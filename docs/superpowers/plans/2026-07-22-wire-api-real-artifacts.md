# Wire FE API to Real Model Artifacts — Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the synthetic data behind the Alert Center, Heatmap, and Redistribusi dashboard modules (plus the shared commodity/region/executive data) with real outputs from the SupplAi forecasting pipeline, via a static JSON export.

**Architecture:** A Python script (`scripts/export_web.py`) reads the model's precomputed parquet artifacts and writes JSON files (shaped to `src/lib/types.ts`) into `src/data/generated/`. The `src/data/*.ts` accessors read those JSON files instead of generating fake data, keeping their exported signatures so most consuming code is untouched. Three pages get targeted edits (real dropdowns, month labels, and — for Alerts — actually consuming the API it already calls).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Recharts; Python 3 + pandas + pyarrow for the export; pytest for the export's pure-function unit tests.

## Global Constraints

- **Spatial level:** provincial — 34 provinces. Source: `artifacts/` (not `artifacts_kab/`).
- **Granularity:** monthly. History points + forecast points are month-stamped `YYYY-MM-01`.
- **Commodities:** exactly these 6 ids (drop all others). WFP name → `(id, display, unit)`, all `kg`:
  - `Beras Medium → (beras, "Beras Medium", kg)`
  - `Bawang Merah → (bawang-merah, "Bawang Merah", kg)`
  - `Bawang Putih → (bawang-putih, "Bawang Putih", kg)`
  - `Daging Ayam → (daging-ayam, "Daging Ayam", kg)`
  - `Telur Ayam → (telur-ayam, "Telur Ayam", kg)`
  - `Minyak Goreng → (minyak-goreng, "Minyak Goreng", kg)`
- **Slug rule:** `re.sub(r"[^a-z0-9]+","-", s.lower()).strip("-")`. So `"DKI Jakarta" → dki-jakarta`, `"Jawa Barat" → jawa-barat`.
- **Severity map (real → `lib/types` Alert.severity):** `Kritis→kritis, Warning→tinggi, Info→sedang`. (`rendah` unused.) Real data currently has **0 Kritis, 2 Warning, 21 Info**.
- **Priority map (real `urgensi` → route priority):** `Kritis→high, Warning→medium, Info→low`.
- **Artifacts path:** export reads from `--artifacts <dir>` (default `../hackathon_phase2/artifacts`). Generated JSON is committed to the repo.
- **No FE test runner:** the repo has only `next build`/`eslint`. FE verification = `npx tsc --noEmit` (or `npm run build`) **plus** curling the live endpoints. Python transforms get real pytest unit tests.
- **`top-cards.tsx` parser gotcha:** it does `parseFloat(value.replace(/[^0-9.]/g,""))`. Every `executive.json` metric `value` MUST be one number with at most a single dot-decimal and an optional trailing unit — **no thousands separators, no minus sign** (e.g. `"95.9%"`, `"204"`, `"4800"`, `"1.0%"`). Direction goes in `statusText`, not the value.
- **Honesty labels:** MAPE is the rolling-origin horizon-1 blend (≈4.14% → 95.9% accuracy); redistribution `stock` is an LP-volume proxy, not inventory; executive metrics with no data source are relabelled to real quantities, never faked.
- **Commit style:** conventional commits; commit after every task's tests pass.

---

## Task 1: Export scaffold + pure helpers + `commodities.json` / `regions.json` / `regional.json`

**Files:**
- Create: `scripts/export_web.py`
- Create: `scripts/tests/test_export_web.py`
- Create (generated): `src/data/generated/commodities.json`, `regions.json`, `regional.json`

**Interfaces:**
- Produces: `slug(s)->str`; `COMMODITY_ID: dict[str,tuple[str,str,str]]`; `load_artifacts(dir)->dict[str,DataFrame|dict]`; `build_commodities()->list`, `build_regions(cent)->list`, `build_regional(forecast, cent)->list`; `main(argv)` CLI writing all JSON with a fail-closed self-check.

- [ ] **Step 1: Write failing unit tests for the pure helpers**

Create `scripts/tests/test_export_web.py`:

```python
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import pandas as pd
import export_web as ew


def test_slug_basic():
    assert ew.slug("DKI Jakarta") == "dki-jakarta"
    assert ew.slug("Jawa Barat") == "jawa-barat"
    assert ew.slug("D.I. Yogyakarta") == "d-i-yogyakarta"


def test_commodity_map_has_six_kg():
    assert len(ew.COMMODITY_ID) == 6
    assert ew.COMMODITY_ID["Beras Medium"] == ("beras", "Beras Medium", "kg")
    assert all(u == "kg" for _, _, u in ew.COMMODITY_ID.values())


def test_build_commodities_shape():
    out = ew.build_commodities()
    assert len(out) == 6
    ids = {c["id"] for c in out}
    assert "minyak-goreng" in ids and "cabai-rawit" not in ids
    assert all(set(c) == {"id", "name", "unit"} for c in out)


def test_build_regions_shape():
    cent = pd.DataFrame({"provinsi": ["DKI Jakarta", "Jawa Barat"],
                         "lat": [-6.2, -6.9], "lon": [106.8, 107.6]})
    out = ew.build_regions(cent)
    assert out[0] == {"id": "dki-jakarta", "name": "DKI Jakarta",
                      "province": "DKI Jakarta", "lat": -6.2, "lng": 106.8}


def test_build_regional_status_rule():
    cent = pd.DataFrame({"provinsi": ["Aceh", "Bali", "Riau"],
                         "lat": [0, 0, 0], "lon": [0, 0, 0]})
    fc = pd.DataFrame({
        "provinsi": ["Aceh", "Bali", "Riau"],
        "komoditas": ["Beras Medium"] * 3,
        "harga_kini": [15000, 14000, 13000],
        "perubahan_persen": [5.0, -5.0, 0.0],
    })
    out = {r["region"]: r for r in ew.build_regional(fc, cent)}
    assert out["Aceh"]["status"] == "CRITICAL"   # >+3%
    assert out["Bali"]["status"] == "SURPLUS"    # <-3%
    assert out["Riau"]["status"] == "STABLE"
    assert out["Aceh"]["price"] == 15000
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd scripts && python -m pytest tests/test_export_web.py -q`
Expected: FAIL — `ModuleNotFoundError: No module named 'export_web'`.

- [ ] **Step 3: Create `scripts/export_web.py` with helpers + the three simple exporters**

```python
"""Export SupplAi model artifacts to JSON for the Next.js front-end.

Reads the batch pipeline's precomputed parquet/meta from an artifacts dir and
writes JSON (shaped to src/lib/types.ts) into src/data/generated/. Re-run after
each retrain:  python scripts/export_web.py
"""
from __future__ import annotations
import argparse, json, re, sys
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
DEFAULT_ARTIFACTS = Path(__file__).resolve().parents[2] / "hackathon_phase2" / "artifacts"


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")


def load_artifacts(art: Path) -> dict:
    def pq(name): return pd.read_parquet(art / f"{name}.parquet")
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


def _write(out_dir: Path, name: str, obj) -> None:
    (out_dir / name).write_text(json.dumps(obj, ensure_ascii=False, indent=1))
    print(f"  wrote {name}")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--artifacts", type=Path, default=DEFAULT_ARTIFACTS)
    ap.add_argument("--out", type=Path,
                    default=Path(__file__).resolve().parents[1] / "src" / "data" / "generated")
    args = ap.parse_args(argv)
    A = load_artifacts(args.artifacts)
    args.out.mkdir(parents=True, exist_ok=True)

    commodities = build_commodities()
    regions = build_regions(A["centroids"])
    regional = build_regional(A["forecast"], A["centroids"])
    _write(args.out, "commodities.json", commodities)
    _write(args.out, "regions.json", regions)
    _write(args.out, "regional.json", regional)

    # ---- fail-closed self-check (grows as later tasks add outputs) ----
    assert len(commodities) == 6, "expected 6 commodities"
    assert len(regions) == 34, f"expected 34 regions, got {len(regions)}"
    assert regional and all(r["status"] in {"CRITICAL", "STABLE", "SURPLUS"} for r in regional)
    print("export_web: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `cd scripts && python -m pytest tests/test_export_web.py -q`
Expected: PASS (5 passed).

- [ ] **Step 5: Run the exporter and eyeball output**

Run: `cd supplai-dev && python scripts/export_web.py`
Expected: prints `wrote commodities.json / regions.json / regional.json` then `export_web: OK`. Confirm `src/data/generated/regions.json` has 34 entries and `commodities.json` has `minyak-goreng`, no `cabai-rawit`.

- [ ] **Step 6: Commit**

```bash
git add scripts/export_web.py scripts/tests/test_export_web.py src/data/generated/commodities.json src/data/generated/regions.json src/data/generated/regional.json
git commit -m "feat(export): scaffold export_web.py + commodities/regions/regional JSON"
```

---

## Task 2: `heatmap.json` — monthly price matrix per commodity

**Files:**
- Modify: `scripts/export_web.py` (add `build_heatmap`, wire into `main`)
- Modify: `scripts/tests/test_export_web.py` (add test)
- Create (generated): `src/data/generated/heatmap.json`

**Interfaces:**
- Consumes: `load_artifacts` output (`panel`, `forecast`), `slug`, `COMMODITY_ID`.
- Produces: `build_heatmap(panel, forecast, months=12) -> dict` keyed by commodity id → `HeatmapResponse` (`{summary:{totalRegions,avgIncrease,alertCount}, matrix:[{region,data:[{date,price,change}]}], topCritical:[{region,commodity,change}]}`).

- [ ] **Step 1: Write the failing test**

Add to `scripts/tests/test_export_web.py`:

```python
def _mini_panel():
    rows = []
    for prov, base in [("Aceh", 15000), ("Bali", 14000)]:
        for i, m in enumerate(pd.date_range("2025-07-01", periods=12, freq="MS")):
            rows.append({"provinsi": prov, "komoditas": "Beras Medium",
                         "bulan": m, "harga": base + i * 100, "n_pasar": 3})
    return pd.DataFrame(rows)


def test_build_heatmap_shape_and_change():
    panel = _mini_panel()
    fc = pd.DataFrame({"provinsi": ["Aceh", "Bali"],
                       "komoditas": ["Beras Medium", "Beras Medium"],
                       "harga_kini": [16100, 15100], "harga_prediksi": [16500, 15000],
                       "perubahan_persen": [2.5, -0.7]})
    hm = ew.build_heatmap(panel, fc, months=12)
    beras = hm["beras"]
    assert beras["summary"]["totalRegions"] == 2
    row = next(r for r in beras["matrix"] if r["region"] == "Aceh")
    assert len(row["data"]) == 12
    assert row["data"][0]["change"] == 0.0            # first cell is baseline
    assert row["data"][-1]["change"] > 0              # prices rose
    assert beras["topCritical"][0]["region"] == "Aceh"   # highest perubahan
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_export_web.py::test_build_heatmap_shape_and_change -q`
Expected: FAIL — `AttributeError: module 'export_web' has no attribute 'build_heatmap'`.

- [ ] **Step 3: Implement `build_heatmap` and wire into `main`**

Add to `export_web.py`:

```python
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
        fc = forecast[forecast.komoditas == wfp].sort_values("perubahan_persen", ascending=False)
        top = [{"region": r.provinsi, "commodity": cid,
                "change": round(float(r.perubahan_persen), 2)} for r in fc.head(5).itertuples()]
        out[cid] = {"summary": {"totalRegions": len(matrix), "avgIncrease": avg_inc,
                                "alertCount": alert_cnt},
                    "matrix": matrix, "topCritical": top}
    return out
```

In `main`, after the regional block:

```python
    heatmap = build_heatmap(A["panel"], A["forecast"])
    _write(args.out, "heatmap.json", heatmap)
    assert set(heatmap) == {c["id"] for c in commodities}, "heatmap missing a commodity"
    assert all(v["matrix"] for v in heatmap.values()), "heatmap has an empty matrix"
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd scripts && python -m pytest tests/test_export_web.py -q`
Expected: PASS (6 passed).

- [ ] **Step 5: Regenerate and spot-check**

Run: `cd supplai-dev && python scripts/export_web.py`
Expected: also prints `wrote heatmap.json`. Confirm `heatmap.json` has a `beras` key with a 34-row `matrix`.

- [ ] **Step 6: Commit**

```bash
git add scripts/export_web.py scripts/tests/test_export_web.py src/data/generated/heatmap.json
git commit -m "feat(export): heatmap.json monthly price matrix per commodity"
```

---

## Task 3: `alerts.json` + extend `Alert` type with `change`

**Files:**
- Modify: `src/lib/types.ts` (add `change: number` to `Alert`)
- Modify: `scripts/export_web.py` (add `build_alerts`)
- Modify: `scripts/tests/test_export_web.py`
- Create (generated): `src/data/generated/alerts.json`

**Interfaces:**
- Consumes: `alerts.parquet`, `COMMODITY_ID`, `meta.dibuat`.
- Produces: `build_alerts(alerts_df, meta) -> dict` → `{summary:{active,thisMonth,avgResponseTime,resolved}, alerts:[Alert]}`. Each `Alert` matches `lib/types.ts` **plus** `change:number`.

- [ ] **Step 1: Add `change` to the `Alert` interface**

In `src/lib/types.ts`, inside `interface Alert`, after `confidence: number`:

```typescript
  confidence: number
  change: number
```

- [ ] **Step 2: Write the failing test**

Add to `scripts/tests/test_export_web.py`:

```python
def test_build_alerts_mapping():
    df = pd.DataFrame({
        "provinsi": ["Sulawesi Utara", "Gorontalo"],
        "komoditas": ["Beras Medium", "Beras Medium"],
        "severity": ["Warning", "Info"],
        "perubahan_persen": [5.99, 4.10],
        "harga_kini": [15000, 15000], "harga_prediksi": [15899, 15600],
        "confidence": [0.97, 0.9], "model": ["LSTM", "LSTM"],
        "mape_komoditas": [1.62, 1.62], "anomali_terkonfirmasi": [False, False],
        "di_atas_het": [True, True], "alasan": ["naik", "naik"],
    })
    res = ew.build_alerts(df, {"dibuat": "2026-07-20T12:42:56"})
    assert res["summary"]["thisMonth"] == 2
    assert res["summary"]["active"] == 2
    a0 = res["alerts"][0]
    assert a0["severity"] == "tinggi"           # Warning -> tinggi
    assert a0["commodity"] == "beras"
    assert a0["confidence"] == 97
    assert round(a0["change"], 2) == 5.99
    assert a0["id"] == "ALT-001"
    assert res["alerts"][1]["severity"] == "sedang"   # Info -> sedang
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_export_web.py::test_build_alerts_mapping -q`
Expected: FAIL — `has no attribute 'build_alerts'`.

- [ ] **Step 4: Implement `build_alerts` and wire into `main`**

Add to `export_web.py`:

```python
SEV_MAP = {"Kritis": "kritis", "Warning": "tinggi", "Info": "sedang"}


def build_alerts(alerts_df: pd.DataFrame, meta: dict) -> dict:
    order = {"Kritis": 0, "Warning": 1, "Info": 2}
    df = alerts_df.copy()
    df["_o"] = df["severity"].map(order).fillna(9)
    df = df.sort_values(["_o", "perubahan_persen"], ascending=[True, False]).reset_index(drop=True)
    ts = meta.get("dibuat", "2026-07-20T00:00:00")
    alerts = []
    for i, r in df.iterrows():
        cid = COMMODITY_ID.get(r["komoditas"], (slug(r["komoditas"]), r["komoditas"], "kg"))[0]
        disp = COMMODITY_ID.get(r["komoditas"], ("", r["komoditas"]))[1]
        chg = float(r["perubahan_persen"])
        arah = "naik" if chg >= 0 else "turun"
        alerts.append({
            "id": f"ALT-{i + 1:03d}",
            "severity": SEV_MAP.get(r["severity"], "sedang"),
            "title": f"Harga {disp} {r['provinsi']} diperkirakan {arah} {abs(chg):.1f}% dalam 3 bulan",
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
```

In `main`:

```python
    alerts = build_alerts(A["alerts"], A["meta"])
    _write(args.out, "alerts.json", alerts)
    assert alerts["alerts"], "no alerts produced"
    assert all(a["severity"] in {"kritis", "tinggi", "sedang", "rendah"} for a in alerts["alerts"])
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd scripts && python -m pytest tests/test_export_web.py -q`
Expected: PASS (7 passed).

- [ ] **Step 6: Regenerate + commit**

```bash
cd supplai-dev && python scripts/export_web.py
git add src/lib/types.ts scripts/export_web.py scripts/tests/test_export_web.py src/data/generated/alerts.json
git commit -m "feat(export): alerts.json + Alert.change field"
```

---

## Task 4: `redistribution.json` — per-commodity routes/provinces/summary

**Files:**
- Modify: `scripts/export_web.py` (add `build_redistribution`)
- Modify: `scripts/tests/test_export_web.py`
- Create (generated): `src/data/generated/redistribution.json`

**Interfaces:**
- Consumes: `flows.parquet`, `meta.plan_meta`, `COMMODITY_ID`, `slug`.
- Produces: `build_redistribution(flows, meta) -> dict` keyed by commodity id **and** `"all"`, each → `RedistributionResponse` (`{summary:{totalRoutes,totalVolume,activeRoutes,estimatedCost}, provinces:[{id,name,status,stock}], routes:[{from,to,commodity,volume,distance,cost,priority}]}`).

- [ ] **Step 1: Write the failing test**

Add to `scripts/tests/test_export_web.py`:

```python
def test_build_redistribution():
    flows = pd.DataFrame({
        "komoditas": ["Beras Medium", "Beras Medium"],
        "dari": ["Jawa Timur", "Bali"], "ke": ["Papua", "Papua"],
        "volume_ton": [500.0, 200.0], "jarak_km": [3800.0, 3000.0],
        "biaya_rp": [2.85e9, 9e8], "harga_asal": [14000, 14950],
        "harga_tujuan": [17000, 17000], "prediksi_kenaikan": [3.4, 3.4],
        "urgensi": ["Warning", "Info"], "hemat_rp": [-1e8, -4e7],
    })
    meta = {"plan_meta": {"Beras Medium": {"status": "ok", "total_ton": 700.0,
            "total_biaya": 3.75e9, "n_rute": 2, "n_sumber": 2, "n_tujuan": 1}}}
    res = ew.build_redistribution(flows, meta)
    beras = res["beras"]
    assert beras["summary"]["totalRoutes"] == 2
    assert beras["summary"]["totalVolume"] == 700
    r0 = next(r for r in beras["routes"] if r["from"] == "Jawa Timur")
    assert r0["priority"] == "medium" and r0["commodity"] == "beras"
    provs = {p["name"]: p for p in beras["provinces"]}
    assert provs["Jawa Timur"]["status"] == "surplus"
    assert provs["Papua"]["status"] == "deficit" and provs["Papua"]["stock"] == 700
    assert "all" in res
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_export_web.py::test_build_redistribution -q`
Expected: FAIL — `has no attribute 'build_redistribution'`.

- [ ] **Step 3: Implement `build_redistribution` and wire into `main`**

Add to `export_web.py`:

```python
PRIO_MAP = {"Kritis": "high", "Warning": "medium", "Info": "low"}


def _response_for(sub: pd.DataFrame, cid: str, plan: dict) -> dict:
    routes, net = [], {}
    for r in sub.itertuples():
        routes.append({"from": r.dari, "to": r.ke, "commodity": cid,
                       "volume": round(float(r.volume_ton)), "distance": round(float(r.jarak_km)),
                       "cost": round(float(r.biaya_rp)),
                       "priority": PRIO_MAP.get(r.urgensi, "low")})
        net[r.dari] = net.get(r.dari, 0.0) + float(r.volume_ton)
        net[r.ke] = net.get(r.ke, 0.0) - float(r.volume_ton)
    provinces = [{"id": slug(name), "name": name,
                  "status": "surplus" if v >= 0 else "deficit", "stock": round(abs(v))}
                 for name, v in sorted(net.items(), key=lambda kv: -kv[1])]
    summary = {"totalRoutes": int(plan.get("n_rute", len(routes))),
               "totalVolume": round(float(plan.get("total_ton", sub["volume_ton"].sum()))),
               "activeRoutes": f"{int(plan.get('n_sumber', 0))} → {int(plan.get('n_tujuan', 0))}",
               "estimatedCost": round(float(plan.get("total_biaya", sub["biaya_rp"].sum())))}
    return {"summary": summary, "provinces": provinces, "routes": routes}


def build_redistribution(flows: pd.DataFrame, meta: dict) -> dict:
    plan_meta = meta.get("plan_meta", {})
    out = {}
    for wfp, (cid, _d, _u) in COMMODITY_ID.items():
        sub = flows[flows.komoditas == wfp]
        if sub.empty:
            continue
        out[cid] = _response_for(sub, cid, plan_meta.get(wfp, {}))
    # aggregate "all": every route keeps its own commodity id
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
```

In `main`:

```python
    redist = build_redistribution(A["flows"], A["meta"])
    _write(args.out, "redistribution.json", redist)
    assert "all" in redist and redist["all"]["routes"], "redistribution missing routes"
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd scripts && python -m pytest tests/test_export_web.py -q`
Expected: PASS (8 passed).

- [ ] **Step 5: Regenerate + commit**

```bash
cd supplai-dev && python scripts/export_web.py
git add scripts/export_web.py scripts/tests/test_export_web.py src/data/generated/redistribution.json
git commit -m "feat(export): redistribution.json per-commodity routes/provinces"
```

---

## Task 5: `executive.json` + finalize the export self-check

**Files:**
- Modify: `scripts/export_web.py` (add `build_executive`)
- Modify: `scripts/tests/test_export_web.py`
- Create (generated): `src/data/generated/executive.json`

**Interfaces:**
- Consumes: `bench_final` (h=1 blend MAPE), `forecast` (avg change, counts), `flows` (route count), `alerts` (count), `meta.plan_meta` (total volume).
- Produces: `build_executive(A) -> dict` = `{topMetrics:[TopMetric], shortcutCards:[...]}`. All metric `value` strings are parser-safe (Global Constraints).

- [ ] **Step 1: Write the failing test**

Add to `scripts/tests/test_export_web.py`:

```python
def test_headline_mape_and_exec_values_parser_safe():
    import re as _re
    # h=1 blend MAPE helper is used for the accuracy card
    bf = pd.DataFrame({"h": [1, 1], "actual": [100.0, 200.0],
                       "lstm": [110.0, 190.0], "lgbm": [90.0, 210.0]})
    assert abs(ew.headline_mape_h1(bf) - 10.0) < 1e-6   # blend == actual? here 10% each

    A = {"bench_final": bf,
         "forecast": pd.DataFrame({"perubahan_persen": [-2.0, 0.0]}),
         "flows": pd.DataFrame({"x": range(65)}),
         "alerts": pd.DataFrame({"severity": ["Warning", "Info"]}),
         "meta": {"plan_meta": {"Beras Medium": {"total_ton": 800.0}}}}
    ex = ew.build_executive(A)
    vals = [m["value"] for m in ex["topMetrics"]]
    for v in vals:                       # parser-safe: one number, opt dot, opt unit
        assert _re.fullmatch(r"\d+(\.\d+)?[^0-9.-]*", v), f"unsafe value {v!r}"
    assert any("%" in v for v in vals)   # accuracy card present
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_export_web.py::test_headline_mape_and_exec_values_parser_safe -q`
Expected: FAIL — `has no attribute 'headline_mape_h1'`.

- [ ] **Step 3: Implement `headline_mape_h1` + `build_executive` and wire into `main`**

Add to `export_web.py`:

```python
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
    total_ton = round(sum(v.get("total_ton", 0) for v in A["meta"].get("plan_meta", {}).values()))
    arah = "TURUN" if avg_chg < 0 else "NAIK"
    top = [
        {"title": "AKURASI PREDIKSI", "value": f"{acc:.1f}%", "statusText": "STABIL",
         "statusType": "stable", "chartType": "line-green"},
        {"title": "PERUBAHAN HARGA 3 BLN", "value": f"{abs(avg_chg):.1f}%", "statusText": arah,
         "statusType": "neutral", "subtext": "rata-rata 6 komoditas", "chartType": "line-red"},
        {"title": "SERI DIPANTAU", "value": f"{n_series}", "statusText": "34 PROVINSI",
         "statusType": "neutral", "subtext": "Seri", "chartType": "dots"},
        {"title": "VOL. REDISTRIBUSI", "value": f"{total_ton}", "statusText": "REKOMENDASI",
         "statusType": "surplus", "subtext": "Ton", "chartType": "bars"},
    ]
    shortcuts = [
        {"title": "Predict", "id": "AKURASI", "value": f"{acc:.1f}%", "label": f"MAPE {mape:.1f}%",
         "type": "predict", "color": "emerald"},
        {"title": "Heatmap", "id": "PROVINSI", "value": "34", "label": "DIPANTAU",
         "type": "heatmap", "color": "blue"},
        {"title": "Match", "id": "RUTE AKTIF", "value": f"{n_routes}", "label": "ROUTES",
         "type": "match", "color": "rose"},
        {"title": "Alert Center", "id": "PERINGATAN", "value": f"{n_alerts}", "label": "AKTIF",
         "type": "alerts", "color": "amber"},
    ]
    return {"topMetrics": top, "shortcutCards": shortcuts}
```

In `main` (and extend the final self-check):

```python
    executive = build_executive(A)
    _write(args.out, "executive.json", executive)
    assert len(executive["topMetrics"]) == 4 and len(executive["shortcutCards"]) == 4
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd scripts && python -m pytest tests/test_export_web.py -q`
Expected: PASS (9 passed).

- [ ] **Step 5: Full regenerate + verify headline numbers**

Run: `cd supplai-dev && python scripts/export_web.py`
Expected: all 7 files written, `export_web: OK`. Confirm `executive.json` accuracy ≈ `95.9%`, VOL. REDISTRIBUSI `4800`, RUTE AKTIF `65`, PERINGATAN `23`.

- [ ] **Step 6: Commit**

```bash
git add scripts/export_web.py scripts/tests/test_export_web.py src/data/generated/executive.json
git commit -m "feat(export): executive.json real headline metrics"
```

---

## Task 6: FE accessors — `commodities.ts`, `regions.ts`, `regional-data.ts` read generated JSON

**Files:**
- Modify: `src/data/commodities.ts`, `src/data/regions.ts`, `src/data/regional-data.ts`

**Interfaces:**
- Consumes: `src/data/generated/{commodities,regions,regional}.json`.
- Produces: unchanged exports — `commodities: Commodity[]`, `getCommodityById`, `regions: Region[]`, `getRegionById`, `regionalComparisonMaster: RegionalPrice[]`.

- [ ] **Step 1: Rewrite `src/data/commodities.ts`**

```typescript
import type { Commodity } from "@/lib/types"
import generated from "./generated/commodities.json"

export const commodities: Commodity[] = generated as Commodity[]

export function getCommodityById(id: string): Commodity | undefined {
  return commodities.find((c) => c.id === id)
}
```

- [ ] **Step 2: Rewrite `src/data/regions.ts`**

```typescript
import type { Region } from "@/lib/types"
import generated from "./generated/regions.json"

export const regions: Region[] = generated as Region[]

export function getRegionById(id: string): Region | undefined {
  return regions.find((r) => r.id === id)
}
```

- [ ] **Step 3: Rewrite `src/data/regional-data.ts`**

Keep the `RegionalPrice` interface; replace the hardcoded array:

```typescript
import generated from "./generated/regional.json"

export interface RegionalPrice {
  region: string
  price: number
  status: "CRITICAL" | "STABLE" | "SURPLUS"
}

export const regionalComparisonMaster: RegionalPrice[] = generated as RegionalPrice[]
```

- [ ] **Step 4: Typecheck**

Run: `cd supplai-dev && npx tsc --noEmit`
Expected: no errors. (If it complains about JSON imports, ensure `resolveJsonModule: true` in `tsconfig.json` — Next 16 sets it by default; add it under `compilerOptions` if missing, then re-run.)

- [ ] **Step 5: Commit**

```bash
git add src/data/commodities.ts src/data/regions.ts src/data/regional-data.ts tsconfig.json
git commit -m "feat(fe): commodities/regions/regional read real generated JSON"
```

---

## Task 7: FE Heatmap — real `getHeatmapData`, real dropdown, month labels

**Files:**
- Modify: `src/data/prices.ts` (replace `getHeatmapData` body; leave `getPriceData` — deferred to phase 2 — untouched)
- Modify: `src/app/(dashboard)/heatmap/page.tsx` (dropdown → map from commodities; "7 hari" copy → months)
- Modify: `src/components/layout/elastic-date-picker.tsx` (day presets → month presets)

**Interfaces:**
- Consumes: `src/data/generated/heatmap.json`; `commodities` from `@/data/commodities`.
- Produces: `getHeatmapData(commodityId, range)` unchanged signature; `range` now = **months**.

- [ ] **Step 1: Replace `getHeatmapData` in `src/data/prices.ts`**

At the top of the file add:

```typescript
import heatmapGenerated from "./generated/heatmap.json"
```

Replace the entire `export function getHeatmapData(...) { ... }` with:

```typescript
export function getHeatmapData(commodityId: string, range: number = 12): HeatmapResponse {
  const all = heatmapGenerated as Record<string, HeatmapResponse>
  const src = all[commodityId] ?? all["beras"]

  const matrix: HeatmapRow[] = src.matrix.map((row) => {
    const slice = row.data.slice(-range)
    const base = slice[0]?.price ?? 1
    const data: HeatmapCell[] = slice.map((c) => ({
      date: c.date, price: c.price,
      change: base ? parseFloat((((c.price - base) / base) * 100).toFixed(2)) : 0,
    }))
    return { region: row.region, data }
  })

  const lastChanges = matrix.map((r) => r.data[r.data.length - 1]?.change ?? 0)
  const avgIncrease = lastChanges.length
    ? parseFloat((lastChanges.reduce((s, v) => s + v, 0) / lastChanges.length).toFixed(2)) : 0
  const alertCount = matrix.filter((r) => {
    if (r.data.length < 2) return false
    const first = r.data[0].price, last = r.data[r.data.length - 1].price
    return first > 0 && ((last - first) / first) * 100 > 10
  }).length

  return {
    summary: { totalRegions: src.summary.totalRegions, avgIncrease, alertCount },
    matrix,
    topCritical: src.topCritical,
  }
}
```

(`HeatmapCell`/`HeatmapRow`/`HeatmapResponse` are already imported at the top of `prices.ts`.)

- [ ] **Step 2: Fix the commodity dropdown in `heatmap/page.tsx`**

Add near the other imports: `import { commodities } from "@/data/commodities";`
Replace the hardcoded `<option>` block (the `<option value="beras">Beras (Premium)</option>` / `cabai` / `bawang` lines) with:

```tsx
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
```

- [ ] **Step 3: Relabel day→month copy in `heatmap/page.tsx`**

- Line ~58: `Prediksi Perubahan Harga 7 hari ke depan di Seluruh Indonesia.` → `Prediksi perubahan harga 1–3 bulan ke depan di seluruh Indonesia.`
- Line ~121: `...deviasi harga > 10% dari Harga Eceran Tertinggi (HET) nasional dalam kurun waktu 7 hari terakhir.` → `...dalam kurun waktu 12 bulan terakhir.`

- [ ] **Step 4: Convert `elastic-date-picker.tsx` presets to months**

Replace the `presets` array and default label:

```tsx
  defaultLabel = "12 bulan terakhir"
```
```tsx
  const presets = [
    { label: "1 bulan", days: 1 },
    { label: "3 bulan", days: 3 },
    { label: "6 bulan", days: 6 },
    { label: "12 bulan terakhir", days: 12 },
  ];
```

(The `days` field still feeds `onRangeChange`; its numeric value is now a month count, which `getHeatmapData` interprets as months. Renaming the field is optional and out of scope.)

- [ ] **Step 5: Verify — build + live endpoint**

Run: `cd supplai-dev && npx tsc --noEmit && (npm run dev >/tmp/next.log 2>&1 &) && sleep 8 && curl -s "http://localhost:3000/api/heatmap?commodity=beras&range=12" | head -c 400; pkill -f "next dev"`
Expected: JSON with `"summary"`, a `"matrix"` of 34 provinces, real prices (e.g. ~14000–17000 for beras), no PRNG artifacts.

- [ ] **Step 6: Commit**

```bash
git add src/data/prices.ts "src/app/(dashboard)/heatmap/page.tsx" src/components/layout/elastic-date-picker.tsx
git commit -m "feat(fe): heatmap reads real data, real dropdown, month ranges"
```

---

## Task 8: FE Redistribusi — real `getRedistributionData` + real dropdown

**Files:**
- Modify: `src/data/redistribution.ts` (replace body)
- Modify: `src/app/(dashboard)/redistribusi/page.tsx` (dropdown → map from commodities)

**Interfaces:**
- Consumes: `src/data/generated/redistribution.json`; `commodities`.
- Produces: `getRedistributionData(commodity?)` unchanged signature.

- [ ] **Step 1: Rewrite `src/data/redistribution.ts`**

```typescript
import type { RedistributionResponse } from "@/lib/types"
import generated from "./generated/redistribution.json"

const data = generated as Record<string, RedistributionResponse>

export function getRedistributionData(commodity?: string): RedistributionResponse {
  return data[commodity ?? "all"] ?? data["all"]
}
```

- [ ] **Step 2: Fix the commodity dropdown in `redistribusi/page.tsx`**

Add `import { commodities } from "@/data/commodities";` near the imports. Replace the hardcoded `<option>` block (`beras`/`bawang-merah`/`cabai-rawit`/`minyak-goreng`) with:

```tsx
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
```

- [ ] **Step 3: Verify — build + live endpoint**

Run: `cd supplai-dev && npx tsc --noEmit && (npm run dev >/tmp/next.log 2>&1 &) && sleep 8 && curl -s "http://localhost:3000/api/redistribution?commodity=beras" | head -c 400; pkill -f "next dev"`
Expected: JSON with real `routes` (e.g. `"from":"Bali"`, `"to":"Kalimantan Utara"`), `priority` in {high,medium,low}, a `summary` with `totalVolume` 800.

- [ ] **Step 4: Commit**

```bash
git add src/data/redistribution.ts "src/app/(dashboard)/redistribusi/page.tsx"
git commit -m "feat(fe): redistribusi reads real data + real dropdown"
```

---

## Task 9: FE Alert Center — real `getAlerts` + page consumes the API

**Files:**
- Modify: `src/data/alerts.ts` (replace body)
- Modify: `src/app/(dashboard)/alerts/page.tsx` (consume `data.alerts`; drop hardcoded `alertsList` seed + fake toast)

**Interfaces:**
- Consumes: `src/data/generated/alerts.json`; API `AlertResponse` (with `Alert.change`).
- Produces: `getAlerts(filters)` unchanged signature returning `AlertResponse`.

- [ ] **Step 1: Rewrite `src/data/alerts.ts`**

```typescript
import type { Alert, AlertResponse } from "@/lib/types"
import generated from "./generated/alerts.json"

const base = generated as AlertResponse

export function getAlerts(filters: Record<string, string> = {}): AlertResponse {
  let alerts: Alert[] = base.alerts
  if (filters.severity) alerts = alerts.filter((a) => a.severity === filters.severity)
  if (filters.status) alerts = alerts.filter((a) => a.status === filters.status)
  if (filters.commodity) alerts = alerts.filter((a) => a.commodity === filters.commodity)
  if (filters.region) alerts = alerts.filter((a) => a.region === filters.region)
  return { summary: base.summary, alerts }
}
```

- [ ] **Step 2: Make `alerts/page.tsx` consume the API instead of the hardcoded seed**

In `src/app/(dashboard)/alerts/page.tsx`:

(a) Replace the hardcoded `useState<AlertData[]>([...])` seed with an empty init:

```tsx
  const [alertsList, setAlertsList] = useState<AlertData[]>([]);
```

(b) After the `useApi` call, add a mapping effect from API `Alert` → page `AlertData`:

```tsx
  useEffect(() => {
    if (!data?.alerts) return;
    const sevMap: Record<string, AlertData["severity"]> = {
      kritis: "CRITICAL", tinggi: "WARNING", sedang: "INFO", rendah: "INFO",
    };
    setAlertsList(data.alerts.map((a) => ({
      id: a.id,
      severity: sevMap[a.severity] ?? "INFO",
      type: a.change >= 0 ? "PRICE SURGE" : "SUPPLY DROP",
      title: a.commodity.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
      location: a.region,
      delta: `${a.change >= 0 ? "+" : ""}${a.change.toFixed(1)}%`,
      updated: "Snapshot",
    })));
  }, [data]);
```

(c) Delete the fake toast `useEffect` (the `setTimeout` that fires `toast.warning("Peringatan Baru", { description: "Lonjakan harga Cabai Rawit terdeteksi di Kab. Jayapura ..." })`).

(d) The client-side `displayedAlerts` title-match filter (`if (commodity === "beras" && item.title !== "Beras Medium") ...`) is now redundant because the API already filters by commodity via the query string. Simplify `displayedAlerts` to filter only by `severity` on `alertsList`:

```tsx
  const displayedAlerts = useMemo(
    () => alertsList.filter((item) => !severity || item.severity === severity),
    [alertsList, severity]
  );
```

- [ ] **Step 3: Verify — build + live endpoint + shape**

Run: `cd supplai-dev && npx tsc --noEmit && (npm run dev >/tmp/next.log 2>&1 &) && sleep 8 && curl -s "http://localhost:3000/api/alerts?severity=tinggi" | head -c 400; pkill -f "next dev"`
Expected: JSON `AlertResponse` with `summary.active` and `alerts[]` carrying real `region` (a province), `commodity` id, and `change`. With `severity=tinggi` only the 2 Warning-derived alerts return.

- [ ] **Step 4: Commit**

```bash
git add src/data/alerts.ts "src/app/(dashboard)/alerts/page.tsx"
git commit -m "feat(fe): alert center consumes real /api/alerts, drop fake seed+toast"
```

---

## Task 10: FE Executive cards — read `executive.json`

**Files:**
- Modify: `src/data/executive.ts` (source `topMetricsData` + `shortcutCardsData` from JSON)

**Interfaces:**
- Consumes: `src/data/generated/executive.json`.
- Produces: unchanged exports `topMetricsData: TopMetric[]`, `shortcutCardsData`.

- [ ] **Step 1: Rewrite `src/data/executive.ts`**

Keep the `TopMetric` interface; replace the two hardcoded arrays:

```typescript
import generated from "./generated/executive.json"

export interface TopMetric {
  title: string;
  value: string;
  statusText: string;
  statusType: "positive" | "stable" | "neutral" | "surplus";
  subtext?: string;
  chartType: "line-red" | "line-green" | "dots" | "bars";
}

export const topMetricsData: TopMetric[] = generated.topMetrics as TopMetric[]
export const shortcutCardsData = generated.shortcutCards
```

- [ ] **Step 2: Verify — build + parser-safety**

Run: `cd supplai-dev && npx tsc --noEmit`
Expected: no errors. Then confirm each `topMetrics[].value` in `src/data/generated/executive.json` matches `^\d+(\.\d+)?[^0-9.-]*$` (no thousands separators / minus) so `top-cards.tsx`'s `parseFloat` renders correctly:

Run: `node -e "require('./src/data/generated/executive.json').topMetrics.forEach(m=>{if(!/^\d+(\.\d+)?[^0-9.-]*$/.test(m.value))throw new Error('unsafe '+m.value)});console.log('values OK')"`
Expected: `values OK`.

- [ ] **Step 3: Commit**

```bash
git add src/data/executive.ts
git commit -m "feat(fe): executive top-cards read real generated metrics"
```

---

## Task 11: End-to-end verification + regenerate workflow

**Files:**
- Create: `scripts/verify_endpoints.sh`
- Modify: `package.json` (add `export:data`, `verify:api` scripts)
- Create: `scripts/README.md` (regenerate instructions)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Create `scripts/verify_endpoints.sh`**

```bash
#!/usr/bin/env bash
# Boot next dev, curl the 3 live endpoints, assert real values, tear down.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run dev >/tmp/supplai-next.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
for i in $(seq 1 30); do curl -sf http://localhost:3000/api/commodities >/dev/null 2>&1 && break; sleep 1; done

echo "== /api/heatmap ==";        curl -sf "http://localhost:3000/api/heatmap?commodity=beras&range=12" | grep -q '"matrix"' && echo OK
echo "== /api/redistribution =="; curl -sf "http://localhost:3000/api/redistribution?commodity=beras" | grep -q '"routes"' && echo OK
echo "== /api/alerts ==";         curl -sf "http://localhost:3000/api/alerts" | grep -q '"summary"' && echo OK
echo "ALL ENDPOINTS OK"
```

- [ ] **Step 2: Make it executable and run the full chain**

```bash
cd supplai-dev
chmod +x scripts/verify_endpoints.sh
python scripts/export_web.py          # regenerate from artifacts
cd scripts && python -m pytest tests/test_export_web.py -q && cd ..
npm run build                          # full typecheck + prod build
bash scripts/verify_endpoints.sh
```
Expected: pytest green (9 passed); `npm run build` succeeds with no type errors; verify script prints `ALL ENDPOINTS OK`.

- [ ] **Step 3: Add convenience scripts to `package.json`**

In `"scripts"` add:

```json
    "export:data": "python scripts/export_web.py",
    "verify:api": "bash scripts/verify_endpoints.sh"
```

- [ ] **Step 4: Write `scripts/README.md`**

```markdown
# Data export

The dashboard reads real model outputs from `src/data/generated/*.json`.
Regenerate them from the SupplAi pipeline artifacts:

    npm run export:data          # reads ../hackathon_phase2/artifacts by default
    # or: python scripts/export_web.py --artifacts /path/to/artifacts

Then verify the live endpoints:

    npm run verify:api

Phase 1 wires Alert Center, Heatmap, and Redistribusi + shared
commodities/regions/executive. The Price-Prediction page is phase 2.
```

- [ ] **Step 5: Manual spot-check (browser)**

Run `npm run dev`, open `/heatmap`, `/redistribusi`, `/alerts`. Confirm: heatmap shows 34 provinces with real prices; redistribusi shows real routes (Bali→Kalimantan Utara etc.); Alert Center shows real province/commodity alerts (2 WARNING, 21 INFO), no "Cabai Rawit Jayapura" toast; commodity dropdowns list the 6 real commodities; top cards show 95.9% / 204 / 4800 / 65.

- [ ] **Step 6: Commit**

```bash
git add scripts/verify_endpoints.sh scripts/README.md package.json
git commit -m "chore(fe): endpoint verification + data-regeneration workflow"
```

---

## Deferred to Phase 2 (follow-up PR)

- Flagship **Price-Prediction page** (`dashboard/page.tsx`) + `prediction-chart.ts` + per-commodity `regional-data`; daily→monthly date-window rework; wire `/api/predictions` (currently dead) and `getPriceData` (left synthetic, unused).
- **NationalHeatmap** per-commodity choropleth (phase 1 shows the real staple/beras map; its commodity selector is cosmetic).
- Landing marketing copy still saying "14 hari" (faq/features/about/hero/modules); the fabricated **alert-detail page** (`alerts/[id]`); the hardcoded **executive activity feed**.

## Self-Review

- **Spec coverage:** static-JSON bridge (Tasks 1–5, 11); 6 commodities / 34 provinces / monthly (Global Constraints, Tasks 1–2); heatmap/alerts/redistribution/executive wired (Tasks 7–10); commodity/region maps (Task 1); severity + priority maps (Tasks 3–4); MAPE from rolling backtest (Task 5); redistribution stock proxy (Task 4); executive reframes (Task 5); dropdown + label fixes (Tasks 7–8); alerts-page API-consumption gotcha (Task 9); verification (Task 11). Deferred items explicitly listed. ✔
- **Placeholder scan:** no TBD/TODO; every code step shows full code; every test step shows expected output. ✔
- **Type consistency:** `getHeatmapData`/`getAlerts`/`getRedistributionData`/`getPriceData` signatures preserved; `Alert.change` added in Task 3 and consumed in Task 9; `RegionalPrice`/`TopMetric` interfaces preserved; generated JSON keys (`beras`, `all`, `topMetrics`, `shortcutCards`) match reader code. ✔
