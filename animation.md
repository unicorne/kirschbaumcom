# Animation Framework Guide

How to write clean, performant Canvas2D animations using this framework. All colors are theme-adjustable via the design token system.

---

## 1. Design Token System (Theming & Colors)

All colors live in a single token object `T`. **Never hardcode color values** — always reference `T.color.*` so the entire palette can be swapped by changing one object.

```js
const T = {
  color: {
    // Backgrounds
    void:         '#08090d',    // deepest background
    bg:           '#0d1117',    // canvas / card background
    surface:      '#161b22',    // elevated surfaces
    surfaceHover: '#1c2128',    // hover state

    // Borders
    border:       '#21262d',    // default border
    borderLight:  '#30363d',    // lighter variant

    // Accent colors (each has a matching glow + dim variant)
    blue:         '#58a6ff',
    blueGlow:     'rgba(88,166,255,0.35)',
    blueDim:      'rgba(88,166,255,0.08)',
    cyan:         '#39d2c0',
    cyanGlow:     'rgba(57,210,192,0.35)',
    green:        '#3fb950',
    greenGlow:    'rgba(63,185,80,0.3)',
    red:          '#f85149',
    redGlow:      'rgba(248,81,73,0.4)',
    amber:        '#d29922',
    amberGlow:    'rgba(210,153,34,0.3)',
    purple:       '#bc8cff',
    purpleGlow:   'rgba(188,140,255,0.3)',

    // Text
    text:         '#e6edf3',    // primary text
    textSec:      '#8b949e',    // secondary text
    textMut:      '#484f58',    // muted / labels
  },
};
```

### How to re-theme

To change the color scheme, replace the values in `T.color`. The rest of the code is decoupled. For example, switching to a light theme:

```js
T.color.bg      = '#ffffff';
T.color.surface = '#f6f8fa';
T.color.text    = '#1f2328';
T.color.blue    = '#0969da';
// ...etc
```

### Glow convention

Every accent color should have a `*Glow` variant (rgba with ~0.3 alpha) and optionally a `*Dim` variant (~0.08 alpha). Glows are used for `shadowColor` and radial gradients; dims for subtle fills.

---

## 2. Animation Architecture

Each animation is a **pure draw function** with this signature:

```js
function drawMyAnimation(ctx, w, h, t) { ... }
```

| Param | Type | Description |
|-------|------|-------------|
| `ctx` | `CanvasRenderingContext2D` | The 2D drawing context |
| `w` | `number` | Canvas CSS width in pixels |
| `h` | `number` | Canvas CSS height in pixels |
| `t` | `number` | Elapsed time in **seconds** (float) |

The framework calls this function every frame via `requestAnimationFrame`. The canvas is **cleared automatically** before each call — you draw from scratch each frame.

### Standard draw function structure

```js
function drawMyAnimation(ctx, w, h, t) {
  // 1. Background layer (grid, fills)
  drawGrid(ctx, w, h);
  const s = S(w);            // responsive scale factor

  // 2. Compute time-based state
  const cycleT = (t % duration) / duration;  // 0→1 loop

  // 3. Draw layers back-to-front
  //    - background fills / zones
  //    - lines / paths
  //    - glows / highlights
  //    - labels / status text

  // 4. Status indicators (top-left label, dots)
}
```

---

## 3. Responsive Scaling

### Scale factor `S(w)`

```js
function S(w) { return Math.max(0.45, w / 600); }
```

Use `s = S(w)` as a multiplier for all pixel-based values: line widths, font sizes, spacing, glow radii. This ensures animations look correct from ~280px to 1200px+.

```js
ctx.lineWidth = 2 * s;
const fontSize = Math.max(8, 11 * s);   // floor prevents unreadable text
const glowRadius = 30 * s;
```

### Mobile detection

```js
T.mobile = window.innerWidth < 600;
```

Use `T.mobile` to:
- Reduce particle counts (e.g. `maxParticles = T.mobile ? 40 : 80`)
- Simplify geometry (fewer grid lines, fewer nodes)
- Skip expensive effects (`shadowBlur`, complex gradients)
- Increase step sizes in path loops (`step = T.mobile ? 2.5 : 1.5`)

### DPR handling

The `useCanvas` hook handles `devicePixelRatio` scaling via `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`. Your draw function works in CSS pixel space — no manual DPR math needed.

---

## 4. Shared Drawing Helpers

### `colorWithAlpha(color, alpha)`
Converts any hex/rgb/rgba color to rgba with the given alpha. Use this instead of hardcoding rgba values:

```js
ctx.strokeStyle = colorWithAlpha(T.color.cyan, 0.5);  // themed + adjustable
```

### `drawGrid(ctx, w, h, spacing?)`
Draws a subtle grid background. Automatically simplifies on mobile. Call at the start of every draw function.

### `drawGlow(ctx, x, y, radius, color)`
Radial gradient circle — use for emphasis, active nodes, particles. Pairs with `*Glow` token colors:

```js
drawGlow(ctx, px, py, 10 * s, T.color.cyanGlow);
```

### `drawLabel(ctx, text, x, y, color, size?)`
Renders monospace text (`IBM Plex Mono`). Enforces a minimum font size on mobile. Always use for status text and labels.

### `applyShadow(ctx, color, blur)`
Sets `shadowColor` and `shadowBlur` on desktop, skips on mobile for GPU performance. Always reset after use:

```js
applyShadow(ctx, T.color.blueGlow, 8 * s);
ctx.stroke();
ctx.shadowBlur = 0;  // always reset
```

---

## 5. Animation Timing Patterns

### Looping cycles

Most animations loop on a fixed duration. Use modular time:

```js
const cycleDur = 8;  // seconds
const cycleT = (t % cycleDur) / cycleDur;  // normalized 0→1
```

### Phase-based sequencing

Break a cycle into named phases with progress values:

```js
// Phase 1: Command typing (0% → 12%)
const cmdProgress = Math.min(1, cycleT / 0.12);

// Phase 2: Dissolve (18% → 45%)
const dissolveP = cycleT < 0.18 ? 0 : Math.min(1, (cycleT - 0.18) / 0.27);

// Phase 3: Result typing (45% → 80%)
const typeP = cycleT < 0.45 ? 0 : Math.min(1, (cycleT - 0.45) / 0.35);
```

### Easing

```js
// Ease in-out via sine
const eased = Math.sin(progress * Math.PI);

// Quadratic ease-in
const eased = progress * progress;

// Smooth pulse
const pulse = Math.sin(t * frequency) * 0.5 + 0.5;
```

### Smooth intensity ramps

```js
let intensity;
if (cycleT < 0.12)      intensity = cycleT / 0.12;        // ramp up
else if (cycleT < 0.72)  intensity = 1;                     // hold
else if (cycleT < 0.85)  intensity = 1 - (cycleT - 0.72) / 0.13;  // ramp down
else                      intensity = 0.08;                  // idle
```

---

## 6. Color Usage Patterns

### Always use tokens — never inline colors

```js
// GOOD
ctx.strokeStyle = T.color.blue;
ctx.fillStyle = colorWithAlpha(T.color.cyan, 0.5);

// BAD — breaks theming
ctx.strokeStyle = '#58a6ff';
ctx.fillStyle = 'rgba(57,210,192,0.5)';
```

### Semantic color mapping via spec palettes

Each animation spec declares a `palette` array of token key names:

```js
{ id: 'anomaly-detection', palette: ['blue', 'green', 'red'] }
```

Use the palette to pick colors programmatically:

```js
const primaryColor = T.color[spec.palette[0]];
const primaryGlow  = T.color[spec.palette[0] + 'Glow'];
```

### Gradient pattern

```js
const grad = ctx.createLinearGradient(x0, y0, x1, y1);
grad.addColorStop(0, colorWithAlpha(T.color.blue, 0.9));
grad.addColorStop(1, colorWithAlpha(T.color.blue, 0.25));
ctx.strokeStyle = grad;
```

---

## 7. Performance Guidelines

| Rule | Why |
|------|-----|
| Skip `shadowBlur` on mobile | GPU-intensive compositing |
| Increase loop step on mobile | Fewer path segments = faster strokes |
| Cap particles / nodes on mobile | Prevent frame drops |
| Use `T.dprCap` (already handled) | Limits retina scaling on low-end devices |
| Reset `shadowBlur = 0` after use | Prevents shadow leaking to subsequent draws |
| Reset `globalAlpha = 1` after use | Same — prevents state leaking |
| Avoid `ctx.save()`/`restore()` in hot loops | Stack push/pop has overhead; reset manually |

---

## 8. New Animation Checklist

1. **Define a spec** in `SPECS` with `id`, `title`, `subtitle`, `tags`, `palette`, `description`
2. **Write a pure draw function** `drawMyAnimation(ctx, w, h, t)`
3. **Start with `drawGrid`** and `const s = S(w)`
4. **Use only `T.color.*`** — no hardcoded colors
5. **Scale all pixel values** with `* s`
6. **Handle mobile** — check `T.mobile` for reduced complexity
7. **Use `applyShadow` + reset** instead of raw `shadowBlur`
8. **Loop on a fixed cycle** — `(t % dur) / dur` for 0→1 progress
9. **Add status label** top-left via `drawLabel`
10. **Register** the draw function in the `AnimationStage` mapping

### Minimal example

```js
function drawPulse(ctx, w, h, t) {
  drawGrid(ctx, w, h);
  const s = S(w);

  const cx = w / 2, cy = h / 2;
  const pulse = Math.sin(t * 2) * 0.5 + 0.5;
  const radius = 20 * s + pulse * 30 * s;

  drawGlow(ctx, cx, cy, radius * 2, T.color.cyanGlow);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = colorWithAlpha(T.color.cyan, 0.3 + pulse * 0.5);
  ctx.fill();
  ctx.strokeStyle = T.color.cyan;
  ctx.lineWidth = 2 * s;
  applyShadow(ctx, T.color.cyanGlow, 12 * s);
  ctx.stroke();
  ctx.shadowBlur = 0;

  drawLabel(ctx, 'PULSE', cx, cy + radius + 16 * s, T.color.textMut, Math.max(8, 10 * s));
}
```

---

## 9. Adapting Colors for a New Theme

To create a new theme, copy the `T.color` block and replace values. The framework guarantees that if you change the tokens, every animation updates automatically — no per-animation edits needed.

Key constraints:
- `*Glow` colors must be the rgba equivalent of the base color at ~0.3 alpha
- `*Dim` colors should be ~0.08 alpha
- Background colors (`void`, `bg`, `surface`) should form a visible elevation hierarchy
- Text colors (`text`, `textSec`, `textMut`) need sufficient contrast against `bg`

```js
// Example: Warm dark theme
T.color.bg       = '#1a1412';
T.color.surface  = '#231e1a';
T.color.blue     = '#7eb8ff';
T.color.blueGlow = 'rgba(126,184,255,0.35)';
T.color.cyan     = '#5ce0d0';
T.color.cyanGlow = 'rgba(92,224,208,0.35)';
T.color.text     = '#f0e8e0';
T.color.textSec  = '#a09080';
T.color.textMut  = '#605040';
```
