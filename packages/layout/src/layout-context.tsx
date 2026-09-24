/**
 * @fusorb/facet-layout: Layout context
 *
 * Manages sidebar open/close state and the optional RouterAdapter.
 * ConsoleLayout provides this; consumers can call `useLayout()` from
 * any child to toggle the sidebar or read the active router.
 */

import * as React from "react";
import type { LayoutContextValue } from "./types.js";
import { createDefaultAdapter, type RouterAdapter } from "./router.js";

const LayoutContext = React.createContext<LayoutContextValue | null>(null);

/** localStorage key for the rail-mode collapsed state. */
const STORAGE_KEY = "facet:sidebar-collapsed";

/** localStorage key for the resizable sidebar width (px). */
const STORAGE_KEY_WIDTH = "facet:sidebar-width";

/** localStorage key for per-section collapse state. */
const STORAGE_KEY_SECTIONS = "facet:sidebar-sections";

/** Default expanded sidebar width. */
export const DEFAULT_SIDEBAR_WIDTH = 240;

export function LayoutProvider({
  children,
  router,
}: {
  children: React.ReactNode;
  /** Framework-aware navigation. Defaults to window.location + plain <a>. */
  router?: RouterAdapter;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarPinned, setSidebarPinned] = React.useState(false);

  // Ref-tracked hover state so the sidebar doesn't flicker closed when the
  // mouse moves between the hamburger button and the sidebar content.
  const hoverRef = React.useRef(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const hoverEnterSidebar = React.useCallback(() => {
    hoverRef.current = true;
    clearCloseTimer();
    if (!sidebarPinned) {
      setSidebarOpen(true);
    }
  }, [sidebarPinned, clearCloseTimer]);

  const hoverLeaveSidebar = React.useCallback(() => {
    hoverRef.current = false;
    clearCloseTimer();
    if (sidebarPinned) return;
    closeTimerRef.current = setTimeout(() => {
      if (!hoverRef.current && !sidebarPinned) {
        setSidebarOpen(false);
      }
    }, 150);
  }, [sidebarPinned, clearCloseTimer]);

  const pinSidebar = React.useCallback(() => {
    setSidebarPinned(true);
    setSidebarOpen(true);
    clearCloseTimer();
  }, [clearCloseTimer]);

  const unpinSidebar = React.useCallback(() => {
    setSidebarPinned(false);
    setSidebarOpen(false);
    clearCloseTimer();
  }, [clearCloseTimer]);

  // Click toggle: open+pin, or close+unpin. If already open via hover only,
  // clicking pins it in place.
  const toggleSidebar = React.useCallback(() => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setSidebarPinned(true);
      clearCloseTimer();
    } else if (!sidebarPinned) {
      setSidebarPinned(true);
      clearCloseTimer();
    } else {
      setSidebarOpen(false);
      setSidebarPinned(false);
      clearCloseTimer();
    }
  }, [sidebarOpen, sidebarPinned, clearCloseTimer]);

  // Rail collapse state, persisted so the choice survives reloads.
  const [sidebarCollapsed, setSidebarCollapsedState] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  const setSidebarCollapsed = React.useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    }
  }, []);

  const toggleSidebarCollapsed = React.useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  }, []);

  // Resizable sidebar width (rail mode, desktop). Persisted so the user's
  // preferred width survives reloads. Bounded to [176, 400].
  const [sidebarWidth, setSidebarWidthState] = React.useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
    const stored = Number(window.localStorage.getItem(STORAGE_KEY_WIDTH));
    return stored >= 176 && stored <= 400 ? stored : DEFAULT_SIDEBAR_WIDTH;
  });

  const setSidebarWidth = React.useCallback((width: number) => {
    const clamped = Math.min(400, Math.max(176, width));
    setSidebarWidthState(clamped);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_WIDTH, String(clamped));
    }
  }, []);

  // Per-section collapse state (sidebar group headers). Persisted so the
  // user's open/closed sections survive reloads. Absent key => open.
  const [collapsedSections, setCollapsedSections] = React.useState<
    Record<string, boolean>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SECTIONS);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  // Section IDs registered by the Sidebar component. Stored in a ref so
  // that collapseAllSidebar / expandAllSidebar can operate without each
  // caller needing to pass the ids down through the tree.
  const registeredSectionsRef = React.useRef<string[]>([])

  const persistSections = React.useCallback((next: Record<string, boolean>) => {
    try {
      window.localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode): non-fatal.
    }
  }, []);

  const toggleSection = React.useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      persistSections(next);
      return next;
    });
  }, []);

  // Accordion mode: open exactly one section, closing the rest.
  // The caller passes all known section ids so sections that haven't been
  // toggled yet (absent from prev) are still collapsed.
  const openSection = React.useCallback(
    (sectionId: string, sectionIds: string[] = []) => {
      setCollapsedSections((prev) => {
        const next: Record<string, boolean> = {};
        // Preserve any sections not in the known list.
        for (const key of Object.keys(prev)) {
          next[key] = prev[key] ?? false;
        }
        // Collapse all known sections except the target.
        for (const id of sectionIds) {
          next[id] = id !== sectionId;
        }
        persistSections(next);
        return next;
      });
    },
    [],
  );

  // Collapse / expand every section at once. The caller passes the section
  // ids it knows about (the Sidebar owns config.navigation, so it has them).
  const collapseAll = React.useCallback((sectionIds: string[] = []) => {
    setCollapsedSections(() => {
      const next: Record<string, boolean> = {};
      for (const id of sectionIds) next[id] = true;
      persistSections(next);
      return next;
    });
  }, []);

   const expandAll = React.useCallback((sectionIds: string[] = []) => {
    setCollapsedSections(() => {
      const next: Record<string, boolean> = {};
      for (const id of sectionIds) next[id] = false;
      persistSections(next);
      return next;
    });
  }, []);

  // Called by the Sidebar component to register its section ids so that
  // collapseAllSidebar / expandAllSidebar can fire without the caller
  // passing ids down through the component tree.
  const registerSections = React.useCallback((sectionIds: string[]) => {
    registeredSectionsRef.current = sectionIds;
  }, []);

  // Collapse every sidebar section AND the sidebar rail itself.
  // This is the "collapsed variant" — icon-only rail with all nav groups
  // folded, ready to reclaim maximum horizontal real estate.
  const collapseAllSidebar = React.useCallback(() => {
    collapseAll(registeredSectionsRef.current);
    setSidebarCollapsed(true);
  }, [collapseAll, setSidebarCollapsed]);

  // Reverse of collapseAllSidebar: expand all sections and the rail.
  const expandAllSidebar = React.useCallback(() => {
    expandAll(registeredSectionsRef.current);
    setSidebarCollapsed(false);
  }, [expandAll, setSidebarCollapsed]);

  // Keep a stable default adapter so the context value is referentially
  // stable across renders unless the consumer swaps the router.
  const defaultRouter = React.useMemo(() => createDefaultAdapter(), []);
  const activeRouter = router ?? defaultRouter;

  // When the sidebar closes by any means (leaf-nav click, click-outside,
  // Sheet close, toggle), reset the pinned flag so the next hover preview
  // can open it again. Without this, clicking a page would leave the
  // sidebar pinned - and since hoverEnterSidebar bails while pinned,
  // the hamburger would stop responding to hover afterwards.
  React.useEffect(() => {
    if (!sidebarOpen) {
      setSidebarPinned(false);
    }
  }, [sidebarOpen, setSidebarPinned]);

  // Clean up the close timer when the provider unmounts.
  React.useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const value: LayoutContextValue = React.useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      sidebarPinned,
      pinSidebar,
      unpinSidebar,
      hoverEnterSidebar,
      hoverLeaveSidebar,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
      sidebarWidth,
      setSidebarWidth,
      collapsedSections,
      toggleSection,
      openSection,
      collapseAll,
      expandAll,
      registerSections,
      collapseAllSidebar,
      expandAllSidebar,
      router: activeRouter,
    }),
    [
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      sidebarPinned,
      pinSidebar,
      unpinSidebar,
      hoverEnterSidebar,
      hoverLeaveSidebar,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
      sidebarWidth,
      setSidebarWidth,
      collapsedSections,
      toggleSection,
      openSection,
      collapseAll,
      expandAll,
      registerSections,
      collapseAllSidebar,
      expandAllSidebar,
      activeRouter,
    ],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const ctx = React.useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayout must be used within a <LayoutProvider>");
  }
  return ctx;
}
