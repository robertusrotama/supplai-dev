"""Export SupplAi model artifacts to JSON for the Next.js front-end.

Reads the batch pipeline's precomputed parquet/meta from an artifacts dir and
writes JSON (shaped to src/lib/types.ts) into src/data/generated/. Re-run after
each retrain:  python scripts/export_web.py
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import pandas as pd

# WFP commodity name -> (id, display name, unit). The 6 the model forecasts.
COMMODITY_ID = {
    "Beras Medium":  ("beras",         "Beras Medium",  "kg"),
    "Bawang Merah":  ("bawang-merah",  "Bawang Merah",  "kg"),
    "Bawang Putih":  ("bawang-putih",  "Bawang Putih",  "kg"),
    "Daging Ayam":   ("daging-ayam",   "Daging Ayam",   "kg"),
    "Telur Ayam":    ("telur-ayam",    "Telur Ayam",    "kg"),
    "Minyak Goreng": ("minyak-goreng", "Minyak Goreng", "kg"),
}

SEV_MAP = {"Kritis": "kritis", "Warning": "tinggi", "Info": "sedang"}
PRIO_MAP = {"Kritis": "high", "Warning": "medium", "Info": "low"}

# scripts/ -> supplai-dev/ -> hackathon_phase2/  (artifacts live at the last)
DEFAULT_ARTIFACTS = Path(__file__).resolve().parents[2] / "artifacts"


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")


def load_artifacts(art: Path) -> dict:
    def pq(name):
        return pd.read_parquet(art / f"{name}.parquet")

    return {
        "forecast": pq("forecast"),
        "forecast_path": pq("forecast_path"),
        "panel": pq("panel"),
        "alerts": pq("alerts"),
        "flows": pq("flows"),
        "thresholds": pq("thresholds"),
        "centroids": pq("centroids"),
        "bench_final": pq("bench_final"),
        "meta": json.loads((art / "meta.json").read_text()),
    }


# --------------------------------------------------------------------------- #
# Builders
# --------------------------------------------------------------------------- #
def build_commodities() -> list:
    return [{"id": cid, "name": name, "unit": unit}
            for (cid, name, unit) in COMMODITY_ID.values()]


def build_regions(cent: pd.DataFrame) -> list:
    return [{"id": slug(r.provinsi), "name": r.provinsi, "province": r.provinsi,
             "lat": float(r.lat), "lng": float(r.lon)}
            for r in cent.itertuples()]


def build_regional(forecast: pd.DataFrame, cent: pd.DataFrame) -> list:
    """Per-province staple (beras) current price + status, for the choropleth."""
    fc = forecast[forecast.komoditas == "Beras Medium"].set_index("provinsi")
    out = []
    for prov in cent["provinsi"]:
        if prov not in fc.index:
            continue
        chg = float(fc.loc[prov, "perubahan_persen"])
        status = "CRITICAL" if chg > 3 else "SURPLUS" if chg < -3 else "STABLE"
        out.append({"region": prov, "price": round(float(fc.loc[prov, "harga_kini"])),
                    "status": status})
    return out


def build_heatmap(panel: pd.DataFrame, forecast: pd.DataFrame, months: int = 12) -> dict:
    out = {}
    for wfp, (cid, _disp, _unit) in COMMODITY_ID.items():
        p = panel[panel.komoditas == wfp]
        matrix = []
        for prov, g in p.groupby("provinsi"):
            g = g.sort_values("bulan").tail(months)
            if g.empty:
                continue
            base = float(g["harga"].iloc[0]) or 1.0
            data = [{"date": f"{b:%Y-%m-01}", "price": round(float(h)),
                     "change": round((float(h) - base) / base * 100, 2)}
                    for b, h in zip(g["bulan"], g["harga"])]
            matrix.append({"region": prov, "data": data})
        last = [row["data"][-1]["change"] for row in matrix if row["data"]]
        avg_inc = round(sum(last) / len(last), 2) if last else 0.0
        alert_cnt = sum(1 for row in matrix
                        if len(row["data"]) >= 2
                        and (row["data"][-1]["price"] - row["data"][0]["price"])
                        / max(row["data"][0]["price"], 1) * 100 > 10)
        fc = forecast[forecast.komoditas == wfp].sort_values("perubahan_persen",
                                                             ascending=False)
        top = [{"region": r.provinsi, "commodity": cid,
                "change": round(float(r.perubahan_persen), 2)}
               for r in fc.head(5).itertuples()]
        out[cid] = {"summary": {"totalRegions": len(matrix), "avgIncrease": avg_inc,
                                "alertCount": alert_cnt},
                    "matrix": matrix, "topCritical": top}
    return out


def build_alerts(alerts_df: pd.DataFrame, meta: dict) -> dict:
    order = {"Kritis": 0, "Warning": 1, "Info": 2}
    df = alerts_df.copy()
    df["_o"] = df["severity"].map(order).fillna(9)
    df = df.sort_values(["_o", "perubahan_persen"],
                        ascending=[True, False]).reset_index(drop=True)
    ts = meta.get("dibuat", "2026-07-20T00:00:00")
    alerts = []
    for i, r in df.iterrows():
        cid = COMMODITY_ID.get(r["komoditas"],
                               (slug(r["komoditas"]), r["komoditas"], "kg"))[0]
        disp = COMMODITY_ID.get(r["komoditas"], ("", r["komoditas"]))[1]
        chg = float(r["perubahan_persen"])
        arah = "naik" if chg >= 0 else "turun"
        alerts.append({
            "id": f"ALT-{i + 1:03d}",
            "severity": SEV_MAP.get(r["severity"], "sedang"),
            "title": f"Harga {disp} {r['provinsi']} diperkirakan {arah} "
                     f"{abs(chg):.1f}% dalam 3 bulan",
            "region": r["provinsi"], "commodity": cid,
            "timestamp": ts, "status": "aktif",
            "confidence": round(float(r["confidence"]) * 100),
            "change": round(chg, 2),
            "detail": {"recommendation": str(r["alasan"]),
                       "history": [{"status": "Terdeteksi", "timestamp": ts}]},
        })
    return {"summary": {"active": len(alerts), "thisMonth": len(alerts),
                        "avgResponseTime": 0, "resolved": 0},
            "alerts": alerts}


def _response_for(sub: pd.DataFrame, cid: str, plan: dict) -> dict:
    routes, net = [], {}
    for r in sub.itertuples():
        routes.append({"from": r.dari, "to": r.ke, "commodity": cid,
                       "volume": round(float(r.volume_ton)),
                       "distance": round(float(r.jarak_km)),
                       "cost": round(float(r.biaya_rp)),
                       "priority": PRIO_MAP.get(r.urgensi, "low")})
        net[r.dari] = net.get(r.dari, 0.0) + float(r.volume_ton)
        net[r.ke] = net.get(r.ke, 0.0) - float(r.volume_ton)
    provinces = [{"id": slug(name), "name": name,
                  "status": "surplus" if v >= 0 else "deficit", "stock": round(abs(v))}
                 for name, v in sorted(net.items(), key=lambda kv: -kv[1])]
    summary = {"totalRoutes": int(plan.get("n_rute", len(routes))),
               "totalVolume": round(float(plan.get("total_ton", sub["volume_ton"].sum()))),
               "activeRoutes": f"{int(plan.get('n_sumber', 0))} → "
                               f"{int(plan.get('n_tujuan', 0))}",
               "estimatedCost": round(float(plan.get("total_biaya",
                                                     sub["biaya_rp"].sum())))}
    return {"summary": summary, "provinces": provinces, "routes": routes}


def build_redistribution(flows: pd.DataFrame, meta: dict) -> dict:
    plan_meta = meta.get("plan_meta", {})
    out = {}
    for wfp, (cid, _d, _u) in COMMODITY_ID.items():
        sub = flows[flows.komoditas == wfp]
        if sub.empty:
            continue
        out[cid] = _response_for(sub, cid, plan_meta.get(wfp, {}))
    all_routes = [rt for resp in out.values() for rt in resp["routes"]]
    all_net = {}
    for resp in out.values():
        for p in resp["provinces"]:
            sign = 1 if p["status"] == "surplus" else -1
            all_net[p["name"]] = all_net.get(p["name"], 0) + sign * p["stock"]
    out["all"] = {
        "summary": {"totalRoutes": sum(r["summary"]["totalRoutes"] for r in out.values()),
                    "totalVolume": sum(r["summary"]["totalVolume"] for r in out.values()),
                    "activeRoutes": f"{len(out)} komoditas",
                    "estimatedCost": sum(r["summary"]["estimatedCost"] for r in out.values())},
        "provinces": [{"id": slug(n), "name": n,
                       "status": "surplus" if v >= 0 else "deficit", "stock": abs(v)}
                      for n, v in sorted(all_net.items(), key=lambda kv: -kv[1])],
        "routes": all_routes}
    return out


def headline_mape_h1(bench_final: pd.DataFrame) -> float:
    b = bench_final[bench_final.h == 1].copy()
    blend = (b["lstm"] + b["lgbm"]) / 2
    return float(((blend - b["actual"]).abs() / b["actual"] * 100).mean())


def build_executive(A: dict) -> dict:
    mape = headline_mape_h1(A["bench_final"])
    acc = 100 - mape
    avg_chg = float(A["forecast"]["perubahan_persen"].mean())
    n_routes = len(A["flows"])
    n_alerts = len(A["alerts"])
    n_series = len(A["forecast"])
    total_ton = round(sum(v.get("total_ton", 0)
                          for v in A["meta"].get("plan_meta", {}).values()))
    arah = "TURUN" if avg_chg < 0 else "NAIK"
    top = [
        {"title": "AKURASI PREDIKSI", "value": f"{acc:.1f}%", "statusText": "STABIL",
         "statusType": "stable", "chartType": "line-green"},
        {"title": "PERUBAHAN HARGA 3 BLN", "value": f"{abs(avg_chg):.1f}%",
         "statusText": arah, "statusType": "neutral",
         "subtext": "rata-rata 6 komoditas", "chartType": "line-red"},
        {"title": "SERI DIPANTAU", "value": f"{n_series}", "statusText": "34 PROVINSI",
         "statusType": "neutral", "subtext": "Seri", "chartType": "dots"},
        {"title": "VOL. REDISTRIBUSI", "value": f"{total_ton}", "statusText": "REKOMENDASI",
         "statusType": "surplus", "subtext": "Ton", "chartType": "bars"},
    ]
    shortcuts = [
        {"title": "Predict", "id": "AKURASI", "value": f"{acc:.1f}%",
         "label": f"MAPE {mape:.1f}%", "type": "predict", "color": "emerald"},
        {"title": "Heatmap", "id": "PROVINSI", "value": "34", "label": "DIPANTAU",
         "type": "heatmap", "color": "blue"},
        {"title": "Match", "id": "RUTE AKTIF", "value": f"{n_routes}", "label": "ROUTES",
         "type": "match", "color": "rose"},
        {"title": "Alert Center", "id": "PERINGATAN", "value": f"{n_alerts}",
         "label": "AKTIF", "type": "alerts", "color": "amber"},
    ]
    return {"topMetrics": top, "shortcutCards": shortcuts}


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _write(out_dir: Path, name: str, obj) -> None:
    (out_dir / name).write_text(json.dumps(obj, ensure_ascii=False, indent=1))
    print(f"  wrote {name}")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--artifacts", type=Path, default=DEFAULT_ARTIFACTS)
    ap.add_argument("--out", type=Path,
                    default=Path(__file__).resolve().parents[1] / "src" / "data" / "generated")
    args = ap.parse_args(argv)

    print(f"reading artifacts from {args.artifacts}")
    A = load_artifacts(args.artifacts)
    args.out.mkdir(parents=True, exist_ok=True)

    commodities = build_commodities()
    regions = build_regions(A["centroids"])
    regional = build_regional(A["forecast"], A["centroids"])
    heatmap = build_heatmap(A["panel"], A["forecast"])
    alerts = build_alerts(A["alerts"], A["meta"])
    redist = build_redistribution(A["flows"], A["meta"])
    executive = build_executive(A)

    _write(args.out, "commodities.json", commodities)
    _write(args.out, "regions.json", regions)
    _write(args.out, "regional.json", regional)
    _write(args.out, "heatmap.json", heatmap)
    _write(args.out, "alerts.json", alerts)
    _write(args.out, "redistribution.json", redist)
    _write(args.out, "executive.json", executive)

    # ---- fail-closed self-check ----
    assert len(commodities) == 6, "expected 6 commodities"
    assert len(regions) == 34, f"expected 34 regions, got {len(regions)}"
    assert regional and all(r["status"] in {"CRITICAL", "STABLE", "SURPLUS"}
                            for r in regional)
    assert set(heatmap) == {c["id"] for c in commodities}, "heatmap missing a commodity"
    assert all(v["matrix"] for v in heatmap.values()), "heatmap has an empty matrix"
    assert alerts["alerts"], "no alerts produced"
    assert all(a["severity"] in {"kritis", "tinggi", "sedang", "rendah"}
               for a in alerts["alerts"])
    assert "all" in redist and redist["all"]["routes"], "redistribution missing routes"
    assert len(executive["topMetrics"]) == 4 and len(executive["shortcutCards"]) == 4
    for m in executive["topMetrics"]:
        assert re.fullmatch(r"\d+(\.\d+)?[^0-9.-]*", m["value"]), \
            f"unsafe exec value {m['value']!r}"
    print("export_web: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
