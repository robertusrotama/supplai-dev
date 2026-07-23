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

All four dashboard modules run on real data — provincial (34), monthly, six
real commodities:

- **Phase 1:** Alert Center, Heatmap, Redistribusi (`/api/*`) + shared
  `commodities` / `regions` / `regional-data` / `executive`.
- **Phase 2:** flagship **Price-Prediction** page (real monthly series, month
  ranges) + per-commodity **NationalHeatmap** choropleth + honest copy
  (14 hari → 1–3 bulan).

## Generated files

| File | Feeds |
|------|-------|
| `commodities.json` | every commodity dropdown |
| `regions.json` | region selectors |
| `regional.json` | national choropleth fallback |
| `heatmap.json` | `/api/heatmap` → Heatmap page |
| `alerts.json` | `/api/alerts` → Alert Center |
| `redistribution.json` | `/api/redistribution` → Redistribusi page |
| `executive.json` | executive top cards |
| `timeseries.json` | Price-Prediction chart + NationalHeatmap map |
| `commodity_mape.json` | per-commodity MAPE on the Price-Prediction cards |

## Still synthetic (documented)

`getPriceData` / `/api/predictions` (dead endpoint, unused by any view); the
`alerts/[id]` detail narrative and the NationalHeatmap recommendation modal
(static regional copy).

Numbers are honest: MAPE is the rolling-origin horizon-1 blend (≈95.9% accuracy);
redistribution `stock` is an LP-volume proxy, not warehouse inventory.
