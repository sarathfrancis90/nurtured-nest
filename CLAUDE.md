# Nurtured Nest — Project Guide

## What Is This

Landing page / website for **Nurtured Nest** — a doula and birth support practice founded by Varshitha, based in Seattle WA. The brand identity is "The Curated Sanctuary."

## Current Phase

**Design complete — ready for development.** All design decisions locked. Mobile nav, contact, animations, responsiveness, analytics, and brand assets finalized. Testimonials and FAQ sections deferred to post-launch.

## Design Artifacts

All design documentation lives in `docs/design/`:

| File | Contents |
|------|----------|
| `color-tokens.md` | Full M3-style color token system with usage rules |
| `typography.md` | Font families, type scale, hierarchy conventions |
| `components.md` | Component specs: buttons, cards, nav, shapes, shadows |
| `principles.md` | Design rules: No-Line, No-Green, Organic Flow, etc. |
| `layout-blueprint.md` | Section-by-section layout, grid, content inventory |
| `refinements.md` | Issues tracker and open design questions |
| `brand-assets.md` | Logo anatomy, font IDs, icon inventory, usage rules |
| `reference/` | Original Stitch export (code.html, screen.png, DESIGN.md) |

## Key Design Rules (Quick Reference)

1. **No 1px borders** for sectioning — use tonal shifts between surface tiers
2. **No green** — even for success. Use primary blue
3. **No pure black shadows** — tint with #393831 at 5% opacity
4. **Asymmetric shapes** — 3rem TL/BR, 1.5rem TR/BL on large containers
5. **Signature gradient** — `linear-gradient(135deg, #3e6a7e, #b9e6fe)` for CTAs
6. **Typography split** — Noto Serif for headlines, Plus Jakarta Sans for UI/labels
7. **Breathing room** — when in doubt, add more spacing
8. **Mobile nav** — Floating bottom bar (Apple Liquid Glass glassmorphism), `md:hidden`. 4 nav items (Home, Services, About, Contact) + "Book" CTA. Active state via Intersection Observer scroll tracking.
9. **No contact form** — Contact section uses phone dialer, email link, and Calendly CTA only
10. **Not needed now** — Dark mode explicitly scoped out. Testimonials, FAQ, and pricing deferred to post-launch.
11. **Uniform hover** — All primary CTAs use `hover:scale-[1.02]` (subtle grow). No mixed scale directions.
12. **Scroll animations** — Sections fade up on scroll (Intersection Observer, 600ms). Staggered card reveals. Respects `prefers-reduced-motion`.
13. **Analytics** — Plausible Analytics (no cookies, no consent banner needed)
14. **Legal pages** — Privacy Policy and Terms of Care as separate pages, not modals

## Tech Stack (Planned)

- Static site (single page + privacy/terms pages)
- Tailwind CSS for styling (build-time, not CDN)
- Material Symbols Outlined for icons
- Google Fonts: Noto Serif + Plus Jakarta Sans
- Sharp (dev dependency) for image processing — `npm run generate-icons`
- Plausible Analytics (lightweight, cookie-free)

## Conventions

- Follow the design token system — never use hardcoded colors outside the palette
- Prefer the custom `asymmetric-shape`, `signature-gradient`, and `ambient-shadow` classes
- All images need real assets — current ones are Stitch placeholders
- Mobile-first responsive: default → md (768px) → lg (1024px)
- Active nav state (desktop + mobile) is driven by Intersection Observer on section scroll position
- Contact section is single-column centered with phone/email/Calendly — no location, no social icons, no form
- Scroll animations: fade-up reveals with `prefers-reduced-motion` support
- Featured card uses background tint (not border) to comply with No-Line rule
- Quote card: absolute on desktop, inline on mobile
- Page flow: Nav → Hero → Services → About → [Testimonials*] → [FAQ*] → Contact → Footer (*deferred)

## Brand Assets

- Source logo: `docs/design/Nurtured_Nest_Logo.png` (6000x3375, line art)
- Source brand name: `docs/design/Nurtured_Nest_Name_Font.png` (script + tagline)
- Generated icons: `public/icons/` — regenerate with `npm run generate-icons`
- Logo lockup uses Brittany Signature (script) — IMAGE ONLY, never a web font
- Nav/footer brand text: Noto Serif italic (live text, not the script font)
- See `docs/design/brand-assets.md` for full logo guidelines
