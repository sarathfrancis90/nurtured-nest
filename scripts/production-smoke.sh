#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-}"
if [ -z "$APP_URL" ]; then
  echo "[production-smoke] APP_URL is required."
  echo "[production-smoke] Usage: APP_URL=\"https://your-domain\" bash scripts/production-smoke.sh"
  exit 1
fi

E2E_BASE_URL="${E2E_BASE_URL:-$APP_URL}"
export APP_URL E2E_BASE_URL

echo "[production-smoke] Target: $APP_URL"

home_status=$(curl -s -o /tmp/nn-home.html -w "%{http_code}" "$APP_URL/")
if [ "$home_status" != "200" ]; then
  echo "[production-smoke] FAIL: homepage returned status $home_status"
  exit 1
fi

if ! grep -q 'href="/book"' /tmp/nn-home.html; then
  echo "[production-smoke] FAIL: home page does not expose /book booking entrypoint"
  exit 1
fi

book_status=$(curl -s -o /tmp/nn-book.html -w "%{http_code}" "$APP_URL/book")
if [ "$book_status" != "200" ]; then
  echo "[production-smoke] FAIL: /book returned status $book_status"
  exit 1
fi

cron_anon=$(curl -s -o /tmp/nn-cron-anon.json -w "%{http_code}" -X POST "$APP_URL/api/bookings/cron")
if [ "$cron_anon" != "403" ]; then
  echo "[production-smoke] FAIL: cron endpoint should reject unauthenticated POST (status $cron_anon)"
  exit 1
fi

if [ -n "${CRON_SECRET:-}" ]; then
  cron_auth=$(curl -s -o /tmp/nn-cron-authed.json -w "%{http_code}" -X POST -H "x-cron-secret: $CRON_SECRET" "$APP_URL/api/bookings/cron")
  if [ "$cron_auth" != "200" ]; then
    echo "[production-smoke] FAIL: cron endpoint with secret returned status $cron_auth"
    exit 1
  fi
fi

echo "[production-smoke] Running route/contract smoke set against deployed app"
npm run qa:smoke

echo "[production-smoke] Production smoke checks passed."
