# Design System Document: The Academic Curator

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**
This design system moves away from the sterile "tech infrastructure" look prevalent in tutoring platforms. Instead, it adopts the persona of a high-end educational institution. We are creating a digital experience that feels like a premium, quiet study in a world-class university—where every pixel serves a purpose, and every interaction feels intentional and authoritative.

To break the "template" look, this system utilizes **intentional asymmetry** and **editorial-grade typography**. We favor breathing room over density, and tonal depth over rigid grid lines. By overlapping elements (e.g., a tutor profile image slightly breaking the container edge), we create a sense of movement and "connection" that aligns with the brand's empowering mission.

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, academic blue and an empowering, energetic orange. We treat color not just as decoration, but as a functional tool for navigation and emotional resonance.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit against a `background` or `surface` area to create a soft, natural break. This removes visual "clutter" and allows the user's eye to flow across the content without being trapped by boxes.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create nested depth:
*   **Base:** `surface` (#f9f9ff) for global backgrounds.
*   **Secondary Sections:** `surface-container-low` (#f3f3f9) for distinct content blocks.
*   **Top Layer Components:** `surface-container-lowest` (#ffffff) for the most prominent content cards, creating a "lifted" effect.

### The "Glass & Gradient" Rule
To ensure the "Professional & Premium" feel, use **Glassmorphism** for floating elements (like navigation bars or hovering action menus). 
*   **Formula:** `surface-variant` color at 80% opacity + `backdrop-blur: 12px`.
*   **Signature Textures:** For primary CTAs and hero backgrounds, use a subtle linear gradient transitioning from `primary` (#003871) to `primary-container` (#1b4f91) at a 135-degree angle. This adds a "soul" to the color that flat hex codes cannot provide.

## 3. Typography
We utilize **Manrope** for its balance of geometric precision and human warmth. 

*   **Display & Headlines:** Use `display-lg` and `headline-lg` to create an editorial feel. These should have a slightly tighter letter-spacing (-0.02em) to feel more authoritative.
*   **Body:** `body-lg` (1rem) is our standard for readability. Ensure line-height is generous (1.6) to provide the "breathing room" required for academic excellence.
*   **Labels:** Use `label-md` in uppercase with increased letter-spacing (+0.05em) for category tags or metadata. This creates a sophisticated, archival look.

The typographic hierarchy should always emphasize clarity. Use `secondary` (#8c4f00) sparingly for high-impact keywords within body text to guide the student’s focus without overwhelming the layout.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Stack `surface-container` tiers. A `surface-container-highest` card sitting on a `surface-container-low` background creates a soft, natural lift.
*   **Ambient Shadows:** When a floating effect is mandatory (e.g., a modal), use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(26, 28, 32, 0.06)`. Note the use of the `on-surface` color tinted at 6% to mimic natural, ambient light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a **Ghost Border**. Use the `outline-variant` token (#c3c6d2) at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** Use semi-transparent `surface` colors to allow the brand orange or blue to softly bleed through from the background, making the layout feel integrated and "alive."

## 5. Components
All components should utilize the **Roundedness Scale** to feel modern and approachable.

*   **Buttons:**
    *   **Primary:** Linear gradient (`primary` to `primary-container`), `xl` (1.5rem) roundedness. 
    *   **Secondary:** Ghost border with `on-surface` text.
    *   **Tertiary:** Text-only with an orange `secondary` underline (2px) on hover.
*   **Cards:** No dividers or borders. Use a change from `surface-container-low` to `surface-container-lowest` to define the card area. Apply `lg` (1rem) corner radius.
*   **Input Fields:** Use `surface-container-high` as the field background with no border. On focus, transition the background to `surface-container-lowest` and add a subtle 2px "glow" using the `primary` color at 10% opacity.
*   **Chips:** Use `secondary-fixed` for background and `on-secondary-fixed` for text. These should be `full` rounded.
*   **Relevant Special Component - "The Knowledge Pulse":** A custom progress indicator for students using a thin `primary` track and a `secondary` (orange) glowing indicator to signify active learning.

## 6. Do’s and Don'ts

### Do:
*   **Do** use asymmetrical layouts where text is left-aligned and imagery is right-aligned with slight overlaps.
*   **Do** leverage white space as a luxury. A premium resource doesn't need to cram information.
*   **Do** use `secondary_container` (orange) sparingly for "Success" or "Empowerment" moments—it should feel like a reward.

### Don’t:
*   **Don’t** use standard 1px gray divider lines between list items; use 24px of vertical padding instead.
*   **Don’t** use high-contrast drop shadows. If the shadow is noticeable, it’s too heavy.
*   **Don’t** use pure black (#000000). Always use `on-surface` (#1a1c20) for text to maintain visual warmth and "Academic Excellence."
*   **Don't** use sharp corners. All elements must follow the roundedness scale (minimum `sm`: 0.25rem) to maintain accessibility and warmth.