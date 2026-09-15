/**
 * @fusorb/facet-components: ActivityFeed
 *
 * A chronological activity/event feed: icon, title, description, and
 * relative timestamp per item, with an optional grouping header per day.
 * Data-driven and fully customizable.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";

export interface ActivityItem {
  id: string;
  title: string;
  /** Optional secondary line. */
  description?: string;
  /** ISO timestamp. */
  timestamp: string;
  /** Semantic icon shown in the item's bubble. */
  icon?: IconName;
  /** Accent color for the icon bubble. Default: "var(--primary)". */
  accent?: string;
}

export interface ActivityFeedProps extends React.HTMLAttributes<HTMLUListElement> {
  items: ActivityItem[];
  /** Group items by calendar day. Default: true. */
  groupByDay?: boolean;
  /** Optional empty state. Default: "No activity yet." */
  emptyText?: string;
  /** Override the relative-time formatter (e.g. "2h ago"). Defaults to the exported `relativeTime`. */
  timeFormatter?: (iso: string, now?: Date) => string;
  /** Override the day-label formatter (e.g. "Today"). Defaults to the exported `dayLabel`. */
  dayLabelFormatter?: (iso: string, now?: Date) => string;
}

/** Format a timestamp as a relative time ("2h ago", "3d ago"). */
export function relativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now.getTime() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins <= 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** Day label for a timestamp ("Today", "Yesterday", or a date). */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * A chronological activity feed. Items render in order with an icon
 * bubble, title, description, and relative time, optionally grouped by
 * calendar day with day headers.
 */
export function ActivityFeed({
  items,
  groupByDay = true,
  emptyText = "No activity yet.",
  className,
  timeFormatter = relativeTime,
  dayLabelFormatter = dayLabel,
  ...props
}: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-center",
          className,
        )}
      >
        <Icon name="inbox" className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  let lastDay = "";
  const rows: React.ReactNode[] = [];

  for (const item of sorted) {
    const day = groupByDay ? dayLabelFormatter(item.timestamp) : "";
    if (groupByDay && day !== lastDay) {
      lastDay = day;
      rows.push(
        <p
          key={`day-${day}`}
          className="px-1 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {day}
        </p>,
      );
    }
    rows.push(
      <li key={item.id} className="flex gap-3 px-1 py-2">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `${item.accent ?? "var(--primary)"}1a`,
            color: item.accent ?? "var(--primary)",
          }}
          aria-hidden="true"
        >
          {item.icon ? <Icon name={item.icon} className="size-4" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {item.title}
            </p>
            <time className="shrink-0 text-xs text-muted-foreground">
              {timeFormatter(item.timestamp)}
            </time>
          </div>
          {item.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
      </li>,
    );
  }

  return (
    <ul className={cn("divide-y divide-border", className)} {...props}>
      {rows}
    </ul>
  );
}

ActivityFeed.displayName = "ActivityFeed";
