/**
 * @fusorb/facet-layout: SidebarAuth
 *
 * Auth quick-action panel rendered at the bottom of the sidebar.
 *
 * Shows the user's avatar + name via <UserAvatar> (from facet-components)
 * with a dropdown containing customizable actions (settings, GitHub,
 * docs quick links, etc.).  A direct "Sign out" button is rendered below
 * in red so it's always accessible without opening the dropdown.
 *
 * Uses useOptionalAuth() from @fusorb/facet-auth — when no auth context
 * is present (static/docs-only sites) the component renders nothing.
 */

import * as React from "react";
import { useOptionalAuth } from "@fusorb/facet-auth";
import { UserAvatar } from "@fusorb/facet-components";
import type { UserAvatarUser, UserAvatarMenuItem } from "@fusorb/facet-components";

export interface SidebarAuthAction {
  label: string;
  href?: string;
  icon?: string;
  onClick?: () => void;
  /** Render in red (destructive). Default: false */
  destructive?: boolean;
}

export interface SidebarAuthProps {
  /** Customizable dropdown actions (settings, GitHub, docs quick links, …). */
  actions?: SidebarAuthAction[];
  /** Settings page href. When set, a Settings item appears in the dropdown. */
  settingsHref?: string;
  /** Optional router-aware link renderer for settings. */
  renderSettingsLink?: (href: string, label: string) => React.ReactNode;
}

/** Convert SidebarAuthAction → UserAvatarMenuItem. */
function toMenuItem(action: SidebarAuthAction): UserAvatarMenuItem {
  return {
    label: action.label,
    icon: action.icon as any,
    destructive: action.destructive,
    onSelect: action.onClick,
  };
}

export function SidebarAuth({
  actions = [],
  settingsHref,
  renderSettingsLink,
}: SidebarAuthProps) {
  const auth = useOptionalAuth();

  // No auth context: hide the panel entirely (docs/static sites).
  if (!auth) return null;

  const { user, logout, isLoading } = auth;

  // Still loading — show a placeholder.
  if (isLoading) {
    return (
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const items: UserAvatarMenuItem[] = [
    ...actions.map((a) => toMenuItem(a)),
  ];

  const handleSignOut = React.useCallback(async () => {
    try {
      await logout();
    } catch {
      // Ignore — auth may be optional or handled by the consumer.
    }
  }, [logout]);

  return (
    <div className="border-t border-sidebar-border p-3">
      {/* Avatar + dropdown (UserAvatar handles its own DropdownMenu) */}
      <div className="flex items-center gap-2">
        <UserAvatar
          user={user as UserAvatarUser}
          items={items}
          signOutLabel="Sign out"
          onSignOut={handleSignOut}
          settingsHref={settingsHref}
          settingsLabel="Settings"
          renderSettingsLink={renderSettingsLink}
          triggerClassName="h-8 w-8"
        />
        <span className="text-sm font-medium">
          {user.name ?? user.email ?? "Account"}
        </span>
      </div>

      {/* Direct sign-out button (red, always visible) */}
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-2 w-full text-left text-xs text-destructive hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}
