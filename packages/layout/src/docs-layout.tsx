/**
 * @fusorb/facet-layout: DocsLayout
 *
 * High-level docs shell built on top of ConsoleLayout.
 *
 * Adds:
 *   - An inherited landing navbar (rendered above the console topbar)
 *   - Sidebar search bar (slot rendered between brand and nav)
 *   - Collapsible "on this page" aside (Desktop-only, lg+)
 *   - Sidebar auth quick-action panel (slot at the bottom)
 *   - Mode toggle (rail / full) persisted to localStorage
 *   - Aside toggle persisted to localStorage
 *   - SettingsMenu with ecosystem links
 *
 * The DocsLayoutContext exposes mode + aside state so that docs-specific
 * topbar controls (SettingsMenu, dropdown) can read or mutate them.
 */

import * as React from "react";
import { ConsoleLayout } from "./console-layout.js";
import type { ConsoleLayoutMode, LayoutConfig } from "./types.js";
import type { RouterAdapter } from "./router.js";
import { Icon } from "@fusorb/facet-components";

export interface DocsLayoutProps {
  /** Layout config (brand + navigation). Built from buildDocsLayoutConfig. */
  config: LayoutConfig;
  /** Router adapter for active-link detection. */
  router?: RouterAdapter;
  /** Sidebar mode. "rail" (default) = collapsible icon-only; "full" = always labeled. */
  mode?: ConsoleLayoutMode;
  /** Inherited landing navbar rendered above the docs-specific topbar. */
  navbar?: React.ReactNode;
  /** Whether only one sidebar section can be open at a time (accordion). Default: true */
  singleOpen?: boolean;
  /** Search trigger rendered inside the sidebar (opens command palette). */
  sidebarSearch?: React.ReactNode;
  /** "On this page" aside content (e.g. DocsTableOfContents / DocsAside). */
  aside?: React.ReactNode;
  /** Aside panel width in px. Default: 260 */
  asideWidth?: number;
  /** Auth quick-action panel at the bottom of the sidebar. */
  sidebarBottom?: React.ReactNode;
  /** Extra docs-specific controls in the topbar (GitHub link, SettingsMenu, …). */
  topbar?: React.ReactNode;
  /** Ecosystem / quick links for the settings menu. */
  links?: Array<{ label: string; href: string; icon?: string }>;
  /** Main routed content (typically <Outlet />). */
  children: React.ReactNode;
}

/* ── Context so docs-specific topbar controls can toggle mode / aside ─ */

export interface DocsLayoutContextValue {
  /** "rail" | "full" */
  mode: ConsoleLayoutMode;
  /** Switch sidebar mode. */
  setMode: (mode: ConsoleLayoutMode) => void;
  /** Toggle between rail and full. */
  toggleMode: () => void;
  /** Whether the on-this-page aside is visible. */
  asideOpen: boolean;
  /** Show / hide the aside. */
  setAsideOpen: (open: boolean) => void;
  /** Toggle the aside. */
  toggleAside: () => void;
}

const DocsLayoutContext = React.createContext<DocsLayoutContextValue | null>(
  null,
);

export function useDocsLayout() {
  const ctx = React.useContext(DocsLayoutContext);
  if (!ctx) {
    throw new Error("useDocsLayout must be used within a <DocsLayout>");
  }
  return ctx;
}

const MODE_STORAGE_KEY = "facet-docs-mode";
const ASIDE_STORAGE_KEY = "facet-docs-aside-open";

/**
 * DocsLayout — the docs-site shell.
 *
 * Wraps ConsoleLayout with an inherited navbar, sidebar search slot,
 * collapsible aside, auth bottom slot, and a docs-specific topbar
 * (mode toggle + aside toggle + extra controls).
 *
 * Two navbars:
 *   1. `navbar` prop — the inherited landing navbar (full-width, dropdowns).
 *   2. ConsoleLayout's Topbar — docs controls (hamburger, mode, aside, settings).
 */
export function DocsLayout({
  config,
  router,
  mode = "rail",
  navbar,
  singleOpen = true,
  sidebarSearch,
  aside,
  asideWidth,
  sidebarBottom,
  topbar,
  children,
}: DocsLayoutProps) {
  const [modeState, setModeState] = React.useState<ConsoleLayoutMode>(mode);
  const [asideOpen, setAsideOpen] = React.useState(true);

  // Hydrate from localStorage (client-only).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === "rail" || savedMode === "full") {
      setModeState(savedMode);
    }
    const savedAside = window.localStorage.getItem(ASIDE_STORAGE_KEY);
    if (savedAside !== null) {
      setAsideOpen(savedAside === "true");
    }
  }, []);

  // Persist changes.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MODE_STORAGE_KEY, modeState);
  }, [modeState]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ASIDE_STORAGE_KEY, String(asideOpen));
  }, [asideOpen]);

  const toggleMode = React.useCallback(() => {
    setModeState((prev) => (prev === "rail" ? "full" : "rail"));
  }, []);
  const toggleAside = React.useCallback(() => {
    setAsideOpen((prev) => !prev);
  }, []);

  const ctx: DocsLayoutContextValue = {
    mode: modeState,
    setMode: setModeState,
    toggleMode,
    asideOpen,
    setAsideOpen,
    toggleAside,
  };

  return (
    <DocsLayoutContext.Provider value={ctx}>
      <ConsoleLayout
        config={config}
        router={router}
        mode={modeState}
        singleOpen={singleOpen}
        navbar={navbar}
        aside={aside}
        asideWidth={asideWidth}
        asideCollapsed={!asideOpen}
        sidebarSearch={sidebarSearch}
        sidebarBottom={sidebarBottom}
        themeToggle
        topbar={
          <>
            {/* Mode toggle (rail / full) */}
            <button
              type="button"
              onClick={toggleMode}
              aria-label={`Switch to ${modeState === "rail" ? "full" : "rail"} mode`}
              className="rounded p-1.5 text-sidebar-foreground/60 hover:bg-foreground/5 hover:text-sidebar-accent-foreground"
              title={modeState === "rail" ? "Expand sidebar" : "Collapse sidebar"}
            >
              {modeState === "rail" ? (
                <Icon name="panel-left-open" className="h-4 w-4" />
              ) : (
                <Icon name="panel-left-close" className="h-4 w-4" />
              )}
            </button>

            {/* Aside toggle (on this page) */}
            <button
              type="button"
              onClick={toggleAside}
              aria-label={asideOpen ? "Hide on this page" : "Show on this page"}
              aria-pressed={asideOpen}
              className="rounded p-1.5 text-sidebar-foreground/60 hover:bg-foreground/5 hover:text-sidebar-accent-foreground"
              title={asideOpen ? "Hide on this page" : "Show on this page"}
            >
              {asideOpen ? (
                <Icon name="panel-right-close" className="h-4 w-4" />
              ) : (
                <Icon name="panel-right-open" className="h-4 w-4" />
              )}
            </button>

            {/* Docs-specific extra controls (GitHub, SettingsMenu, …) */}
            {topbar}
          </>
        }
      >
        {children}
      </ConsoleLayout>
    </DocsLayoutContext.Provider>
  );
}
