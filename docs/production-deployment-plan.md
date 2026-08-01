# Production Deployment Plan (Free-Tier)

This document defines the production rollout path for the in-app booking system with no reliance on Google Calendar and free-tier services.

## 1) Recommended architecture

- Runtime: Vercel (Next.js app + serverless routes)
- Data: Supabase Postgres (managed free tier)
- Notifications: Resend (email) + Twilio (SMS optional)
- Scheduler: Vercel Cron (`/api/bookings/cron` every 5 minutes)
- Queue: DB-backed notification outbox via Prisma
- Storage: None (local filesystem not used for business state)

## 2) Why Postgres via Supabase is the right fit (for low booking volume)

- You need transactional integrity for:
  - duplicate booking prevention (idempotency)
  - outbox retries/dead-letter behavior
  - booking state transitions
  - timezone-aware booking windows
- Postgres is strongly consistent and better for booking concurrency than document stores in this workflow.
- Supabase free tier is enough at low volume and gives production-like SQL behavior.

## 3) Production environment setup

### 3.1 Supabase (DB)

1. Create a Supabase project on the free tier.
2. Capture the connection string from project settings.
3. Enable SSL in URL: `?sslmode=require`.
4. Set Vercel environment variable `DATABASE_URL`.
5. Run migration/schema sync once during initial deployment:
   - `npx prisma db push --accept-data-loss` (local with production URL)

### 3.2 Resend email + domain sender (Cloudflare domain)

1. Create/add a domain in Resend.
2. Copy the DNS records from Resend into Cloudflare for that domain.
3. Verify domain in Resend UI.
4. Set:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` (must use verified domain identity, e.g. `noreply@your-domain.com`)
5. Run `npm run notify:live` in staging with test recipient to verify template output before enabling broad sends.

### 3.3 Twilio SMS (optional)

1. Add a Twilio trial account.
2. Verify sender number and set:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM`
3. Keep SMS enabled only when needed using `ENABLE_SMS=true`.
4. For production staging, set `TWILIO_TEST_TO` before dry-run sends.

### 3.4 Core application secrets

- `APP_SHARED_SECRET` (strong, random, minimum 32 bytes)
- `APP_URL` (production origin, e.g. `https://your-domain`)
- `CRON_SECRET` (strong, rotate if exposed)
- `APP_ENV=production`
- `RATE_LIMIT_REQUESTS_PER_MINUTE` for low-volume tuning

## 4) Cloudflare + domain-based sender note

Your guess is correct: this stack can send from a real domain-based email.
Use your hosted domain in Cloudflare, add DNS records provided by Resend, and keep `EMAIL_FROM` aligned to that verified domain.

## 5) Deployment automation

### 5.1 Push-to-main contract

The repository now includes `.github/workflows/production-deploy.yml`:

- Pull requests: run local production-readiness gates only.
- Push to `main`: run readiness gates, deploy to Vercel production, then run post-deploy smoke checks.

### 5.2 Required GitHub repository secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `CRON_SECRET` (optional, strongly recommended)
- `DATABASE_URL` (for local CI migrations only if you replicate secret handling in CI)

### 5.3 Post-deploy verification commands

Set `APP_URL` to the deployment URL and run:

```bash
APP_URL="https://your-domain" E2E_BASE_URL="$APP_URL" bash scripts/production-smoke.sh
```

This validates:
- homepage reachable and includes `/book` entrypoint
- `/book` route is reachable
- unauthorized cron call fails (security posture)
- authorized cron call works when `CRON_SECRET` is set
- route/contract smoke suite

## 6) Validation contracts for agent review

Contract baseline already exists in `contracts/booking-validation.json` and includes:

- API envelope shapes
- validation and auth error codes
- idempotency expectations
- reminder schedule and template requirements
- booking UI entrypoint contract (`/book`, `/book/manage/{id}?token={token}`)

Use the same contract as the source of truth for adversarial QA and functional/e2e acceptance.
