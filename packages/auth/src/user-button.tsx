/**
 * UserButton: user avatar dropdown trigger.
 *
 * Shows the user's avatar (or initials fallback) with a dropdown
 * menu for profile, settings, and sign out.
 */

import * as React from "react";
import { useAuth } from "./provider.js";
import type { Appearance, ComponentSlots } from "./types.js";

import { Badge, Button } from "@fusorb/facet-components";
import { Avatar, AvatarFallback } from "@fusorb/facet-components";
import { getModSymbol, cn } from "@fusorb/facet-components";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@fusorb/facet-components";

/* ── Copy ──────────────────────────────────────────────────── */

export interface UserButtonCopy {
  /** Menu item label for "Profile". */
  profile: string;
  /** Menu item label for "Settings". */
  settings: string;
  /** Menu item label for "Sign out". */
  signOut: string;
  /** Section header for organizations. */
  organizations: string;
}

const defaultUserButtonCopy: UserButtonCopy = {
  profile: "Profile",
  settings: "Settings",
  signOut: "Sign out",
  organizations: "Organizations",
};

/* ── Props ─────────────────────────────────────────────────── */

export interface UserButtonProps {
  appearance?: Appearance;
  slots?: ComponentSlots & {
    /** Override the trigger element entirely */
    trigger?: React.ReactNode;
    /** Override the user's name label */
    label?: React.ReactNode;
    /** Custom renderer for role badge inside membership rows */
    roleBadge?: (role: string) => React.ReactNode;
  };
  /** Called when user clicks "Sign out" */
  onSignOut?: () => void;
  /** Called when user clicks "Profile" */
  onProfile?: () => void;
  /** Called when user clicks "Settings" */
  onSettings?: () => void;
  /** Extra className for the dropdown menu. */
  className?: string;
  /** Override user-visible text strings. All keys fall back to English defaults. */
  copy?: Partial<UserButtonCopy>;
}

/* ── Helpers ───────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Component ─────────────────────────────────────────────── */

export function UserButton({ appearance, slots, onSignOut, onProfile, onSettings, className, copy }: UserButtonProps) {
  const { user, logout } = useAuth();
  const c = { ...defaultUserButtonCopy, ...copy };

  if (!user) return null;

  const initials = getInitials(user.name ?? user.email);
  const displayName = user.name ?? user.email;

  const handleSignOut = async () => {
    await logout();
    onSignOut?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {slots?.trigger ?? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className={appearance?.className}>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-56", className)}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            {slots?.label ?? (
              <>
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfile}>
          {c.profile}
          <DropdownMenuShortcut>⇧{getModSymbol()}P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettings}>
          {c.settings}
          <DropdownMenuShortcut>{getModSymbol()},</DropdownMenuShortcut>
        </DropdownMenuItem>
        {user.memberships && user.memberships.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {c.organizations}
            </DropdownMenuLabel>
            {user.memberships.map((m, i) => (
              <DropdownMenuItem key={i} disabled>
                {m.name ?? ""}
                {m.role &&
                  (slots?.roleBadge
                    ? slots.roleBadge(m.role)
                    : (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-[9px] font-medium"
                      >
                        {m.role}
                      </Badge>
                    ))}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          {c.signOut}
          <DropdownMenuShortcut>⇧{getModSymbol()}Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
