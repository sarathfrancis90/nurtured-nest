# CLAUDE.md — Nurtured Nest

## Project Overview

Professional birth doula business website (Nurtured Nest by Varshitha). Next.js 15 App Router with Supabase backend, deployed to Cloudflare Workers via OpenNext. Combines a public marketing site with a protected admin panel.

## Tech Stack

- **Framework**: Next.js 15.2 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase Postgres with Row-Level Security
- **Auth**: Supabase Auth (email/password for admin)
- **Validation**: Zod
- **Styling**: Plain CSS with custom properties (no CSS-in-JS, no Tailwind)
- **Deployment**: Cloudflare Workers via `@opennextjs/cloudflare`
- **Email**: Resend API
- **CAPTCHA**: Cloudflare Turnstile

## Commands

```bash
npm run dev              # Local dev server
npm run build            # Production build
npm run lint             # ESLint (next/core-web-vitals + next/typescript)
npm run build:cloudflare # OpenNext build for Cloudflare Workers
npm run deploy:cloudflare # Build + deploy to Cloudflare
```

**CI runs `lint` then `build` on PRs.** Both must pass.

## Project Structure

```
app/
  (public)/          # Public marketing pages (home, about, services, contact, etc.)
    resources/[slug] # Dynamic blog-style resource posts
    layout.tsx       # Public layout with PageShell
  admin/             # Protected admin panel (dashboard, leads, settings, content)
    layout.tsx       # Admin layout with auth gate + AdminShell
  actions.ts         # All server actions (forms, auth, CRUD)
  globals.css        # All styles — CSS custom properties for theming
components/          # Shared React components
lib/
  types.ts           # TypeScript type definitions
  data.ts            # Data fetching functions (Supabase with bundled fallbacks)
  content.ts         # Default/fallback content (works without Supabase)
  auth.ts            # Auth helpers
  env.ts             # Environment variable validation
  supabase-server.ts # Server-side Supabase client
  supabase-browser.ts # Client-side Supabase client
  utils.ts           # Utility helpers (phone formatting, WhatsApp links)
db/
  schema.sql         # Full Postgres schema with RLS policies and seed data
docs/
  runbook.md         # Non-technical admin guide
```

## Architecture & Patterns

### Data Flow
- **No REST API** — uses Next.js Server Actions exclusively (`app/actions.ts`)
- Public pages fetch from Supabase with bundled fallback defaults (`lib/data.ts` + `lib/content.ts`)
- Forms validated with Zod schemas, then processed in server actions
- Contact form submissions: validate → Turnstile CAPTCHA check → store lead → send email via Resend

### Component Model
- **Server Components by default** (async components in `app/`)
- **Client Components** use `"use client"` pragma — only where interactivity is needed (forms, admin UI)
- Path alias: `@/*` maps to root directory

### Graceful Degradation
- `lib/env.ts` exports `hasSupabaseEnv()` — data layer checks this before querying
- When Supabase is unavailable, bundled content from `lib/content.ts` is returned
- This means the site can render without a database connection

### Database
- 7 tables: `site_settings`, `service_items`, `faqs`, `testimonials`, `resources_posts`, `leads`, `cta_events`
- RLS enforced: public reads for content, public insert for leads, authenticated full access for admin
- Lead status workflow: `new` → `contacted` → `consult-booked` → `closed-won` / `closed-lost`
- Schema changes go in `db/schema.sql`

## Code Conventions

- **Variables/functions**: camelCase
- **React components**: PascalCase
- **Database columns**: snake_case
- **CSS classes**: kebab-case / BEM-style (`admin-layout`, `admin-sidebar`)
- **Styling**: CSS custom properties for theming (`--color-sky`, `--color-sand`, `--color-ink`, `--color-accent`); mobile-first responsive; `--radius: 22px` for consistent border radius
- **No test framework** currently — CI validates via lint + build only
- **No Tailwind** — all styles in `app/globals.css`

## Environment Variables

See `.env.example` and `.dev.vars.example` for the full list. Key vars:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `RESEND_API_KEY` / `RESEND_FROM` / `NOTIFICATION_EMAIL` — Email notifications
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` — CAPTCHA
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL

## CI/CD

- **PR checks** (`.github/workflows/ci.yml`): `npm ci` → `lint` → `build` on Node 20
- **Deploy** (`.github/workflows/deploy-cloudflare.yml`): auto on push to `main` + manual trigger; deploys via Wrangler to Cloudflare Workers
- Deployment requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets
