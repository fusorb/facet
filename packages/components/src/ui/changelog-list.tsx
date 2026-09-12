/**
 * @fusorb/facet-components: ChangelogList
 *
 * A ready-to-use changelog / release notes list. Vertical timeline of
 * releases, each with a version, date, tag chips (Added / Changed /
 * Fixed / Removed / Security), and bullet groups per tag.
 *
 * Built for the "what shipped?" surface every docs site / open-source
 * project needs but nobody wants to keep styling. Data-driven: pass an
 * array of releases, render.
 *
 * Usage:
 *   <ChangelogList
 *     releases={[
 *       { version: "1.4.0", date: "2026-08-12", tag: "release",
 *         changes: [
 *           { kind: "added", text: "FaqSection component" },
 *           { kind: "fixed", text: "Billing interval toggle" },
 *         ] },
 *     ]}
 *   />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export type ChangelogChangeKind =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "deprecated"
  | "security";

export interface ChangelogChange {
  /** Change category. Determines the tag chip color + icon. */
  kind: ChangelogChangeKind;
  /** Bullet text. */
  text: string;
  /** Optional hyperlink target. */
  href?: string;
  /** Optional contributor / author attribution. */
  author?: string;
}

export interface ChangelogRelease {
  /** Version string (e.g. "1.4.0", "2026-08-12", "Phase 5"). */
  version: string;
  /** ISO date or human-readable date string. */
  date: string;
  /** Optional tag (e.g. "release", "pre-release", "security"). */
  tag?: string;
  /** Optional short title for the release. */
  title?: string;
  /** Bullet list of changes, grouped internally by `kind`. */
  changes: ChangelogChange[];
  /** Optional pre-release / nightly indicator. */
  pre?: boolean;
}

export interface ChangelogListProps extends React.HTMLAttributes<HTMLOListElement> {
  releases: ChangelogRelease[];
  /** Show a filter row at the top (toggle each kind on/off). Default: false. */
  showFilter?: boolean;
  /** Hide empty groups (kinds with no changes). Default: true. */
  hideEmptyKinds?: boolean;
  /** Override user-visible text strings. */
  copy?: Partial<ChangelogListCopy>;
  /** Custom date formatter. */
  formatDate?: (date: string) => string;
}

export interface ChangelogListCopy {
  /** Label above the filter row. */
  filterLabel: string;
  /** Text for the pre-release tag. */
  preRelease: string;
  /** Override individual kind labels (e.g. { added: "New" }). */
  kindLabels: Partial<Record<ChangelogChangeKind, string>>;
}

const defaultChangelogCopy: ChangelogListCopy = {
  filterLabel: "Filter",
  preRelease: "pre-release",
  kindLabels: {},
};

/* ── Helpers ───────────────────────────────────────────────── */

const KIND_META: Record<ChangelogChangeKind, { label: string; icon: IconName; pill: string }> = {
  added: {
    label: "Added",
    icon: "plus",
    pill: "bg-emerald-500/10 text-emerald-700",
  },
  changed: {
    label: "Changed",
    icon: "settings",
    pill: "bg-sky-500/10 text-sky-700",
  },
  fixed: {
    label: "Fixed",
    icon: "wrench",
    pill: "bg-violet-500/10 text-violet-700",
  },
  removed: {
    label: "Removed",
    icon: "trash",
    pill: "bg-rose-500/10 text-rose-700",
  },
  deprecated: {
    label: "Deprecated",
    icon: "triangle-alert",
    pill: "bg-amber-500/10 text-amber-700",
  },
  security: {
    label: "Security",
    icon: "shield-alert",
    pill: "bg-red-500/10 text-red-700",
  },
};

function defaultFormatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ── Filter chip ──────────────────────────────────────────── */

function FilterChip({
  kind,
  label,
  count,
  enabled,
  onToggle,
}: {
  kind: ChangelogChangeKind;
  label: string;
  count: number;
  enabled: boolean;
  onToggle: () => void;
}) {
  const meta = KIND_META[kind];
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        enabled
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-accent/40",
      )}
    >
      <Icon name={meta.icon} className="size-3.5" />
      <span>{label}</span>
      <span className="rounded bg-background/40 px-1 text-[10px] font-semibold tabular-nums">
        {count}
      </span>
    </button>
  );
}

/* ── Main component ────────────────────────────────────────── */

const KIND_ORDER: ChangelogChangeKind[] = [
  "added",
  "changed",
  "fixed",
  "deprecated",
  "removed",
  "security",
];

/**
 * A vertical changelog list: each release is a node on a timeline, with
 * bullets grouped by kind. Optional filter row at the top.
 */
export function ChangelogList({
  releases,
  showFilter = false,
  hideEmptyKinds = true,
  className,
  copy,
  formatDate: formatDateProp,
  ...props
}: ChangelogListProps) {
  const c = { ...defaultChangelogCopy, ...copy };
  const fmt = formatDateProp ?? defaultFormatDate;
  const [enabled, setEnabled] = React.useState<Record<ChangelogChangeKind, boolean>>({
    added: true,
    changed: true,
    fixed: true,
    removed: true,
    deprecated: true,
    security: true,
  });

  // Compute counts per kind across all releases.
  const counts = React.useMemo(() => {
    const c: Record<ChangelogChangeKind, number> = {
      added: 0,
      changed: 0,
      fixed: 0,
      removed: 0,
      deprecated: 0,
      security: 0,
    };
    for (const r of releases) for (const change of r.changes) c[change.kind]++;
    return c;
  }, [releases]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {c.filterLabel}
          </span>
          {KIND_ORDER.map((kind) => (
            <FilterChip
              key={kind}
              kind={kind}
              label={c.kindLabels[kind] ?? KIND_META[kind].label}
              count={counts[kind]}
              enabled={enabled[kind]}
              onToggle={() =>
                setEnabled((prev) => ({ ...prev, [kind]: !prev[kind] }))
              }
            />
          ))}
        </div>
      )}

      <ol className="relative space-y-8 pl-8" {...props}>
        {/* Vertical rail */}
        <span
          aria-hidden="true"
          className="absolute left-3.5 top-2 bottom-2 w-px bg-border"
        />

        {releases.map((release, i) => {
          // Group changes by kind, in fixed order.
          const groups = new Map<ChangelogChangeKind, ChangelogChange[]>();
          for (const change of release.changes) {
            if (!enabled[change.kind]) continue;
            const list = groups.get(change.kind) ?? [];
            list.push(change);
            groups.set(change.kind, list);
          }
          const visibleGroups = KIND_ORDER.filter((k) => {
            const list = groups.get(k);
            return list && list.length > 0;
          }).filter((k) => !(hideEmptyKinds && (groups.get(k)?.length ?? 0) === 0));

          if (visibleGroups.length === 0) return null;

          return (
            <li key={`${release.version}-${i}`} className="relative">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[24px] top-1 inline-flex size-3.5 items-center justify-center rounded-full ring-2 ring-background",
                  release.pre ? "bg-amber-500" : "bg-primary",
                )}
              />
              <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {release.title ?? `v${release.version}`}
                </h3>
                {!release.title && (
                  <span className="font-mono text-sm text-muted-foreground">
                    {release.version}
                  </span>
                )}
                {release.tag && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
                    {release.tag}
                  </span>
                )}
                {release.pre && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    {c.preRelease}
                  </span>
                )}
                <time
                  dateTime={release.date}
                  className="ml-auto text-xs text-muted-foreground"
                >
                  {fmt(release.date)}
                </time>
              </header>

              <div className="mt-3 space-y-3">
                {visibleGroups.map((kind) => {
                  const meta = KIND_META[kind];
                  const items = groups.get(kind) ?? [];
                  return (
                    <div key={kind}>
                      <div
                        className={cn(
                          "mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          meta.pill,
                        )}
                      >
                        <Icon name={meta.icon} className="size-3" />
                        {c.kindLabels[kind] ?? meta.label}
                      </div>
                      <ul className="space-y-1 pl-1">
                        {items.map((change, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-sm text-foreground/90"
                          >
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                            <span className="leading-relaxed">
                              {change.href ? (
                                <a
                                  href={change.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-primary hover:underline"
                                >
                                  {change.text}
                                </a>
                              ) : (
                                change.text
                              )}
                              {change.author && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  , {change.author}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

ChangelogList.displayName = "ChangelogList";