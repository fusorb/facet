/**
 * ChangelogFeed: a vertical release timeline that renders ChangelogItems as
 * ChangelogCards, with a search box and a category filter bar. Console
 * styling via Facet semantic tokens (bg-card, border-border, text-foreground,
 * text-muted-foreground, ring-primary, bg-primary/10, bg-muted) — nothing
 * is hardcoded, fully themeable per fintech / med / edu / enterprise preset.
 *
 * Compound API mirrors ChangelogCard: <ChangelogFeed items={...} />
 * renders <ChangelogFeed.FilterBar> + <ChangelogFeed.Timeline> by default;
 * each part is forwardRef + className-overridable, so callers can restyle
 * or swap either part at the usage level:
 *   <ChangelogFeed items={items} />
 *   <ChangelogFeed.FilterBar ... />            // standalone search + pills
 *   <ChangelogFeed.Timeline items={items} />  // standalone staggered cards
 *
 * Stagger: item entrances use the Facet `stagger` motion helper
 * (stagger(60, { count }) -> number[] of ms delays) so the timeline animates
 * consistently with the rest of the console.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { stagger } from "@fusorb/facet-motion";
import { Input } from "./input.js";
import {
  type ChangelogItem,
  type ReleaseCategory,
  ChangelogCard,
} from "./changelog-card.js";

export type ChangeCategory = "all" | "feature" | "improvement" | "security" | "fix";

export interface ChangelogFeedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Release list rendered by the timeline. */
  items: ChangelogItem[];
  /** Initial search term. */
  defaultSearch?: string;
  /** Initial active category filter. Default: "all". */
  defaultCategory?: ChangeCategory;
}

export interface ChangelogFeedFilterBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  search: string;
  onSearch: (value: string) => void;
  categories?: ChangeCategory[];
  selectedCategory: ChangeCategory;
  onSelectCategory: (category: ChangeCategory) => void;
}

const CATEGORY_OPTIONS: ChangeCategory[] = [
  "all",
  "feature",
  "improvement",
  "security",
  "fix",
];

const CATEGORY_LABELS: Record<Exclude<ChangeCategory, "all">, string> = {
  feature: "Features",
  improvement: "Improvements",
  security: "Security",
  fix: "Fixes",
};

// Dot color keyed by ReleaseCategory (item.category) for timeline items.
const TIMELINE_DOT: Record<ReleaseCategory, string> = {
  FEATURE: "bg-primary",
  IMPROVEMENT: "bg-secondary",
  SECURITY: "bg-success",
  FIX: "bg-warning",
};

// Dot color keyed by ChangeCategory (lowercase) for filter pills.
const FILTER_DOT: Record<Exclude<ChangeCategory, "all">, string> = {
  feature: "bg-primary",
  improvement: "bg-secondary",
  security: "bg-success",
  fix: "bg-warning",
};

const ChangelogFeedFilterBar = React.forwardRef<
  HTMLDivElement,
  ChangelogFeedFilterBarProps
>(
  (
    {
      search,
      onSearch,
      categories = CATEGORY_OPTIONS,
      selectedCategory,
      onSelectCategory,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn("flex flex-wrap items-center gap-3", className)}
      {...props}
    >
      <Input
        type="search"
        placeholder="Search releases…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="max-w-sm"
        aria-label="Search releases"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((category) => {
          const selected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium",
                "transition-colors focus-visible:outline-none",
                selected
                  ? "border-transparent bg-primary/10 text-primary ring-1 ring-primary"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
              )}
            >
              {category === "all" ? "All" : CATEGORY_LABELS[category]}
              {category !== "all" && (
                <span
                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", FILTER_DOT[category])}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  ),
);
ChangelogFeedFilterBar.displayName = "ChangelogFeedFilterBar";

interface ChangelogTimelineItemProps {
  item: ChangelogItem;
  delay: number;
}

const ChangelogTimelineItem = React.forwardRef<
  HTMLLIElement,
  ChangelogTimelineItemProps & React.HTMLAttributes<HTMLLIElement>
>(({ item, delay, className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative animate-facet-fade-up", className)}
    style={{ animationDelay: `${delay}ms` }}
    {...props}
  >
    <span
      className={cn(
        "absolute left-[-13px] top-1 h-2 w-2 shrink-0 rounded-full",
        TIMELINE_DOT[item.category],
      )}
      aria-hidden="true"
    />
    <ChangelogCard item={item} className="border-border" />
  </li>
));
ChangelogTimelineItem.displayName = "ChangelogTimelineItem";

interface ChangelogTimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Filtered release list rendered as staggered TimelineItem cards. */
  items: ChangelogItem[];
}

const ChangelogFeedTimeline = React.forwardRef<
  HTMLUListElement,
  ChangelogTimelineProps
>(({ items, className, ...props }, ref) => {
  const delays = stagger(60, { count: items.length });

  return (
    <ul
      ref={ref}
      className={cn("relative flex flex-col gap-4", className)}
      {...props}
    >
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
      {items.length === 0 && (
        <li className="text-sm text-muted-foreground">No matching releases.</li>
      )}
      {items.map((item, i) => (
        <ChangelogTimelineItem
          key={item.id}
          item={item}
          delay={delays[i] ?? 0}
        />
      ))}
    </ul>
  );
});
ChangelogFeedTimeline.displayName = "ChangelogFeedTimeline";

const ChangelogFeedBase = React.forwardRef<HTMLDivElement, ChangelogFeedProps>(
  (
    { items, defaultSearch = "", defaultCategory = "all", className, children, ...props },
    ref,
  ) => {
    const [search, setSearch] = React.useState(defaultSearch);
    const [category, setCategory] = React.useState<ChangeCategory>(defaultCategory);

    const term = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch =
        term === "" ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.highlights.some((h) => h.toLowerCase().includes(term));
      const matchesCategory =
        category === "all" || item.category.toLowerCase() === category;
      return matchesSearch && matchesCategory;
    });

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <ChangelogFeedFilterBar
          search={search}
          onSearch={setSearch}
          selectedCategory={category}
          onSelectCategory={setCategory}
        />
        <ChangelogFeedTimeline items={filtered} />
        {children}
      </div>
    );
  },
);
ChangelogFeedBase.displayName = "ChangelogFeed";

export const ChangelogFeed = Object.assign(ChangelogFeedBase, {
  FilterBar: ChangelogFeedFilterBar,
  Timeline: ChangelogFeedTimeline,
});
