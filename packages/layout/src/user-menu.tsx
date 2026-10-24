/**
 * @fusorb/facet-layout: User Menu
 *
 * Avatar + dropdown with user info, settings link, and sign out.
 * Uses the injected layout session (via useLayout) and UserAvatar from
 * @fusorb/facet-components.
 */

import * as React from "react";
import { UserAvatar, Skeleton } from "@fusorb/facet-components";
import { useLayout } from "./layout-context.js";

export interface UserMenuProps {
  /** Path to settings page. Default: "/settings/profile" */
  settingsPath?: string;
  /** Callback when "Sign out" is clicked. Default: calls signOut() from the injected session */
  onSignOut?: () => void;
  /** Additional topbar actions (notifications, theme toggle, etc.) */
  children?: React.ReactNode;
}

export function UserMenu({
  settingsPath = "/settings/profile",
  onSignOut,
  children,
}: UserMenuProps) {
  const { router, session } = useLayout();

  const signOut = session.signOut;
  const handleSignOut = React.useCallback(async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await signOut();
    }
  }, [signOut, onSignOut]);

  const { user, isLoading } = session;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        {children}
      </div>
    );
  }

  if (!user) return null;

  // Settings item navigates via the layout router adapter.
  const SettingsLink = router.Link;

  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        user={user}
        onSignOut={handleSignOut}
        settingsHref={settingsPath}
        settingsLabel="Settings"
        renderSettingsLink={(href, label) => (
          <SettingsLink href={href} className="flex items-center gap-2">
            {label}
          </SettingsLink>
        )}
      />
      {children}
    </div>
  );
}
