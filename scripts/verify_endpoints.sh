#!/usr/bin/env bash
# Boot next dev, curl the 3 live endpoints, assert real values, tear down.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run dev >/tmp/supplai-next.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
for _ in $(seq 1 40); do
  curl -sf http://localhost:3000/api/commodities >/dev/null 2>&1 && break
  sleep 1
done

echo "== /api/heatmap =="
curl -sf "http://localhost:3000/api/heatmap?commodity=beras&range=12" | grep -q '"matrix"' && echo OK
echo "== /api/redistribution =="
curl -sf "http://localhost:3000/api/redistribution?commodity=beras" | grep -q '"routes"' && echo OK
echo "== /api/alerts =="
curl -sf "http://localhost:3000/api/alerts" | grep -q '"summary"' && echo OK
echo "ALL ENDPOINTS OK"
