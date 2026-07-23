#!/usr/bin/env bash
# start.sh — start the SupplAi dashboard (Next.js front-end).
#
# Usage:
#   ./start.sh              start the dev server (auto-picks a free port)
#   ./start.sh --prod       production build, then start
#   ./start.sh --refresh    regenerate data from ../artifacts before starting
#   ./start.sh --port 5001  prefer a specific port (falls back if it is busy)
#   ./start.sh --help       show this help
#
# It picks the first free port from a preferred list, so a congested machine
# never blocks startup. The dashboard reads real model data from committed JSON
# (src/data/generated), so it runs standalone — no separate backend server.
# Use --refresh only after retraining the model (needs Python + ../artifacts).
set -euo pipefail

cd "$(dirname "$0")"

# Preferred ports, first free one wins (privileged / DB ports intentionally excluded).
PORTS=(8100 8000 8001 8008 8080 8010 8020 8030 8040 8050 8060 8070 8090 \
       5000 5001 5002 5003 5004 5005 5006 5007 5008 5009 5010 6969 7007 8501)

MODE="dev"
REFRESH=0
PORT_OVERRIDE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --prod) MODE="prod" ;;
    --refresh) REFRESH=1 ;;
    --port) PORT_OVERRIDE="${2:?--port needs a number}"; shift ;;
    -h|--help) grep '^#' "$0" | grep -v '^#!' | sed 's/^#\( \|$\)//'; exit 0 ;;
    *) echo "unknown option: $1 (try --help)" >&2; exit 1 ;;
  esac
  shift
done

command -v npm >/dev/null || { echo "npm not found — install Node.js first." >&2; exit 1; }

port_busy() {
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -q ":$1 "
  else
    (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null && { exec 3>&- 3<&-; return 0; } || return 1
  fi
}

# Pick the first free port: the --port value (if given) is tried first.
CANDIDATES=("${PORTS[@]}")
[ -n "$PORT_OVERRIDE" ] && CANDIDATES=("$PORT_OVERRIDE" "${PORTS[@]}")
PORT=""
for p in "${CANDIDATES[@]}"; do
  if port_busy "$p"; then continue; fi
  PORT="$p"; break
done
[ -n "$PORT" ] || { echo "No free port found in the preferred list." >&2; exit 1; }
if [ -n "$PORT_OVERRIDE" ] && [ "$PORT" != "$PORT_OVERRIDE" ]; then
  echo "!! port $PORT_OVERRIDE is busy — using $PORT instead."
fi

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

echo
echo "======================================================"
echo "  SupplAi dashboard → http://localhost:${PORT}"
echo "  mode: ${MODE}   (press Ctrl+C to stop)"
echo "======================================================"
echo

if [ "$MODE" = "prod" ]; then
  npm run build
  npm run start -- -p "$PORT"
else
  npm run dev -- -p "$PORT"
fi
