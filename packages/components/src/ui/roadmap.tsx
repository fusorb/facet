/**
 * Roadmap: vertical timeline of feature items with status badges.
 * Two variants:
 *  - "card": each item renders as a bordered card with a status badge
 *    (default).
 *  - "timeline": a lighter look with a status dot, a mono phase/date
 *    label and no card chrome, for landing-page sections.
 */
import * as React from "react";
import { cn } from "../utils.js";
import { stagger } from "@fusorb/facet-motion";

export type RoadmapStatus = "done" | "in-progress" | "planned";

export interface RoadmapItem {
  title: string;
  description?: string;
  status: RoadmapStatus;
  /** Optional label shown next to the status, e.g. a target date or phase. */
  date?: string;
}

export interface RoadmapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Items in the order they appear on the timeline. */
  items: RoadmapItem[];
  /** Show the connecting line between items. Default: true */
  showLine?: boolean;
  /** Visual style. "card" (default) or "timeline" (lighter, dot + label). */
  variant?: "card" | "timeline";
  /** Constrain the timeline to a fixed height and scroll vertically when it
   * overflows (useful when the roadmap grows past the viewport). Pass a Tailwind
   * height class, e.g. `"max-h-96"`. Default: unset (natural height). */
  maxHeight?: string;
}

const STATUS_STYLES: Record<RoadmapStatus, string> = {
  done: "border-success/60 bg-success/10 text-success",
  "in-progress": "border-primary/60 bg-primary/10 text-primary",
  planned: "border-border bg-muted/40 text-muted-foreground",
};

const STATUS_DOT: Record<RoadmapStatus, string> = {
  done: "bg-success",
  "in-progress": "bg-primary",
  planned: "bg-muted-foreground/40",
};

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  done: "Done",
  "in-progress": "In progress",
  planned: "Planned",
};

/**
 * A data-driven roadmap timeline. Each item renders as a status-badged row
 * on a vertical connector line. Use the `timeline` variant for a lighter
 * dot + mono-label look in landing sections.
 */
const Roadmap = React.forwardRef<HTMLDivElement, RoadmapProps>(
  (
    {
      items,
      showLine = true,
      variant = "card",
      maxHeight,
      className,
      ...props
    },
    ref,
  ) => {
    const itemStaggerDelays = stagger(70, { count: items.length });
    return (
    <div
      ref={ref}
      className={cn(
        "space-y-0",
        maxHeight,
        maxHeight ? "overflow-y-auto" : "",
        className,
      )}
      {...props}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        if (variant === "timeline") {
          return (
            <div
              key={`${item.title}-${i}`}
              className="relative flex gap-5 pb-8 last:pb-0 animate-facet-fade-up"
            style={{ animationDelay: `${itemStaggerDelays[i] ?? 0}ms` }}
            >
              {showLine && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-border",
                    isLast && "hidden",
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative mt-1.5 size-[23px] shrink-0 rounded-full border-4 border-background",
                  STATUS_DOT[item.status],
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.date && (
                    <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                      {item.date}
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      STATUS_STYLES[item.status],
                    )}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
                <h3 className="mt-1 font-semibold text-foreground">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        }
        return (
          <div
            key={`${item.title}-${i}`}
            className="relative flex gap-4 pb-6 last:pb-0 animate-facet-fade-up"
          style={{ animationDelay: `${itemStaggerDelays[i] ?? 0}ms` }}
          >
            {showLine && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[9px] top-6 h-[calc(100%-1.5rem)] w-px bg-border",
                  isLast && "hidden",
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative mt-1.5 size-[19px] shrink-0 rounded-full border-4 border-background",
                STATUS_DOT[item.status],
              )}
            />
            <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  {item.title}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    STATUS_STYLES[item.status],
                  )}
                >
                  {item.date
                    ? `${STATUS_LABEL[item.status]} · ${item.date}`
                    : STATUS_LABEL[item.status]}
                </span>
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
      </div>
      );
  },
);
Roadmap.displayName = "Roadmap";

export { Roadmap };
