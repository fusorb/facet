/**
 * Changeset: a date-grouped content timeline that renders commit dates as
 * pill / bordered headings on the right and plain text content on the left.
 *
 * Unlike Roadmap (status dots + card chrome) or ChangelogWithDate (version
 * cards with kind pills), Changeset has no card chrome at all — the date is
 * a bordered label and the content is just text renderers (headers, lists,
 * paragraphs). Each date renders as an `<h3>` with a stable `id`, so when
 * embedded in a docs page the DocsTableOfContents can build its "On this
 * page" outline from the commit dates automatically.
 *
 * The component uses `flex-row-reverse` so the date `<h3>` stays first in
 * DOM order (clean TOC ordering) while visually appearing on the right,
 * with the content flowing on the left and a generous gap between them.
 *
 * The component lives in facet-components so it can be used standalone or via
 * the docs block renderer; the docs engine maps the `changeset` block type to
 * this component and routes sub-blocks through the same Guide.tsx text
 * renderers that every other block uses.
 *
 * Usage:
 *   <Changeset
 *     entries={[
 *       {
 *         date: "2026-09-24",
 *         children: (
 *           <>
 *             <P>Rebuilt the hero with a console surface.</P>
 *             <Ul>
 *               <Li>Added auth console preview</Li>
 *               <Li>Removed domain-cycling card</Li>
 *             </Ul>
 *           </>
 *         ),
 *       },
 *     ]}
 *   />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { stagger } from "@fusorb/facet-motion";

export interface ChangesetEntry {
  /** Date label rendered on the right column (e.g. "2026-09-24"). */
  date: string;
  /** Stable id for the heading anchor. Defaults to a slug of `date`. */
  id?: string;
  /** Content rendered in the left column: headers, lists, paragraphs, etc. */
  children: React.ReactNode;
}

export interface ChangesetProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Date-grouped entries, in chronological order (newest first by convention). */
  entries: ChangesetEntry[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const Changeset = React.forwardRef<HTMLDivElement, ChangesetProps>(
  ({ entries, className, ...props }, ref) => {
    const delays = stagger(60, { count: entries.length });

    return (
      <div ref={ref} className={cn("space-y-5", className)} {...props}>
        {entries.map((entry, i) => {
          const id = entry.id ?? slugify(entry.date);

          return (
            <div
              key={id}
              className={cn(
                "items-start gap-6",
                "flex animate-facet-fade-up",
                "flex-row-reverse",
              )}
              style={{ animationDelay: `${delays[i] ?? 0}ms` }}
            >
              {/* Date label — right column, renders as h3 for the docs TOC */}
              <div className="flex h-max flex-shrink-0 items-start justify-center">
                <h3
                  id={id}
                  className={cn(
                    "whitespace-nowrap rounded-md border border-border",
                    "bg-muted/40 px-3 py-1.5 font-mono text-xs font-medium",
                    "text-muted-foreground",
                  )}
                >
                  {entry.date}
                </h3>
              </div>

              {/* Content — left column, plain text renderers, no card chrome */}
              <div className="min-w-0 flex-1">{entry.children}</div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No changeset entries to display.
          </p>
        )}
      </div>
    );
  },
);
Changeset.displayName = "Changeset";

export { Changeset };
