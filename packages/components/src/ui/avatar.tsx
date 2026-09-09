import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../utils.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "./dropdown-menu.js";
import { Icon, type IconName } from "../icon/index.js";

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/** Minimal shape of an authenticated user (matches @arcevo/facet-sdk User). */
export interface UserAvatarUser {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  memberships?: { tenantId?: string; name?: string | null; role?: string }[];
}

export interface UserAvatarMenuItem {
  /** Label, e.g. "Profile". */
  label: string;
  /** Shortcut hint shown on the right, e.g. "⇧⌘P". */
  shortcut?: string;
  /** Optional icon name from the facet registry. */
  icon?: IconName;
  /** Called when the item is selected. */
  onSelect?: () => void;
  /** Style as destructive. Default: false. */
  destructive?: boolean;
}

export interface UserAvatarProps {
  /** The authenticated user. */
  user: UserAvatarUser;
  /**
   * Avatar behavior.
   * - "auth": avatar + dropdown menu (name/email, items, organizations, sign out).
   * - "default": plain avatar only, no dropdown.
   * Default: "auth".
   */
  variant?: "auth" | "default";
  /** Optional custom menu items rendered under the user header. */
  items?: UserAvatarMenuItem[];
  /** Label for the sign-out item. Default: "Sign out". */
  signOutLabel?: string;
  /** Called when the sign-out item is selected. */
  onSignOut?: () => void;
  /**
   * Optional Settings link. When set, a Settings item renders inside the
   * menu as an anchor with this href. Pass a router-aware `<Link>` child
   * via `renderSettingsLink` for SPA navigation (rendered with asChild).
   */
  settingsHref?: string;
  /** Label for the Settings item. Default: "Settings". */
  settingsLabel?: string;
  /**
   * Custom renderer for the Settings item's link. Receives the href and
   * label and should return a router-aware link (e.g. react-router
   * `<Link>`). When omitted, a plain `<a href>` is used.
   */
  renderSettingsLink?: (href: string, label: string) => React.ReactNode;
  /** Optional avatar size class. Default: "h-8 w-8". */
  className?: string;
  /** Optional avatar image class. */
  imageClassName?: string;
  /** Optional badge/content rendered in the dropdown header below the email (e.g. role indicator). */
  roleBadge?: React.ReactNode;
  /** Label for the Organizations section. Default: "Organizations". */
  organizationsLabel?: string;
  /** Override the Settings menu-item icon name. Default: "settings". */
  settingsIconName?: IconName;
  /** Override the organization icon name. Default: "building". */
  organizationIconName?: IconName;
  /** Override the sign-out icon name. Default: "logout". */
  signOutIconName?: IconName;
  /** Additional className for the dropdown content container. */
  dropdownClassName?: string;
  /** Additional className for the trigger button. */
  triggerClassName?: string;
}

/** Derive initials from a name (or email prefix), max 2 chars. */
export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(/\s+|@/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * UserAvatar: Clerk-style authenticated user avatar.
 *
 * A circular avatar (image or initials fallback) that opens a dropdown
 * with the user's name/email, optional menu items, organizations, and a
 * sign-out action. Pass the user object straight from the facet SDK's
 * `useAuth()` / `ArcIdClient.me()` (the `User` shape): the component
 * only needs name/email/picture/memberships.
 *
 * Usage:
 *   <UserAvatar
 *     user={user}
 *     items={[
 *       { label: "Profile", shortcut: "⇧⌘P", onSelect: () => navigate("/profile") },
 *       { label: "Settings", shortcut: "⌘,", onSelect: () => navigate("/settings") },
 *     ]}
 *     onSignOut={logout}
 *   />
 */
export function UserAvatar({
  user,
  variant = "auth",
  items,
  signOutLabel = "Sign out",
  onSignOut,
  settingsHref,
  settingsLabel = "Settings",
  settingsIconName = "settings",
  organizationIconName = "building",
  signOutIconName = "logout",
  organizationsLabel = "Organizations",
  renderSettingsLink,
  className,
  imageClassName,
  roleBadge,
  dropdownClassName,
  triggerClassName,
}: UserAvatarProps) {
  const initials = getInitials(user.name, user.email);

  const avatar = (
    <Avatar className={cn("h-8 w-8", className)}>
      {user.picture ? (
        <AvatarImage src={user.picture} alt={user.name ?? "User"} className={imageClassName} />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (variant === "default") {
    return avatar;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Open ${user.name ?? "user"} menu`}
          className={cn(
            "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            triggerClassName,
          )}
        >
          {avatar}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("z-70 w-56", dropdownClassName)}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{user.name ?? "Signed in"}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            )}
          </div>
          {roleBadge && (
            <div className="mt-1">{roleBadge}</div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items?.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={item.onSelect}
            className={item.destructive ? "text-destructive focus:text-destructive" : undefined}
          >
            {item.icon ? <Icon name={item.icon} className="size-4" /> : null}
            {item.label}
            {item.shortcut ? <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut> : null}
          </DropdownMenuItem>
        ))}
        {settingsHref ? (
          <>
            <DropdownMenuItem asChild>
              {renderSettingsLink ? (
                renderSettingsLink(settingsHref, settingsLabel)
              ) : (
                <a href={settingsHref} className="flex items-center gap-2">
                  <Icon name={settingsIconName} className="size-4" />
                  {settingsLabel}
                </a>
              )}
            </DropdownMenuItem>
          </>
        ) : null}
        {user.memberships && user.memberships.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {organizationsLabel}
            </DropdownMenuLabel>
            {user.memberships.map((m, i) => (
              <DropdownMenuItem key={m.tenantId ?? i} disabled>
                <Icon name={organizationIconName} className="size-4" />
                {m.name ?? "Organization"}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Icon name={signOutIconName} className="size-4" />
          {signOutLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
UserAvatar.displayName = "UserAvatar";

export { Avatar, AvatarImage, AvatarFallback };
