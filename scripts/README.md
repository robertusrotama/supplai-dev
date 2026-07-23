# Data export

The dashboard reads real model outputs from `src/data/generated/*.json`.
Regenerate them from the SupplAi pipeline artifacts:

    npm run export:data          # reads ../artifacts by default
    # or: python scripts/export_web.py --artifacts /path/to/artifacts

Then verify the live endpoints:

    npm run verify:api

Unit tests for the export transforms:

    cd scripts && python -m pytest tests/test_export_web.py -q

## Scope

Phase 1 wires **Alert Center, Heatmap, and Redistribusi** end-to-end, plus the
shared `commodities` / `regions` / `regional-data` / `executive` modules. Data
is provincial (34), monthly, six real commodities.

The flagship **Price-Prediction** page (`dashboard/page.tsx`, `prediction-chart.ts`)
is phase 2 — it is built around a daily 14-day window and still reads synthetic
data until reworked to monthly.

## Generated files

| File | Feeds |
|------|-------|
| `commodities.json` | every commodity dropdown |
| `regions.json` | region selectors |
| `regional.json` | national choropleth (`NationalHeatmap`) |
| `heatmap.json` | `/api/heatmap` → Heatmap page |
| `alerts.json` | `/api/alerts` → Alert Center |
| `redistribution.json` | `/api/redistribution` → Redistribusi page |
| `executive.json` | executive top cards |

Numbers are honest: MAPE is the rolling-origin horizon-1 blend (≈95.9% accuracy);
redistribution `stock` is an LP-volume proxy, not warehouse inventory.
