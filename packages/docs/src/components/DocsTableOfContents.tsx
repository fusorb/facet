import * as React from "react";
import type { DocsBlock } from "../lib/pages.js";
import { slug } from "../lib/ids.js";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface DocsTableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  /** The page blocks to scan for headings (h2, h3). */
  blocks: DocsBlock[];
}

/**
 * "On this page" right rail for docs content pages.
 *
 * Extracts every `h2` / `h3` block from the page and renders a sticky
 * list of anchor links.  IntersectionObserver highlights the heading
 * currently in view so the reader always knows where they are.
 */
export function DocsTableOfContents({
  blocks,
  className,
  ...props
}: DocsTableOfContentsProps) {
  const headings = React.useMemo(
    () =>
      blocks
        .filter((b) => b.type === "h2" || b.type === "h3")
        .map((b) => ({
          id: slug(b.text),
          text: b.text,
          level: b.type === "h2" ? 2 : 3,
        })),
    [blocks],
  );

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
      className={cn("sticky top-24 h-max py-2 text-sm", className)}
      {...props}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-border pl-3">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block rounded-sm border-l-2 border-transparent px-2 py-1 text-muted-foreground",
                "transition-all hover:border-primary hover:text-foreground hover:underline decoration-primary/50",
                activeId === h.id && "border-primary font-medium text-primary",
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
