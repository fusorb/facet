---
"@fusorb/facet-layout": patch
"@fusorb/facet-docs": patch
---

Harden the app shells and their layout surfaces:

- **ConsoleLayout**: fix a Rules-of-Hooks violation — the click-outside
  `useRef`/`useEffect` sat after the `isLoading` / `!isAuthenticated` early
  returns, so an auth transition could throw "rendered more hooks than during
  the previous render". Hooks now precede every return.
- **DocsAside**: controlled (`collapsed`) mode now actually calls `onToggle`
  instead of silently flipping unused internal state, and the hydration effect
  no longer clobbers persisted state or double-fires `onToggle` on mount.
- **ChatLayout**: suppress Sidebar's default brand block (the sidebar header
  already renders the brand) so the name is not shown twice.
- **Shortcuts**: Ctrl/Cmd+K (palette) and Ctrl/Cmd+Shift+B (collapse all) are
  ignored while typing; Ctrl/Cmd+B no longer also fires when Shift is held.
- **LayoutFeatures**: `tenantSwitcher`, `themeToggle`, and `search` are now
  honored by ConsoleLayout, so the domain presets take effect.
- **Types / dead code**: `LayoutContextValue.router` is now non-optional (the
  provider always injects an adapter), so the unreachable no-adapter fallbacks
  in Sidebar are removed. `className` passthrough added to Sidebar, Topbar,
  PageHeader, and TenantSwitcher. 19 new shell regression tests.
- **Consistency**: `className` passthrough on AuthLayout / ConsoleLayout /
  DocsLayout / LandingLayout / ChatLayout; `AuthLayout.brandPanelClassName` is
  additive (keeps the responsive defaults); Topbar gains `showUserMenu`;
  DocsAside/SidebarAuth export their heading/action types; a shared
  `useIsDesktop` replaces two copies; sidebar width docs corrected (240).
- **Fixes**: remove the invalid `z-60` topbar utility (a no-op in Tailwind v4);
  drop the hardcoded `v1.0.0` sidebar footer; remove the dead `links`
  pass-through into the layout DocsLayout (facet-docs renders its own settings
  menu already).
