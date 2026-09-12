/**
 * @fusorb/facet-layout: RouterAdapter
 *
 * Framework-agnostic navigation. facet components never import a router
 * directly; consumers pass a RouterAdapter into <LayoutProvider> (or a
 * per-component adapter prop) so Sidebar, Navbar, and UserMenu render
 * framework-native links and detect the active route.
 *
 * Default behavior (no adapter): plain <a href> + window.location matching,
 * which works for static/MVP sites.
 */

import * as React from "react";

export interface RouterLinkProps {
  href: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
}

export interface RouterAdapter {
  /** Render a framework-native link (Next <Link>, react-router <Link>) or a plain <a>. */
  Link: React.ComponentType<RouterLinkProps>;
  /** True when `href` matches the current route (prefix-aware). */
  isActive: (href: string) => boolean;
  /** Current route path (e.g. Next.js `router.asPath`). Falls back to `window.location`. */
  asPath?: string;
}

/** Default active-path matcher: exact match or child-path prefix. */
export function matchPath(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(href.endsWith("/") ? href : href + "/");
}

function DefaultLink(
  {
    href,
    className,
    onClick,
    children,
    "aria-label": ariaLabel,
    "aria-current": ariaCurrent,
  }: RouterLinkProps,
  ref: React.Ref<HTMLAnchorElement>,
) {
  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      ref={ref}
    >
      {children}
    </a>
  );
}

/** forwardRef so Radix asChild (Tooltip, DropdownMenu) can attach trigger handlers. */
const ForwardedDefaultLink = React.forwardRef(DefaultLink);

/** Browser default: window.location + plain anchors. */
export function createDefaultAdapter(): RouterAdapter {
  return {
    Link: ForwardedDefaultLink,
    isActive: (href) => {
      if (typeof window === "undefined") return false;
      return matchPath(href, window.location.pathname);
    },
    asPath:
      typeof window !== "undefined"
        ? window.location.pathname + window.location.hash
        : undefined,
  };
}
