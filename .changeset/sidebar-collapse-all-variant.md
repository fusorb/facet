---
"@fusorb/facet-layout": minor
---

Add collapsed sidebar variant that collapses all sidebar sections and the aside at once.

- New `collapseAllSidebar`, `expandAllSidebar`, and `registerSections` functions in `LayoutContext`.
- New `collapsedAll`, `collapseAllSidebarAndAside`, `expandAllSidebarAndAside`, and `toggleCollapseAll` in `DocsLayoutContext`.
- Added a dedicated toggle button in the docs topbar (Collapse all / Expand all) with `maximize-2` / `minimize-2` icons.
- Added `Ctrl+Shift+B` keyboard shortcut.
- Added a "Collapse all" / "Expand all" option in the SettingsMenu dropdown.
- All state (rail collapse, section collapse, mode, aside) persists via existing localStorage keys.
