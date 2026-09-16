---
"@fusorb/facet-tokens": minor
---

## Motion System — Animation Tokens & Consolidated Keyframes

**Motion tokens (CSS variables)** added to `:root` in `tokens.css`:
durations `--motion-duration-0` through `--motion-duration-1000` (MD3 stepped
scale), 8 easing curves (`--motion-ease-standard` / `-decelerate` / `-accelerate` /
`--motion-ease-emphasized*` / `--motion-ease-spring` / `--motion-ease-bounce`),
travel distances `--motion-distance-sm`–`2xl`, scales `--motion-scale-inactive`
/ `pop`, blur `--motion-blur-inactive`, and `--motion-delay-stagger` (50ms).

**TypeScript types** added: `MotionDuration`, `MotionEasing`, `MotionDistance`,
`MotionScale`, `MotionBlur`, `MotionTokens` — all exported from the package
barrel and added to the `FacetTokens` interface.

**Runtime export** `motion` — a `MotionTokens` object mapping every token to
its `var(--motion-*)` reference for programmatic use in React components.

**New keyframe families** (consolidated from the animation.txt research sheet,
each pulling the best curve from shadcn / Tailwind / Material Design /
Framer Motion / animate.css): `facet-fade-in/out`, `facet-slide-down/left/right`,
`facet-zoom-in/out`, `facet-flip-x`, `facet-bounce`, `facet-shake` — all
duration/easing-driven by motion tokens for theme-wide control.

**New Tailwind utilities**: `animate-facet-fade-in`, `animate-facet-fade-out`,
`animate-facet-slide-down`, `animate-facet-slide-left`, `animate-facet-slide-right`,
`animate-facet-zoom-in`, `animate-facet-zoom-out`, `animate-facet-flip-x`,
`animate-facet-bounce`, `animate-facet-shake`.

All additions are purely additive — no existing CSS variables or keyframes are
removed or renamed. The deprecated `.glow-indigo` alias is retained.
