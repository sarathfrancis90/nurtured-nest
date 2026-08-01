#!/usr/bin/env bash
set -euo pipefail

PORT="${E2E_PORT:-3001}"
HOST="${E2E_HOST:-127.0.0.1}"
APP_URL="${APP_URL:-http://$HOST:$PORT}"
E2E_BASE_URL="${E2E_BASE_URL:-$APP_URL}"
LOG_FILE="${E2E_SERVER_LOG:-/tmp/nutured-nest-e2e-server.log}"
TIMEOUT_SECONDS="${E2E_SERVER_READY_TIMEOUT:-40}"

export APP_URL E2E_BASE_URL

npm run dev -- --hostname "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
  wait "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for i in $(seq 1 "$TIMEOUT_SECONDS"); do
  if curl -sSf "$E2E_BASE_URL/book" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq "$TIMEOUT_SECONDS" ]; then
    echo "dev server did not become ready on $E2E_BASE_URL in ${TIMEOUT_SECONDS}s" >&2
    echo "--- server log tail ---" >&2
    tail -n 120 "$LOG_FILE" >&2
    exit 1
  fi
  sleep 1
done

if [ "$#" -gt 0 ]; then
  npm run e2e -- "$@"
else
  npm run e2e
fi
