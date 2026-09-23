/**
 * @fusorb/facet-layout: DocsAside
 *
 * Collapsible "on this page" navigation panel for docs layouts.
 *
 * Reads a list of headings (h2/h3) and renders anchor links with
 * IntersectionObserver-based active-link tracking.  The panel is
 * scrollable when headings overflow, collapsible via a header toggle,
 * and styled with the light-blue (`--primary`) palette:
 *   - active link: left border + text at full blue, bg at ~10 % opacity.
 *
 * This component is generic — it does NOT know about DocsBlock.
 * The docs package extracts h2/h3 from DocsBlock[] (using `slug()`)
 * and passes the headings array here.
 */

import * as React from "react";
import { Icon } from "@fusorb/facet-components";

export interface DocsAsideHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface DocsAsideProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onToggle"> {
  /** Headings to render as nav links. */
  headings: DocsAsideHeading[];
  /** Initially collapsed? Default: false */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Called when the collapse toggle is pressed. */
  onToggle?: (collapsed: boolean) => void;
}

const ASIDE_STORAGE_KEY = "facet-docs-aside-collapsed";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DocsAside({
  headings,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onToggle,
  className,
  ...props
}: DocsAsideProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(ASIDE_STORAGE_KEY);
      if (saved !== null) setInternalCollapsed(saved === "true");
    } catch {}
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ASIDE_STORAGE_KEY, String(collapsed));
    } catch {}
    onToggle?.(collapsed);
  }, [collapsed, onToggle]);

  const handleToggle = React.useCallback(() => {
    setInternalCollapsed((prev) => !prev);
  }, []);

  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!headings.length || typeof window === "undefined") return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      {
        root: null,
        // Trigger active state when the heading is in the upper-middle of the viewport.
        rootMargin: "-20% 0px -35% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <aside
      aria-label="On this page"
      className={cn(
        "flex h-screen w-full flex-col border-l border-sidebar-border bg-sidebar",
        className,
      )}
      {...props}
    >
      {/* Header with collapsible toggle */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          On this page
        </p>
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={!collapsed}
          aria-controls="docs-aside-content"
          className="rounded p-1 text-muted-foreground/60 hover:text-foreground"
        >
          <Icon
            name="chevron-down"
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              !collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Scrollable heading list */}
      <div
        id="docs-aside-content"
        className={cn(
          "flex-1 overflow-y-auto px-3 transition-[max-height]",
          collapsed ? "max-h-0" : "max-h-[calc(100vh-80px)]",
        )}
      >
        <ul className="space-y-0.5 border-l border-border pl-3">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "block rounded-sm border-l-2 border-transparent px-2 py-1 text-muted-foreground",
                  "transition-all hover:border-primary hover:text-foreground hover:underline decoration-primary/50",
                  // Light-blue palette: full-blue border + text, bg at ~10 % opacity
                  activeId === h.id &&
                    "border-primary bg-primary/10 font-medium text-primary",
                  h.level === 3 && "pl-6",
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
