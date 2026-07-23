#!/usr/bin/env bash
# start.sh — start the SupplAi dashboard (Next.js front-end).
#
# Usage:
#   ./start.sh              start the dev server (default) on http://localhost:3000
#   ./start.sh --prod       production build, then start
#   ./start.sh --refresh    regenerate data from ../artifacts before starting
#   ./start.sh --port 4000  use a different port
#   ./start.sh --help       show this help
#
# The dashboard reads real model data from committed JSON (src/data/generated),
# so it runs standalone — no separate backend server is needed. Use --refresh
# only after retraining the model (needs Python + ../artifacts).
set -euo pipefail

cd "$(dirname "$0")"

MODE="dev"
REFRESH=0
PORT=3000
while [ $# -gt 0 ]; do
  case "$1" in
    --prod) MODE="prod" ;;
    --refresh) REFRESH=1 ;;
    --port) PORT="${2:?--port needs a number}"; shift ;;
    -h|--help) grep '^#' "$0" | grep -v '^#!' | sed 's/^#\( \|$\)//'; exit 0 ;;
    *) echo "unknown option: $1 (try --help)" >&2; exit 1 ;;
  esac
  shift
done

command -v npm >/dev/null || { echo "npm not found — install Node.js first." >&2; exit 1; }

if [ ! -d node_modules ]; then
  echo "==> Installing dependencies (first run)…"
  npm install
fi

if [ "$REFRESH" = "1" ]; then
  PY="$(command -v python || command -v python3 || true)"
  if [ -n "$PY" ] && [ -d ../artifacts ]; then
    echo "==> Regenerating data from ../artifacts…"
    "$PY" scripts/export_web.py || echo "!! export failed — falling back to committed JSON." >&2
  else
    echo "!! --refresh skipped (needs Python and ../artifacts)." >&2
  fi
fi

export PORT
echo
echo "======================================================"
echo "  SupplAi dashboard → http://localhost:${PORT}"
echo "  mode: ${MODE}   (press Ctrl+C to stop)"
echo "======================================================"
echo

if [ "$MODE" = "prod" ]; then
  npm run build
  npm run start
else
  npm run dev
fi
