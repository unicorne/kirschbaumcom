# Design Style Guide

Extracted rules and principles from Juxtopposed's design philosophy.

---

## 1. Color System

### Neutral Foundation (Layer 1)

- **Backgrounds:** Use near-white (98-100%) for light mode. Pure white is fine.
- **Sidebar/frame:** Slightly darker anchor -- e.g. add 2% of your brand color to the sidebar.
- **Cards on light mode are flexible:** dark background + lighter cards, light background + darker cards, or monochromatic layers.
- **Borders:** Use ~85% white for card edges instead of thin black borders. Subtle, not overpowering.
- **Button darkness = importance:** Ghost buttons are lightest, primary CTAs are darkest (black with white text). Multi-purpose buttons sit around 90-95% white.
- **Text hierarchy via lightness:**
  - Important headings: ~11% white (near black, but not pure black)
  - Body text: 15-20% white
  - Subtext/secondary: 30-40% white
- **Aim for ~4 background layers, 1-2 stroke colors, and 3 text variants** for product design.

### Accent Color (Layer 2)

- Think of your brand color as a **scale/ramp** (100-900), not a single swatch.
- Primary use: 500 or 600. Hover: step up to 700. Links: 400 or 500.
- Use tools like UI Colors to generate the full ramp.
- Some products (like Vercel) stay fully neutral -- an accent is optional.

### Semantic Colors (Layer 3)

- **Always** use red for destructive actions, green for success, yellow for warnings, blue for trust -- regardless of brand color.
- For charts, use the **OKLCH color space** to get perceptually uniform brightness across the spectrum. Increment hue by 25-30 at fixed lightness/chroma.
- Neutral-only charts look lame. Single-hue-ramp charts look too similar. Use a full spectrum.

### Theming (Layer 4)

- To theme any neutral: plug hex into OKLCH, drop lightness by 0.03, increase chroma by 0.02, adjust hue.
- Works for both light and dark mode.

---

## 2. Dark Mode

- **Dark mode is NOT the inverse of light mode.** Build it intentionally.
- Dark colors look more similar -- **double the distance** between shades (light mode: ~2% apart, dark mode: 4-6% apart).
- Surfaces **always get lighter as they elevate** (raised cards = lighter background or a visible border).
- Brand color shifts down the ramp: use 300-400 as primary (vs 500-600 on light).
- Dim text brightness; brighten borders.
- Reserve pure white for the most important actions/text only.
- Desaturate bright brand colors slightly.
- Use deep purples, reds, or greens for backgrounds -- not just navy or gray.
- No shadows in dark mode; create depth through lighter card surfaces instead.

---

## 3. Typography

- **One font is enough.** Pick a clean sans-serif and stick with it.
- **Letter spacing hack:** Tighten headers by -2% to -3%, drop line height to 110-120%. Instantly more professional.
- **Font size ranges:**
  - Landing pages: up to 6 sizes, wide range.
  - Dashboards: rarely exceed 24px -- information density is higher.
- Use size, weight, and color to create hierarchy -- not decoration.

---

## 4. Layout & Spacing

- **White space is critical.** Let elements breathe.
- Use a **4-point grid system** -- all spacing as multiples of 4. Not because it looks inherently better, but because you can always halve values, which creates consistency.
- 12-column grids are guidelines, not rules. Custom landing pages often ignore them. Structured pages (galleries, blogs) benefit from them for responsiveness (12 cols desktop, 8 tablet, 4 mobile).
- **Group related elements** with tighter spacing; separate unrelated groups with more space. This is visual hierarchy through proximity.
- Double the horizontal padding relative to vertical padding on buttons.

---

## 5. Hierarchy & Visual Weight

- **Most important = largest, boldest, most colorful, near the top.**
- Hierarchy comes from **contrast**: small vs big, colorful vs neutral, bold vs light.
- Images always add a great pop and make scanning easy -- use them whenever possible.
- Icons should match the line height of adjacent text (e.g., 24px text = 24px icons). Most icons are too large by default.
- Icons generally need **no color** -- color on icons should communicate status (active tab, selected state), not decoration.

---

## 6. Component States & Feedback

- **Every interaction needs a response.** If a user does anything, the UI should react.
- **Button states (minimum 4):** default, hover, active/pressed, disabled. Add loading (spinner) when needed.
- **Input states:** default, focused (highlight border), error (red border + message), warning (optional).
- **Hover:** slightly lighter/brighter version of base color.
- **Active/pressed:** slightly darker version.
- **Disabled:** desaturate the color + lighten, use lighter text.
- On mobile (no hover), rely on press/tap effects -- e.g., a slightly darker background on press.

---

## 7. Micro-interactions

- Micro-interactions **confirm actions** -- e.g., a "Copied!" chip sliding up after clicking a copy button.
- Range from practical (toast notifications, loading spinners) to playful (scroll animations, swipe effects).
- Every keyboard shortcut or action should produce **visible feedback** -- if users don't see a change, they assume it failed.

---

## 8. Shadows & Depth

- **Light mode:** Use shadows, but reduce opacity and increase blur. If the shadow is the first thing you notice, it's too strong.
- Card shadows should be subtle; popovers/overlays need stronger shadows.
- Inner + outer shadows can create tactile, raised button effects.
- **Dark mode:** No shadows. Use surface lightness to convey elevation.

---

## 9. Overlays & Backgrounds

- Never leave text unreadable over images.
- Use a **linear gradient** that fades from transparent to a solid background color -- better than a full-screen overlay.
- For extra polish, add a **progressive blur** on top of the gradient.
- Almost never use bright colors for backgrounds. Start neutral gray + light/white foreground.
- You can tint neutrals with a hint of brand color (like Headspace tints cards with subtle orange).

---

## 10. Product Design Thinking

### Design for All States

- Don't just design the happy path. Handle: **empty states, loading states, error states, success messages.**
- Empty states should guide users to their next action (message + CTA), not leave a blank screen.
- Notifications/status indicators keep users informed (e.g., build succeeded/failed).

### Build for Flow

- Think in **screens and sequences**, not isolated pages.
- Ask: "How did the user get here? What do they need next?"
- Chain small decisions naturally (e.g., create workspace -> name it -> add members -> done).

### Design Systems & Consistency

- Maintain consistent spacing, button styles, type scales, and color scheme across all screens.
- Every new screen should feel familiar even if the content is different.
- A design system builds user trust -- e.g., primary color always = non-destructive action.

### Progressive Disclosure

- Only show what the user needs in the current moment.
- Hide filters/tools until they're relevant (e.g., no filters on an empty dashboard).
- Reveal detail on interaction (click to expand, hover for context).

---

## 11. Native Desktop App Feel

- Respect OS-level settings (light/dark mode).
- Use keyboard shortcuts generously, but always show visual feedback for them.
- **Drag and drop everywhere** -- getting content in and out should feel effortless.
- The app should be a **system, not a destination** -- appear when needed, get out of the way.
- Follow platform layout conventions: top bar for global actions, sidebar for navigation, center for content.
- Integrate window controls (traffic lights) naturally into the UI.
- Keep top ~50px clear for window dragging.
- Onboard users to keyboard shortcuts -- they're powerful but easy to forget.

---

## 12. The 60/30/10 Rule (Adapted)

- Traditional: 60% dominant neutral, 30% secondary, 10% accent.
- In product design this breaks down -- e.g., Vercel is 90% black, 8% white, 2% red.
- The spirit of the rule still applies: **one dominant tone, measured use of secondary, accent only for emphasis.**
- Less is almost always more with color. Reducing the palette creates clarity.

---

## Quick Reference Checklist

1. Start with a neutral foundation (near-white or dark backgrounds)
2. Pick one brand color and build a full ramp (100-900)
3. Always include semantic colors (red, green, yellow, blue)
4. Dark mode: double the shade distances, elevate = lighten
5. One sans-serif font, tighten header letter spacing
6. 4-point grid, generous white space
7. Every element needs hover, active, disabled states
8. Every action needs visible feedback
9. Design empty, loading, error, and success states
10. Use OKLCH for perceptually uniform color palettes
