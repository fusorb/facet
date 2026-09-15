import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";
import { Button } from "./button.js";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./sheet.js";
import { ScrollArea } from "./scroll-area.js";

/* ── Types ─────────────────────────────────────────────────── */

export type NotificationType =
  "default" | "success" | "warning" | "error" | "info";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  time?: string;
  read?: boolean;
  type?: NotificationType;
  /** Optional element rendered at the start (avatar, icon, etc.) */
  icon?: React.ReactNode;
  /** Callback when a single notification is clicked */
  onClick?: (notification: Notification) => void;
}

export interface NotificationDrawerProps {
  /** List of notifications */
  notifications?: Notification[];
  /** Total unread count (defaults to counting unread from notifications) */
  unreadCount?: number;
  /** Called when a notification is clicked */
  onNotificationClick?: (notification: Notification) => void;
  /** Called when "Mark all as read" is clicked */
  onMarkAllRead?: () => void;
  /** Called when a single notification is marked read */
  onMarkRead?: (notification: Notification) => void;
  /** Called with the ids of a bulk "mark read" (when several are selected) */
  onMarkReadMany?: (ids: string[]) => void;
  /** Called when a notification is dismissed (remove from list) */
  onDismiss?: (notification: Notification) => void;
  /** Called when a notification is deleted (hard remove, distinct from dismiss) */
  onDelete?: (notification: Notification) => void;
  /** Called with the ids of a bulk delete (when several are selected) */
  onDeleteMany?: (ids: string[]) => void;
  /** Show the toolbar (search + filter + actions). Default: true when any
   *  of onSearchChange/onFilterChange/onMarkAllRead/onDelete is provided. */
  showToolbar?: boolean;
  /** Controlled search query (defaults to internal state). */
  search?: string;
  /** Called when the search box changes. */
  onSearchChange?: (query: string) => void;
  /** Controlled read filter. Default: "all". */
  filter?: "all" | "unread";
  /** Called when the read filter changes. */
  onFilterChange?: (filter: "all" | "unread") => void;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Drawer side */
  side?: "left" | "right";
  /** Show a footer with "View all" action */
  showFooter?: boolean;
  /** Called when "View all" is clicked */
  onViewAll?: () => void;
  /** Empty state content */
  emptyState?: React.ReactNode;
  /** Panel header content override */
  header?: React.ReactNode;
  /** Extra className for the wrapper. */
  className?: string;
  /** Override user-visible strings. All keys fall back to English defaults. */
  copy?: Partial<NotificationDrawerCopy>;
}

/* ── Copy ────────────────────────────────────────────────── */

export interface NotificationDrawerCopy {
  /** Drawer title / trigger aria-label. Default: "Notifications". */
  title: string;
  /** Suffix shown when there are unread items, e.g. "(3 unread)". Default: "unread". */
  unreadCountSuffix: string;
  /** Search box placeholder. */
  searchPlaceholder: string;
  /** Suffix for the selected-count pill, e.g. "selected". */
  selectedSuffix: string;
  /** "Mark all as read" bulk button. */
  markAllRead: string;
  /** "Mark read" bulk action button. */
  markRead: string;
  /** "Delete" bulk action button. */
  bulkDelete: string;
  /** "Cancel" bulk selection button. */
  cancel: string;
  /** "all" filter tab label. */
  filterAll: string;
  /** "unread" filter tab label. */
  filterUnread: string;
  /** Empty state when there are no notifications. */
  noNotifications: string;
  /** Empty state when search yields no results. */
  noNotificationsMatch: string;
  /** Prefix for the per-item checkbox aria-label ("Select {title}"). */
  selectPrefix: string;
  /** Prefix for the per-item delete aria-label ("Delete {title}"). */
  deletePrefix: string;
  /** Prefix for the per-item dismiss aria-label ("Dismiss {title}"). */
  dismissPrefix: string;
  /** Footer "View all" button text. */
  viewAll: string;
}

const defaultCopy: NotificationDrawerCopy = {
  title: "Notifications",
  unreadCountSuffix: "unread",
  searchPlaceholder: "Search notifications...",
  selectedSuffix: "selected",
  markAllRead: "Mark all read",
  markRead: "Mark read",
  bulkDelete: "Delete",
  cancel: "Cancel",
  filterAll: "all",
  filterUnread: "unread",
  noNotifications: "No notifications",
  noNotificationsMatch: "No notifications match.",
  selectPrefix: "Select",
  deletePrefix: "Delete",
  dismissPrefix: "Dismiss",
  viewAll: "View all notifications",
};

/* ── Type styling ──────────────────────────────────────────── */

const typeStyles: Record<NotificationType, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
  info: "text-primary",
};

/* ── Component ─────────────────────────────────────────────── */

export function NotificationDrawer({
  notifications = [],
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
  onMarkRead,
  onMarkReadMany,
  onDismiss,
  onDelete,
  onDeleteMany,
  showToolbar,
  search: searchProp,
  onSearchChange,
  filter: filterProp,
  onFilterChange,
  trigger,
  side = "right",
  showFooter = true,
  onViewAll,
  emptyState,
  header,
  className,
  copy,
}: NotificationDrawerProps) {
  const c = { ...defaultCopy, ...copy };
  const [internalSearch, setInternalSearch] = React.useState("");
  const [internalFilter, setInternalFilter] = React.useState<"all" | "unread">(
    "all",
  );
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const search = searchProp ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;
  const filter = filterProp ?? internalFilter;
  const setFilter = onFilterChange ?? setInternalFilter;

  const count =
    unreadCount ?? notifications.filter((n) => n.read !== true).length;

  // Toolbar is shown when explicitly requested OR any action/search/filter
  // handler is wired (so a bare drawer stays clean).
  const toolbarEnabled =
    showToolbar ??
    Boolean(
      onSearchChange ||
      onFilterChange ||
      onMarkAllRead ||
      onMarkReadMany ||
      onDelete ||
      onDeleteMany,
    );

  const handleClick = (n: Notification) => {
    if (n.read !== true) onMarkRead?.(n);
    onNotificationClick?.(n);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Bulk helpers: prefer the dedicated bulk callbacks, else fan out the
  // single-item ones so a consumer wiring just onMarkRead/onDelete gets
  // bulk actions for free.
  const bulkMarkRead = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (onMarkReadMany) onMarkReadMany(ids);
    else
      notifications
        .filter((n) => ids.includes(n.id))
        .forEach((n) => onMarkRead?.(n));
    clearSelection();
  };

  const bulkDelete = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (onDeleteMany) onDeleteMany(ids);
    else
      notifications
        .filter((n) => ids.includes(n.id))
        .forEach((n) => onDelete?.(n));
    clearSelection();
  };

  // Filter by read state + search across title/description.
  const q = search.trim().toLowerCase();
  const visible = notifications.filter((n) => {
    if (filter === "unread" && n.read !== false) return false;
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      (n.description ?? "").toLowerCase().includes(q)
    );
  });
  const hasUnread = notifications.some((n) => n.read !== true);
  const selecting = selectedIds.size > 0;

  return (
    <Sheet onOpenChange={(open) => !open && clearSelection()}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`${c.title}${count > 0 ? ` (${count} ${c.unreadCountSuffix})` : ""}`}
          >
            <Icon name="bell" className="size-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side={side}
        className={cn("flex w-full flex-col p-0 sm:max-w-sm", className)}
      >
        {header ?? (
          <SheetHeader className="flex flex-row items-center justify-between gap-4 border-b px-4 py-3">
            <SheetTitle>{c.title}</SheetTitle>
          </SheetHeader>
        )}

        {toolbarEnabled && notifications.length > 0 && (
          <div className="flex flex-col gap-2 border-b px-4 py-2">
            {/* Search */}
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={c.searchPlaceholder}
                className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-2.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {selecting ? (
              /* Bulk action bar: replaces the filter row while items are selected */
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">
                  {selectedIds.size} {c.selectedSuffix}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={bulkMarkRead}
                    className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-accent hover:text-accent-foreground"
                  >
                    {c.markRead}
                  </button>
                  {(onDelete || onDeleteMany) && (
                    <button
                      type="button"
                      onClick={bulkDelete}
                      className="rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      {c.bulkDelete}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {c.cancel}
                  </button>
                </div>
              </div>
            ) : (
              /* Filter + single mark-all */
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                  {(["all", "unread"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      aria-pressed={filter === f}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium capitalize transition-colors",
                        filter === f
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {f === "all" ? c.filterAll : c.filterUnread}
                    </button>
                  ))}
                </div>
                {onMarkAllRead && hasUnread && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {c.markAllRead}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {notifications.length === 0 ? (
          (emptyState ?? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <Icon name="bell" className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {c.noNotifications}
              </p>
            </div>
          ))
        ) : visible.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {c.noNotificationsMatch}
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
              {visible.map((n) => {
                const iconColor = typeStyles[n.type ?? "default"];
                const isSelected = selectedIds.has(n.id);
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "group relative flex cursor-pointer gap-3 rounded-lg py-2.5 pl-2 pr-2 text-left text-sm transition-colors hover:bg-accent",
                      n.read === false && "bg-accent/50",
                      isSelected && "bg-accent",
                    )}
                    onClick={() => handleClick(n)}
                  >
                    {/* Selection checkbox: appears on hover (LinkedIn-style),
                        persistent while the drawer is open. Always clickable
                        (touch devices + tests), subtly visible by default. */}
                    <span
                      className={cn(
                        "flex shrink-0 items-center pt-px transition-opacity",
                        isSelected
                          ? "opacity-100"
                          : "opacity-50 group-hover:opacity-100",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(n.id)}
                        aria-label={`${c.selectPrefix} ${n.title}`}
                        className="size-4 accent-[var(--primary)]"
                      />
                    </span>

                    {/* Icon slot (aligned with the title line) */}
                    {n.icon ? (
                      <span className={cn("mt-px size-4 shrink-0", iconColor)}>
                        {n.icon}
                      </span>
                    ) : null}

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={cn(
                            "font-medium text-foreground",
                            n.read === false && "pr-1",
                          )}
                        >
                          {n.title}
                        </p>
                        {n.time && (
                          <span className="shrink-0 whitespace-nowrap text-[10px] text-muted-foreground/60">
                            {n.time}
                          </span>
                        )}
                      </div>
                      {n.description && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {n.description}
                        </p>
                      )}
                    </div>

                    {/* Per-row actions (delete/dismiss) */}
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(n);
                          }}
                          aria-label={`${c.deletePrefix} ${n.title}`}
                          className="rounded-sm p-1 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Icon name="trash" className="size-4" />
                        </button>
                      )}
                      {onDismiss && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(n);
                          }}
                          aria-label={`${c.dismissPrefix} ${n.title}`}
                          className="rounded-sm p-1 text-muted-foreground/50 hover:bg-muted hover:text-foreground"
                        >
                          <Icon name="close" className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {showFooter && notifications.length > 0 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={onViewAll}
            >
              {c.viewAll}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

NotificationDrawer.displayName = "NotificationDrawer";
