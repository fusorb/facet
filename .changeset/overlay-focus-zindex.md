---
"@fusorb/facet-components": patch
---

Stage 3 of the component-library cleanup:

- **Overlay lifecycle revert**: reverted dialog, sheet, drawer, alert-dialog,
  popover, select, tooltip, hover-card, menubar, and context-menu from the
  JS-driven exit lifecycle (`Presence` + `Motion` exit + `forceMount` +
  `useOverlayOpen`) back to CSS-driven exit via `data-[state=closed]:animate-facet-*`
  with a plain `<DialogPortal>`. Overlays now import only `{ Motion }` (no
  `Presence`).
- **Removed dead code**: deleted `src/ui/motion-usage.tsx` (`OverlayContext` +
  `useOverlayOpen`, imported only by the 10 overlays) and removed its
  `NON_COMPONENT_FILES` exclusion from the three drift-gate scripts.
- **Focus restore**: restored visible, keyboard-only focus rings on Button,
  Input, Select, Dialog, and Tabs using `focus-visible:ring-2
  focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
  focus-visible:ring-offset-background`. Because these use `:focus-visible`,
  mouse clicks do **not** show a ring/border (keyboard-only). `ring` colour
  resolves to `--ring: #38bdf8` via the Tailwind `@theme` in `tailwind.css`.
  Navbar dropdown-trigger buttons (the "mother navlinks") now carry
  `focus-visible:ring-0` so keyboard Tab focus on the trigger itself is
  suppressed — the ring is delegated to the menu items instead.
  Navbar already shows focus via `focus:bg-accent` on delegated items.
- **z-index normalization**: modal backdrops are now `z-[60]` (below their
  floating content) and floating content/overlays/menus are `z-[70]`, using
  bracketed arbitrary values. Plain `z-60`/`z-70` are no-ops under Tailwind v4's
  default scale (0,1,10,20,30,40,50,auto) and were corrected where introduced;
  the navbar's pre-existing `z-60`/`z-70` no-op classes were also corrected
  to bracketed arbitrary values (`z-[60]`/`z-[70]`) in the same pass.
- **Tests**: added `focus-ring.test.tsx` asserting the `focus-visible:` ring
  classes are present on Button and Input.

Deviations flagged in AGENTS: the overlay revert used a blunt `git checkout
deb6ad0` of each file instead of the originally proposed shared
overlay-wrapper abstraction.
