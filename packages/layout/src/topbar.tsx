/**
 * @fusorb/facet-layout: Topbar
 *
 * Sticky top bar with mobile hamburger, tenant switcher, user menu, and an
 * optional built-in theme toggle (renders @fusorb/facet-components'
 * ThemeToggle; requires a ThemeProvider ancestor).
 */

import * as React from "react";
import { ThemeToggle } from "@fusorb/facet-components";
import { useLayout } from "./layout-context.js";
import { UserMenu } from "./user-menu.js";
import { TenantSwitcher } from "./tenant-switcher.js";
import type { TenantReference } from "./types.js";

export interface TopbarProps {
  tenants?: TenantReference[];
  activeTenant?: TenantReference | null;
  onTenantSwitch?: (tenantId: string) => void;
  /** Rendered after the user menu (notifications, theme toggle, etc.) */
  children?: React.ReactNode;
  /** Render the built-in theme toggle (requires a ThemeProvider ancestor). */
  themeToggle?: boolean;
  /** Path to settings page */
  settingsPath?: string;
  /** Override sign out handler */
  onSignOut?: () => void;
  /** Rail mode: show the desktop collapse toggle. Default: "full" */
  mode?: "full" | "rail";
  /** Mobile: brand logo node to show in place of the hamburger. */
  mobileBrand?: React.ReactNode;
}

export function Topbar({
  tenants = [],
  activeTenant = null,
  onTenantSwitch,
  children,
  themeToggle = false,
  settingsPath,
  onSignOut,
  mode = "full",
  mobileBrand,
}: TopbarProps) {
  const {
    sidebarOpen,
    toggleSidebar,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    hoverEnterSidebar,
    hoverLeaveSidebar,
  } = useLayout();

  return (
    <header className="sticky top-0 z-60 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile: brand logo morphs into a window on hover. Mouse hover
            previews the sidebar; click pins it open. Hover-leave closes
            it (after a short delay) unless pinned. */}
        <button
          type="button"
          onClick={toggleSidebar}
          onMouseEnter={hoverEnterSidebar}
          onMouseLeave={hoverLeaveSidebar}
          data-mobile-trigger
          className="group relative z-40 rounded-md p-1 text-foreground/70 transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
        >
          {mobileBrand ?? (
            <span className="relative block">
              {/* Default hamburger */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-opacity duration-150 group-hover:opacity-0"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              {/* Window icon revealed on hover */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="9" y1="5" x2="9" y2="19" />
              </svg>
            </span>
          )}
        </button>

        {/* Rail-mode collapse toggle (desktop) */}
        {mode === "rail" && (
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden rounded-md p-1 text-foreground/60 hover:bg-accent lg:inline-flex"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-pressed={sidebarCollapsed}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {sidebarCollapsed ? (
                <path d="m9 18 6-6-6-6" />
              ) : (
                <path d="m15 18-6-6 6-6" />
              )}
            </svg>
          </button>
        )}

        <TenantSwitcher
          tenants={tenants}
          activeTenant={activeTenant}
          onSwitch={onTenantSwitch ?? (() => {})}
        />
      </div>

      <div className="flex items-center gap-3">
        {themeToggle && <ThemeToggle />}
        {children}
        <UserMenu settingsPath={settingsPath} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
