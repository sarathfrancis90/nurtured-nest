# Typography System

## Font Families

| Role | Font | Usage |
|------|------|-------|
| `headline` / `body` | **Noto Serif** (400, 700, 400i) | Display text, headings, editorial content, quotes, pull-quotes |
| `label` | **Plus Jakarta Sans** (400, 500, 600, 700) | Buttons, nav links, labels, micro-copy, body descriptions, functional UI |

### Loading

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Hierarchy Rule

> Always lead with **Noto Serif** for titles to establish the "Sanctuary" vibe, then transition to **Plus Jakarta Sans** for the "doing" parts of the interface.

## Type Scale (as used in the design)

### Display / Hero

| Element | Classes | Rendered |
|---------|---------|----------|
| Hero H1 | `font-headline text-4xl md:text-6xl lg:text-8xl leading-tight` | 2.25rem / 3.75rem / 6rem |
| Hero H1 accent | `italic text-primary` | Italic primary color |

### Headlines

| Element | Classes | Rendered |
|---------|---------|----------|
| Section title (About) | `font-headline text-5xl lg:text-6xl leading-tight` | ~3rem / 3.75rem |
| Section title (Services, Contact) | `font-headline text-4xl lg:text-5xl` | ~2.25rem / 3rem |
| Card title | `font-headline text-2xl` | 1.5rem |
| Contact sub-heading | `font-headline text-3xl` | 1.875rem |
| Contact detail | `font-headline text-xl` | 1.25rem |

### Body / Description

| Element | Classes | Rendered |
|---------|---------|----------|
| Hero description | `font-label text-lg leading-relaxed` | 1.125rem, Plus Jakarta Sans |
| About body text | `font-label text-lg leading-relaxed` | 1.125rem |
| Card description | `font-label text-on-surface-variant leading-relaxed` | base (1rem) |
| Contact description | `font-label text-on-surface-variant text-lg` | 1.125rem |

### Labels & Micro-copy

| Element | Classes | Rendered |
|---------|---------|----------|
| Section subtitle | `font-label text-on-surface-variant uppercase tracking-[0.2em] text-xs font-bold` | 0.75rem, spaced |
| "Meet Your Guide" label | `font-label text-primary font-bold uppercase tracking-widest text-sm` | 0.875rem |
| Nav links | `font-label text-sm font-medium tracking-wide` | 0.875rem |
| Button text (primary) | `font-label text-base font-semibold` | 1rem |
| Button text (nav CTA) | `font-label text-sm font-semibold` | 0.875rem |
| List items | `font-label text-sm text-on-surface/80` | 0.875rem |
| Footer links | `font-label text-xs uppercase tracking-widest font-bold` | 0.75rem |
| Micro label | `font-label text-xs uppercase tracking-widest font-medium` | 0.75rem |
| Mobile nav label | `font-label text-[10px] font-medium tracking-wide` | 0.625rem (10px) |

> **Note:** The 10px mobile nav label is smaller than the standard `text-xs` (12px) minimum. This is a deliberate exception for the space-constrained mobile bottom nav where the icon is the primary affordance and the label is supplementary.

### Quote / Editorial

| Element | Classes | Rendered |
|---------|---------|----------|
| Floating quote | `font-headline italic text-xl text-primary` | 1.25rem, Noto Serif italic |
| Quote attribution | `font-label text-xs uppercase tracking-widest text-on-surface-variant` | 0.75rem |

## Spacing Patterns

- Headlines → body: `mb-4` to `mb-8`
- Body → CTA: `mb-10`
- Section padding: `py-32` (8rem vertical)
- Card internal: `p-8` (2rem)

## Key Conventions

1. **Noto Serif** is never used for buttons, labels, or navigation
2. **Plus Jakarta Sans** is never used for main headings or editorial quotes
3. Uppercase + wide tracking is used for category labels and micro-copy only
4. `italic` on Noto Serif is used for brand emphasis (tagline, quotes, founder subtitle)
5. Text colors follow the token system: `on-surface` for primary, `on-surface-variant` for secondary, `primary` for accent text

---

## Logo Lockup Typography (Image-Only)

The brand's logo lockup image (`Nurtured_Nest_Name_Font.png`) uses distinct fonts from the website's live text. These fonts appear ONLY in pre-rendered logo images and are never loaded as web fonts.

| Element | Font (best match) | Style | Notes |
|---------|-------------------|-------|-------|
| "Nurtured Nest" script | Brittany Signature (Creatype Studio) | Signature/calligraphy | Dramatic upstrokes, connected letters, thin-to-thick stroke contrast |
| "WHERE BIRTH FEELS SAFE" | Bebas Neue (or similar condensed sans) | Uppercase, black weight, wide-tracked | Clean, geometric, condensed proportions |

### Website vs. Logo Typography

| Context | "Nurtured Nest" rendering | Font used |
|---------|--------------------------|-----------|
| Logo lockup image | Pre-rendered PNG | Brittany Signature (script) |
| OG / social preview | Pre-rendered composite | Brittany Signature (script) |
| Nav bar | Live text | Noto Serif italic |
| Footer | Live text | Noto Serif italic |

The script/calligraphy font is **never** loaded as a web font. It exists only in the logo lockup image asset. See `brand-assets.md` for full guidelines.
