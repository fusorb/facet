---
"@fusorb/facet-components": minor
---

Chart crosshair + dynamic axis range:

- Crosshair intersection dot border now inherits the chart background color instead of the foreground, so it renders as the background (black in dark mode, light in light mode) — matching the crosshair point dots and keeping the snapped intersection visually grounded.
- New `tickCount` prop (default `4`) controls how many ticks are drawn on the value axis (`niceTicks` previously hardwired 4).
- New optional `yMin` / `yMax` props override the auto-computed value-axis range. The range still falls back to the data-derived min/max (clamped to include 0 for bar correctness) when omitted, so existing charts are unchanged.
