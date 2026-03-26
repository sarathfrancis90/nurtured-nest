# Color Token System

Source: Google Stitch export — Material Design 3 style tokens.

## Palette Overview

Anchored in atmospheric morning-sky blue and heritage cream warmth.

## Primary

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#3e6a7e` | Brand-defining moments, primary actions, accent text |
| `primary-dim` | `#315e72` | Darker primary variant |
| `primary-container` | `#b9e6fe` | Backgrounds for primary-related UI, selection highlight |
| `primary-fixed` | `#b9e6fe` | Fixed primary surface (same as container) |
| `primary-fixed-dim` | `#abd8ef` | Dimmed fixed primary |
| `on-primary` | `#ffffff` | Text/icons on primary backgrounds |
| `on-primary-container` | `#275569` | Text/icons on primary-container |
| `on-primary-fixed` | `#104356` | Text on fixed primary |
| `on-primary-fixed-variant` | `#325f73` | Variant text on fixed primary |
| `inverse-primary` | `#b9e6fe` | Primary for inverse/dark surfaces |

## Secondary

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary` | `#4f6875` | Supporting accent, secondary actions |
| `secondary-dim` | `#435c69` | Darker secondary variant |
| `secondary-container` | `#cce6f6` | Secondary element backgrounds |
| `secondary-fixed` | `#cce6f6` | Fixed secondary surface |
| `secondary-fixed-dim` | `#bed8e8` | Dimmed fixed secondary |
| `on-secondary` | `#ffffff` | Text on secondary backgrounds |
| `on-secondary-container` | `#3c5562` | Text on secondary-container |
| `on-secondary-fixed` | `#29434f` | Text on fixed secondary |
| `on-secondary-fixed-variant` | `#465f6c` | Variant text on fixed secondary |

## Tertiary (Warm Accent)

| Token | Hex | Usage |
|-------|-----|-------|
| `tertiary` | `#6d6353` | Warm accent for variety/contrast |
| `tertiary-dim` | `#605748` | Darker tertiary |
| `tertiary-container` | `#f4e6d2` | Tertiary element backgrounds |
| `tertiary-fixed` | `#f4e6d2` | Fixed tertiary surface |
| `tertiary-fixed-dim` | `#e6d8c5` | Dimmed fixed tertiary |
| `on-tertiary` | `#ffffff` | Text on tertiary |
| `on-tertiary-container` | `#5d5445` | Text on tertiary-container |
| `on-tertiary-fixed` | `#4a4233` | Text on fixed tertiary |
| `on-tertiary-fixed-variant` | `#675e4e` | Variant text on fixed tertiary |

## Surface System (Layering Hierarchy)

Surfaces layer from brightest (top) to warmest (bottom). Used to create depth without borders.

| Token | Hex | Layer | Usage |
|-------|-----|-------|-------|
| `surface-container-lowest` | `#ffffff` | Topmost | Cards, elevated elements |
| `surface-bright` / `surface` / `background` | `#fffbff` | Base | Page background |
| `surface-container-low` | `#fdf9f1` | Recessed-1 | Alternate section backgrounds |
| `surface-container` | `#f7f3eb` | Recessed-2 | Contact section, footer area |
| `surface-container-high` | `#f1eee5` | Recessed-3 | Input fields (unfocused) |
| `surface-container-highest` / `surface-variant` | `#ece8de` | Deepest | Footer, heavy ground |

## Text & Content

| Token | Hex | Usage |
|-------|-----|-------|
| `on-surface` | `#393831` | Primary text, headings |
| `on-background` | `#393831` | Same as on-surface (body text) |
| `on-surface-variant` | `#66645d` | Secondary text, descriptions, captions |
| `inverse-surface` | `#0f0e0b` | Inverse background |
| `inverse-on-surface` | `#9f9d97` | Text on inverse surfaces |

## Outline & Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `outline` | `#838178` | Standard outline (use sparingly) |
| `outline-variant` | `#bcb9b0` | Ghost borders at 10-30% opacity only |

## Error

| Token | Hex | Usage |
|-------|-----|-------|
| `error` | `#af3d3b` | Error states (use sparingly) |
| `error-dim` | `#67040d` | Darker error |
| `error-container` | `#fa746f` | Error background |
| `on-error` | `#ffffff` | Text on error |
| `on-error-container` | `#6e0a12` | Text on error-container |

## Special

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-tint` | `#3e6a7e` | Tint overlay (matches primary) |

## Signature Gradient

```css
background: linear-gradient(135deg, #3e6a7e 0%, #b9e6fe 100%);
```

Used exclusively for primary CTA buttons (Hero, Nav, Calendly booking).

## Glassmorphism Recipes

### Desktop Top Nav

```css
background: rgba(255, 251, 255, 0.70); /* surface at 70% */
backdrop-filter: blur(16px);           /* 12px-20px range */
-webkit-backdrop-filter: blur(16px);
```

### Mobile Bottom Nav (Apple Liquid Glass)

```css
background: rgba(255, 251, 255, 0.60); /* surface at 60% — more transparent for liquid feel */
backdrop-filter: blur(24px);           /* heavier blur for liquid glass depth */
-webkit-backdrop-filter: blur(24px);
border-top: 1px solid rgba(255, 255, 255, 0.35); /* white refraction edge */
box-shadow: 0 -4px 24px -4px rgba(57, 56, 49, 0.05); /* upward ambient shadow */
```

Used for: desktop top nav, mobile bottom nav, floating tooltips.

## Rules

- **NO green** anywhere, even for success states. Use `primary` or `primary-container` for success.
- **NO pure black (`#000`)** in shadows. Use `on-surface` (#393831) at 5% opacity.
- **NO high-contrast borders**. If border needed, use `outline-variant` at 10-30% opacity max.
- Boundaries are defined via **tonal shifts** between surface tiers, never lines.
