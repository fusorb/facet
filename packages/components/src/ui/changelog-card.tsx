/**
 * ChangelogCard: a developer-console release card rendered from a single
 * ChangelogItem. Renders version + date, a category badge (Feature /
 * Improvement / Security / Fix), an optional status badge, a title, a
 * description, a highlights list, and an inline diff toggle that reveals a
 * themed code viewer.
 *
 * Every color is a Facet semantic token (bg-card, border-border,
 * text-foreground, text-muted-foreground, text-primary, text-success,
 * text-warning, text-destructive, ring-primary) — nothing is hardcoded,
 * so the card follows the active domain preset in fintech / med / edu /
 * enterprise and re-themes by overriding tokens.
 *
 * Fully customizable: the category presentation (label / dot / badge
 * variant), the copy (`labels`), and every slot class (`classNames`) are
 * overridable per instance. The category dot and status badge are opt-in
 * (off by default) so the timeline owns the indicator dots.
 *
 * Compound (dot-notation) API: each slot is a forwardRef component that
 * accepts a className, so callers style color & spacing at the usage level:
 *   <ChangelogCard item={item}>          // auto-rendered from data
 *   <ChangelogCard.Header />             // styled container (standalone)
 *   <ChangelogCard.Title />              // h3
 *   <ChangelogCard.Description />        // p
 *   <ChangelogCard.Highlights />         // ul
 *   <ChangelogCard.DiffToggle />         // toggle Button
 *   <ChangelogCard.DiffViewer />         // pre (hosts <code>)
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Badge, type BadgeProps } from "./badge.js";
import { Button } from "./button.js";

export type ReleaseCategory = "FEATURE" | "IMPROVEMENT" | "SECURITY" | "FIX";
export type ReleaseStatus = "Current" | "Latest Release" | null;

export interface ChangelogItem {
  /** Stable identifier for the card (used as the React key / anchor). */
  id: string;
  /** Version label, e.g. "v2.5.0". */
  version: string;
  /** Human-readable date, e.g. "August 2026". */
  date: string;
  /** Status badge text; null renders no status badge. */
  status?: ReleaseStatus;
  /** Change category — drives the category badge tone. */
  category: ReleaseCategory;
  /** One-line heading for the release. */
  title: string;
  /** Longer description text. */
  description: string;
  /** Bulleted highlight points. */
  highlights: string[];
  /** Optional inline diff exposed via a toggle + viewer. */
  codeDiff?: {
    /** Programming-language hint for the <code> class (e.g. "ts"). */
    language?: string;
    /** Raw diff / code text rendered as text (never via dangerouslySetInnerHTML). */
    code: string;
  };
}

/* ── Source data types (from gen-changelog.mjs) ────────────── */

export type ChangelogChangeKind =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "deprecated"
  | "security";

export interface ChangelogChange {
  kind: ChangelogChangeKind;
  text: string;
  href?: string;
  author?: string;
}

export interface ChangelogRelease {
  version: string;
  date: string;
  tag?: string;
  title?: string;
  changes: ChangelogChange[];
  pre?: boolean;
}

/* ── Release tag → ReleaseCategory mapping ─────────────────── */

const TAG_TO_CATEGORY: Record<string, ReleaseCategory> = {
  breaking: "IMPROVEMENT",
  feat: "FEATURE",
  fix: "FIX",
  perf: "IMPROVEMENT",
  deps: "IMPROVEMENT",
  security: "SECURITY",
  "pre-release": "FEATURE",
  release: "IMPROVEMENT",
};

/**
 * Adapter: convert a generated ChangelogRelease (from gen-changelog.mjs)
 * into a ChangelogItem consumable by ChangelogCard / ChangelogFeed.
 *
 * - tag        → category  (via TAG_TO_CATEGORY, throws on unknown)
 * - changes[]  → highlights (all change texts)
 * - description ← synthesized from the first change entry
 * - status     ← positional: newest release gets a badge
 * - codeDiff   ← omitted (source data carries no diffs)
 */
export function toChangelogItem(
  release: ChangelogRelease,
  index: number,
): ChangelogItem {
  const category = TAG_TO_CATEGORY[release.tag ?? "release"];
  if (!category) {
    throw new Error(
      `toChangelogItem: unmapped changelog tag "${release.tag}" — ` +
        `add it to TAG_TO_CATEGORY. Known: ${Object.keys(TAG_TO_CATEGORY).join(", ")}`,
    );
  }

  let status: ReleaseStatus = null;
  if (index === 0) {
    status = release.pre ? "Current" : "Latest Release";
  }

  return {
    id: release.version,
    version: release.version,
    date: release.date,
    status,
    category,
    title: release.title ?? `v${release.version}`,
    description: release.changes[0]?.text ?? "",
    highlights: release.changes.map((c) => c.text),
  };
}

/* ── Category presentation config ──────────────────────────── */

/** Presentation of a release category. Every field defaults to a token. */
export interface ChangelogCategoryMeta {
  /** Badge text. */
  label: string;
  /** Indicator-dot class (used by the timeline dot / opt-in card dot). */
  dot: string;
  /** Badge tone. */
  badgeVariant: BadgeProps["variant"];
}

/** Partial overrides merged over {@link DEFAULT_CHANGELOG_CATEGORY_CONFIG}. */
export type ChangelogCategoryConfig = Partial<
  Record<ReleaseCategory, Partial<ChangelogCategoryMeta>>
>;

export const DEFAULT_CHANGELOG_CATEGORY_CONFIG: Record<
  ReleaseCategory,
  ChangelogCategoryMeta
> = {
  FEATURE: { label: "Feature", dot: "bg-primary", badgeVariant: "default" },
  IMPROVEMENT: { label: "Improvement", dot: "bg-secondary", badgeVariant: "secondary" },
  SECURITY: { label: "Security", dot: "bg-success", badgeVariant: "success" },
  FIX: { label: "Fix", dot: "bg-warning", badgeVariant: "warning" },
};

/** Merge consumer category overrides over the token-driven defaults. */
export function resolveChangelogCategoryConfig(
  overrides?: ChangelogCategoryConfig,
): Record<ReleaseCategory, ChangelogCategoryMeta> {
  return (Object.keys(DEFAULT_CHANGELOG_CATEGORY_CONFIG) as ReleaseCategory[]).reduce(
    (acc, key) => {
      acc[key] = { ...DEFAULT_CHANGELOG_CATEGORY_CONFIG[key], ...overrides?.[key] };
      return acc;
    },
    {} as Record<ReleaseCategory, ChangelogCategoryMeta>,
  );
}

/** Per-instance copy overrides. */
export interface ChangelogCardLabels {
  showDiff?: string;
  hideDiff?: string;
}

/** Per-slot class overrides. Each falls back to the component default. */
export interface ChangelogCardClassNames {
  header?: string;
  meta?: string;
  categoryDot?: string;
  categoryBadge?: string;
  statusBadge?: string;
  title?: string;
  description?: string;
  highlights?: string;
  diffToggle?: string;
  diffViewer?: string;
}

const DEFAULT_LABELS: Required<ChangelogCardLabels> = {
  showDiff: "Show diff",
  hideDiff: "Hide diff",
};

const STATUS_BADGE_VARIANT: Record<
  Exclude<ReleaseStatus, null>,
  BadgeProps["variant"]
> = {
  Current: "default",
  "Latest Release": "outline",
};

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        "ml-2 h-4 w-4 text-muted-foreground transition-transform",
        open && "rotate-180",
      )}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ChangelogCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between", className)}
    {...props}
  >
    {children}
  </div>
));
ChangelogCardHeader.displayName = "ChangelogCardHeader";

const ChangelogCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-foreground font-semibold", className)}
    {...props}
  >
    {children}
  </h3>
));
ChangelogCardTitle.displayName = "ChangelogCardTitle";

const ChangelogCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
));
ChangelogCardDescription.displayName = "ChangelogCardDescription";

const ChangelogCardHighlights = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, children, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("list-disc list-inside space-y-1 text-sm", className)}
    {...props}
  >
    {children}
  </ul>
));
ChangelogCardHighlights.displayName = "ChangelogCardHighlights";

const ChangelogCardDiffToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="sm"
    className={cn("text-muted-foreground", className)}
    {...props}
  >
    {children}
  </Button>
));
ChangelogCardDiffToggle.displayName = "ChangelogCardDiffToggle";

const ChangelogCardDiffViewer = React.forwardRef<
  HTMLPreElement,
  React.HTMLAttributes<HTMLPreElement>
>(({ className, children, ...props }, ref) => (
  <pre
    ref={ref}
    className={cn(
      "overflow-x-auto rounded-md border border-border bg-background/60",
      "font-mono text-xs",
      className,
    )}
    {...props}
  >
    {children}
  </pre>
));
ChangelogCardDiffViewer.displayName = "ChangelogCardDiffViewer";

export interface ChangelogCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The release to render. */
  item: ChangelogItem;
  /** Whether the code-diff panel starts expanded. Default: false. */
  defaultExpandedDiff?: boolean;
  /** Category presentation overrides (label / dot / badge variant). */
  categoryConfig?: ChangelogCategoryConfig;
  /** Show the in-card category dot. Default: false (the timeline owns dots). */
  showCategoryDot?: boolean;
  /** Show the status badge. Default: false. */
  showStatus?: boolean;
  /** Copy overrides. */
  labels?: ChangelogCardLabels;
  /** Per-slot class overrides. */
  classNames?: ChangelogCardClassNames;
}

const ChangelogCardBase = React.forwardRef<HTMLDivElement, ChangelogCardProps>(
  (
    {
      item,
      defaultExpandedDiff = false,
      categoryConfig,
      showCategoryDot = false,
      showStatus = false,
      labels,
      classNames,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [diffOpen, setDiffOpen] = React.useState(defaultExpandedDiff);
    const categories = resolveChangelogCategoryConfig(categoryConfig);
    const category = categories[item.category];
    const copy = { ...DEFAULT_LABELS, ...labels };

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border border-border bg-card p-5 text-foreground",
          "flex flex-col gap-4",
          className,
        )}
        {...props}
      >
        <ChangelogCardHeader className={classNames?.header}>
          <div
            className={cn(
              "flex items-center gap-2 font-mono text-xs text-muted-foreground",
              classNames?.meta,
            )}
          >
            {showCategoryDot ? (
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  category.dot,
                  classNames?.categoryDot,
                )}
                aria-hidden="true"
              />
            ) : null}
            <span>{item.version}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={item.date}>{item.date}</time>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={category.badgeVariant} className={classNames?.categoryBadge}>
              {category.label}
            </Badge>
            {showStatus && item.status ? (
              <Badge
                variant={STATUS_BADGE_VARIANT[item.status]}
                className={classNames?.statusBadge}
              >
                {item.status}
              </Badge>
            ) : null}
          </div>
        </ChangelogCardHeader>

        <ChangelogCardTitle className={classNames?.title}>
          {item.title}
        </ChangelogCardTitle>
        <ChangelogCardDescription className={classNames?.description}>
          {item.description}
        </ChangelogCardDescription>

        {item.highlights.length > 0 ? (
          <ChangelogCardHighlights className={classNames?.highlights}>
            {item.highlights.map((highlight, i) => (
              <li key={`h-${item.id}-${i}`}>{highlight}</li>
            ))}
          </ChangelogCardHighlights>
        ) : null}

        {item.codeDiff ? (
          <>
            <ChangelogCardDiffToggle
              type="button"
              aria-expanded={diffOpen}
              onClick={() => setDiffOpen((open) => !open)}
              className={classNames?.diffToggle}
            >
              <span>{diffOpen ? copy.hideDiff : copy.showDiff}</span>
              <ChevronDownIcon open={diffOpen} />
            </ChangelogCardDiffToggle>
            {diffOpen ? (
              <ChangelogCardDiffViewer className={classNames?.diffViewer}>
                <code
                  className={cn(
                    item.codeDiff.language
                      ? `language-${item.codeDiff.language}`
                      : undefined,
                  )}
                >
                  {item.codeDiff.code}
                </code>
              </ChangelogCardDiffViewer>
            ) : null}
          </>
        ) : null}

        {children}
      </div>
    );
  },
);
ChangelogCardBase.displayName = "ChangelogCard";

export const ChangelogCard = Object.assign(ChangelogCardBase, {
  Header: ChangelogCardHeader,
  Title: ChangelogCardTitle,
  Description: ChangelogCardDescription,
  Highlights: ChangelogCardHighlights,
  DiffToggle: ChangelogCardDiffToggle,
  DiffViewer: ChangelogCardDiffViewer,
});
