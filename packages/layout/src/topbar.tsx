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
  /** Persistent brand node (logo + label) rendered on the left of the topbar. */
  brand?: React.ReactNode;
  /**
   * Customize the tenant switcher. Receives the resolved props; falls back to
   * the built-in TenantSwitcher when absent (backward-compatible).
   */
  renderTenantSwitcher?: (props: {
    tenants: TenantReference[];
    activeTenant: TenantReference | null;
    onSwitch: (tenantId: string) => void;
  }) => React.ReactNode;
  /**
   * Customize the user menu. Receives the resolved props; falls back to the
   * built-in UserMenu when absent (backward-compatible).
   */
  renderUserMenu?: (props: {
    settingsPath?: string;
    onSignOut?: () => void;
  }) => React.ReactNode;
}

/** Default tenant switcher: delegates to the built-in TenantSwitcher. */
function DefaultTenantSwitcher({
  tenants,
  activeTenant,
  onSwitch,
}: {
  tenants: TenantReference[];
  activeTenant: TenantReference | null;
  onSwitch: (tenantId: string) => void;
}) {
  return (
    <TenantSwitcher
      tenants={tenants}
      activeTenant={activeTenant}
      onSwitch={onSwitch}
    />
  );
}

/** Default user menu: delegates to the built-in UserMenu. */
function DefaultUserMenu({
  settingsPath,
  onSignOut,
}: {
  settingsPath?: string;
  onSignOut?: () => void;
}) {
  return <UserMenu settingsPath={settingsPath} onSignOut={onSignOut} />;
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
  brand,
  renderTenantSwitcher,
  renderUserMenu,
}: TopbarProps) {
  const {
    sidebarOpen,
    toggleSidebar,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    hoverEnterSidebar,
    hoverLeaveSidebar,
  } = useLayout();

  const handleTenantSwitch = onTenantSwitch ?? (() => {});

  return (
    <header className="sticky top-0 z-60 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        {brand}
        {/* Mobile: brand logo morphs into a window on hover. Mouse hover
            previews the sidebar; click pins it open. Hover-leave closes
            it (after a short delay) unless pinned. */}
        <button
          type="button"
          onClick={toggleSidebar}
          onMouseEnter={hoverEnterSidebar}
          onMouseLeave={hoverLeaveSidebar}
          data-mobile-trigger
          className="group relative z-40 rounded-md p-1 text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
        >
          <span className="relative block">
            {/* Logo (or default hamburger) — fades out on hover to
                reveal the window icon below */}
            <span className="inline-block transition-opacity duration-150 group-hover:opacity-0">
              {mobileBrand ?? (
                /* Default hamburger */
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
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </span>
            {/* Window icon revealed on hover (morph target for logo or hamburger) */}
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
        </button>

        {/* Rail-mode collapse toggle (desktop) */}
        {mode === "rail" && (
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden rounded-md p-1 text-foreground/60 hover:bg-foreground/5 lg:inline-flex"
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

        {renderTenantSwitcher
          ? renderTenantSwitcher({
              tenants,
              activeTenant,
              onSwitch: handleTenantSwitch,
            })
          : (
            <DefaultTenantSwitcher
              tenants={tenants}
              activeTenant={activeTenant}
              onSwitch={handleTenantSwitch}
            />
          )}
      </div>

      <div className="flex items-center gap-3">
        {themeToggle && <ThemeToggle />}
        {children}
        {renderUserMenu
          ? renderUserMenu({ settingsPath, onSignOut })
          : (
            <DefaultUserMenu
              settingsPath={settingsPath}
              onSignOut={onSignOut}
            />
          )}
      </div>
    </header>
  );
}
