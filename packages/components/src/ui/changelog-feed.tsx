/**
 * ChangelogFeed: a vertical release timeline that renders ChangelogItems as
 * ChangelogCards, with a search box and a category filter bar. Console
 * styling via Facet semantic tokens (bg-card, border-border, text-foreground,
 * text-muted-foreground, ring-primary, bg-primary/10, bg-muted) — nothing
 * is hardcoded, fully themeable per fintech / med / edu / enterprise preset.
 *
 * The timeline is built on the Roadmap timeline (shared connector line,
 * connector dot and stagger) via its `renderItem` slot, so the feed and the
 * roadmap stay visually aligned from one geometry.
 *
 * Fully customizable: category presentation (`categoryConfig`), copy
 * (`labels`), and every slot class (`classNames`) are overridable.
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
import { Input } from "./input.js";
import { Roadmap, type RoadmapItem, type RoadmapStatus } from "./roadmap.js";
import {
  type ChangelogItem,
  type ChangelogCategoryConfig,
  type ChangelogCardClassNames,
  type ReleaseCategory,
  ChangelogCard,
  resolveChangelogCategoryConfig,
} from "./changelog-card.js";

export type ChangeCategory =
  | "all"
  | "feature"
  | "improvement"
  | "security"
  | "fix";

export interface ChangelogFeedLabels {
  /** Search input placeholder. */
  searchPlaceholder?: string;
  /** Empty-state text when nothing matches. */
  empty?: string;
  /** Label for the "all" filter pill. */
  all?: string;
  /** Per-category filter pill labels. */
  categories?: Partial<Record<Exclude<ChangeCategory, "all">, string>>;
}

export interface ChangelogFeedClassNames extends ChangelogCardClassNames {
  root?: string;
  filterBar?: string;
  search?: string;
  filters?: string;
  filterPill?: string;
  filterPillActive?: string;
  filterDot?: string;
  timeline?: string;
  timelineDot?: string;
  card?: string;
}

export interface ChangelogFeedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Release list rendered by the timeline. */
  items: ChangelogItem[];
  /** Initial search term. */
  defaultSearch?: string;
  /** Initial active category filter. Default: "all". */
  defaultCategory?: ChangeCategory;
  /** Category presentation overrides (label / dot / badge variant). */
  categoryConfig?: ChangelogCategoryConfig;
  /** Copy overrides. */
  labels?: ChangelogFeedLabels;
  /** Per-slot class overrides. */
  classNames?: ChangelogFeedClassNames;
}

export interface ChangelogFeedFilterBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  search: string;
  onSearch: (value: string) => void;
  categories?: ChangeCategory[];
  selectedCategory: ChangeCategory;
  onSelectCategory: (category: ChangeCategory) => void;
  categoryConfig?: ChangelogCategoryConfig;
  labels?: ChangelogFeedLabels;
  classNames?: ChangelogFeedClassNames;
}

const CATEGORY_OPTIONS: ChangeCategory[] = [
  "all",
  "feature",
  "improvement",
  "security",
  "fix",
];

const FILTER_TO_RELEASE: Record<Exclude<ChangeCategory, "all">, ReleaseCategory> =
  {
    feature: "FEATURE",
    improvement: "IMPROVEMENT",
    security: "SECURITY",
    fix: "FIX",
  };

const DEFAULT_FILTER_LABELS: Record<
  Exclude<ChangeCategory, "all">,
  string
> = {
  feature: "Features",
  improvement: "Improvements",
  security: "Security",
  fix: "Fixes",
};

// The connector dot is a timeline concern; the Roadmap status is only a
// fallback when no explicit category dot is resolved.
const STATUS_BY_CATEGORY: Record<ReleaseCategory, RoadmapStatus> = {
  FEATURE: "in-progress",
  IMPROVEMENT: "planned",
  SECURITY: "done",
  FIX: "planned",
};

const DEFAULT_LABELS: Required<ChangelogFeedLabels> = {
  searchPlaceholder: "Search releases…",
  empty: "No matching releases.",
  all: "All",
  categories: DEFAULT_FILTER_LABELS,
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
      categoryConfig,
      labels,
      classNames,
      className,
      ...props
    },
    ref,
  ) => {
    const meta = resolveChangelogCategoryConfig(categoryConfig);
    const copy = { ...DEFAULT_LABELS, ...labels };
    const categoryLabels = { ...DEFAULT_FILTER_LABELS, ...labels?.categories };

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-center gap-3", classNames?.filterBar, className)}
        {...props}
      >
        <Input
          type="search"
          placeholder={copy.searchPlaceholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className={cn("max-w-sm", classNames?.search)}
          aria-label="Search releases"
        />
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            classNames?.filters,
          )}
        >
          {categories.map((category) => {
            const selected = selectedCategory === category;
            const release =
              category === "all" ? null : FILTER_TO_RELEASE[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                  "transition-colors focus-visible:outline-none",
                  selected
                    ? "border-transparent bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                  classNames?.filterPill,
                  selected && classNames?.filterPillActive,
                )}
              >
                {category === "all" ? copy.all : categoryLabels[category]}
                {release ? (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      meta[release].dot,
                      classNames?.filterDot,
                    )}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
ChangelogFeedFilterBar.displayName = "ChangelogFeedFilterBar";

export interface ChangelogTimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Filtered release list rendered as staggered TimelineItem cards. */
  items: ChangelogItem[];
  categoryConfig?: ChangelogCategoryConfig;
  labels?: ChangelogFeedLabels;
  classNames?: ChangelogFeedClassNames;
}

const ChangelogFeedTimeline = React.forwardRef<
  HTMLDivElement,
  ChangelogTimelineProps
>(
  (
    { items, categoryConfig, labels, classNames, className, ...props },
    ref,
  ) => {
    const meta = resolveChangelogCategoryConfig(categoryConfig);
    const copy = { ...DEFAULT_LABELS, ...labels };

    if (items.length === 0) {
      return (
        <p
          ref={ref}
          className={cn("text-sm text-muted-foreground", classNames?.timeline, className)}
          {...props}
        >
          {copy.empty}
        </p>
      );
    }

    const roadmapItems: RoadmapItem[] = items.map((item) => ({
      title: item.title,
      description: item.description,
      status: STATUS_BY_CATEGORY[item.category],
      date: item.date,
      dotClassName: cn(meta[item.category].dot, classNames?.timelineDot),
    }));

    return (
      <Roadmap
        ref={ref}
        items={roadmapItems}
        renderItem={(_, index) => (
          <ChangelogCard
            item={items[index]!}
            categoryConfig={categoryConfig}
            classNames={classNames}
            className={classNames?.card}
          />
        )}
        className={cn(classNames?.timeline, className)}
        {...props}
      />
    );
  },
);
ChangelogFeedTimeline.displayName = "ChangelogFeedTimeline";

const ChangelogFeedBase = React.forwardRef<HTMLDivElement, ChangelogFeedProps>(
  (
    {
      items,
      defaultSearch = "",
      defaultCategory = "all",
      categoryConfig,
      labels,
      classNames,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [search, setSearch] = React.useState(defaultSearch);
    const [category, setCategory] =
      React.useState<ChangeCategory>(defaultCategory);

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
        className={cn("flex flex-col gap-6", classNames?.root, className)}
        {...props}
      >
        <ChangelogFeedFilterBar
          search={search}
          onSearch={setSearch}
          selectedCategory={category}
          onSelectCategory={setCategory}
          categoryConfig={categoryConfig}
          labels={labels}
          classNames={classNames}
        />
        <ChangelogFeedTimeline
          items={filtered}
          categoryConfig={categoryConfig}
          labels={labels}
          classNames={classNames}
        />
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
