# Wire FE API to real model artifacts — Design

**Date:** 2026-07-22
**Branch:** `feat/wire-api-real-artifacts` (fork `bakwankawa/supplai-dev`, PR target `robertusrotama/supplai-dev:dev`)
**Status:** Approved (design), pending implementation plan

## Goal

Replace the front-end's synthetic data layer (seeded-PRNG random walks, fake
commodities, hardcoded counts) with real outputs from the SupplAi forecasting
pipeline, without changing the API contract the React components already consume.

## Context

The FE (`supplai-dev`, Next.js App Router) serves six API routes. Each route
imports a function/const from `src/data/*.ts` and returns it as JSON. Today
those modules are **entirely synthetic**: `prices.ts` generates random walks
with a fake "Ramadan spike" narrative; `commodities.ts` lists 11 commodities
(5 of which the model never forecasts); `alerts.ts` / `redistribution.ts` are
hardcoded arrays; `executive.ts` holds invented operational metrics.

The model (`hackathon_phase2`, `train.py`) is a **batch pipeline**, not a live
service. It precomputes every forecast, alert, and redistribution route into
`artifacts/*.parquet` + `meta.json`. There is nothing to serve live — so the
bridge is an export step, not an API server.

## Decisions (locked with user)

| Decision | Choice |
|---|---|
| Data bridge | **Static JSON export** — Python reads artifacts, writes JSON into the repo; routes read JSON. No runtime Python. |
| Commodities | **6 real only**: beras, bawang-merah, bawang-putih, daging-ayam, telur-ayam, minyak-goreng. Drop cabai-rawit, gula-pasir, daging-sapi, tomat, wortel, kentang. |
| Spatial level | **Provincial (34)**. Export is level-parameterized so kabupaten (111) is a re-run, but the FE (province field, choropleth, redistribution provinces) stays provincial. |
| Granularity | **Monthly + relabel**. Real monthly history + 3 monthly forecast points. FE day-range controls (14/30/90 hari) relabelled to months (1/3/6 bulan). |
| Executive cards | **Fix what's real, reframe the rest** (see Honesty). |

## Architecture

Two pieces:

### 1. `export_web.py` (new — in `hackathon_phase2/`, next to `train.py`)

- CLI: `python export_web.py [--level provinsi|kabupaten] [--out <dir>]`.
  Default level `provinsi`; default out `supplai-dev/src/data/generated/`.
- Reads from `artifacts/` (or `artifacts_kab/` when `--level kabupaten`).
- Writes 7 JSON files (below).
- Self-validates before writing: 6 commodities, 34 regions, no NaN, monthly
  ISO dates, all 7 files non-empty. Exits non-zero on any failure.
- Idempotent — safe to re-run after every retrain.

### 2. Rewired accessors (in `supplai-dev/src/data/*.ts`)

The `data/*.ts` modules keep their **exact exported signatures** so the
`api/*/route.ts` handlers and React components need no change:

- `getPriceData(commodityId, regionId, range)` → `PredictionResponse`
- `getHeatmapData(commodityId, range)` → `HeatmapResponse`
- `getAlerts(filters)` → `AlertResponse`
- `getRedistributionData(commodity?)` → `RedistributionResponse`
- `commodities: Commodity[]`, `regions: Region[]`

Internals change from PRNG generation to reading `./generated/*.json`
(static `import`, bundled by Next). The PRNG config tables in `prices.ts`
(`COMMODITY_CONFIG`, `DISTANCE_FACTOR`, `mulberry32`, generators) are removed.

### Data flow

```
train.py → artifacts/*.parquet + meta.json
         → export_web.py --level provinsi
         → supplai-dev/src/data/generated/*.json
         → data/*.ts accessors (read JSON)
         → api/*/route.ts (unchanged)
         → useApi hook → React components (unchanged)
```

## Generated JSON — schemas

All shapes mirror `src/lib/types.ts`. Slugs: lowercase, non-alphanumeric →
hyphen (e.g. `"DKI Jakarta"` → `dki-jakarta`, `"Jawa Barat"` → `jawa-barat`).

### `commodities.json` — `Commodity[]`
Fixed map (WFP name → id, display name, unit):
```
Beras Medium   → beras,         "Beras Medium",   kg
Bawang Merah   → bawang-merah,  "Bawang Merah",   kg
Bawang Putih   → bawang-putih,  "Bawang Putih",   kg
Daging Ayam    → daging-ayam,   "Daging Ayam",    kg
Telur Ayam     → telur-ayam,    "Telur Ayam",     kg
Minyak Goreng  → minyak-goreng, "Minyak Goreng",  kg
```
All six units are `kg` — confirmed against the WFP `unit` column (Oil is
reported per KG, not per liter).

### `regions.json` — `Region[]`
From `centroids.parquet` (34 rows): `{id: slug(provinsi), name: provinsi,
province: provinsi, lat, lng: lon}`.

### `predictions.json` — nested map `{ [commodityId]: { [regionId]: Series } }`
where `Series = { summary: PredictionSummary, timeseries: PricePoint[] }`:
- `timeseries` = last 24 months of `panel.harga` (`actual` set, `predicted`/
  `upper`/`lower` null) **followed by** 3 rows from `forecast_path`
  (`predicted = ensemble`, `upper = hi`, `lower = lo`, `actual` null).
  `date` = `YYYY-MM-01`.
- `summary.currentPrice` = `forecast.harga_kini`;
  `summary.predictedPrice` = `forecast.harga_prediksi` (h=3);
  `summary.priceChange` = last actual − previous-month actual (from `panel`);
  `summary.mape` = per-commodity **horizon-1** MAPE from rolling-origin
  backtest (`bench_final`, blend of `lstm`+`lgbm`).
- Accessor builds `comparison` (current price across regions for the commodity)
  from the map at request time; `range` slices the history tail.

### `heatmap.json` — `{ [commodityId]: HeatmapResponse }`
- `matrix`: one `HeatmapRow` per region; `data` = last 12 monthly cells
  `{date, price, change}` where `change` = cumulative % vs first cell in range.
- `summary`: `{ totalRegions: 34, avgIncrease, alertCount }` (alertCount =
  regions with >10% cumulative rise — same rule as fixture, now on real data).
- `topCritical`: top 5 by `forecast.perubahan_persen`.
- Accessor slices to `range` months.

### `alerts.json` — `AlertResponse`
From `alerts.parquet` (23 rows) → `Alert[]`:
- `id` = `ALT-001…` (stable order by severity then perubahan desc).
- `severity`: `Kritis→kritis, Warning→tinggi, Info→sedang` (`rendah` unused).
- `title` = composed, e.g. `"Harga {komoditas} {provinsi} diperkirakan naik
  {perubahan}% dalam 3 bulan"`.
- `region` = provinsi, `commodity` = id, `confidence` = `confidence`×100.
- `timestamp` = `meta.dibuat` (static snapshot).
- `status` = `"aktif"` (we have no workflow state).
- `detail.recommendation` = `alasan`; `detail.history` = one `{Terdeteksi,
  meta.dibuat}` entry.
- `summary`: `active` = count aktif, `thisMonth` = total, `resolved` = 0,
  `avgResponseTime` = 0 (no ops data). These two have no data source, so the
  UI should **hide or label them "n/a"** rather than display a misleading `0`.

### `redistribution.json` — `RedistributionResponse`
From `flows.parquet` (65 rows) + `meta.plan_meta`:
- `routes`: `{from: dari, to: ke, commodity: id, volume: volume_ton,
  distance: jarak_km, cost: biaya_rp, priority}` where `urgensi`:
  `Kritis→high, Warning→medium, Info→low`.
- `provinces`: derived from net flow — a province that is a net source
  (`dari` volume > `ke` volume) is `surplus`, else `deficit`; `stock` = net
  tons (abs). **This is an LP-volume proxy, not warehouse inventory** — we have
  no inventory data. Labeled as such in the UI copy where feasible.
- `summary`: `{ totalRoutes, totalVolume, activeRoutes, estimatedCost }`
  aggregated from `plan_meta` across commodities.
- Accessor filters `routes` by `commodity` when passed.

### `executive.json` — `{ topMetrics: TopMetric[], shortcutCards: [...] }`
Reframed to artifact-backed values (see Honesty):
- Accuracy = `100 − MAPE_h1` (~96.1%).
- Inflation card → **avg predicted 3-mo change** across commodities (real), relabelled.
- Active-TPIDs card → **34 provinsi / 204 seri** (real, relabelled).
- Distribution card → **real total LP volume** from `flows` (tons).
- Shortcut cards (recs, critical) → real route count (65) / Kritis count.

`executive.ts` refactors to read these values from `generated/executive.json`
while keeping its TS interfaces.

## Rewiring details / gotchas

- **Hardcoded default ids.** `api/predictions/route.ts` defaults
  `region=jakarta`; region ids are now province slugs, so `jakarta` no longer
  exists. Update route/component defaults to real ids (e.g. `dki-jakarta`,
  `beras`). Grep components for hardcoded region/commodity ids and fix.
- **Range semantics.** Range values become months; update the FE range-control
  labels ("14 hari" → "1 bulan", etc.) and any default range constant.
- **Number formatting.** Monthly dates render on axes previously labelled daily;
  confirm the chart's date formatter handles `YYYY-MM-01` gracefully.

## Honesty callouts (project theme)

1. **MAPE** from rolling-origin backtest (horizon-1 headline ≈ 3.94%), not the
   lenient 3-fold `meta.json` (5.18%). Reported with its horizon.
2. **Redistribution `stock`** is an LP-volume proxy, explicitly not inventory.
3. **Executive cards** — every number is either artifact-derived or a real
   count relabelled to what it actually measures. Nothing operational is
   fabricated; metrics we can't back (TPID roster, CPI inflation) are replaced
   by real quantities under honest labels.

## Implementation scoping (discovered during planning)

Tracing actual data consumers changed the delivery shape. Only **3 of 6 routes
are live** (`/api/alerts`, `/api/heatmap`, `/api/redistribution`); `/api/
predictions`, `/api/commodities`, `/api/regions` are never fetched — the pages
import the data modules directly. Additional gotchas:

- **`alerts/page.tsx` ignores its own `useApi('/api/alerts')` result** and
  renders a hardcoded `alertsList` state. Wiring the accessor is not enough —
  the page must be refactored to consume `data.alerts` (and drop the fake
  toast). API `Alert` → page `AlertData` mapping required.
- **Heatmap has two data paths.** `PriceMatrix`/`TopCritical` use `/api/
  heatmap` (clean swap), but the choropleth `<NationalHeatmap>` reads
  `regionalComparisonMaster` (`regional-data.ts`) directly — so `regional-
  data.ts` is also in scope (real per-province staple prices). NationalHeatmap's
  own commodity selector stays cosmetic in phase 1 (per-commodity choropleth
  deferred with the flagship).
- **Range control:** `FilterBar` is unused; the live control is
  `ElasticDatePicker` (heatmap page). Its day presets become month presets.

**Phased delivery (user-approved):**
- **Phase 1 (this plan):** Alert Center, Heatmap, Redistribusi + shared
  `commodities`/`regions`/`regional-data`/`executive`. Real data end-to-end for
  three of four modules.
- **Phase 2 (follow-up PR):** flagship Price-Prediction page + `prediction-
  chart.ts` + `regional-data` per-commodity + `/api/predictions`, incl. the
  daily→monthly date-window rework. Landing marketing copy, the fabricated
  alert-detail page, and the executive activity feed are deferred here too.

## Scope

**In (phase 1):** 3 live API endpoints + executive cards + shared data modules;
provincial; monthly; the export script; in-scope FE default-id / dropdown /
label fixes; verification.

**Non-goals:** live/streaming serving; kabupaten-tuned FE; the 5 fake
commodities; real TPID/inflation/inventory data; auth; new UI features.

## Verification

- `export_web.py` self-checks (fail-closed): 6 commodities, 34 regions, no NaN,
  monthly ISO dates, 7 files written.
- FE `npm run build` (typecheck) is green.
- `verify_endpoints.sh` (or a small Node script): boots `next dev`, curls all 6
  `/api` routes, asserts each response matches its `lib/types.ts` shape and
  carries real values (e.g. a known province price, a real route).
- Manual spot-check: one prediction series renders in the chart; heatmap shows
  34 provinces; alerts list shows real commodity/province.

## Rollback

The export writes only into `src/data/generated/` and touches `data/*.ts`,
route defaults, `executive.ts`, and range labels. Reverting the branch restores
the synthetic layer; no data migration or infra involved.
