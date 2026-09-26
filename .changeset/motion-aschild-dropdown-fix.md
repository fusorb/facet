---
"@fusorb/facet-motion": minor
"@fusorb/facet-components": minor
---

## motion: asChild mode + dropdown render fix

Fixed a render issue where dropdowns triggered on hover/click (Navbar, UserMenu)
appeared behind other content or mispositioned. Root cause: `<Motion>` rendered a
plain `<div>` wrapper around Radix popover `Content`, whose inline `transform`/
`opacity` styles created a stacking context and distorted Radix positioning.

### facet-motion
- Added `asChild` prop to `<Motion>`: when set, Motion clones its single child
  element and applies animation styles + a merged ref directly on it — **no
  wrapper `<div>`**. The rendered element becomes the animated node, preserving
  Radix Portal positioning, focus scope, and z-index stacking.
- Added `setRef` + `useMergeRefs` helpers for stable ref merging.

### facet-components
- Migrated all 10 Radix popover `Content` components from CSS
  `data-[state=open]:animate-facet-zoom-in` to `<Motion asChild
  effect="zoom" direction="up">`:
  - dropdown-menu (Content + SubContent), tooltip, popover, hover-card,
    context-menu (Content + SubContent), menubar (Content + SubContent),
    navigation-menu (Viewport), select, dialog, sheet, alert-dialog
- Removed enter animation CSS classes from all Contents (Motion JS spring handles enter).
- Preserved `data-[state=closed]:animate-facet-zoom-out` exit classes on all Contents.
- Left overlays (Dialog/Sheet/AlertDialog) and NavigationMenuIndicator as CSS-only.
