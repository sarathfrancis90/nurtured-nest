# Nurtured Nest Booking (In-app)

This repository implements a free-tier-friendly in-app booking workflow with:
- Dynamic availability
- Idempotent booking creation
- Token-based manage/confirm flows
- Notification queue with email and optional SMS reminders
- API contract-first validation
- Front-end pages using the existing design language

## 1) What is implemented

### App pages
- Homepage booking CTA routes to `/book` (no calendar redirects)
- `/book`:
  - Step 1: service/date/time selection
  - Availability from `/api/bookings/availability`
  - Step 2: client details
  - Confirmation and submit
  - Success view with manage link
- `/book/manage/[bookingId]`
  - Loads booking by token
  - Confirm, cancel, and reschedule actions using token-protected endpoints
- `/book/lookup`
  - Finds bookings by email or phone after one-time verification

### API routes
- `GET /api/bookings/availability`
  - returns available UTC slots constrained by service window, timezone and lead time
- `POST /api/bookings`
  - creates booking with idempotency and overlap checks
- `GET /api/bookings/{bookingId}/manage?token=...`
  - returns booking state for secure self-service management
- `POST /api/bookings/{bookingId}/confirm`
- `POST /api/bookings/{bookingId}/cancel`
  - both require valid token and return status updates
- `POST /api/bookings/{bookingId}/reschedule`
- `POST /api/bookings/lookup`
  - creates a short-lived verification challenge without exposing booking tokens
- `POST /api/bookings/lookup/verify`
  - consumes the challenge and returns secure manage links
- `POST /api/bookings/cron`
  - processes notification outbox

### Database
- Prisma models:
  - `Booking`
  - `BookingIdempotency`
  - `BookingNotificationOutbox`
  - `BookingEvent`
  - `AvailabilityBlock`
  - `BookingLookupChallenge`

## 2) Feasibility on free tiers (with low booking volume)

Given your low booking volume and desire to stay free-tier:
- **Database**: Managed Postgres (Neon free plan / Supabase free tier / Railway free if available) is enough for small loads.
- **Recommended DB**: Supabase free tier Postgres for managed production convenience and free-tier reliability.
- **Email**: Resend free tier for small volume email confirmations/reminders.
- **SMS**: Twilio trial (paid credits model, low usage) if you need SMS reminders.
- **Cron/queue worker**:
  - `processNotificationQueue()` reads from DB outbox and can run via Vercel Cron, GitHub Action cron, or any scheduler.
- **Traffic shape**: lead-time + daily cap + rate limiting and idempotency cover low-traffic reliability.

Open-source primitives used:
- Next.js (framework)
- Prisma + Postgres schema migration model
- Zod validation
- Luxon timezone/date handling
- Playwright (test harness)

## 3) Deployment notes

1. Install and sync env vars
   - Copy `.env.example` to `.env`
   - Ensure `DATABASE_URL`, `APP_URL`, `APP_SHARED_SECRET`
   - Configure provider keys if email/SMS is enabled
2. Generate Prisma client
   - `npm run db:generate`
3. Apply schema
   - `npx prisma migrate deploy` (use committed migrations in production)
4. Start app
   - `npm run dev`
5. Deploy notification worker
   - Keep `vercel.json` in repo; Vercel Cron is configured for `/api/bookings/cron`.
   - If `CRON_SECRET` is set, calls are authorized by:
     - `x-cron-secret` header, or
     - `cron_secret` query param, or
     - Vercel cron invocation (`x-vercel-cron: 1`) when no `CRON_SECRET` is configured

## 3.1) Local containerized Postgres (local testing)

Use this to keep local validation deterministic:
- Start DB: `docker compose up -d`
- Wait for readiness: `docker inspect -f '{{json .State.Health.Status}}' nurtured-nest-db`
- Sync schema: `npx prisma db push`
- Stop DB when done: `docker compose down`

Production Supabase (recommended) DB:
- Use Supabase managed Postgres (`postgresql://... ?sslmode=require`) from project settings.
- This keeps schema behavior consistent across local + free-tier hosted environments.

## 3.2) Free-tier-ready production architecture

- Database
  - Start with a managed Postgres free tier (Neon or Supabase) and keep booking volume low.
  - Keep retention short on events/outbox if growth is a concern.
- Runtime
  - Vercel Hobby/Starter for app hosting (no extra message queue service needed).
  - Use Vercel Cron (or GitHub Actions every 5 min) for `/api/bookings/cron`.
  - Vercel Cron schedule is set in `vercel.json` as `*/5 * * * *`.
- Notification transport
  - Email: Resend free sandbox/dev mode for non-production testing.
  - SMS: Twilio trial for low-volume reminders.
- Open-source dependencies
  - Framework + validation + data + tests already in stack:
    - Next.js, Prisma, Zod, Luxon, Playwright.

## 3.3) Deployment + validation gates (required before release)

1. `npm run build`
2. `npm run qa` (typecheck + full e2e suite)
3. `npm run api:contracts`
4. `npm run notify:contracts`
5. `npm run db:smoke`
6. `npm run verify:production` (staging/staged env only, points to target URL via `E2E_BASE_URL`)
7. Manual notification audit
   - In staging, set test credentials and run `npm run notify:live`.
   - Confirm output file `.notify-live-last-run.json` exists and indicates successful payload generation.
8. Production deployment
   - Set `DATABASE_URL`, `APP_URL`, `APP_SHARED_SECRET`.
   - Set `CRON_SECRET`.
   - Configure cron authorization with one or more accepted pathways (`x-cron-secret`, `cron_secret`, or x-vercel-cron when `CRON_SECRET` is not configured).
   - Configure provider env:
     - `RESEND_API_KEY`, `EMAIL_FROM` for email.
     - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` for SMS.
   - Route `/book`, `/book/manage/...` and all API endpoints must stay behind app domain only (no calendar redirect).

## 3.4) Free-tier alerting strategy (email + SMS)

- Email:
  - Use Resend free tier for prod/dev confirmation and reminder traffic.
  - Keep provider key out of local dev to avoid unexpected sends, and rely on contract tests for template verification.
  - Use `npm run notify:live` as a one-time smoke audit in staging with test recipient values.
- SMS:
  - Use Twilio with `ENABLE_SMS=true` when you intentionally want SMS reminders.
  - Configure:
    - `TWILIO_ACCOUNT_SID`
    - `TWILIO_AUTH_TOKEN`
    - `TWILIO_FROM`
  - Ensure message templates remain under transport limits (`160` chars for legacy SMS path).
- Delivery:
  - All alerts go through DB-backed outbox with retry status.
  - `/api/bookings/cron` drives actual provider calls and is idempotent-safe.

## 3.5) Vercel Cron production runbook

1. Confirm Vercel cron config
   - `vercel.json` contains a cron entry for `/api/bookings/cron`.
   - schedule is every 5 minutes by default (`*/5 * * * *`).
2. Post-deploy verification (staging first, production second)
   - run `npm run qa`, `npm run api:contracts`, `npm run notify:contracts`, and `npm run db:smoke` against staging URL.
   - trigger one manual call to `POST /api/bookings/cron` with the scheduler secret.
   - confirm response payload is `{ ok: true, data: { processed, sent, failed, retried, dead, skipped } }`.
3. Validate scheduled execution
   - open Vercel Cron dashboard and confirm last run is successful.
4. Release hardening
   - set `CRON_SECRET` and keep it rotated on secret changes.
   - keep alert provider credentials for production only.
   - track `.notify-live-last-run.json` in staging for outbound template validation.

## 4) Validation contracts

`contracts/booking-validation.json` is the machine-readable contract used by validation agents for automated checks:
- request/response envelope shape
- service/channels rules
- error expectations for known failure modes (validation, overlap, idempotency, business hours, queue behavior)

## 5) E2E checks shipped

- `tests/e2e/booking-entry.spec.ts`
- `tests/e2e/booking-happy-path.spec.ts`
- `tests/e2e/booking-adversarial.spec.ts`
- `tests/e2e/booking-qa-visual.spec.ts`
- `tests/e2e/booking-contract.spec.ts`
- `tests/e2e/booking-notification-contract.spec.ts`

Run:
- `npm run build` (type + compile)
- `npx playwright install`
- `npm run e2e`

## 6) Validation plan for adversarial QA agents

Execution order used for hardening:

1. Entrypoint/flow checks: `tests/e2e/booking-entry.spec.ts`
2. Happy path checks: `tests/e2e/booking-happy-path.spec.ts`
3. Adversarial functional checks: `tests/e2e/booking-adversarial.spec.ts`
4. Visual/usability checks: `tests/e2e/booking-qa-visual.spec.ts`
5. API contract checks: `tests/e2e/booking-contract.spec.ts`
6. Notification payload/template checks: `tests/e2e/booking-notification-contract.spec.ts`
7. DB smoke checks: `npm run db:smoke`

For deployment validation:

- Validate env and contract assumptions against `contracts/booking-validation.json`.
- Run `npm run e2e` from staging URL by setting `E2E_BASE_URL`.
- Keep `RESEND_API_KEY` and Twilio credentials unset for dev smoke tests to avoid non-deterministic outbound traffic.
- When credentials are available, run the optional live provider audit script after staging verification:
  - `npm run notify:live`

## 7) Production rollout (GitHub + Vercel + Supabase)

### 7.1 Zero-friction deployment flow

- Local/pre-merge:
  - Push to any branch or open PR: `.github/workflows/production-deploy.yml` runs typecheck/build/e2e/contract gates against the committed Prisma migration chain using containerized Postgres.
- Merge to `main`:
  - Same quality gates run.
  - A separate `migrate` job applies versioned Prisma migrations to production before deployment.
  - Vercel deployment runs only after quality and database migration jobs pass.
  - Post-deploy smoke checks run automatically via `scripts/production-smoke.sh`.

### 7.2 Required GitHub repository secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `CRON_SECRET` (recommended; required for strict cron auth in production)
- `APP_SHARED_SECRET`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (optional while SMS is disabled)

### 7.3 Production URL smoke validation

From your local terminal:

```bash
APP_URL="https://your-domain.example" \
E2E_BASE_URL="https://your-domain.example" \
CRON_SECRET="your-cron-secret" \
bash scripts/production-smoke.sh
```

This validates entry points, cron auth behavior, and route/contract smoke coverage.

### 7.4 Post-deploy provider audit

After each production push:

1. Confirm `.notify-live-last-run.json` exists after running:
   - `npm run notify:live`
2. Confirm template text/subject expectations in test logs (and optionally provider dashboards).
3. Confirm reminders are queued and processed:
   - `GET /api/bookings/cron` fails without auth
   - `POST /api/bookings/cron` succeeds with `CRON_SECRET` and returns queue summary.

You can also use the npm alias:

```bash
npm run smoke:production
```

### 7.5 Supabase + Resend + Cloudflare note

- Supabase remains the DB recommendation for free-tier transactional consistency.
- Resend works well with Cloudflare-hosted domains for domain-based sender identity:
  - Add provider-issued DNS records to Cloudflare.
  - Set `EMAIL_FROM` to a verified address under that domain.
- Twilio remains optional and can stay disabled until SMS is needed.
