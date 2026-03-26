# Design Refinements & Issues Tracker

Items to address before development begins.

## Critical

- [x] **No mobile navigation** — RESOLVED: Floating bottom nav bar with Apple Liquid Glass glassmorphism, visible below `md` breakpoint. 4 nav items + "Book" CTA. See components.md Section 3b.
- [ ] **Placeholder images** — Both images (hero nursery, Varshitha portrait) are Google Stitch-generated URLs. Need real photography or proper placeholders.
- [x] **Dead buttons (partial)** — "Read My Full Journey" removed entirely. "Explore Our Care" and "Our Philosophy" still need targets defined.
- [ ] **Calendly integration** — "Book" buttons link to `#contact`. Need actual Calendly URL or embed widget for the final CTA.
- [ ] **Footer links** — Privacy Policy and Terms of Care will be separate pages (not modals). Need actual content written.
- [x] **Brand logo assets** — RESOLVED: Custom logo mark replaces Material `spa` icon. Favicon, Apple touch icon, Android icons, OG image, and nav logo generated via `npm run generate-icons`. See `brand-assets.md`.

## Design Consistency — RESOLVED

- [ ] **Duplicate font import** — Material Symbols Outlined is loaded twice (lines 10-11 in code.html). Remove one during build.
- [x] **Inconsistent hover scales** — RESOLVED: All primary CTAs standardized to `hover:scale-[1.02]` (subtle grow). No more mixed 95%/105%.
- [x] **Floating quote card shadow** — RESOLVED: Switched from `shadow-lg` (standard Tailwind) to `ambient-shadow` (custom tinted). Consistent with design system.
- [x] **Nav colors use Tailwind defaults** — RESOLVED: Switching from `text-sky-*` to design tokens. Active: `text-primary font-bold`, Inactive: `text-on-surface-variant`, Hover: `hover:text-primary`.
- [x] **Contact outer card** — RESOLVED: Switching from `rounded-xl` to `asymmetric-shape` to match organic flow pattern.
- [x] **Service card 2 border** — RESOLVED: Replaced `border-t-4 border-primary` with `bg-primary-container/10` background tint. Complies with No-Line rule while still creating visual hierarchy through tonal shift.

## Missing Features

- [ ] **SEO meta tags** — No `<meta name="description">`, no Open Graph tags. Favicon and app icons generated (see `brand-assets.md` for HTML tags). Still needs meta description and OG tags wired up.
- [ ] **Accessibility** — No skip-to-content link, no ARIA labels on icon-only buttons, no focus-visible states defined. Must add `prefers-reduced-motion` support for scroll animations.
- [ ] **Loading states** — No skeleton screens or loading indicators for images.
- [ ] **404 / error page** — Not designed yet.
- [x] **Form/contact form** — RESOLVED: Not needed. Contact uses phone dialer, email link, and Calendly CTA.
- [ ] **Cookie consent / GDPR** — Not needed if using Plausible Analytics (no cookies). Revisit if adding other tracking.
- [x] **Analytics** — RESOLVED: Will use Plausible Analytics ($9/month). Privacy-first, no cookies, GDPR-compliant, lightweight script. No cookie consent banner needed.
- [ ] **Legal pages** — Need Privacy Policy and Terms of Care as separate pages. Should include: scope of practice ("not a medical professional"), no outcome guarantees, cancellation policy.

## Content Updates

- [ ] **Copyright year** — Says "2024", should be "2025" or dynamic.
- [ ] **Phone number** — Placeholder `+1 (206) 555-0100` in contact section. Replace with real number before launch.
- [ ] **Email** — `hello@nurturednest.co` — confirm this is the real domain/email.

## Design Enhancements

- [x] **Scroll animations** — RESOLVED: Subtle fade-up reveals on sections using Intersection Observer. Staggered card reveals (150ms delay). Respects `prefers-reduced-motion`. See components.md Section 11.
- [x] **Active nav state** — RESOLVED: Intersection Observer-based scroll tracking for both desktop and mobile nav. See components.md Section 10.
- [ ] **Image lazy loading** — Add `loading="lazy"` to below-fold images (about portrait).
- [x] **Mobile responsiveness** — RESOLVED: All mobile specs documented. H1 scaling, image heights, card stagger removal, quote card repositioning, bottom nav spacing. See layout-blueprint.md Mobile Responsiveness Reference.
- [x] **Quote card mobile** — RESOLVED: Repositioned inline below image on mobile (static flow). Absolute overlapping position only on `lg`+.

## Deferred (Post-Launch)

- [ ] **Testimonials section** — Space reserved between About and Contact. Will implement when business is live and client testimonials are available. See components.md Section 12.
- [ ] **FAQ section** — Space reserved between Testimonials and Contact. Will implement when content is ready. See components.md Section 12.
- [ ] **Pricing section** — Deferred until packages and rates are finalized. May add between Services and About.

## Questions for Design Review

1. ~~Should the mobile nav be a full-screen overlay or a slide-in drawer?~~ **ANSWERED: Floating bottom nav bar with Liquid Glass glassmorphism.**
2. ~~Is the Calendly booking the only CTA, or should there also be a contact form?~~ **ANSWERED: No form. Phone dialer + email + Calendly.**
3. ~~Should the About section link to a separate page ("Read My Full Journey")?~~ **ANSWERED: Button removed entirely.**
4. ~~Are Privacy Policy / Terms of Care separate pages or modals?~~ **ANSWERED: Separate pages, linked from footer.**
5. ~~What analytics/tracking is needed?~~ **ANSWERED: Plausible Analytics ($9/month). No cookies, no consent banner.**
6. ~~Is dark mode a priority?~~ **ANSWERED: No. Explicitly not needed.**
