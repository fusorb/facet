---
"@fusorb/facet-components": major
---

Remove redundant components: `GlowBorderCard`, `HoverCard`, and `Drawer`.

- `GlowBorderCard` duplicated ShineBorderCard's border-beam effect.
- `HoverCard` had no internal consumers or docs demo; its
  `@radix-ui/react-hover-card` dependency is dropped.
- `Drawer` was redundant with `Sheet` (which is itself a Drawer); use `<Sheet>`
  instead.
- `vaul` is no longer a dependency (`Sheet` is built on
  `@radix-ui/react-dialog`).
- Counts updated 116 → 113 across packages, docs pages, landing site-data,
  README, and CLAUDE.md.
