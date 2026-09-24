/**
 * @fusorb/facet-layout: Sidebar
 *
 * Fixed-width navigation panel for desktop.
 * Renders sections and items from LayoutConfig.navigation.
 * Uses the LayoutProvider RouterAdapter when provided (Next/react-router
 * aware links + active detection); falls back to window.location + <a>.
 *
 * Rail mode: collapses to an icon-only rail; the expanded width is
 * resizable via the drag handle on the right edge (VS Code style).
 */

import * as React from "react";
import { useLayout, DEFAULT_SIDEBAR_WIDTH } from "./layout-context.js";
import {
  ScrollArea,
  Skeleton,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Icon,
} from "@fusorb/facet-components";
import type { BrandConfig, LayoutConfig, NavItem, NavSection } from "./types.js";
import type { RouterAdapter } from "./router.js";

/* ── Props ────────────────────────────────────────────────── */

export interface SidebarProps {
  config: LayoutConfig;
  isLoading?: boolean;
  /** Rail mode: render icon-only with tooltip labels. Default: false */
  collapsed?: boolean;
  /** Current expanded sidebar width in px. Default: 260 */
  width?: number;
  /** Accordion mode: opening a section collapses the others, and collapsible
   *  child groups within an open section also behave as accordion (opening
   *  one closes its siblings). Default: false */
  singleOpen?: boolean;
  /** Custom render for the brand section (logo + label). Defaults to
   *  DefaultBrand. Pass to fully replace the brand block — e.g. to add a
   *  tagline, CTA, or domain-specific logo treatment. */
  renderBrand?: (
    brand: BrandConfig,
    ctx: { collapsed: boolean },
  ) => React.ReactNode;
  /** Custom render for a leaf nav item. Defaults to the built-in link
   *  rendering. Pass to fully replace how a navigation item renders
   *  (icon, badge, active state, link element). */
  renderNavItem?: (
    item: NavItem,
    ctx: {
      isActive: boolean;
      depth: number;
      collapsed: boolean;
      hasChildren: boolean;
      router?: RouterAdapter;
    },
  ) => React.ReactNode;
  /** Optional search bar rendered at the top of the sidebar nav
   *  (between the brand and the navigation sections).
   *  Typically a trigger that opens the command palette dialog. */
  sidebarSearch?: React.ReactNode;
  /** Content rendered at the very bottom of the sidebar, below the nav
   *  and above the footer — e.g. auth quick-action panel. */
  sidebarBottom?: React.ReactNode;
}

/* ── Component ────────────────────────────────────────────── */

export function Sidebar({
  config,
  isLoading,
  collapsed = false,
  width = DEFAULT_SIDEBAR_WIDTH,
  singleOpen = false,
  renderBrand,
  renderNavItem,
  sidebarSearch,
  sidebarBottom,
}: SidebarProps) {
  const {
    setSidebarOpen,
    router,
    setSidebarWidth,
    setSidebarCollapsed,
    collapseAll,
    expandAll,
    hoverEnterSidebar,
    hoverLeaveSidebar,
  } = useLayout();

  const handleNav = React.useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  const sidebarWidth = collapsed ? 68 : width;

  // VS Code style resize: dragging the right edge resizes the sidebar.
  // Dragging below the min width collapses it to the rail; dragging the
  // rail's handle (or the chevron) expands it again.
  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (collapsed) return;
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;
      const onMove = (moveEvent: PointerEvent) => {
        const next = startWidth + (moveEvent.clientX - startX);
        if (next <= 96) {
          // Below min width: collapse to rail.
          setSidebarCollapsed(true);
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          return;
        }
        setSidebarWidth(next);
      };
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [collapsed, width, setSidebarWidth, setSidebarCollapsed],
  );

  return (
    <aside
      data-sidebar
      className={`fixed left-0 top-14 z-30 flex h-[calc(100vh-56px)] flex-col border-r bg-sidebar transition-[width] duration-200 pointer-events-auto ${
        collapsed ? "w-[68px]" : ""
      }`}
      style={collapsed ? undefined : { width: `${sidebarWidth}px` }}
      // Track hover across the sidebar content so the hamburger's close timer
      // is cancelled while the mouse is inside the sidebar - the user can
      // open sections/subsections without the sidebar snapping shut.
      onMouseEnter={hoverEnterSidebar}
      onMouseLeave={hoverLeaveSidebar}
    >
      {/* Resize handle (VS Code style, right edge) */}
      {!collapsed && (
        <div
          onPointerDown={handlePointerDown}
          className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-foreground/30 active:bg-foreground/40"
          aria-hidden="true"
        />
      )}

      {/* Brand */}
      {renderBrand
        ? renderBrand(config.brand, { collapsed })
        : <DefaultBrand brand={config.brand} collapsed={collapsed} />}

      {/* Search bar — only shown when expanded (has room) */}
      {!collapsed && sidebarSearch && (
        <div className="px-3 py-2">{sidebarSearch}</div>
      )}

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        {isLoading ? (
          <SidebarSkeleton collapsed={collapsed} />
        ) : config.navigation.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="px-2 text-center text-sm text-sidebar-foreground/40">
              No navigation items
            </p>
            {!collapsed && (
              <SidebarToolbar
                sectionIds={config.navigation.map((s) => s.id ?? s.title)}
                onCollapseAll={collapseAll}
                onExpandAll={expandAll}
              />
            )}
          </div>
        ) : (
          <nav
            className={
              collapsed ? "flex flex-col items-center gap-1" : "space-y-6"
            }
          >
            {!collapsed && (
              <SidebarToolbar
                sectionIds={config.navigation.map((s) => s.id ?? s.title)}
                onCollapseAll={collapseAll}
                onExpandAll={expandAll}
              />
            )}
            {config.navigation.map((section) => (
              <NavSectionRenderer
                key={section.title}
                section={section}
                router={router}
                onNav={handleNav}
                onExpand={() => setSidebarCollapsed(false)}
                collapsed={collapsed}
                singleOpen={singleOpen}
                sectionIds={config.navigation.map((s) => s.id ?? s.title)}
                renderNavItem={renderNavItem}
              />
            ))}
          </nav>
        )}
      </ScrollArea>

      {/* Auth / quick-action bottom — only when expanded */}
      {!collapsed && sidebarBottom && (
        <div className="border-t border-sidebar-border p-3">{sidebarBottom}</div>
      )}

      {/* Footer */}
      <div className="p-4">
        {collapsed ? (
          <p className="text-center text-xs text-sidebar-foreground/40">
            {config.brand.name.slice(0, 1).toUpperCase()}
          </p>
        ) : (
          <p className="text-center text-xs text-sidebar-foreground/40">
            {config.brand.name} v1.0.0
          </p>
        )}
      </div>
    </aside>
  );
}

/* ── Nav section (internal) ───────────────────────────────── */

/** True when an item (or any nested child) matches the active route. */
function isItemActive(
  item: NavItem,
  isActive: (href: string) => boolean,
): boolean {
  if (isActive(item.href)) return true;
  return item.children?.some((child) => isItemActive(child, isActive)) ?? false;
}

function sectionHasActiveItem(
  section: NavSection,
  isActive: (href: string) => boolean,
): boolean {
  return section.items.some((item) => isItemActive(item, isActive));
}

function NavSectionRenderer({
  section,
  router,
  onNav,
  collapsed,
  onExpand,
  singleOpen = false,
  sectionIds,
  renderNavItem,
}: {
  section: NavSection;
  router: RouterAdapter | undefined;
  onNav: () => void;
  collapsed: boolean;
  onExpand: () => void;
  singleOpen?: boolean;
  sectionIds: string[];
  renderNavItem?: SidebarProps["renderNavItem"];
}) {
  // Storybook-style section: the header toggles the whole group.
  // Open by default; collapse state is persisted via layout context.
  const { collapsedSections, toggleSection, openSection } = useLayout();
  const sectionKey = section.id ?? section.title;
  const isActive = router
    ? router.isActive
    : (href: string) => href === window.location.pathname;
  const hasActive = sectionHasActiveItem(section, isActive);
  // Section open state is driven solely by the persisted collapse map.
  // An active section auto-expands via the route-change effect above
  // (one-shot), so the user can still collapse it afterwards - keeping
  // accordion (singleOpen) behavior intact.
  const explicitlyCollapsed = collapsedSections[sectionKey] === true;
  const open = !explicitlyCollapsed;

  // On route change, auto-expand the section that now contains the active
  // route (even if the user previously collapsed it). This is a one-shot
  // side effect - it only triggers when the URL actually changes, so it
  // never interferes with accordion (singleOpen) logic or explicit
  // collapses from chevron clicks / collapse-all.
  const routeKey =
    router?.asPath ?? window.location.pathname + window.location.hash;
  React.useEffect(() => {
    // Auto-expand the section that contains the active route.
    // Only runs on mount / route change - never on state writes from
    // chevron clicks or accordion toggling - so the user can still
    // collapse the active section.
    if (hasActive && explicitlyCollapsed) {
      toggleSection(sectionKey);
    }
  }, [routeKey]);

  // Scroll the active section into view when it opens.
  const sectionRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open && hasActive && sectionRef.current) {
      sectionRef.current.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
    }
  }, [open, hasActive]);

  // Header toggle: in accordion (single-open) mode, opening a section closes
  // the rest (openSection); clicking the already-open section collapses it
  // (toggleSection). In multi-open mode each header just toggles itself.
  const handleToggle = () => {
    if (singleOpen) {
      if (open) {
        toggleSection(sectionKey);
      } else {
        openSection(sectionKey, sectionIds);
      }
    } else {
      toggleSection(sectionKey);
    }
  };

  // Item-level accordion state: when singleOpen is true, opening a
  // collapsible child group closes its siblings - mirroring the
  // section-level behaviour so the Components sidebar sub-groups behave
  // the same as the top-level sections.
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  // Collapsed rail (YouTube-style): one icon slot per section, not a list.
  // All section icons stack together with no scroll; the full item list
  // only shows when the sidebar is expanded.
  if (collapsed) {
    const first = section.items[0];
    const icon = first?.icon;
    return (
      <div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onExpand}
                aria-label={section.title}
                className="flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-foreground/5 hover:text-sidebar-accent-foreground"
              >
                {icon ? (
                  <span className="size-4 shrink-0 text-primary">{icon}</span>
                ) : (
                  <span className="text-sm font-semibold">
                    {section.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{section.title}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div ref={sectionRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="mb-2 flex w-full items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`hidden lg:inline-flex shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        {section.title}
      </button>
      {open && (
        <ul className="space-y-1">
          {section.items.map((item) => (
            <NavItemRenderer
              key={item.href}
              item={item}
              router={router}
              onNav={onNav}
              onExpand={onExpand}
              depth={0}
              collapsed={collapsed}
              singleOpen={singleOpen}
              openItem={openItem}
              setOpenItem={setOpenItem}
              renderNavItem={renderNavItem}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Nav item (internal): supports nested collapsible groups ─ */

function NavItemRenderer({
  item,
  router,
  onNav,
  onExpand,
  depth,
  collapsed,
  singleOpen = false,
  openItem = null,
  setOpenItem,
  renderNavItem,
}: {
  item: NavItem;
  router: RouterAdapter | undefined;
  onNav: () => void;
  onExpand: () => void;
  depth: number;
  collapsed: boolean;
  /** When true, opening a collapsible group closes sibling groups
   *  (accordion) using the section-level openItem state. */
  singleOpen?: boolean;
  openItem?: string | null;
  setOpenItem?: React.Dispatch<React.SetStateAction<string | null>>;
  renderNavItem?: SidebarProps["renderNavItem"];
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  // Local accordion state for nested levels (depth 1+) that don't
  // receive an external openItem/setOpenItem from their parent.
  const [localOpenItem, setLocalOpenItem] = React.useState<string | null>(null);
  const children = item.children;
  const hasChildren = children?.length;
  const getActive = router
    ? router.isActive
    : (href: string) => href === window.location.pathname;
  // Auto-expand a collapsible group when one of its children is the
  // active page, so the current location is always visible.
  const childActive = hasChildren
    ? children.some((child) => isItemActive(child, getActive))
    : false;
  // In single-open (accordion) mode the open state is owned by openItem
  // (external at depth 0, local at depth 1+) - so the user can collapse an
  // active group. childActive only drives a one-shot auto-expand on route
  // change (below), not a forced-open state.
  const hasExternalOpenState = singleOpen && setOpenItem;
  const effectiveOpenItem = hasExternalOpenState ? openItem : localOpenItem;
  const effectiveSetOpenItem = hasExternalOpenState
    ? setOpenItem
    : setLocalOpenItem;
  const open = singleOpen
    ? effectiveOpenItem === item.href
    : childActive
      ? true
      : internalOpen;

  // On route change, auto-expand the group that now contains the active
  // child (mirrors the section-level behaviour). One-shot via [routeKey]
  // so it never fights an explicit user collapse.
  const routeKey =
    router?.asPath ??
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.hash
      : "");
  React.useEffect(() => {
    if (childActive && singleOpen && effectiveOpenItem !== item.href) {
      effectiveSetOpenItem(item.href);
    }
  }, [routeKey]);

  // Group item: toggles its children inline (full mode) or shows icon-only trigger
  if (hasChildren) {
    return (
      <li>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() =>
                  collapsed
                    ? onExpand()
                    : singleOpen
                      ? effectiveOpenItem === item.href
                        ? effectiveSetOpenItem(null)
                        : effectiveSetOpenItem(item.href)
                      : setInternalOpen((v) => !v)
                }
                aria-expanded={collapsed ? undefined : open}
                aria-label={collapsed ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors text-foreground hover:bg-foreground/5 hover:text-sidebar-accent-foreground ${
                  collapsed ? "justify-center px-0" : ""
                }`}
                style={
                  collapsed ? undefined : { paddingLeft: `${8 + depth * 12}px` }
                }
              >
                {item.icon && collapsed && (
                  <span className="size-4 shrink-0 text-primary">
                    {item.icon}
                  </span>
                )}
                {!collapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge != null && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                {!collapsed && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={`hidden lg:inline-flex shrink-0 text-sidebar-foreground/40 transition-transform ${open ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">{item.label}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {!collapsed && open && (
          <ul className="mt-1 space-y-1">
            {children.map((child) => (
              <NavItemRenderer
                key={child.href}
                item={child}
                router={router}
                onNav={onNav}
                onExpand={onExpand}
                depth={depth + 1}
                collapsed={collapsed}
                singleOpen={singleOpen}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // Leaf item: framework-aware link when an adapter is provided.
  const isActive = router
    ? router.isActive(item.href)
    : defaultIsActive(item.href);
  const Link = router?.Link ?? DefaultAnchor;
  if (renderNavItem) {
    return renderNavItem(item, {
      depth,
      isActive,
      collapsed,
      hasChildren: false,
      router,
    });
  }
  return (
    <li key={item.href}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={(event) => {
                if (collapsed) {
                  event.preventDefault();
                  onExpand();
                  return;
                }
                onNav();
              }}
              aria-label={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "bg-foreground/10 text-sidebar-accent-foreground"
                  : "text-foreground hover:bg-foreground/5 hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon && collapsed && (
                <span className="size-4 shrink-0 text-primary">
                  {item.icon}
                </span>
              )}
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge != null && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">{item.label}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </li>
  );
}

/* ── Sidebar toolbar: collapse / expand all (with tooltips) ── */

interface SidebarToolbarProps {
  sectionIds: string[];
  onCollapseAll: (ids: string[]) => void;
  onExpandAll: (ids: string[]) => void;
}

function SidebarToolbar({
  sectionIds,
  onCollapseAll,
  onExpandAll,
}: SidebarToolbarProps) {
  return (
    <div className="hidden lg:flex sticky top-0 z-20 mb-4 items-center gap-2 border-b border-border bg-sidebar">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onCollapseAll(sectionIds)}
              aria-label="Collapse all sections"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:bg-foreground/5 hover:text-sidebar-foreground"
            >
              <Icon name="chevrons-up" className="size-3.5 shrink-0" />
              <span>Collapse all</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Collapse all sections</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onExpandAll(sectionIds)}
              aria-label="Expand all sections"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:bg-foreground/5 hover:text-sidebar-foreground"
            >
              <Icon name="chevrons-down" className="size-3.5 shrink-0" />
              <span>Expand all</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Expand all sections</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

/* ── Default brand ──────────────────────────────── */

/** Shield fallback logo used when `brand.logo` is not provided. */
export const BrandLogo = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L4 6V12C4 17.52 7.58 22.48 12 24C16.42 22.48 20 17.52 20 12V6L12 2Z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M12 6L8 8V12C8 14.5 9.67 16.8 12 17.5C14.33 16.8 16 14.5 16 12V8L12 6Z"
      fill="currentColor"
      opacity="0.4"
    />
  </svg>
);

/** Default brand block: logo (or shield fallback) + label. */
function DefaultBrand({
  brand,
  collapsed,
}: {
  brand: BrandConfig;
  collapsed: boolean;
}) {
  return (
    <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-5">
      {brand.logo ?? <BrandLogo className="shrink-0 text-primary" />}
      {!collapsed && (
        <span className="truncate font-semibold text-sidebar-foreground">
          {brand.name}
        </span>
      )}
    </div>
  );
}

/* ── Default (no adapter) behavior ────────────────────────── */

function defaultIsActive(href: string): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === href || path.startsWith(href + "/");
}

function DefaultAnchor({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

/* ── Skeleton ─────────────────────────────────────────────── */

function SidebarSkeleton({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-md" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <div className="space-y-1">
            {[1, 2].map((j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
