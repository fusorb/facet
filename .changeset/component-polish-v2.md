---
"@fusorb/facet-components": minor
---

Animation + layout polish (V2-READINESS):

- Overlay enter/exit animations in DropdownMenu, ContextMenu, Menubar,
  HoverCard, Popover, Select, and Tooltip now use facet-native
  `facet-overlay-in/out` (120ms ease-out in / 100ms ease-in out) instead of
  Radix default `animate-in/fade-in/zoom-in-95`. Modals (Dialog, Sheet,
  AlertDialog) and NavigationMenu viewport retain their centred zoom per
  the intentional animation grammar — the two systems are NOT unified.
- Navbar: glass-header redesign with scroll-aware `data-stuck` state;
  pill flattened to a full-width integrated surface (light `bg-background/60`
  + `backdrop-blur-xl` at rest, intensifying to `bg-background/95` + shadow
  on scroll). Removed duplicate native tooltip.
- FaqSection: new `limit`, `showMoreLabel`, and `showLessLabel` props
  (Google-style show-more reveal).
- DropdownMenu: icon-aware description indent — text-only items no longer
  receive a 24px jump; label and description align in both single-column and
  megamenu variants.
- ShineButton: inline-flex content span so icon no longer stacks on text.
- Stepper: keyed per-step `facet-fade-up` entrance (was instant swap).
- Roadmap: staggered `facet-fade-up` on items (CSS, SSR-safe).
- DataTable: staggered `facet-fade-up` on data rows only (keyed; skeleton
  unchanged).
- Chart: `facet-chart-fadeIn` + `facet-chart-draw` wired with prop-wired
  `animationDuration`; crosshair dot carries `data-crosshair-point="true"`.
- Marquee: `pauseOnHover` defaults to true for the loop variant; strip
  default left as `false`.
- Hero: content wrapper `mx-auto max-w-3xl` centering; GridPattern overlay
  removed.
