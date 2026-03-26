# Complete Design Style Guide

Extracted rules and principles from Juxtopposed's design philosophy across all videos.

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
- **Don't use pure black or pure white for most elements.** Reserve them for the most important actions. Using more grays is what separates mediocre from professional designers.
- **Use a darker tint of your accent color** instead of pure black/white as a background to incorporate more color. E.g., GitHub uses dark blue, not pure black. For light backgrounds, use the Tailwind 50 value with the 500 accent; for dark, use 300 as primary with 950 as background.

### Accent Color (Layer 2)

- Think of your brand color as a **scale/ramp** (100-900), not a single swatch.
- Primary use: 500 or 600. Hover: step up to 700. Links: 400 or 500.
- Use tools like UI Colors to generate the full ramp.
- Some products (like Vercel) stay fully neutral -- an accent is optional.
- **Adapt brand colors** for accessibility. If a brand color fails WCAG checks, darken it or choose a complementary color that passes.
- **Expand from one brand color** by rotating slightly on the color wheel (analogous colors) or picking a complementary color across the wheel.

### Semantic Colors (Layer 3)

- **Always** use red for destructive actions, green for success, yellow for warnings, blue for trust -- regardless of brand color.
- For charts, use the **OKLCH color space** to get perceptually uniform brightness across the spectrum. Increment hue by 25-30 at fixed lightness/chroma.
- Neutral-only charts look lame. Single-hue-ramp charts look too similar. Use a full spectrum.

### Theming (Layer 4)

- To theme any neutral: plug hex into OKLCH, drop lightness by 0.03, increase chroma by 0.02, adjust hue.
- Works for both light and dark mode.

### HSB Color Palette Trick

- Start with a base color in HSB (Hue, Saturation, Brightness).
- For each darker variant: increase saturation by ~20, decrease brightness by ~10.
- For even richer palettes: also shift the hue ~20 points toward blue/purple (darker hues) for each step.
- This creates naturally harmonious color sets for cards, backgrounds, and depth layers.

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
- **No shadows in dark mode.** Create depth through surface lightness instead. Take your dark background, bump brightness up 4-6, bump saturation down 10-20 for each layer.
- Light mode text colors (like dark purple instead of black) should become light grays on dark mode -- easier on the eyes than white.
- Chips and badges: dim saturation and brightness, flip the text to lighter for hierarchy.

---

## 3. Typography

- **One font is enough.** Pick a clean sans-serif and stick with it.
- **Letter spacing hack:** Tighten headers by -2% to -4%, drop line height to 110-120%. Instantly more professional. This matters most above 70-80px.
- **Font size ranges:**
  - Landing pages: up to 6 sizes, wide range.
  - Dashboards: rarely exceed 24px -- information density is higher, with smaller spacing between sizes.
- Use size, weight, and color to create hierarchy -- not decoration.
- **Friendly copy matters.** Say "we sweat the details" not "we take pride in our attention to detail." Natural, easy-to-understand language beats corporate jargon.

---

## 4. Layout & Spacing

### General

- **White space is critical.** Let elements breathe. Beginner UIs are almost always packed too tight.
- Use a **4-point grid system** (or 8-point) -- all spacing as multiples of 4. Not because it looks inherently better, but because you can always halve values, creating consistency.
- In Figma: change nudge amount from default 10 to 8 to stay on grid.
- For larger sizes, round to the nearest 5 or 10.
- 12-column grids are guidelines, not rules. Custom landing pages often ignore them. Structured pages (galleries, blogs) benefit from them for responsiveness (12 cols desktop, 8 tablet, 4 mobile).
- **Group related elements** with tighter spacing; separate unrelated groups with more space. This is visual hierarchy through proximity.

### Buttons

- Double the horizontal padding relative to vertical padding.
- Ghost buttons = sidebar links without a background until hover.
- The more important a button is, the darker it should be.

### Cards

- **Don't be lame with card layouts.** Remove unnecessary labels if the UI implies the information. Group by related content, rank by importance, use icons for visual scanning.
- Choose between borders or background colors for card separation. Prefer outlines on dark mode, background colors on light mode.
- Keep margins well-spaced so content isn't tightly packed.

### Lines & Dividers

- **Lose the lines** unless they're part of your design style. Lines are often redundant clutter.
- Instead, space items far enough apart to be clearly separate.
- If spacing is tight, use subtle alternating row backgrounds rather than lines everywhere.
- **Fewer elements to get the point across = better.**

### SaaS Landing Page Layouts

- The dominant layout: big text, big image, lots of space. It's everywhere because it works -- users scroll looking for more info.
- Differentiate with unique fonts, inline diagrams, interactive elements, or subtle gradients.
- **Logo sections** are near-universal social proof (41/50 SaaS sites). Two styles: static row of important logos, or animated marquee with edge gradients and progressive blur.
- **Clickable multi-sections** (tabbed feature showcases) are very common. Always design all tabs, not just the first one.
- **Simple Bento grids** (not Apple-complex marketing ones) work great for feature showcases. Stick to simple grids so devs don't lose it.
- **Straight-line grids** (like Vercel's feature sections) with tasteful animations look modern and structured.
- **Images in navigation** dropdowns are a strong 2025 trend -- much more appealing than plain link lists.

---

## 5. Hierarchy & Visual Weight

- **Most important = largest, boldest, most colorful, near the top.**
- Hierarchy comes from **contrast**: small vs big, colorful vs neutral, bold vs light.
- Images always add a great pop and make scanning easy -- use them whenever possible.
- Icons should match the line height of adjacent text (e.g., 24px text = 24px icons). Most icons are too large by default.
- Icons generally need **no color** -- color on icons should communicate status (active tab, selected state), not decoration.
- **If your UI isn't clear enough to imply labels, you're not doing it right.** Remove redundant labels; use icons and grouping instead.

---

## 6. Icons

- Use a consistent icon library (Phosphor, Lucide, Feather). Never mix fill, line width, or style within the same visual area.
- **Different icon styles in separate areas is fine** (navbar icons vs content icons vs feature icons) as long as they're visually distinct contexts.
- Icons without labels need **tooltip popups** on hover (with ~1 second delay) if they're not universally recognized.
- Good icons dramatically speed up scanning; bad icons actively hurt the design.
- **Never let AI choose your icons.** AI defaults to emojis -- always replace with professional icon libraries.

---

## 7. Rounded Corners

- When nesting rounded corners (corner inside a corner), the **inner radius = outer radius minus the gap** between them. E.g., outer 30px with 10px gap = inner 20px.
- This breaks down when the gap exceeds the outer radius -- just eyeball it.
- Pill shapes don't need this adjustment (distance is equal all around).
- **iOS corner smoothing** in Figma (squircle) subtly tapers the curve before the corner for a more refined look.

---

## 8. Component States & Feedback

- **Every interaction needs a response.** If a user does anything, the UI should react.
- **Button states (minimum 4):** default, hover, active/pressed, disabled. Add loading (spinner) when needed.
- **Input states:** default, focused (highlight border), error (red border + message), warning (optional).
- **Hover:** slightly lighter/brighter version of base color. Or use text slide-up effects instead of color changes.
- **Active/pressed:** slightly darker version. Shrinking the button on press creates a tactile "pressing into" feel.
- **Disabled:** desaturate the color + lighten, use lighter text. Should be obvious without any other visual cues.
- On mobile (no hover), rely on press/tap effects -- e.g., a slightly darker background on press.
- **Toast notifications** are your dashboard notification system. Use them for success confirmations, warnings, errors -- anytime you want to inform without taking over the screen.

---

## 9. Micro-interactions & Animation

### Principles

- Micro-interactions **confirm actions** -- e.g., a "Copied!" chip sliding up after clicking a copy button.
- Range from practical (toast notifications, loading spinners) to playful (scroll animations, swipe effects).
- Every keyboard shortcut or action should produce **visible feedback** -- if users don't see a change, they assume it failed.
- **Motion should support clarity, not distract from it.** Animations that don't serve a purpose (navigation, confirmation, drawing attention to the product) are just noise.
- **Almost never use linear easing.** Things in real life speed up and slow down. Play with easing curves: snappy and performant, fun and springy, or slow and smooth.

### Specific Patterns

- **Button hovers:** Text slide-up on hover + shrink on press (avoids needing to pick hover colors).
- **Keyboard shortcut reminders:** Animate keys pressing when the user triggers the shortcut, with a success message.
- **Toast notifications:** Slide up, with loading animations and celebratory success messages (particle effects).
- **Name tags on hover:** Small label pops up with tilt on avatar hover. Use custom spring easing (stiffness: 636, dampening: 24).
- **Shimmer/gradient strokes:** Rotating angular gradient masked to a border outline -- very modern.
- **Delayed tooltips:** Show on mouse enter after ~1 second delay, disappear on mouse leave.
- **Text hover pop-outs:** Hovering on a word reveals a related image/preview -- great for showing context without extra space.
- **Progress bars:** Animate a fill sliding along the bar using masked rectangles.
- **Card swipe dismiss:** Rotate card out + fade, scale up background cards to fill the space.
- **Search bar expansion:** Collapse to magnifying glass icon, expand on click with smooth animation.
- **Upgrade/upsell hovers:** Show plan limits on hover of usage meters.

### Loading & Streaming

- **Skeleton loading** with shimmer effects for content that's being generated. Placeholders for images and text boxes make the layout feel alive.
- **Stream responses word by word** (like ChatGPT) -- turns delay into anticipation.
- **Loading spinners** should be short, looping, and fluid (bouncing dots, rotating icons).
- For multi-step processes, show animated steps (e.g., "searching docs", "extracting quotes", "drafting answer") fading in one by one.

### Landing Page Animations

- Use motion to **draw attention to the product**, not to look cool for its own sake.
- Scroll animations should transition into product showcases (e.g., hero morphs into dashboard).
- **Hover animations** on feature sections demonstrate the product interactively.
- **Unexpected moments** are engaging if built well -- unfold effects, reveal animations, breaking the pattern.
- **Parallax on scroll** in spacious margins creates lifelike feeling without crazy backgrounds.
- **Text animations** draw attention because they move -- progress bar fills, bouncing elements, words replacing each other.
- Things that don't need to move but do (with purpose) make sites feel alive.

---

## 10. Shadows & Depth

- **Light mode:** Use shadows, but reduce opacity and increase blur. If the shadow is the first thing you notice, it's too strong.
- **Don't use Figma's default shadow settings** -- they're way too harsh. Change shadow color to light gray (not transparent black), increase blur significantly.
- Card shadows should be subtle; popovers/overlays need stronger shadows.
- Inner + outer shadows can create tactile, raised button effects.
- **Dark mode:** No shadows. Use surface lightness to convey elevation.
- Or just remove shadows completely -- often less visual noise = better design.

---

## 11. Overlays & Backgrounds

- Never leave text unreadable over images.
- Use a **linear gradient** that fades from transparent to a solid background color -- better than a full-screen overlay.
- For extra polish, add a **progressive blur** on top of the gradient.
- Almost never use bright colors for backgrounds. Start neutral gray + light/white foreground.
- You can tint neutrals with a hint of brand color (like Headspace tints cards with subtle orange).
- **Gradients:** If you must use one, stick to variations of the same color (darker/lighter). Multi-color gradients rarely work.
- **Dark glass effect** (AI startup aesthetic): rectangle with transparency, subtle gradient, background blur, 1px border, soft inner shadow. Add a shimmer animation on the border for extra polish.

---

## 12. Product Design Thinking

### Design for All States

- Don't just design the happy path. Handle: **empty states, loading states, error states, success messages, disabled states.**
- Empty states should guide users to their next action (message + CTA + animation), not leave a blank screen.
- Notifications/status indicators keep users informed (e.g., build succeeded/failed).
- **Optimistic UI:** Process in the background, assume success (like Gmail deleting emails instantly). Confirm with toast if needed.

### Build for Flow

- Think in **screens and sequences**, not isolated pages.
- Ask: "How did the user get here? What do they need next?"
- Chain small decisions naturally (e.g., create workspace -> name it -> add members -> done).
- **Sketch out flows on paper first** to catch major gaps (missing skip buttons, search bars, back navigation).

### Progressive Disclosure

- Only show what the user needs in the current moment.
- Hide filters/tools until they're relevant (e.g., no filters on an empty dashboard).
- Reveal detail on interaction (click to expand, hover for context).
- A **load more button is preferable over infinite scroll** -- gives users control and lets them reach the footer.
- Build progressive disclosure into inputs too: toggle advanced mode, show token costs, etc.

### Design Systems & Consistency

- Maintain consistent spacing, button styles, type scales, and color scheme across all screens.
- Every new screen should feel familiar even if the content is different.
- A design system builds user trust -- e.g., primary color always = non-destructive action.
- **Inconsistent components kill designs:** Match corner radii, button sizes, search bar styles across the app.
- Use Figma styles for colors, variables for measurements, components for UI elements.
- A design system reflects team values: lean startups need lightweight/flexible, large orgs need deeply defined.
- **Knowing when to break the system with intention** separates mastery from rigidity.

### Content-Driven Design

- **Start with user intent**, not aesthetics. What is the user trying to accomplish?
- A search bar is a natural starting point if the intent is to find something.
- Only expand functionality as user intent expands.
- **Decide what content to display** based on how users interact (scan info like price/rating/location before clicking for details).
- **Structure content for edge cases:** What happens with long names? Bright images behind icons? Truncate, add contrast circles, handle the unexpected.

---

## 13. Native Desktop App Feel

- Respect OS-level settings (light/dark mode).
- Use keyboard shortcuts generously, but always show visual feedback for them.
- **Drag and drop everywhere** -- getting content in and out should feel effortless.
- The app should be a **system, not a destination** -- appear when needed, get out of the way.
- Follow platform layout conventions: top bar for global actions, sidebar for navigation, center for content.
- Integrate window controls (traffic lights) naturally into the UI.
- Keep top ~50px clear for window dragging.
- Onboard users to keyboard shortcuts -- they're powerful but easy to forget.
- Popovers, new windows, and notifications live **outside the main window** -- design for them.

---

## 14. Mobile & Swipe Interactions

### Within-Page Navigation

- **Scrolling cards** with bounce easing feel much more natural than rigid swiping.
- **Skew cards** off the edge to create a 3D ring/carousel effect.
- Add **fluid swipe indicators** (magnetic dot effects) rather than boring static dots.
- Use the phone edge as a **horizon** that shrinks items approaching it.

### Between-Page Navigation

- Make page transitions follow the **direction of the swipe** -- background and content slide together.
- **Expand a card to become the next page** for seamless transitions (card grows to fill screen, content fades in).
- Even simple transitions (circle expand/shrink) are much better than basic page slides.

### Swipe Gestures

- Swipe gestures can **replace buttons** for common actions (delete, add, dismiss).
- Always provide a button alternative for the uninitiated.
- **Swipe-to-confirm** for high-impact or irreversible actions (better than a button that can be accidentally tapped).
- **Dismiss popovers** with swipe down -- zoom out the background when the popover appears.

### Easing

- **Never use linear easing.** Real objects accelerate and decelerate.
- Match easing to personality: snappy = performant, springy = fun, slow = smooth/premium.

---

## 15. Dashboard Design

### Sidebar

- Houses persistent, globally relevant elements (navigation, profile, search).
- **Profile management** at top with clickable indicator (picture + arrows).
- Navigation links: recognizable icon + short title. Works for collapsible sidebars too.
- **Group links by relevance.** Send settings/help to the bottom (rarely used).
- Nest expanding groups as links grow. Always have an active state indicator.
- Use empty sidebar space for feature highlights, notifications, or integrations.

### Main Content

- **Do one thing well.** If your dashboard needs a PhD to operate, it's too complex.
- What you put in the main section reflects what's most important to the user.
- Use simple grid layouts (two-column, two-row is a solid starting point).
- Top of dashboard: important page actions or simple navigation (dropdown + primary CTA).
- **Keep displayed data simple:** favicon, shortened link, actual link, date, clicks. Add brief descriptions if space allows.
- Stack items into lists for less clutter (vs individual bordered cards).
- Add **bulk actions** via multi-select micro interaction.

### Charts

- **Don't overdesign charts.** Simple and informative beats aesthetic but unreadable.
- Always include: grid lines, axis numbers, summary, date/range selector.
- Add hover interactions: show exact values, dim other bars, highlight the focused data point.
- Charts should have a vertical axis. Rounded bar tops make it hard to read values. Don't show more bars than data points.
- Use favicons/icons next to chart items for quick identification.

### Modals, Popovers & Pages

- **Popover:** Simple context, non-blocking (user can click away). E.g., display settings.
- **Modal:** Complex context, blocking (must confirm/cancel). E.g., create new item. Follow with a toast confirmation.
- **New page:** Permanent or very large context. E.g., item detail view. Always include back button or breadcrumb.
- **Toasts:** Notification system for the dashboard. Success, warning, error states. Don't take over the screen.

### The Four Dashboard Components

1. **Lists & tables:** Separation via space, dividers, or alternating colors. Add search, filter, sort for interactivity.
2. **Cards:** Charts, toasts, KPI widgets. Well-spaced margins, border or background separation.
3. **User inputs:** Forms, settings, modals. Sometimes combined (tables with forms inside cards).
4. **Tabs:** Add pages without cluttering the sidebar. Different views of related data.

---

## 16. AI Product UI Patterns

- **Start with a giant prompt box.** Gets users trying the tool immediately, clean aesthetic above the fold.
- **Make the prompt box useful:** Preview PDFs/images, compress code blocks, add context chips (brainstorm/data/email mode), integrations (Google Drive, GitHub, Figma).
- **Progressive disclosure in inputs:** Toggle advanced mode, token cost estimate above input.
- **Generation history is essential.** Organize by session, preview first line/snippet, allow deletion and search.
- **Memory panel:** Let users see, control, bulk delete, and add to persistent AI memory. Don't hide it in settings.
- **Inline editing:** Highlight any response text, type what you want changed. Fast, contextual, frictionless.
- **Show the AI's work:** Research trails, sources cited, step-by-step logic. Makes the product feel intelligent, not like a black box.
- **Streaming responses** word by word turns delay into anticipation.
- **Confidence indicators:** Show certainty scores (high confidence / unverified) below AI responses.
- **Loading:** Skeleton shimmer effects, animated steps, bouncing dots, rotating icons -- always show progress.

---

## 17. Beginner Mistakes to Avoid

1. **Not planning user flows.** Sketch flows on paper first. Missing: search bars, skip buttons, back navigation, hover states.
2. **Overusing effects.** Shadows, glows, gradients -- less visual noise = better. If you need a gradient, use variations of one color.
3. **Tight spacing.** Use grids and auto-layout. Mobile needs even more space than you think.
4. **Inconsistent components.** Match corner radii, button sizes, styles across the design. Use Figma styles/variables/components.
5. **Bad or mismatched icons.** Use one consistent library. Sort by stroke width and corner style.
6. **Redundant elements.** Remove arrows users can swipe, unnecessary borders, visual clutter. Dim rather than remove if contrast is a concern.
7. **No interactive feedback.** Gray out buttons on click, fill save icons, add loading wheels, show red dots for new items.
8. **Overdesigned charts.** Prioritize readability over aesthetics. Include axes, match bars to data points, keep it simple.
9. **Letting AI choose colors, layouts, or icons.** AI defaults to bright clashing colors, emojis, and repetitive KPI blocks. Always redesign these.

---

## 18. Presenting Designs

### Portfolio/Social (Creative)

- **Plain background:** Take accent color, darken and desaturate it. Add faint shadow. Minimalism makes the design pop.
- **Dark mode glow:** Large blurred circles of accent color behind the UI. Add glassy background + gradient stroke.
- **Explode the image:** Extend elements off the screen (lines, patterns, UI pieces).
- **Skew:** 2 degrees vertical, -14 degrees horizontal. Pop out the main element with offset and shadow.
- **Collages:** Offset multiple screens, add rotation, avoid grid alignment. Pop out the most important frame.
- **Zoom into dashboard details** and animate them for a professional-yet-creative showcase.

### Client Meetings (Professional)

- **Mockups** show the product in its real context (computer screens, iPads, Apple Watches).
- **AI-generated custom mockups:** Describe the scene with small realistic details (cracks, water stains, natural lighting) for believability.
- **Prototyping > static images.** Show don't tell. Demonstrate hidden features, swipe actions, modal animations. Communicates polish that screenshots can't.

---

## 19. Vibe Coding Fixes

When redesigning AI/vibe-coded apps:

1. **Replace emojis** with professional icon libraries (Phosphor, Lucide).
2. **Fix AI's color choices** -- they always go for bright, clashing colors. Apply your neutral + accent system.
3. **Remove AI's redundant KPI blocks** -- AI loves showing the same data 3 times.
4. **Fix the sidebar:** Remove irrelevant counts, align left, tighten spacing, replace gradient avatars with proper account cards, collapse settings into popovers.
5. **Collapse busy card actions** into triple-dot menus. Move dates/metadata to logical positions.
6. **Use modals over flyouts** when there's space and the action relates to current context.
7. **Add low-hanging-fruit features:** Toggle to split data by individual items, comparison views, maps with shaded regions.
8. **Landing pages need graphics** to establish trust. Even simple skewed screenshots of the product elevate the page massively.

---

## 20. Captivating Design (Structure + Motion + Surprise)

### Structure First

- **Captivating != chaotic.** Guide the user's eye intentionally.
- Ask: "If someone had 5 seconds to scroll, could they understand the idea?"
- **Wireframe test:** Remove all content -- does the layout alone guide the eye?
- Give generous space to text and surrounding elements.
- Don't split text into too many separate elements, avoid excessive small ornamentation.

### Motion Second

- Motion should **deliberately draw attention to the product**, not just look cool.
- Integrate product demos into scroll animations (hero morphs into dashboard).
- Simple single-section hover animations that demonstrate the product beat complex scroll-jacking.
- **Break the pattern occasionally** -- unexpected moments (page unfolds, hidden reveals) are engaging if well-built.

### Surprise Third

- Unexpected interactions reward users for exploring (expanding modals, hidden easter eggs).
- On mobile: clean structure first, then animation (swipe transitions), then surprise (editing tools sliding up from bottom).
- **Animations should situate the user:** Sliding up = temporary action, sliding from left = progress forward.

### Playful Design

- Replace sterile corporate layouts with **contextual illustrations** (doodles, illustrations, icons) around the core message.
- Elements should draw attention to center text, not clutter it. If adding one more illustration makes it feel cluttered, remove it.
- **Entrance animations** for decorative elements: rotate and pop in, fly in from off-screen and bob, slide and rotate.
- Apply easing for natural motion. Add parallax on scroll for depth.
- **Text animation** (progress bars filling, words replacing each other, checkboxes appearing) draws attention because it moves.
- **404 pages** are the ultimate place to be quirky and fun.
- **Hover interactions on everything** (even in simple designs) prevent simplicity from becoming blandness.

---

## Quick Reference Checklist

1. Start with a neutral foundation (near-white or dark backgrounds, tinted with brand color)
2. Pick one brand color and build a full ramp (100-900)
3. Always include semantic colors (red, green, yellow, blue)
4. Dark mode: double shade distances, elevate = lighten, no shadows
5. One sans-serif font, tighten header letter spacing (-2% to -4%)
6. 4/8-point grid, generous white space, fewer lines
7. Consistent components: match corner radii, button sizes, icon styles
8. Every element needs hover, active, disabled states
9. Every action needs visible feedback (toast, animation, state change)
10. Design empty, loading, error, and success states
11. Use OKLCH for perceptually uniform color palettes
12. Sketch user flows before designing screens
13. Progressive disclosure: show only what's needed now
14. Remove redundant elements -- fewer elements = better
15. Motion supports clarity, never distracts from it
16. Never use linear easing -- match easing to personality
17. Sidebar: icons + short titles, grouped by relevance, settings at bottom
18. Charts: readable over aesthetic, always include axes and labels
19. Mobile: bounce easing, directional transitions, swipe + button alternatives
20. Structure -> Motion -> Surprise (in that order of priority)
