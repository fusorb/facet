---
"@fusorb/facet-components": minor
"@fusorb/facet-docs": patch
---

Chart polish + ThemeToggle icon sizing:

- Chart `width` prop - make the viewBox width customizable (default 800) so text stays readable in narrower containers
- `axisFontSize` (default 11) and `pieLabelFontSize` (default 12) props - all font sizes are now customizable with sensible defaults, fixing the "too tiny" pie labels in constrained cards
- Pie + Donut: leader lines connect each slice to its label, labels spaced 24px from the arc (was 16), text anchored based on slice angle for readability, two-line default label (bold category + muted percentage), and `renderSliceLabel` prop for fully custom label content (supports bold+sublabel, icons, etc.)
- Pie + Donut hover focus tightened - the hovered slice stays at full opacity, non-hovered slices dim to 0.4, and `onMouseLeave` clears the hover state
- Cartesian bar opacity made consistent with pie/donut - full opacity by default, dim to 0.85 for non-hovered bars on hover
- ThemeToggle icon sized to 16px (`size={16}`) to match Navbar's other icon buttons (sun/moon icons were defaulting to 24px and overflowing the 16px container)
- Crosshair tracking circles now carry `data-crosshair-point="true"` (targeting + styling hook)
- Docs changelog surface list cleaned up - removed stale `DataTablePage` and `BorderBeamCard` (both ejected/removed), updated count to 19
