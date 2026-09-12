import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";
import { ThemeToggle } from "../theme/theme-toggle.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu.js";
import { UserAvatar, type UserAvatarUser } from "./avatar.js";
import { Icon } from "../icon/index.js";

/** Minimal router abstraction so Navbar can render framework-native links. */
export interface NavbarRouterLinkProps {
  href: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
  "aria-current"?: "page" | undefined;
}

export interface NavbarRouter {
  Link: React.ComponentType<NavbarRouterLinkProps>;
  isActive: (href: string) => boolean;
}

/* ── Navbar variants ───────────────────────────────────────── */

export const navbarVariants = cva(
  "flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8",
  {
    variants: {
      variant: {
        default: "border-b border-border bg-background",
        sticky:
          "sticky top-0 z-60 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        glass: "sticky top-0 z-60 border-b border-white/10 glass",
        bordered: "border border-border/60 bg-background shadow-sm",
        transparent: "border-b border-transparent bg-transparent",
        pill: [
          "sticky top-0 z-60 w-full",
          "border-b border-border/60 bg-background/80 px-3 py-2 shadow-sm shadow-black/5",
          "backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
          "transition-colors",
          "md:top-3 md:mx-auto md:w-[calc(100%-2rem)] md:max-w-7xl md:rounded-full md:border md:border-border/60 md:bg-background/70 md:px-3 md:shadow-lg md:shadow-black/5 lg:px-4",
        ].join(" "),
      },
      size: {
        default: "h-16",
        sm: "h-12",
        lg: "h-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/* ── Types ─────────────────────────────────────────────────── */

export interface NavChildLink {
  /** Route href */
  href: string;
  /** Display label */
  label: string;
  /** Short description shown under the label in the dropdown */
  description?: string;
  /** Optional icon element (e.g. lucide <Home />) */
  icon?: React.ReactNode;
  /** Optional badge ("New", count, etc.) */
  badge?: string | number;
  /** Nested sub-links (rendered as a second-level sub-menu). */
  children?: NavChildLink[];
}

export interface NavLink {
  /** Route href (or label key when children are provided) */
  href: string;
  /** Display label */
  label: string;
  /** Optional icon element (e.g. lucide <Home />) */
  icon?: React.ReactNode;
  /** Active state override: when omitted, uses href matching */
  active?: boolean;
  /** Optional badge ("New", count, etc.) */
  badge?: string | number;
  /** Optional sub-links rendered in a dropdown menu */
  children?: NavChildLink[];
  /** Render the dropdown as a wide multi-column panel (megamenu, OpenAI-style).
   *  e.g. 2 = two columns of children. Default: 1 (single list). */
  columns?: number;
  /** Width override for the dropdown panel (e.g. "w-[36rem]"). Default: "w-64". */
  panelWidth?: string;
}

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof navbarVariants> {
  /** Brand element: logo, name, or both */
  brand?: React.ReactNode;
  /** Nav links rendered in desktop view */
  links?: NavLink[];
  /** Whether a link is active (defaults to exact href match against current path) */
  onNavigate?: (href: string) => void;
  /** Framework-aware routing (Next <Link>, react-router <Link>, ...). */
  router?: NavbarRouter;
  /** Right-side actions (buttons, avatar, notification bell, etc.) */
  actions?: React.ReactNode;
  /** Authenticated user avatar (auth dropdown with sign-out/settings/items)
   *  rendered above the mobile breakpoint, where the hamburger is hidden.
   *  Omit on small/medium screens in favor of the hamburger. Wire this to your
   *  auth (arc-id SDK `useAuth()` / `me()` exposes the `UserAvatarUser` shape). */
  user?: UserAvatarUser;
  /** Render the built-in theme toggle in the actions area.
   *  Requires a <ThemeProvider> ancestor (from @fusorb/facet-components). */
  showThemeToggle?: boolean;
   /** Mobile menu content: defaults to a stacked list of links.
    *  When provided, the element receives `onNavigate` (which closes the menu
    *  on navigation) via prop injection. */
  mobileMenu?: React.ReactElement;
  /** Show mobile hamburger. Default: true when links/mobileMenu provided */
  showMobileMenu?: boolean;
  /** Breakpoint at which the desktop links show and the hamburger hides
   *  ("sm" | "md" | "lg" | "xl"). Default: "md". Raise it (e.g. "lg")
   *  when the navbar carries many links. */
  mobileBreakpoint?: "sm" | "md" | "lg" | "xl";
  /** When true, dropdown menus open on hover (desktop) instead of click.
   *  Hovering another link closes the current dropdown; hovering the
   *  dropdown content does NOT close it. Click still toggles the dropdown
   *  as a fallback. Default: false. */
  hoverDropdowns?: boolean;
  /** Render children instead of links */
  children?: React.ReactNode;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * Pre-built class strings per breakpoint so Tailwind's scanner can detect
 * every possible responsive variant (sm, md, lg, xl). Dynamic template
 * literals like `${mobileBreakpoint}:hidden` are invisible to the Tailwind v4
 * scanner and silently fail to generate the CSS -- the hamburger would never
 * hide on desktop. By keeping all four variants as static string literals in
 * this object, every responsive utility is guaranteed to be generated.
 */
const BREAKPOINT_DISPLAY = {
  sm: { hide: "sm:hidden", flex: "sm:flex", block: "sm:block" },
  md: { hide: "md:hidden", flex: "md:flex", block: "md:block" },
  lg: { hide: "lg:hidden", flex: "lg:flex", block: "lg:block" },
  xl: { hide: "xl:hidden", flex: "xl:flex", block: "xl:block" },
} as const;

export function Navbar({
  variant,
  size,
  brand,
  links = [],
  onNavigate,
  router,
  actions,
  user,
  showThemeToggle = false,
  mobileMenu,
  showMobileMenu,
  mobileBreakpoint = "md",
  hoverDropdowns = false,
  children,
  className,
  ...props
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navbarRef = React.useRef<HTMLElement>(null);
  // Hover-dropdown coordination: only one dropdown open at a time; the
  // shared closeTimerRef bridges the gap between trigger and portaled content.
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPill = variant === "pill";
  // Variants that define their own sticky positioning must not be overridden
  // by the trailing "relative" (tailwind-merge keeps the last position class).
  const hasOwnPosition = variant === "pill" || variant === "sticky" || variant === "glass";

  const hasMobileMenu = mobileMenu !== undefined || links.length > 0;
  const showHamburger = showMobileMenu ?? hasMobileMenu;

  const bpHide = BREAKPOINT_DISPLAY[mobileBreakpoint].hide;
  const bpFlex = BREAKPOINT_DISPLAY[mobileBreakpoint].flex;
  const bpBlock = BREAKPOINT_DISPLAY[mobileBreakpoint].block;

  // Clear any pending close timer when the navbar unmounts.
  React.useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    // Close any open hover dropdown when navigating.
    setOpenDropdown(null);
    onNavigate?.(href);
  };

  // Close the mobile menu when clicking outside the navbar (toggle button
  // and dropdown both live inside the nav, so clicking elsewhere collapses).
  React.useEffect(() => {
    if (!showHamburger || !mobileOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showHamburger, mobileOpen]);

  // Close any open hover dropdown with Escape (modal={false} below means
  // Radix won't auto-fire onOpenChange for it).
  React.useEffect(() => {
    if (!hoverDropdowns) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openDropdown) {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        setOpenDropdown(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hoverDropdowns, openDropdown, closeTimerRef, setOpenDropdown]);

  return (
    <nav
      ref={navbarRef}
      className={cn(navbarVariants({ variant, size }), hasOwnPosition ? "" : "relative", className)}
      {...props}
    >
      {/* Brand */}
      {brand && <div className="flex shrink-0 items-center gap-2">{brand}</div>}

      {/* Desktop links */}
      {children ?? (
        <div
          className={cn(
            `hidden items-center ${bpFlex}`,
            isPill ? "gap-0.5 rounded-full bg-muted/40 p-1" : "gap-1",
          )}
        >
          {links.map((link) => (
            <NavLinkItem
               key={link.href}
               link={link}
               router={router}
               onNavigate={handleNav}
               isPill={isPill}
               hoverDropdowns={hoverDropdowns}
               openDropdown={openDropdown}
               setOpenDropdown={setOpenDropdown}
               closeTimerRef={closeTimerRef}
             />
          ))}
        </div>
      )}

      {/* Actions + mobile toggle */}
      <div className="flex shrink-0 items-center gap-2">
        {showThemeToggle && <ThemeToggle />}
        {actions}
        {user && (
          <div className={`shrink-0 ${bpBlock} hidden`}>
            <UserAvatar user={user} />
          </div>
        )}
        {showHamburger && (
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Toggle menu"}
            aria-expanded={mobileOpen}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:bg-accent hover:text-accent-foreground ${bpHide}`}
          >
            {mobileOpen ? (
              <Icon name="close" className="size-5" aria-hidden="true" />
            ) : (
              <Icon name="menu" className="size-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {showHamburger && mobileOpen && (
        <div
          className={cn(
            `absolute inset-x-0 top-full z-60 border-b border-border bg-background p-4 ${bpHide}`,
            isPill && "mt-1 rounded-2xl shadow-lg",
          )}
        >
          {mobileMenu
            // mobileMenu is typed as React.ReactElement, whose props don't
            // include our injected `onNavigate`. Cast the element to a generic
            // shape so the inject overrides pass React's cloneElement check;
            // the consumer-side mobile menu contract still requires it.
            ? React.cloneElement(mobileMenu as React.ReactElement<{ onNavigate?: (href: string) => void }>, { onNavigate: handleNav })
            : (
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <MobileNavLink key={link.href} link={link} router={router} onNavigate={handleNav} />
                ))}
              </div>
            )}
        </div>
      )}
    </nav>
  );
}

/* ── Internal link item (desktop) ──────────────────────────── */

function NavLinkItem({
  link,
  router,
  onNavigate,
  isPill = false,
  hoverDropdowns = false,
  openDropdown = null,
  setOpenDropdown,
  closeTimerRef,
}: {
  link: NavLink;
  router: NavbarRouter | undefined;
  onNavigate: (href: string) => void;
  isPill?: boolean;
  hoverDropdowns?: boolean;
  openDropdown?: string | null;
  setOpenDropdown?: React.Dispatch<React.SetStateAction<string | null>>;
  closeTimerRef?: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}) {
  const isActive =
    link.active ??
    (router
      ? router.isActive(link.href)
      : typeof window !== "undefined" && isHrefActive(link.href));

  // In pill mode the active item gets a solid rounded chip on the tray.
  const itemClass = cn(
    "flex items-center gap-2 text-sm font-medium transition-colors",
    isPill ? "rounded-full px-3 py-1.5" : "rounded-md px-3 py-2",
    isActive
      ? isPill
        ? "bg-background text-foreground shadow-sm"
        : "bg-accent text-accent-foreground"
      : "text-foreground/70 hover:bg-accent/60 hover:text-foreground",
  );

  // Link with sub-links → render a dropdown (OpenAI-style)
  if (link.children?.length) {
    const isMega = (link.columns ?? 1) > 1;
    const panelWidth = link.panelWidth ?? (isMega ? "w-[32rem]" : "w-64");

    // Hover-dropdown helpers (shared timer lifted to Navbar so moving
    // between links cancels the previous close and opens the next).
    const clearCloseTimer = React.useCallback(() => {
      if (closeTimerRef?.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, [closeTimerRef]);
    const scheduleClose = React.useCallback(() => {
      clearCloseTimer();
      if (closeTimerRef) {
        closeTimerRef.current = setTimeout(() => setOpenDropdown?.(null), 250);
      }
    }, [closeTimerRef, clearCloseTimer, setOpenDropdown]);

    const dropdownOpen = hoverDropdowns ? openDropdown === link.href : undefined;
    const dropdownOnOpenChange = hoverDropdowns
      ? (open: boolean) => {
          // In hover mode we own the open/close lifecycle via the mouse
          // timers.  Ignore every auto-close Radix fires (focus loss,
          // outside-click, Escape) - those fire spuriously during the
          // hover → content transition and cause the dropdown to blink.
          // Click-on-trigger still opens, and toggles via onClick below.
          if (open) {
            clearCloseTimer();
            setOpenDropdown?.(link.href);
          }
        }
      : undefined;

    const triggerClick = hoverDropdowns
      ? (e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          clearCloseTimer();
          setOpenDropdown?.(openDropdown === link.href ? null : link.href);
        }
      : undefined;

    const triggerHoverProps = hoverDropdowns
      ? {
          onMouseEnter: () => {
            clearCloseTimer();
            setOpenDropdown?.(link.href);
          },
          onMouseMove: clearCloseTimer,
          onMouseLeave: scheduleClose,
        }
      : {};
    const contentHoverProps = hoverDropdowns
      ? {
          onMouseEnter: clearCloseTimer,
          onMouseMove: clearCloseTimer,
          onMouseLeave: scheduleClose,
        }
      : {};

    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={dropdownOnOpenChange} modal={!hoverDropdowns}>
        <DropdownMenuTrigger asChild>
          <button type="button" className={cn(itemClass, "data-[state=open]:bg-accent/60")} {...triggerHoverProps} onClick={triggerClick}>
            {link.icon && <span className="size-4 shrink-0 text-primary/70">{link.icon}</span>}
            <span>{link.label}</span>
            {link.badge != null && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {link.badge}
              </span>
            )}
            <Icon name="chevron-down" className="text-muted-foreground/60" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className={cn("z-70 p-2", panelWidth)}
          {...contentHoverProps}
        >
          {isMega ? (
            /* Wide multi-column megamenu (OpenAI-style) */
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(link.columns ?? 2, 4)}, minmax(0,1fr))` }}
            >
              {link.children.map((child) => (
                <DropdownMenuItem
                  key={child.href}
                  onSelect={() => onNavigate(child.href)}
                  className="flex cursor-pointer flex-col items-start gap-1 rounded-md px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {child.icon && (
                      <span className="size-4 shrink-0 text-primary/70">{child.icon}</span>
                    )}
                    {child.label}
                    {child.badge != null && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                        {child.badge}
                      </span>
                    )}
                  </span>
                  {child.description && (
                    <span className="text-xs leading-snug text-muted-foreground">
                      {child.description}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            /* Single-column list with optional nested sub-menus */
            <div className="flex flex-col gap-0.5">
              {link.children.map((child, index) => (
                <React.Fragment key={child.href}>
                  {index > 0 && !child.children && <DropdownMenuSeparator />}
                  {child.children?.length ? (
                    /* Nested sub-menu */
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex cursor-pointer items-center gap-2 py-2">
                        {child.icon && (
                          <span className="size-4 shrink-0 text-primary/70">{child.icon}</span>
                        )}
                        <span className="flex-1 font-medium">{child.label}</span>
                        {child.badge != null && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                            {child.badge}
                          </span>
                        )}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {child.children.map((nested) => (
                          <DropdownMenuItem
                            key={nested.href}
                            onSelect={() => onNavigate(nested.href)}
                            className="flex cursor-pointer items-center gap-2 py-2"
                          >
                            {nested.icon && (
                              <span className="size-4 shrink-0 text-primary/70">
                                {nested.icon}
                              </span>
                            )}
                            <span className="flex-1">{nested.label}</span>
                            {nested.badge != null && (
                              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                {nested.badge}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ) : (
                    <DropdownMenuItem
                      onSelect={() => onNavigate(child.href)}
                      className="flex cursor-pointer flex-col items-start gap-0.5 py-2.5"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {child.icon && (
                          <span className="size-4 shrink-0 text-primary/70">{child.icon}</span>
                        )}
                        {child.label}
                        {child.badge != null && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                            {child.badge}
                          </span>
                        )}
                      </span>
                      {child.description && (
                        <span className="pl-6 text-xs text-muted-foreground">{child.description}</span>
                      )}
                    </DropdownMenuItem>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const Link = router?.Link ?? "a";
  return (
    <Link
      href={link.href}
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(link.href);
        }
      }}
      className={itemClass}
      aria-current={isActive ? "page" : undefined}
    >
      {link.icon && <span className="size-4 shrink-0 text-primary/70">{link.icon}</span>}
      <span>{link.label}</span>
      {link.badge != null && (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
          {link.badge}
        </span>
      )}
    </Link>
  );
}

/* ── Internal mobile link (expands sub-links inline) ───────── */

function MobileNavLink({
  link,
  router,
  onNavigate,
}: {
  link: NavLink;
  router: NavbarRouter | undefined;
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const Link = router?.Link ?? "a";

  if (link.children?.length) {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            {link.icon && <span className="size-4 shrink-0 text-primary/70">{link.icon}</span>}
            {link.label}
          </span>
          <Icon
            name="chevron-down"
            className={cn("text-muted-foreground/60 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {open && (
          <div className="ml-4 flex flex-col gap-1 border-l pl-3">
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(child.href);
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                {child.icon && <span className="size-4 shrink-0">{child.icon}</span>}
                <span>{child.label}</span>
                {child.badge != null && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {child.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={link.href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(link.href);
      }}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
    >
      {link.icon && <span className="size-4 shrink-0 text-primary/70">{link.icon}</span>}
      <span>{link.label}</span>
      {link.badge != null && (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
          {link.badge}
        </span>
      )}
    </Link>
  );
}

Navbar.displayName = "Navbar";

/**
 * Active-state matching for plain anchors:
 * - Hash links ("#features") match against window.location.hash.
 * - Path links ("/dashboard") match the pathname.
 */
function isHrefActive(href: string): boolean {
  if (href.startsWith("#")) {
    return window.location.hash === href;
  }
  return window.location.pathname === href;
}
