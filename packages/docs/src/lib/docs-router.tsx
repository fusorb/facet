import * as React from "react";
import { Link, useLocation } from "react-router-dom";
type RouterAdapter = any; type RouterLinkProps = any;

/**
 * Bridges facet-layout's RouterAdapter to react-router so Sidebar,
 * Navbar, and UserMenu render react-router Links and detect active routes.
 */
export function useDocsRouterAdapter(): RouterAdapter {
  const location = useLocation();

  const LinkComponent = React.useMemo(() => {
    function DocsLink({
      href,
      className,
      onClick,
      children,
      "aria-current": ariaCurrent,
      "aria-label": ariaLabel,
    }: RouterLinkProps) {
      return (
        <Link
          to={href}
          className={className}
          onClick={onClick}
          aria-current={ariaCurrent}
          aria-label={ariaLabel}
        >
          {children}
        </Link>
      );
    }
    return DocsLink;
  }, []);

  return React.useMemo<RouterAdapter>(
    () => ({
      Link: LinkComponent,
      isActive: (href: string) => {
        const pathname = location.pathname;
        if (pathname === href) return true;
        // The root path "/" is exact-match only; it is not a prefix of
        // every route (otherwise Overview would stay highlighted).
        if (href === "/") return false;
        return pathname.startsWith(href.endsWith("/") ? href : `${href}/`);
      },
    }),
    [LinkComponent, location.pathname],
  );
}
