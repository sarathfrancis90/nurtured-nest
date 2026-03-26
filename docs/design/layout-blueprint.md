# Page Sections & Layout Blueprint

## Global Layout

- **Max width:** `max-w-7xl` (80rem / 1280px)
- **Horizontal padding:** `px-6 lg:px-12`
- **Section vertical padding:** `py-32` (8rem)
- **Centered container:** `mx-auto`

---

## Section 1: Navigation (Header)

**Position:** Fixed, `top-0`, `z-50`
**Background:** Glassmorphic — `bg-white/70 backdrop-blur-xl shadow-sm`

```
[Logo + Brand Name]          [Home] [Services] [About] [Contact]          [CTA Button]
```

- **Layout:** `flex justify-between items-center`
- **Padding:** `px-12 py-5`
- **Logo:** Brand mark icon (`public/icons/logo-nav.png`, ~40px) + "Nurtured Nest" (headline italic, on-surface, 2xl)
- **Nav links:** Hidden on mobile (`hidden md:flex`), spaced `space-x-10`
- **CTA:** Signature gradient pill

**Mobile:** Nav links hidden below `md`. Mobile navigation handled by a floating bottom nav bar (see components.md Section 3b).

**Active state:** Current section link is highlighted dynamically via Intersection Observer scroll tracking (see components.md Section 10).

---

## Section 2: Hero (#home)

**Background:** `surface` (#fffbff)
**Height:** `min-h-screen`, with `pt-20` to clear fixed nav

**Mobile note:** Image stacks below text. H1 scales: `text-4xl md:text-6xl lg:text-8xl`. Image height: `h-[350px] lg:h-[800px]`.

```
|--------------------------------------------|
|  [Text Content]     |    [Hero Image]      |
|  col-span-6         |    col-span-6        |
|                     |    asymmetric-shape   |
|  H1: "Where birth   |    h-[600px]         |
|  feels safe."       |    lg:h-[800px]      |
|                     |                      |
|  Description        |                      |
|                     |                      |
|  [CTA] [Text Link]  |                      |
|                     |    [blur blob]       |
|--------------------------------------------|
```

- **Grid:** `grid-cols-1 lg:grid-cols-12 gap-12 items-center`
- **Left column:** `lg:col-span-6 z-10`
- **Right column:** `lg:col-span-6 relative`
- **Image container:** `absolute inset-0 asymmetric-shape overflow-hidden ambient-shadow`
- **Decorative blob:** `absolute -bottom-10 -left-10 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl`

### Content Inventory
- H1: "Where birth feels safe." (italic accent on "feels safe.")
- Body: "A curated sanctuary for the modern journey..."
- CTA 1: "Explore Our Care" (gradient button)
- CTA 2: "Our Philosophy" (text link + arrow)
- Image: Serene nursery interior

---

## Section 3: Services (#services)

**Background:** `surface-container-low` (#fdf9f1) — tonal shift from hero

```
|------------------------------------------|
|         "Core Offerings"                 |
|   "Comprehensive Support Systems"        |
|                                          |
|  [Card 1]     [Card 2]     [Card 3]     |
|  pt-12        (flush)      pt-24        |
|  Prenatal     Doula Care   Postpartum   |
|------------------------------------------|
```

- **Header:** Centered, `mb-20`
- **Grid:** `grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start`
- **Stagger:** Cards offset vertically via wrapper padding (pt-12, 0, pt-24) on `md`+ only. On mobile (single column), stagger is removed — uniform spacing.

### Card Content Inventory

| Card | Icon | Title | Items |
|------|------|-------|-------|
| 1 | `pregnancy` (primary) | Prenatal Guidance | Birth Plan Strategy, Nutritional Counseling, Movement & Breathwork |
| 2 | `volunteer_activism` (secondary) | Labor Doula Care | Continuous Labor Presence, Partner Coaching, Pain Management Tools |
| 3 | `baby_changing_station` (tertiary) | Postpartum Support | Newborn Care Education, Lactation Support, Emotional Recovery |

---

## Section 4: About (#about)

**Background:** `surface` (#fffbff) — returns to base

```
|------------------------------------------------|
|  [Portrait Image]          |  Meet Your Guide   |
|  asymmetric-shape          |  "Varshitha"       |
|  h-[600px]                 |  The Heart of Nest |
|                            |                    |
|  [Floating quote card]     |  Bio paragraph 1   |
|  absolute -top-10 -right-10|  Bio paragraph 2   |
|------------------------------------------------|
```

- **Grid:** `grid-cols-1 lg:grid-cols-2 gap-20 items-center`
- **Image:** `asymmetric-shape overflow-hidden ambient-shadow h-[350px] md:h-[450px] lg:h-[600px] w-full`
- **Quote card (desktop lg+):** Floating absolute, `bg-surface-container p-8 rounded-xl ambient-shadow max-w-[240px]`, offset `-top-10 -right-10` overlapping image
- **Quote card (mobile):** Static inline card below portrait, `asymmetric-shape ambient-shadow`, full width within column

### Content Inventory
- Label: "Meet Your Guide"
- H2: "Varshitha — The Heart of Nest"
- Quote: "Your story is the foundation of our care."
- Bio: 2 paragraphs about founding intention and background

---

## Section 5: Testimonials (#testimonials) — DEFERRED

**Status:** Deferred until business is live and client testimonials are available.

**When implemented:**
- **Background:** `surface-container-low` (#fdf9f1) — tonal shift from About
- **Layout:** `grid-cols-1 md:grid-cols-2 gap-8`, staggered like service cards
- **Cards:** `asymmetric-shape`, `ambient-shadow`, `bg-surface-container-lowest`
- **Content per card:** Quote, client first name, context
- **Position:** Between About and Contact (or FAQ when added)

---

## Section 6: FAQ (#faq) — DEFERRED

**Status:** Deferred until content is ready.

**When implemented:**
- **Background:** `surface` (#fffbff) — back to base
- **Layout:** `max-w-3xl mx-auto` centered, accordion format
- **Position:** Between Testimonials and Contact

---

## Section 7: Contact (#contact)

**Background:** `surface-container` (#f7f3eb)

```
|------------------------------------------------|
|  bg-surface-container-lowest asymmetric-shape   |
|  |------------------------------------------|  |
|  |           centered content               |  |
|  |                                          |  |
|  |       "Let's connect."                   |  |
|  |       Description                        |  |
|  |                                          |  |
|  |    [Phone icon]  +1 (206) 555-0100       |  |
|  |    [Email icon]  hello@nurturednest.co   |  |
|  |                                          |  |
|  |    [Book a Free Consultation]            |  |
|  |    "Free 20-Minute Intro Call"           |  |
|  |------------------------------------------|  |
|------------------------------------------------|
```

- **Outer wrapper:** `bg-surface-container-lowest asymmetric-shape p-8 lg:p-16 ambient-shadow`
- **Layout:** Single column, centered — `max-w-xl mx-auto text-center`
- **No grid split** — simplified from the original two-column layout

### Content Inventory
- H2: "Let's connect."
- Description: "Every sanctuary starts with a conversation. We offer a complimentary 20-minute discovery call."
- Phone: `<a href="tel:+12065550100">` with `phone` icon, label "Call Us", value "+1 (206) 555-0100" (placeholder — update before launch)
- Email: `<a href="mailto:hello@nurturednest.co">` with `mail` icon, label "Email Us", value "hello@nurturednest.co"
- CTA: "Book a Free Consultation" (signature gradient button, `px-12 py-5 text-lg`)
- Micro-label: "Free 20-Minute Intro Call"

### Removed from Original
- Studio/location row
- Social icon buttons (Threads/X, Instagram)
- Two-column grid with separate Calendly panel
- Calendar icon circle
- `border-t` divider above social section

---

## Section 8: Footer

**Background:** `surface-container-highest` (#ece8de) — warmest/deepest surface

```
[Logo]          [Copyright]          [Privacy] [Terms]
```

- **Layout:** `flex flex-col md:flex-row justify-between items-center gap-8`
- **Padding:** `py-16`
- **Border:** `border-t border-outline-variant/5` (extremely subtle, 5% opacity)

### Content Inventory
- Logo: Brand mark icon + "Nurtured Nest" (italic Noto Serif)
- Copyright: "2024 Nurtured Nest Care" (needs update)
- Links: Privacy Policy (separate page), Terms of Care (separate page)

---

## Page Flow Summary

```
1. Nav (fixed top desktop / floating bottom mobile)
2. Hero (#home)
3. Services (#services)
4. About (#about)
5. Testimonials (#testimonials) — DEFERRED
6. FAQ (#faq) — DEFERRED
7. Contact (#contact)
8. Footer
```

---

## Mobile Responsiveness Reference

| Area | Default (mobile) | md (768px) | lg (1024px) |
|------|-----------------|------------|-------------|
| Hero H1 | `text-4xl` (2.25rem) | `text-6xl` (3.75rem) | `text-8xl` (6rem) |
| Hero image | `h-[350px]`, stacks below text | Same | `h-[800px]`, side-by-side |
| Service card stagger | No stagger (uniform) | Stagger applied (pt-12, 0, pt-24) | Same |
| Service card grid | `grid-cols-1` | `grid-cols-3` | Same |
| About image | `h-[350px]` | `h-[450px]` | `h-[600px]` |
| Quote card | Inline below image (static) | Same | Absolute overlapping image |
| Contact padding | `p-8` | Same | `p-16` |
| Bottom nav | Visible (5 items) | Hidden | Hidden |
| Top nav links | Hidden | Visible | Visible |
| Body bottom padding | `pb-20` (for bottom nav) | `pb-0` | `pb-0` |

---

## Mobile Bottom Navigation Bar (below md only)

- **Position:** Fixed bottom, full-width, `z-50`
- **Visible:** Below `md` breakpoint only
- **Content:** 4 nav items (Home, Services, About, Contact) + "Book" CTA pill
- **Behavior:** Active item highlights based on scroll position (Intersection Observer). Tapping a nav item smooth-scrolls to the section.
- **Safe area:** `pb-[env(safe-area-inset-bottom)]` for iOS
- **Body padding:** Add `pb-20` to `<main>` on mobile to prevent content hiding behind the bar

See components.md Section 3b for full visual spec.

---

## Image Assets Needed

| Location | Description | Current Source |
|----------|-------------|---------------|
| Hero | Serene nursery interior, morning light | Google placeholder |
| About | Portrait of Varshitha, professional doula | Google placeholder |
