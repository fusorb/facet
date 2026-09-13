---
"@fusorb/facet-components": minor
---

Chart v2 polish — crosshair fix, animations, and range selector:

- **Crosshair duplication fix**: The intersection dot is now hidden when the
  crosshair snaps to a data point — it was rendering on top of the active
  data-point dot, creating a "duplicated/blinking" appearance. The guide line
  snaps to the nearest data point; bar/histogram charts dynamically snap within
  an 8px threshold (following the cursor otherwise), giving the "follow cursor,
  stick to data point when hovered" behavior.

- **Crosshair dot centering**: The active data-point dot's hover `scale(1.15)`
  is now anchored to the dot's centre with `transformOrigin` (matching the
  pie/donut slices). Without it, SVG's default origin-`0` scaling shifted the
  active dot off the band centre, re-creating the drift the snap fix was meant
  to eliminate (the dot floated right/down away from the snapped guide line).

- **View animations**: Replaced all slide-from-top entry animations
  (`translateY` / `slide-in-from-top-*`) with pure fade or fade+zoom in
  Tooltip, Popover, DropdownMenu, Select, Dialog, AlertDialog, NavigationMenu,
  Sheet, Chart (facet-chart-fadeIn keyframe), MicroInteractions,
  RevealCard, and the `facet-fade-up` / `facet-dissolve` Tailwind keyframes.

- **ChartRangeSelector**: Now positional (`position` prop: top-left/top-right/
  bottom-left/bottom-right/top/bottom), customizable (`size` prop: compact/
  normal/wide), minimizable (collapsible with a toggle button, controlled or
  uncontrolled), and opt-in via the new `rangeSelector` prop on `Chart`.
