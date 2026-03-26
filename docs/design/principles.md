# Design Principles & Rules

Creative North Star: **"The Curated Sanctuary"**

A high-end editorial experience that feels like a premium wellness publication — tactile, breathable, deeply intentional. Every screen is a composition, not a template.

---

## Core Principles

### 1. Organic Flow
Reject clinical grids. Use asymmetrical compositions, generous whitespace, and soft-brutalist layering. Let elements overlap slightly (e.g., image overlapping text container) for editorial depth.

### 2. Breathing Room
If you think there is enough margin, add one more level of spacing. Move from Scale 8 to Scale 10. Sections use `py-32` (8rem). The design breathes.

### 3. Intentional Layering
Surface tiers always move from darker/warmer on the bottom to lighter/brighter on the top. This creates natural depth without any borders or lines.

### 4. Sanctuary Feel
The digital environment should feel as supportive and calm as the care Nurtured Nest provides. Every design choice serves this feeling.

---

## Strict Rules

### The "No-Line" Rule
**1px solid borders are strictly prohibited for sectioning or containment.**

Boundaries must be defined through:
1. **Tonal shifts** — placing `surface-container-low` against `surface` background
2. **Soft transitions** — subtle gradients between surface tiers
3. **Vertical spacing** — Scale 6 (1.5rem) or Scale 8 (2rem) minimum

**Exception:** Ghost borders are allowed when accessibility requires a container edge — `outline-variant` (#bcb9b0) at 10-30% opacity max.

### No Green
No green tones anywhere, even for "success" states. Use `primary` (#3e6a7e) or `primary-container` (#b9e6fe) for success indicators.

### No Harsh Shadows
Never use pure black (#000) for shadows. Always tint with `on-surface` (#393831) at 5% opacity. Use diffused blur (24px+). This mimics natural ambient light.

### No Standard Grids
Avoid boxing everything into equal columns. Let elements have staggered vertical offsets, overlap slightly, and create editorial asymmetry.

### No High-Contrast Borders
High-contrast lines create visual "noise" that contradicts the calming goal. If a border is needed, it must be a ghost border.

### No Dividers
Never use horizontal lines (`<hr>` or border-top/bottom) to separate list items. Use vertical spacing or subtle background shifts instead.

**If absolutely needed:** Use `border-outline-variant/10` (10% opacity) as the minimum acceptable divider.

---

## Shape Language

### Asymmetric Containers
```
Top-left:     3rem (xl)
Top-right:    1.5rem (md)
Bottom-left:  1.5rem (md)
Bottom-right: 3rem (xl)
```

Diagonal symmetry — large corners at top-left and bottom-right. This is the signature shape.

### Buttons
Always `rounded-full` (pill shape). Never use the asymmetric shape on buttons.

### Small Elements
Smaller elements (icon circles, nav items) use standard `rounded-full`.

---

## Elevation Hierarchy

From top to bottom:
1. **Floating elements** — Glassmorphic nav (top desktop + bottom mobile), floating quote card (highest elevation)
2. **Cards** — `surface-container-lowest` (#fff) with ambient shadow
3. **Content sections** — Alternating surface tiers
4. **Footer** — `surface-container-highest` (deepest/warmest)

---

## Interaction Patterns

| Element | Hover / Interaction Effect |
|---------|--------------------------|
| Service cards | `-translate-y-4` lift, 500ms transition |
| All primary CTAs | `scale-[1.02]` (subtle grow), uniform across all contexts |
| Text button arrow | `translate-x-1` nudge |
| Ghost button | `bg-primary-container/20` fill |
| Nav links (desktop) | Color shift to `text-primary` (design token) |
| Mobile nav item (tap) | `active:scale-95`, 100ms transition |
| Mobile nav item (active) | `text-primary font-bold` + indicator dot |
| Section reveals (scroll) | Fade up (`opacity-0 translateY-8` → visible), 600ms ease-out |
| Service card reveals | Staggered fade up, 150ms delay between cards |

### Reduced Motion

All animations must respect `prefers-reduced-motion: reduce`. When enabled, content appears immediately with no transitions.

---

## Content Voice

- Headlines: Declarative, short, emotionally resonant ("Where birth feels safe.")
- Descriptions: Warm, professional, inclusive
- Labels: Uppercase, widely tracked, authoritative
- Quotes: Italic serif, personal, attributed
