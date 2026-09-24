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
 *   - Collapsed variant: one button collapses the sidebar rail, every nav
 *     section, AND the aside at once (Ctrl/Cmd+Shift+B). Toggling restores
 *     all three (full rail + expanded sections + aside).
 *   - SettingsMenu with ecosystem links
 *
 * The DocsLayoutContext exposes mode + aside + collapse-all state so that
 * docs-specific topbar controls (SettingsMenu, dropdown, keyboard) can read
 * or mutate them.
 */

import * as React from "react";
import { ConsoleLayout } from "./console-layout.js";
import { useLayout } from "./layout-context.js";
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
  /** Whether the sidebar rail, all nav sections, AND the aside are all collapsed.
    *  When true the viewport is maximised for content. */
  collapsedAll: boolean;
  /** Collapse the sidebar rail, every nav section, AND the aside in one shot. */
  collapseAllSidebarAndAside: () => void;
  /** Reverse: expand the sidebar rail, unfold every section, and restore the aside. */
  expandAllSidebarAndAside: () => void;
  /** Toggle between fully-collapsed and fully-expanded. */
  toggleCollapseAll: () => void;
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

  // ── Collapsed-all (sidebar rail + every section + aside) ────────────
  // The combined state lives in a ref so DocsTopbarControls (rendered inside
  // both LayoutProvider and DocsLayoutContext) can populate it synchronously
  // during render.  External consumers read it via `collapsedAll` (synced
  // through state) and trigger actions via the delegating callbacks below.
  const collapseAllStateRef = React.useRef<{
    collapsedAll: boolean;
    collapse: (() => void) | null;
    expand: (() => void) | null;
  }>({ collapsedAll: false, collapse: null, expand: null });
  const [collapsedAll, setCollapsedAll] = React.useState(false);

  const ctx: DocsLayoutContextValue = {
    mode: modeState,
    setMode: setModeState,
    toggleMode,
    asideOpen,
    setAsideOpen,
    toggleAside,
    collapsedAll,
    collapseAllSidebarAndAside: () => collapseAllStateRef.current.collapse?.(),
    expandAllSidebarAndAside: () => collapseAllStateRef.current.expand?.(),
    toggleCollapseAll: () => {
      if (collapseAllStateRef.current.collapsedAll) {
        collapseAllStateRef.current.expand?.();
      } else {
        collapseAllStateRef.current.collapse?.();
      }
    },
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
          <DocsTopbarControls
            collapseAllStateRef={collapseAllStateRef}
            setCollapsedAll={setCollapsedAll}
            topbar={topbar}
          />
        }
      >
        {children}
      </ConsoleLayout>
    </DocsLayoutContext.Provider>
  );
}

/**
 * Renders the docs-specific topbar controls: mode toggle (rail/full),
 * aside toggle, and the combined "collapse all sidebar + aside" button.
 *
 * Lives inside ConsoleLayoutInner (therefore inside LayoutProvider) so it
 * can read both useLayout() (sidebar rail + sections) and useDocsLayout()
 * (mode + aside) and wire them together.
 */
interface DocsTopbarControlsProps {
  collapseAllStateRef: React.MutableRefObject<{
    collapsedAll: boolean;
    collapse: (() => void) | null;
    expand: (() => void) | null;
  }>;
  setCollapsedAll: (v: boolean) => void;
  topbar?: React.ReactNode;
}

function DocsTopbarControls({
  collapseAllStateRef,
  setCollapsedAll,
  topbar,
}: DocsTopbarControlsProps) {
  const { mode, asideOpen, setMode, setAsideOpen, toggleMode, toggleAside } =
    useDocsLayout();
  const { sidebarCollapsed, collapseAllSidebar, expandAllSidebar } = useLayout();

  // Everything is "all collapsed" when the sidebar is in rail mode, the rail
  // is collapsed, and the aside is hidden.
  const computedCollapsedAll =
    mode === "rail" && sidebarCollapsed && !asideOpen;

  // Populate the ref synchronously so the delegating callbacks in the
  // DocsLayoutContext value (which read from the ref) always see the latest
  // closures — even before effects run.
  collapseAllStateRef.current = {
    collapsedAll: computedCollapsedAll,
    collapse: () => {
      // Rail mode + collapsed rail (all sections folded) + aside hidden.
      setMode("rail");
      collapseAllSidebar();
      setAsideOpen(false);
    },
    expand: () => {
      // Full mode + expanded rail (all sections unfolded) + aside restored.
      setMode("full");
      expandAllSidebar();
      setAsideOpen(true);
    },
  };

  // Sync display state for external consumers (e.g. SettingsMenu).
  React.useEffect(() => {
    setCollapsedAll(computedCollapsedAll);
  }, [computedCollapsedAll, setCollapsedAll]);

  // Ctrl/Cmd+Shift+B: collapse / expand everything.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "b"
      ) {
        event.preventDefault();
        if (computedCollapsedAll) {
          setMode("full");
          expandAllSidebar();
          setAsideOpen(true);
        } else {
          setMode("rail");
          collapseAllSidebar();
          setAsideOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    computedCollapsedAll,
    collapseAllSidebar,
    expandAllSidebar,
    setMode,
    setAsideOpen,
  ]);

  return (
    <>
      {/* Mode toggle (rail / full) */}
      <button
        type="button"
        onClick={toggleMode}
        aria-label={`Switch to ${mode === "rail" ? "full" : "rail"} mode`}
        className="rounded p-1.5 text-sidebar-foreground/60 hover:bg-foreground/5 hover:text-sidebar-accent-foreground"
        title={mode === "rail" ? "Expand sidebar" : "Collapse sidebar"}
      >
        {mode === "rail" ? (
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

      {/* Collapse all sidebar sections + aside */}
      <button
        type="button"
        onClick={() => {
          if (computedCollapsedAll) {
            setMode("full");
            expandAllSidebar();
            setAsideOpen(true);
          } else {
            setMode("rail");
            collapseAllSidebar();
            setAsideOpen(false);
          }
        }}
        aria-label={
          computedCollapsedAll
            ? "Expand all sections"
            : "Collapse all sections"
        }
        aria-pressed={computedCollapsedAll}
        className="rounded p-1.5 text-sidebar-foreground/60 hover:bg-foreground/5 hover:text-sidebar-accent-foreground"
        title={
          computedCollapsedAll
            ? "Expand all sections"
            : "Collapse all sections"
        }
      >
        {computedCollapsedAll ? (
          <Icon name="maximize-2" className="h-4 w-4" />
        ) : (
          <Icon name="minimize-2" className="h-4 w-4" />
        )}
      </button>

      {/* Docs-specific extra controls (GitHub, SettingsMenu, …) */}
      {topbar}
    </>
  );
}
