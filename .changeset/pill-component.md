---
"@arcevo/facet-components": minor
"@arcevo/facet-docs": patch
"@arcevo/facet-layout": patch
"@arcevo/facet-landing": patch
---

Add `Pill` component — a theme-adaptable, fully-rounded pill with a leading dot, icon, or custom indicator. Renders as a span by default, a button when `selected` or `onClick` is provided, or an anchor with `href`. Supports `color` (primary, secondary, success, warning, destructive), `variant` (default, outline, filled, ghost, subtle), `radius`, `size`, `removable`/`onRemove`, and `indicator` props.

Also exports `PillGroup` (tablist container) and `PillTrigger` (tab trigger with keyboard navigation) for toggle interfaces. All three are typed, SSR-safe, and dogfooded on the landing site's section headers.

Docs engine wired with usage snippets, variant gallery, and live preview for Pill. Landing app: ad-hoc inline pills consolidated onto `<Pill>`, off-grid spacing (`px-1.5`/`py-0.5`, `mt-0.5`, `gap-1.5`, `space-y-1.5`, `px-2.5`) normalized to the 4pt/8pt grid, component counts synced to 114 across all surfaces.
