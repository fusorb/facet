---
"@fusorb/facet-components": minor
"@fusorb/facet-docs": patch
---

Chart: fix 3 failing tests (handlePointerMove no longer bails on zero-width SVG rects in jsdom; ResizeObserver scaleRef formula corrected to width/rect.width).

Chart: add visible axis spine lines (solid y-axis + x-axis) so axes are properly framed instead of floating with only dashed gridlines. Increased left padding from 48 to 56px for better y-axis label clearance.

Chart: add `maxHeight` prop — when set, the chart container becomes vertically scrollable so charts with many categories (especially horizontal bar layouts) can be fully viewed without crowding.

Chart: add `rowHeight` prop (default 36px) — horizontal bar charts now auto-grow their height to `n * rowHeight + padding` so each category row gets adequate vertical space, and bars distribute across the plot height (not width) via a new `catY` positioning function.

Docs: add chart component variant gallery (Line, Bar, Area, Pie, Donut, Composed, Horizontal, Stacked, Smooth, Step) to the variant gallery and usage snippets.

Chart: pie slices no longer scale(1.03) on hover from the label position (which caused an inconsistent pop) - hover now dims via opacity only, matching donut behavior.

Chart: new `crosshairPoints` prop (default false) - the colored point markers that chased the crosshair cursor are now opt-in, so the crosshair line is the only element that follows the mouse by default.
