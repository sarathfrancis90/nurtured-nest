# Design System Documentation: Nurtured Nest

## 1. Overview & Creative North Star
**The Creative North Star: "The Curated Sanctuary"**

This design system rejects the clinical, rigid grids of standard digital products in favor of a high-end editorial experience. It is designed to feel like a premium wellness publication—tactile, breathable, and deeply intentional. We move beyond "blue boxes" to create a sanctuary of information through the use of **Organic Flow**. 

By leveraging asymmetrical compositions, generous whitespace, and "soft-brutalist" layering, we create a digital environment that feels as supportive and calm as the care Nurtured Nest provides. We treat every screen as a composition, not a template.

---

## 2. Colors
Our palette is anchored in the soft, atmospheric blue of the morning sky and the grounding warmth of heritage cream. 

### The Chromatic Palette
- **Primary (`#3e6a7e`):** The "Soft Accent Blue." Use this for brand-defining moments and primary actions.
- **Surface/Background (`#fffbff`):** A warm, luminous cream that prevents eye strain and provides a premium, paper-like feel.
- **Naturals:** Utilizing `surface_container` tiers (`#f7f3eb` to `#ece8de`) to create subtle shifts in environment.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning or containment. Boundaries must be defined through:
1.  **Tonal Shifts:** Placing a `surface_container_low` section against the `surface` background.
2.  **Soft Transitions:** Using extremely subtle gradients (e.g., `surface` to `surface_container`).

### Glass & Gradient Rule
To achieve a bespoke feel, use **Glassmorphism** for floating elements (navbars, tooltips). 
- **Recipe:** Use a semi-transparent version of `surface` or `primary_container` with a `backdrop-blur` of 12px–20px. 
- **Signature Texture:** Apply a linear gradient from `primary` (`#3e6a7e`) to `primary_container` (`#b9e6fe`) for Hero CTAs to provide "soul" and depth.

---

## 3. Typography
We use typography as a structural element, not just a carrier of information.

- **Display & Headlines (Noto Serif):** Our editorial voice. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) to create a clear, authoritative, yet gentle hierarchy. The serif detail conveys heritage and trust.
- **Labels & Functional UI (Plus Jakarta Sans):** For micro-copy, buttons, and navigation, we switch to this modern sans-serif. It provides clarity and a contemporary edge that balances the traditional serif.
- **Hierarchy Tip:** Always lead with Noto Serif for titles to establish the "Sanctuary" vibe, then transition to Plus Jakarta Sans for the "doing" parts of the interface.

---

## 4. Elevation & Depth
In this system, depth is biological and soft, not mechanical.

### The Layering Principle
Achieve hierarchy by stacking `surface-container` tiers. 
- **Example:** A card in `surface_container_lowest` (#ffffff) sitting atop a `surface_container_low` (#fdf9f1) section creates a natural, soft lift.

### Ambient Shadows
Avoid the "drop shadow" look. If an element must float:
- **Shadow Tinting:** Use a diffused shadow (blur 24px+) with 5% opacity, tinted with the `on_surface` color (`#393831`). This mimics natural, ambient light.

### The "Ghost Border" Fallback
If accessibility requires a container edge, use a **Ghost Border**: `outline_variant` (`#bcb9b0`) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Asymmetrical Cards & Containers
Following the "Organic Flow" aesthetic, cards should not have uniform corners.
- **Pattern:** Set `border-top-left-radius: xl` (3rem) and `border-bottom-right-radius: xl` (3rem), while keeping the other corners at `md` (1.5rem). This mimics the organic shapes found in the brand's visual identity.
- **Forbid Dividers:** Never use horizontal lines to separate list items. Use vertical spacing (Scale 6 or 8) or subtle background shifts.

### Buttons
- **Primary:** Rounded `full` (9999px), using the Signature Gradient (Primary to Primary Container). Label: `plusJakartaSans` (Medium weight).
- **Secondary:** Transparent background with a "Ghost Border" and `on_surface` text.

### Input Fields
- **Style:** Use `surface_container_high` with no border. On focus, transition the background to `surface_container_lowest` and apply a soft `primary` ghost-border.
- **Labels:** Always use `label-md` in `plusJakartaSans`.

### Floating Sanctuary Navigation
A bottom-centered or top-floating bar using Glassmorphism (`surface_variant` at 70% opacity + blur) and `xl` rounding. This keeps the interface feeling light and unencumbered.

---

## 6. Do's and Don'ts

### Do:
- **Embrace Asymmetry:** Use the "Organic Flow" shape logic for image masks and large containers.
- **Use "Breathing Room":** If you think there is enough margin, add one more level of spacing (e.g., move from Scale 8 to 10).
- **Layer with Intent:** Ensure your `surface` tiers always move from darker/warmer on the bottom to lighter/brighter on the top.

### Don't:
- **No Green:** Do not use any green tones, even for "success" states. Use the soft blue for success and `error` (`#af3d3b`) sparingly.
- **No Harsh Grids:** Avoid boxing everything into equal columns. Let elements overlap slightly (e.g., an image overlapping a text container) to create editorial depth.
- **No Standard Shadows:** Never use pure black (#000) for shadows. It breaks the "Serene" atmosphere. Use the tinted ambient shadow method.
- **No High Contrast Borders:** High-contrast lines create visual "noise" that contradicts the calming goal of this system.