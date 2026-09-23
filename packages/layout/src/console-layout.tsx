/**
 * @fusorb/facet-layout: ConsoleLayout
 *
 * Dashboard shell: fixed sidebar + topbar + content area.
 * On mobile the sidebar is a slide-in panel (no overlay so the hamburger
 * stays clickable). Hovering the hamburger previews the sidebar; clicking
 * pins it open. Clicking outside (or pressing Escape) closes it.
 * Uses LayoutProvider for sidebar state.
 */

import * as React from "react";
import { useOptionalAuth } from "@fusorb/facet-auth";
import { useLayout, LayoutProvider } from "./layout-context.js";
import { Sidebar } from "./sidebar.js";
import { Topbar } from "./topbar.js";
import type { ConsoleLayoutMode, LayoutConfig, TenantReference } from "./types.js";
import type { RouterAdapter } from "./router.js";

/** True when the viewport is at the desktop (lg) breakpoint or wider. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export interface ConsoleLayoutProps {
  config: LayoutConfig;
  tenants?: TenantReference[];
  activeTenant?: TenantReference | null;
  onTenantSwitch?: (tenantId: string) => void;
  /** Sidebar mode. "full" = always-labeled, "rail" = collapsible icon-only. Default: "full" */
  mode?: ConsoleLayoutMode;
  /** Framework-aware navigation (Next <Link>, react-router <Link>, ...). */
  router?: RouterAdapter;
  /** Extra content rendered at the right side of the topbar (links, toggles). */
  topbar?: React.ReactNode;
  /** Render the built-in theme toggle in the topbar (needs a ThemeProvider ancestor). */
  themeToggle?: boolean;
  /**
   * Accordion mode: opening a sidebar section closes the others. Default: false
   * (sections stay independently open). Recommended for doc-style sidebars
   * and narrow rail layouts.
   */
  singleOpen?: boolean;
  /**
   * Optional aside panel rendered between the sidebar and main content
   * (desktop only, lg+). Typically used for "on this page" navigation.
   * When provided the main content is offset to the right to make room.
   * Desktop-only — not rendered on medium or small screens.
   */
  aside?: React.ReactNode;
  /** Width of the aside panel in px. Default: 260 */
  asideWidth?: number;
  /** When true, the aside panel is not rendered (content takes full width). */
  asideCollapsed?: boolean;
  children: React.ReactNode;
}

function ConsoleLayoutInner({
  config,
  tenants,
  activeTenant,
  onTenantSwitch,
  mode = "full",
  topbar,
  themeToggle = false,
  singleOpen = false,
  aside,
  asideWidth = 260,
  asideCollapsed = false,
  children,
}: ConsoleLayoutProps) {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    sidebarWidth,
    toggleSidebarCollapsed,
  } = useLayout();
  const isDesktop = useIsDesktop();

  // Ctrl/Cmd+B toggles the rail sidebar collapse (VS Code style). Ignored
  // while the user is typing in an input, textarea, or contenteditable.
  React.useEffect(() => {
    if (mode !== "rail") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable)
        ) {
          return;
        }
        event.preventDefault();
        toggleSidebarCollapsed();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, toggleSidebarCollapsed]);

  // Auth is optional. Without an <ArcProvider>, treat the user as
  // authenticated so the shell works for docs/static sites that have
  // no auth context.
  const auth = useOptionalAuth();
  const isAuthenticated = auth?.isAuthenticated ?? true;
  const isLoading = auth?.isLoading ?? false;

  // Show loading state while auth resolves
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated: render children directly (let Guard or SignIn handle it)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const sidebarWidthPx =
    mode === "rail" && sidebarCollapsed ? 68 : sidebarWidth;

  // Click-outside (and Escape) closes the mobile sidebar.
  // The hamburger button is excluded via [data-mobile-trigger] so that
  // click-to-pin works even while the sidebar is open on hover.
  const setSidebarOpenRef = React.useRef(setSidebarOpen);
  setSidebarOpenRef.current = setSidebarOpen;
  React.useEffect(() => {
    if (!sidebarOpen) return;
    const close = () => setSidebarOpenRef.current(false);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("[data-sidebar]") ||
        target?.closest("[data-mobile-trigger]")
      )
        return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  // Classic mode: the sidebar is persistent and pushes content (full/rail).
  const classicDesktop = isDesktop;
  const showAside = classicDesktop && aside && !asideCollapsed;
  // Rail mode: sidebar 68px rail; full mode: sidebar 260px.
  // Per the docs layout spec, the aside is NOT compacted in full mode —
  // it stays its given width in both rail and full.
  const padLeft = classicDesktop ? sidebarWidthPx : 0;
  // Offset main content by the aside width when it is shown.
  const padRight = showAside ? asideWidth : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Classic mode: persistent adjustable sidebar (full / rail) */}
      {classicDesktop && (
        <div className="hidden lg:block">
          <Sidebar
            config={config}
            collapsed={mode === "rail" && sidebarCollapsed}
            width={sidebarWidth}
            singleOpen={singleOpen}
          />
        </div>
      )}

      {/* Desktop aside panel (on this page) — between sidebar and main.
          Only rendered on large/desktop screens; hidden on medium + small. */}
      {showAside && (
        <aside
          data-docs-aside
          className="fixed top-0 z-20 hidden h-screen flex-col border-l bg-background transition-[width] duration-200 lg:flex"
          style={{ width: `${asideWidth}px` }}
        >
          {aside}
        </aside>
      )}

      {/* Mobile: slide-in sidebar panel (no overlay - the hamburger stays
          clickable so you can pin it even while the preview is open). */}
      {!isDesktop && (
        <div
          className={`fixed inset-y-0 left-0 z-[80] flex h-screen w-[260px] transform flex-col border-r bg-sidebar transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          data-sidebar
        >
          <Sidebar config={config} singleOpen={singleOpen} />
        </div>
      )}

      {/* Main area — offset for sidebar and (optionally) aside */}
      <div
        className="flex min-w-0 flex-1 flex-col transition-[padding] duration-200"
        style={
          padLeft > 0 || padRight > 0
            ? { paddingLeft: `${padLeft}px`, paddingRight: `${padRight}px` }
            : undefined
        }
      >
        <Topbar
          tenants={tenants}
          activeTenant={activeTenant}
          onTenantSwitch={onTenantSwitch}
          mode={mode}
          themeToggle={themeToggle}
        >
          {topbar}
        </Topbar>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function ConsoleLayout(props: ConsoleLayoutProps) {
  return (
    <LayoutProvider router={props.router}>
      <ConsoleLayoutInner {...props} />
    </LayoutProvider>
  );
}
