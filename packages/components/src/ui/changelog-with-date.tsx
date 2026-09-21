/**
 * @fusorb/facet-components: ChangelogWithDate
 *
 * A date-grouped changelog inspired by Lovable's release notes.  Releases
 * are bucketed by year (or month) with a sticky year axis on the left and
 * a vertical timeline in the main column.  Each release card shows version,
 * date, tag chips, and change bullets grouped by kind — reusing the same
 * kind icons and colours as ChangelogList.
 *
 * Usage:
 *   <ChangelogWithDate
 *     releases={facetChangelog}
 *     groupBy="year"
 *     showFilter
 *   />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";
import {
  ChangelogChange,
  ChangelogChangeKind,
  ChangelogListCopy,
  ChangelogRelease,
  KIND_META,
  KIND_ORDER,
  FilterChip,
  defaultChangelogCopy,
  defaultFormatDate,
} from "./changelog-list.js";

export interface ChangelogWithDateProps extends React.HTMLAttributes<HTMLDivElement> {
  releases: ChangelogRelease[];
  /** Bucket releases by year or by month. @default "year" */
  groupBy?: "year" | "month";
  /** Show a filter row at the top (toggle each kind on/off). @default false */
  showFilter?: boolean;
  /** Hide releases whose kinds are all toggled off. @default true */
  hideEmptyKinds?: boolean;
  /** Override user-visible text strings. */
  copy?: Partial<ChangelogListCopy>;
  /** Custom date formatter. */
  formatDate?: (date: string) => string;
}

interface YearGroup {
  label: string;
  year: string;
  releases: ChangelogRelease[];
}

const kindEnabledDefault: Record<ChangelogChangeKind, boolean> = {
  added: true,
  changed: true,
  fixed: true,
  removed: true,
  deprecated: true,
  security: true,
};

function extractDate(date: string): Date | null {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

function groupReleases(
  releases: ChangelogRelease[],
  groupBy: "year" | "month",
): YearGroup[] {
  const map = new Map<string, ChangelogRelease[]>();

  for (const r of releases) {
    const d = extractDate(r.date);
    if (!d) {
      // Fallback: bucket unparseable dates under "Unknown".
      const arr = map.get("Unknown") ?? [];
      arr.push(r);
      map.set("Unknown", arr);
      continue;
    }
    const key =
      groupBy === "month"
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        : String(d.getFullYear());
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }

  return Array.from(map.entries())
    .map(([key, rels]) => {
      const label =
        groupBy === "month" && key !== "Unknown"
          ? new Date(key + "-01").toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
            })
          : key;
      return {
        label,
        year: key === "Unknown" ? "Unknown" : key.slice(0, 4),
        releases: rels,
      };
    })
    .sort((a, b) => b.label.localeCompare(a.label));
}

function ReleaseNode({
  release,
  idx,
  fmt,
  c,
  enabled,
  hideEmptyKinds,
}: {
  release: ChangelogRelease;
  idx: number;
  fmt: (date: string) => string;
  c: ChangelogListCopy;
  enabled: Record<ChangelogChangeKind, boolean>;
  hideEmptyKinds: boolean;
}) {
  // Group visible changes by kind in the canonical order.
  const groups = new Map<ChangelogChangeKind, ChangelogChange[]>();
  for (const change of release.changes) {
    if (!enabled[change.kind]) continue;
    const arr = groups.get(change.kind) ?? [];
    arr.push(change);
    groups.set(change.kind, arr);
  }

  const visibleKinds = KIND_ORDER.filter((k) => {
    const arr = groups.get(k);
    if (!arr || arr.length === 0) return false;
    if (hideEmptyKinds) return arr.length > 0;
    return true;
  });

  if (visibleKinds.length === 0) return null;

  return (
    <li key={`${release.version}-${idx}`} className="relative mb-4 last:mb-0">
      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[24px] top-1 inline-flex size-3.5 items-center justify-center rounded-full ring-2 ring-background",
          release.pre ? "bg-warning" : "bg-primary",
        )}
      />

      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-heading text-base font-semibold text-foreground">
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
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
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

      <div className="mt-2 space-y-2.5">
        {visibleKinds.map((kind) => {
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
                          {" "}
                          · {change.author}
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
}

/**
 * A date-grouped changelog with a sticky year axis, inspired by Lovable's
 * release-notes layout.
 */
export function ChangelogWithDate({
  releases,
  groupBy = "year",
  showFilter = false,
  hideEmptyKinds = true,
  copy,
  formatDate: formatDateProp,
  className,
  ...props
}: ChangelogWithDateProps) {
  const c = { ...defaultChangelogCopy, ...copy };
  const fmt = formatDateProp ?? defaultFormatDate;
  const [enabled, setEnabled] =
    React.useState<Record<ChangelogChangeKind, boolean>>(kindEnabledDefault);

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

  const groups = React.useMemo(
    () => groupReleases(releases, groupBy),
    [releases, groupBy],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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

      <div className="relative flex gap-4">
        {/* Vertical rail */}
        <span
          aria-hidden="true"
          className="absolute left-[13px] top-2 bottom-2 w-px bg-border"
        />

        {/* Year / month axis — sticky labels */}
        <div className="sticky top-4 flex h-max w-16 flex-shrink-0 justify-end self-start">
          {groups.map((g) => (
            <span
              key={g.label}
              className="text-xs font-medium text-muted-foreground"
            >
              {g.label}
            </span>
          ))}
        </div>

        {/* Release timeline */}
        <ol className="relative flex-1 pl-[22px]">
          {groups.map((g) => (
            <li key={g.label} className="mb-6 last:mb-0">
              <div className="mb-3 sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {g.label}
                </h3>
              </div>
              <ul className="space-y-1">
                {g.releases.map((release, idx) => (
                  <ReleaseNode
                    key={`${release.version}-${idx}`}
                    release={release}
                    idx={idx}
                    fmt={fmt}
                    c={c}
                    enabled={enabled}
                    hideEmptyKinds={hideEmptyKinds}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      {releases.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No changelog entries to display.
        </p>
      )}
    </div>
  );
}

ChangelogWithDate.displayName = "ChangelogWithDate";
