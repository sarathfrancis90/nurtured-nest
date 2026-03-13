# Nurtured Nest Web App

Production-ready Next.js website and admin app for Nurtured Nest (Varshitha, Professional Birth Doula), designed to run on free-tier infrastructure.

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
- Cloudflare Pages/Workers (deployment)
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
5. Create cache bucket once:
   - `npx wrangler r2 bucket create nurtured-nest-opennext-cache`
6. Deploy:
   - `npm run deploy:cloudflare`
7. In Cloudflare dashboard, add the custom domain route:
   - suggested: `nurturednest.aventiq.work`

## GitHub setup
1. Initialize this folder as its own git repo:
   - `git init`
2. Commit:
   - `git add . && git commit -m \"Initial Nurtured Nest web app\"`
3. Create remote repo and push:
   - `gh repo create nurtured-nest --private --source=. --push`

## Notes
- If Supabase env vars are missing, website falls back to bundled default flyer content and admin actions are disabled.
- Booking uses external link (`booking_url`) and WhatsApp deep links.
- Pricing is intentionally handled as "Contact for pricing".
