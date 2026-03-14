# Nurtured Nest Web App

Production-ready Next.js website and admin app for Nurtured Nest (Varshitha, Professional Birth Doula), designed to run on free-tier infrastructure.

## Live URLs
- **Primary:** https://nurtured-nest.sarathfrancis.workers.dev
- **Custom domain:** https://nurturednest.sarathfrancis.work (requires DNS setup)

## Flyer-accurate source data
- Business: Nurtured Nest
- Name: Varshitha
- Role: Professional Birth Doula
- Tagline: Where Birth Feels Safe
- Contact: 226-755-9978, nurturednestca@gmail.com
- Services:
  - Emotional and physical support for new parents
  - Advocacy and guidance for birth preferences
  - Comfort techniques: breathing and positioning

## Stack
- Next.js (App Router, TypeScript)
- Supabase (database, auth, storage)
- Cloudflare Workers (deployment via OpenNext)
- Cloudflare Turnstile (anti-spam)
- Resend (notification emails)

## Quick start
1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env.local`
3. Fill env values from Supabase/Resend/Turnstile.
4. Run local dev:
   - `npm run dev`
5. Production build check:
   - `npm run build`

## Database setup
1. Open Supabase project SQL Editor.
2. Run [`db/schema.sql`](db/schema.sql).
3. Create at least one authenticated admin user in Supabase Auth.

## Admin usage
- URL: `/admin`
- Login with Supabase Auth email/password.
- Use pages:
  - `/admin/leads` for inquiry tracking
  - `/admin/settings` for core business/contact details
  - `/admin/content`, `/admin/testimonials`, `/admin/resources` for content tables

## Cloudflare deployment (Workers + OpenNext)
1. Authenticate Wrangler:
   - `npx wrangler login`
2. Copy local preview env:
   - `cp .dev.vars.example .dev.vars`
3. Build for Cloudflare runtime:
   - `npm run build:cloudflare`
4. Preview Cloudflare runtime locally:
   - `npm run preview:cloudflare`
5. Deploy:
   - `npm run deploy:cloudflare`
6. Domain routes are configured in [`wrangler.jsonc`](wrangler.jsonc):
   - `nurturednest.sarathfrancis.work/*`
7. DNS setup in Cloudflare for zone `sarathfrancis.work`:
   - proxied `AAAA` record for `nurturednest` → `100::` (placeholder for Workers route)

## GitHub setup
1. Configure repository secrets for CI/CD deploy:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
2. Optional runtime secrets (for full production functionality):
   - `RESEND_API_KEY`
   - `NOTIFICATION_EMAIL`
   - `NOTIFICATION_FROM_EMAIL`
   - `TURNSTILE_SECRET_KEY`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

## Notes
- If Supabase env vars are missing, website falls back to bundled default flyer content and admin actions are disabled.
- Booking uses external link (`booking_url`) and WhatsApp deep links.
- Pricing is intentionally handled as "Contact for pricing".
