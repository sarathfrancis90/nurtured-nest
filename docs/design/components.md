# Component Specifications

## 1. Asymmetric Shape (Core Pattern)

The signature "Organic Flow" shape used throughout the design.

```css
.asymmetric-shape {
  border-top-left-radius: 3rem;
  border-bottom-right-radius: 3rem;
  border-top-right-radius: 1.5rem;
  border-bottom-left-radius: 1.5rem;
}
```

**Used on:** Hero image, service cards, about portrait.
**Rule:** Never use uniform border-radius on large containers or image masks.

---

## 2. Buttons

### Primary CTA (Signature Gradient)

```html
<button class="signature-gradient text-on-primary font-label px-10 py-4 rounded-full text-base font-semibold ambient-shadow">
    Label Text
</button>
```

- Background: `linear-gradient(135deg, #3e6a7e 0%, #b9e6fe 100%)`
- Text: white (`on-primary`)
- Shape: `rounded-full` (pill)
- Shadow: ambient (diffused, tinted)
- Hover: `hover:scale-[1.02] transition-transform` (subtle grow, all CTAs uniform)

**Sizes:**
| Context | Padding | Text |
|---------|---------|------|
| Nav CTA | `px-8 py-3` | `text-sm` |
| Hero CTA | `px-10 py-4` | `text-base` |
| Contact CTA | `px-12 py-5` | `text-lg` |
| Mobile nav CTA | `px-5 py-2` | `text-xs` |

### Secondary / Ghost Button

```html
<button class="bg-transparent border border-outline-variant/30 text-on-surface font-label px-10 py-4 rounded-full text-base font-semibold hover:bg-primary-container/20 transition-colors">
    Label Text
</button>
```

- Background: transparent
- Border: `outline-variant` at 30% opacity (ghost border)
- Text: `on-surface`
- Hover: subtle `primary-container` fill at 20%

### Text Button (Inline CTA)

```html
<button class="font-label text-primary font-bold flex items-center gap-2 group">
    Label
    <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
```

- No background, no border
- Primary-colored text
- Trailing arrow icon with hover animation

---

## 3. Navigation Bar

```
Fixed top | bg-white/70 | backdrop-blur-xl | shadow-sm
```

- **Position:** Fixed, full-width, `z-50`
- **Glass effect:** `bg-white/70 backdrop-blur-xl`
- **Container:** `max-w-7xl mx-auto`, `px-12 py-5`
- **Layout:** `flex justify-between items-center`
- **Logo:** Brand mark icon (`public/icons/logo-nav.png`, 40x40 / `logo-nav@2x.png` for retina) + "Nurtured Nest" in italic Noto Serif text. See `brand-assets.md`.
- **Links:** Plus Jakarta Sans, `text-sm font-medium tracking-wide`
  - Active: `text-primary font-bold` (driven by scroll position — see Section 11)
  - Inactive: `text-on-surface-variant`
  - Hover: `hover:text-primary transition-colors`
- **CTA:** Signature gradient pill button
- **Mobile:** Links hidden below `md`. Mobile navigation is handled by the floating bottom nav bar (see Section 3b).

---

## 3b. Mobile Bottom Navigation Bar

Floating bottom nav with Apple Liquid Glass-style glassmorphism. Mobile only (below `md` breakpoint).

### Visibility & Positioning

- **Visible:** `md:hidden` — hidden at `md` (768px) and above
- **Position:** `fixed bottom-0 left-0 right-0 z-50`
- **Safe area:** `padding-bottom: env(safe-area-inset-bottom)` for iOS home indicator

### Glassmorphism (Liquid Glass)

```css
.liquid-glass-nav {
  background: rgba(255, 251, 255, 0.60);          /* surface at 60% — more transparent than top nav */
  backdrop-filter: blur(24px);                      /* heavier blur for liquid depth */
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.35); /* white refraction edge (not structural) */
  box-shadow: 0 -4px 24px -4px rgba(57, 56, 49, 0.05); /* upward ambient shadow */
}
```

The `border-top` is a glassmorphic material edge simulating light refraction — it does NOT violate the No-Line rule (which prohibits structural/sectioning borders).

### Dimensions & Layout

- **Height:** `h-16` (4rem / 64px) + safe area padding
- **Layout:** `flex items-center justify-around`
- **Full bleed:** No max-width — spans full screen width
- **Padding:** `px-2` (minimal, `justify-around` handles spacing)

### Nav Items (4 items + 1 CTA)

Each nav item is a vertical icon + label stack:

```html
<a href="#section" class="flex flex-col items-center justify-center gap-0.5">
  <span class="material-symbols-outlined text-xl">icon</span>
  <span class="font-label text-[10px] font-medium tracking-wide">Label</span>
</a>
```

| Item | Icon (Material Symbols) | Label | Target |
|------|------------------------|-------|--------|
| Home | `home` | Home | `#home` |
| Services | `self_improvement` | Services | `#services` |
| About | `person` | About | `#about` |
| Contact | `mail` | Contact | `#contact` |

**Icon choice notes:** `self_improvement` (meditation/yoga pose) is used for Services. The logo is a custom brand mark (circle + cradling hands + olive branches), not a Material icon.

### CTA Button

```html
<a href="#contact" class="signature-gradient text-on-primary font-label rounded-full px-5 py-2 text-xs font-bold">
  Book
</a>
```

- Signature gradient pill (same as other CTAs)
- Compact size: `px-5 py-2 text-xs font-bold`
- Scrolls to `#contact` section
- Positioned as the rightmost item in the nav bar

### States

- **Inactive:** `text-on-surface-variant` (#66645d) for both icon and label
- **Active:** `text-primary font-bold` (#3e6a7e) + dot indicator below label
  - Dot: `w-1 h-1 rounded-full bg-primary` centered under label
- **Tap feedback:** `active:scale-95 transition-transform duration-100`

Active state is determined automatically by scroll position (see Section 11).

### Appear Animation

- Slides up from below on page load
- `translate-y-full` to `translate-y-0`, `transition-transform duration-500 ease-out`
- Remains persistently visible (no hide-on-scroll)

### Interaction with Top Nav

- The desktop top nav header remains visible on mobile (logo + CTA button)
- Only the desktop nav links are hidden (`hidden md:flex`)
- The bottom nav replaces the missing link navigation on mobile
- Add `pb-20` to `<body>` or `<main>` on mobile to prevent bottom content from being hidden behind the nav bar

---

## 4. Service Cards

```
Wrapper: group + vertical offset for stagger
Card: bg-surface-container-lowest asymmetric-shape p-8 ambient-shadow
Hover: hover:-translate-y-4 transition-all duration-500
```

### Stagger Pattern (visual rhythm)

| Card | Wrapper class | Offset |
|------|--------------|--------|
| Card 1 (Prenatal) | `pt-12` | 3rem from top |
| Card 2 (Doula) | none | Flush top, has `border-t-4 border-primary` |
| Card 3 (Postpartum) | `pt-24` | 6rem from top |

### Card Anatomy

1. **Icon circle:** `w-16 h-16 rounded-full bg-{color}-container` with Material icon
   - Card 1: `bg-primary-container`, `text-primary`
   - Card 2: `bg-secondary-container`, `text-secondary`
   - Card 3: `bg-tertiary-container`, `text-tertiary`
2. **Title:** `font-headline text-2xl mb-4`
3. **Description:** `font-label text-on-surface-variant leading-relaxed mb-6`
4. **Bullet list:** Small colored dots (`w-1.5 h-1.5 rounded-full bg-primary`) + text

### Featured Card (Card 2)

Differentiated via a subtle background tint instead of a border (No-Line rule compliant):
- Background: `bg-primary-container/10` (faint primary tint) instead of `surface-container-lowest`
- No vertical offset wrapper (flush with grid top)
- No `border-t` — the tonal shift creates visual hierarchy per the design system

### Mobile Stagger Behavior

On mobile (single column, `grid-cols-1`), remove the stagger offsets (pt-12, pt-24) — cards stack with uniform spacing.

---

## 5. Floating Quote Card

```html
<div class="absolute -top-10 -right-10 bg-surface-container p-8 rounded-xl ambient-shadow max-w-[240px]">
```

- **Background:** `surface-container` (#f7f3eb)
- **Shape:** `rounded-xl` (standard, not asymmetric)
- **Shadow:** `ambient-shadow` (custom tinted — NOT `shadow-lg`)
- **Content:** Italic quote in `font-headline text-xl text-primary` + attribution

### Desktop (lg+)
- **Position:** Absolute, offset outside parent (`-top-10 -right-10`)
- Overlaps the about portrait image for editorial depth

### Mobile (default)
- **Position:** Static (normal flow), rendered as inline card below the portrait image
- Remove absolute positioning below `lg`
- Apply `asymmetric-shape` and `ambient-shadow`
- Full width within content column

---

## 6. Contact Info Row

```html
<div class="flex items-start gap-6">
  <div class="w-12 h-12 rounded-full bg-primary-container/40 flex items-center justify-center shrink-0">
    <span class="material-symbols-outlined text-primary">icon</span>
  </div>
  <div>
    <p class="font-label text-xs uppercase tracking-widest font-bold text-primary mb-1">Label</p>
    <p class="font-headline text-xl">Value</p>
  </div>
</div>
```

- Icon in a 40% opacity primary-container circle
- Label in uppercase micro-copy
- Value in headline font

---

## 7. Decorative Blur Blob

```html
<div class="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl"></div>
```

- Large blurred circle positioned behind content
- 30% opacity primary-container color
- Creates ambient depth effect

---

## 8. Ambient Shadow (Utility)

```css
.ambient-shadow {
  box-shadow: 0 24px 48px -12px rgba(57, 56, 49, 0.05);
}
```

- Tinted with `on-surface` color (#393831) NOT black
- 5% opacity
- Large blur (48px), offset down (24px), inset (-12px)
- Used on: Hero image, service cards, calendar icon, contact wrapper

---

## 9. Icons

**Library:** Material Symbols Outlined (variable font)

```css
font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
```

**Icons used:**
| Icon | Context |
|------|---------|
| Custom brand mark (PNG) | Logo — nav bar, footer. See `brand-assets.md` |
| `arrow_forward` | Text button CTA |
| `pregnancy` | Prenatal service card |
| `volunteer_activism` | Doula service card |
| `baby_changing_station` | Postpartum service card |
| `mail` | Email contact + mobile nav (Contact) |
| `phone` | Phone dialer (contact section) |
| `calendar_month` | Calendly CTA |
| `home` | Mobile bottom nav (Home) |
| `self_improvement` | Mobile bottom nav (Services) |
| `person` | Mobile bottom nav (About) |

---

## 10. Scroll-Based Active Navigation State

Both the desktop top nav and mobile bottom nav highlight the currently visible section based on scroll position.

### Mechanism

JavaScript Intersection Observer API observing the four `<section>` elements.

### Observed Targets

`#home`, `#services`, `#about`, `#contact`

### Observer Configuration

```javascript
const observer = new IntersectionObserver(callback, {
  root: null,                          // viewport
  rootMargin: '-50% 0px -50% 0px',     // trigger at vertical center line
  threshold: 0                          // any intersection at center
});
```

The `rootMargin: '-50% 0px -50% 0px'` shrinks the observation zone to a 1px horizontal line at the viewport center. Whichever section overlaps this midpoint is "active." This avoids flickering with sections of varying heights.

### Behavior

- When a section enters the center zone, its corresponding nav link receives the active state
- Only one section is active at a time
- Default on page load (before scroll): `#home` is active
- The callback updates both desktop top nav and mobile bottom nav simultaneously

### Active Class Application

- **Desktop top nav:** Active link gets `text-primary font-bold`, inactive links get `text-on-surface-variant`
- **Mobile bottom nav:** Active item gets `text-primary font-bold` + dot indicator, inactive items get `text-on-surface-variant`

### Smooth Scroll

All nav item taps (both desktop and mobile) trigger smooth scroll to the target section:

```css
html { scroll-behavior: smooth; }
```

Already enabled via `scroll-smooth` class on `<html>`.

---

## 11. Scroll-Triggered Section Animations

Sections reveal with a subtle fade-up animation as they enter the viewport, reinforcing the editorial "Curated Sanctuary" feel.

### Animation Style

```css
/* Initial state (hidden) */
.section-reveal {
  opacity: 0;
  transform: translateY(2rem);
  transition: opacity 600ms ease-out, transform 600ms ease-out;
}

/* Revealed state */
.section-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Trigger

Intersection Observer (same API as active nav state):
- `threshold: 0.1` — triggers when 10% of the section is visible
- One-time reveal — once visible, stays visible (no re-hiding on scroll up)

### What Animates

| Element | Animation | Stagger |
|---------|-----------|---------|
| Section headings | Fade up | None |
| Service cards | Fade up | 150ms delay between cards |
| About content | Fade up | None |
| Contact card | Fade up | None |

### What Does NOT Animate

- **Hero section** — immediately visible on load (no delay to first content)
- **Nav bar** — always visible
- **Footer** — no animation

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .section-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

Users who prefer reduced motion see all content immediately with no animation.

---

## 12. Deferred Sections (Post-Launch)

### Testimonials Section

**Status:** Deferred — business not yet live. Space reserved in page flow between About and Contact.

**When implemented:**
- Position: Between About (#about) and Contact (#contact)
- Background: `surface-container-low` (tonal shift from About)
- Layout: 2-col grid on desktop (`md:grid-cols-2`), single column on mobile
- Cards: `asymmetric-shape`, `ambient-shadow`, `bg-surface-container-lowest`
- Content per card: quote text, client first name, context (e.g., "First-time parent, 2025")
- Section ID: `#testimonials`
- Mobile nav: Not added to bottom nav until section exists

### FAQ Section

**Status:** Deferred — content not yet available.

**When implemented:**
- Position: Between Testimonials and Contact
- Background: `surface` (back to base — tonal shift)
- Format: Collapsible accordion
- Questions: `font-headline` (Noto Serif), answers: `font-label` (Plus Jakarta Sans)
- Animation: Smooth expand/collapse, 300ms ease
- Layout: `max-w-3xl mx-auto` on desktop, full-width on mobile
- Section ID: `#faq`
