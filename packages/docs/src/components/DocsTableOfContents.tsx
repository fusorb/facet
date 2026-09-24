import * as React from "react";
import { useLocation } from "react-router-dom";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface DocsTableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  /** CSS selector for the content container to scan for headings. */
  container?: string;
}

interface HeadingEntry {
  id: string;
  text: string;
  level: number;
}

/**
 * "On this page" right rail for docs content pages.
 *
 * Dynamically scans the rendered page content for `h2` / `h3` headings
 * (which carry `id` attributes generated from their text via `slug`) and
 * builds the TOC from the live DOM rather than from pre-parsed page
 * blocks.  A MutationObserver keeps the list in sync when content is
 * lazily rendered.  IntersectionObserver highlights the heading currently
 * in view so the reader always knows where they are.
 */
export function DocsTableOfContents({
  container = "main",
  className,
  ...props
}: DocsTableOfContentsProps) {
  const location = useLocation();
  const [headings, setHeadings] = React.useState<HeadingEntry[]>([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector<HTMLElement>(container);
    if (!root) return;

    const scan = () => {
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>("h2[id], h3[id]"),
      ).filter((el) => el.id);

      setHeadings((prev) => {
        if (
          prev.length === nodes.length &&
          prev.every((h, i) => h.id === nodes[i]?.id)
        ) {
          return prev;
        }
        return nodes.map((el) => ({
          id: el.id,
          text: el.textContent?.trim() ?? "",
          level: el.tagName === "H2" ? 2 : 3,
        }));
      });
    };

    const raf = requestAnimationFrame(scan);
    const observer = new MutationObserver(scan);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [location.pathname, container]);

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
      className={cn("sticky top-24 h-max px-4 py-2 text-sm", className)}
      {...props}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        On this page
      </p>
      <ul className="space-y-0.5 pl-3">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block rounded-sm px-2 py-1 text-muted-foreground transition-colors",
                "hover:bg-foreground/5 hover:text-foreground",
                activeId === h.id &&
                  "bg-foreground/10 font-medium text-foreground",
              )}
              style={h.level === 3 ? { paddingLeft: "1.5rem" } : undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
