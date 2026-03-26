# Brand Assets & Logo Guidelines

## Logo Anatomy

The Nurtured Nest brand mark is a minimalist line-art illustration consisting of:

1. **Circle** — represents the womb / safe space
2. **Cradling hands** — two curved hands supporting from below
3. **Olive/leaf branches** — organic elements flanking the circle, representing growth and nurture
4. **Center dot** — small dot at center, representing the baby / new life

Style: Black line art, delicate strokes, organic and hand-drawn aesthetic.

## Source Files

| Asset | File | Dimensions | Contents |
|-------|------|-----------|----------|
| Logo mark | `docs/design/Nurtured_Nest_Logo.png` | 6000x3375px | Line-art logo, black on white |
| Brand name lockup | `docs/design/Nurtured_Nest_Name_Font.png` | 6000x3375px | Script name + tagline |

---

## Logo Variants

### 1. Full Lockup (Logo + Name + Tagline)

Logo mark above "Nurtured Nest" in script font above "WHERE BIRTH FEELS SAFE."
- Use for: hero sections, marketing materials, social sharing (OG image)
- Rendered as: pre-composed image (never live text for the script portion)
- Source: composite of both source PNGs

### 2. Icon Only (Logo Mark)

Just the circle + hands + branches.
- Use for: favicons, app icons, small avatar contexts
- Minimum size: 32x32px (detail degrades below this)
- Generated at all standard sizes via `npm run generate-icons`

### 3. Text + Icon (Horizontal — Nav/Footer)

Logo mark inline + "Nurtured Nest" as live text.
- Use for: navigation bar, footer
- Logo: `public/icons/logo-nav.png` (40x40) or `logo-nav@2x.png` (80x80 retina)
- Text: **Noto Serif italic** (live web text, NOT the script font)
- This is how the brand appears on the website — icon + live text

---

## Typography in Logo

### Script Font (Logo Lockup Image Only)

- **Best match:** Brittany Signature by Creatype Studio
- **Style:** Modern calligraphy / signature script
- **Characteristics:** Dramatic upstrokes, connected flowing letters, thin-to-thick stroke contrast, elegant inky flow, 80+ ligatures for natural connections
- **License:** Free for personal use, commercial license required
- **Usage: IMAGE ONLY** — never loaded as a web font, never rendered as live text

### Tagline Font (Logo Lockup Image Only)

- **Best match:** Bebas Neue (or similar condensed sans-serif at Black weight)
- **Style:** Bold/Black weight, condensed, geometric sans-serif
- **Characteristics:** All uppercase, very wide letter-spacing, uniform stroke width
- **Usage: IMAGE ONLY** — appears only in the brand name lockup image

### Website Brand Text

- **Font:** Noto Serif, italic, 400 weight
- **Used in:** Nav bar, footer, any live-text "Nurtured Nest" rendering on the site
- **Color:** `on-surface` (#393831) by default, or `primary` (#3e6a7e) depending on context

### Summary Table

| Context | "Nurtured Nest" rendering | Font used |
|---------|--------------------------|-----------|
| Logo lockup image | Pre-rendered PNG | Brittany Signature (script) |
| OG / social preview | Pre-rendered composite | Brittany Signature (script) |
| Nav bar (desktop) | Live text | Noto Serif italic |
| Nav bar (mobile top) | Live text | Noto Serif italic |
| Footer | Live text | Noto Serif italic |

---

## Color Variants

### Primary (Black on White)

Default brand mark style. Black (#000 or #393831) line art on white/transparent background.
- Use for: most contexts, light backgrounds

### Primary Colored

Line art tinted in `primary` (#3e6a7e).
- Use for: nav bar icon, on-brand contexts
- Achievable via CSS `filter` or by generating a tinted variant

### Reversed (White on Dark)

White line art for dark backgrounds.
- Generate by inverting the logo mark
- Use for: dark overlay contexts, if ever needed

---

## Clear Space & Minimum Size

### Clear Space

Maintain padding equal to the height of the center dot element on all sides. No other elements should intrude into this space.

### Minimum Sizes

| Context | Minimum Size | Notes |
|---------|-------------|-------|
| Favicon | 16x16px | Fine detail lost; acceptable |
| App icon | 48x48px | Logo recognizable |
| Navigation | 40x40px | Inline with nav text |
| Marketing | 200px wide | Full lockup minimum |

---

## Generated Icon Assets

All icons are generated from the source logo via `npm run generate-icons` (script: `scripts/generate-icons.js`).

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16/32/48 multi-size | Browser tab icon |
| `favicon-16x16.png` | 16x16 | PNG favicon fallback |
| `favicon-32x32.png` | 32x32 | PNG favicon (high-DPI) |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `android-chrome-192x192.png` | 192x192 | Android home screen |
| `android-chrome-512x512.png` | 512x512 | Android splash screen |
| `android-chrome-maskable-192x192.png` | 192x192 | Android adaptive icon (20% safe zone) |
| `android-chrome-maskable-512x512.png` | 512x512 | Android adaptive icon (20% safe zone) |
| `logo-nav.png` | 40x40 | Nav bar inline logo |
| `logo-nav@2x.png` | 80x80 | Nav bar retina logo |
| `og-image.png` | 1200x630 | Social media sharing preview |

Output directory: `public/icons/`
Manifest: `public/site.webmanifest`

### HTML Head Tags (ready to paste)

```html
<link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#3e6a7e">
<meta property="og:image" content="/icons/og-image.png">
```

---

## Rules

1. **Never stretch or distort** the logo — always maintain aspect ratio
2. **Never rotate** the logo
3. **Never add effects** (drop shadows, glows, outlines) to the logo mark
4. **Never change the internal proportions** of the logo elements
5. **The script font is image-only** — never attempt to render it as live web text
6. **Nav/footer brand name** always uses Noto Serif italic, never the script font
7. **Regenerate icons** after any logo source change: `npm run generate-icons`
