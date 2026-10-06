---
"@fusorb/facet-components": minor
---

Component stability + animation polish.

- **Carousel**: optional `autoplay` prop (`boolean | number` ms) with
  pause-on-hover.
- **Sheet / NotificationDrawer**: now slide in/out from their edge
  (`top`/`right`/`bottom`/`left`) via the motion slide keyframes instead of
  zooming; the notification drawer inherits this.
- **AnimatedButton**: default animation switched from `sparkle` to `shine`; the
  bare animated variants (ripple / magnetic / shine) now render through
  `Button` so they carry full styling. `SparkleButton` remains exported.
- **Chart**: the hover crosshair now clears on pointer leave.
- **Popover family** (popover, dropdown-menu, tooltip, context-menu, menubar,
  select): switched to the subtler anchored `facet-pop-in/out` animation
  (opacity + `scale`) so it no longer composes with / fights Radix's popper
  positioning transform.
- **Tokens**: added `facet-slide-in-from-*` / `facet-slide-out-to-*` and
  `facet-pop-in/out` keyframes + utilities; `--shine-color` token.
