/**
 * @fusorb/facet-layout: CommandPalette
 *
 * Framework-agnostic Ctrl+K command palette with a full-screen dialog
 * overlay (GitHub / VS Code style). Commands are derived dynamically
 * from LayoutConfig.navigation, so consumers get search over their
 * sidebar for free (one command per nav item, grouped by section title).
 *
 * The trigger is a search bar (icon + placeholder + "Ctrl K" badge).
 * Clicking it, or pressing Ctrl/Cmd+K, opens a Dialog overlay that
 * takes over the screen with the command list centered on top.
 *
 * Navigation is injected via `navigate` (defaults to window.location).
 * Pass your router's imperative navigate (e.g. react-router useNavigate)
 * for SPA navigation.
 *
 * Loading is async-capable: pass a `search` callback returning a Promise
 * and the dialog shows a Skeleton row while it resolves.
 */

import * as React from "react";
import {
  Dialog,
  DialogContent,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Skeleton,
  Kbd,
  getModSymbol,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Icon,
} from "@fusorb/facet-components";
import type { LayoutConfig, NavItem } from "./types.js";

/* ── Search history (persisted) ────────────────────────────── */

const HISTORY_KEY = "facet:search-history";
const HISTORY_MAX = 10;

function loadHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string").slice(0, HISTORY_MAX);
    }
  } catch {
    // Ignore corrupt history and start fresh.
  }
  return [];
}

function saveHistory(items: string[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    // Storage may be unavailable (private mode); history is best-effort.
  }
}

export interface CommandResult {
  /** Group heading, e.g. "Components". */
  group: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  keywords?: string[];
}

export interface CommandPaletteProps {
  config: LayoutConfig;
  /** Optional label shown in the empty search input. Default: "Search docs..." */
  placeholder?: string;
  /** Imperative navigation; defaults to window.location.href. */
  navigate?: (href: string) => void;
  /**
   * Async search. When provided, results replace the nav-derived commands
   * while loading (skeleton rows) then resolve to a grouped list.
   */
  search?: (query: string) => Promise<CommandResult[]>;
  /** Optional extra static commands shown above the nav groups. */
  quickActions?: CommandResult[];
  /** Controlled open state (defaults to internal state). */
  open?: boolean;
  /** Controlled open-state change (required when `open` is set). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Render the trigger button. Defaults to a search bar with a "Ctrl K"
   * badge. Pass `null` to hide the trigger (e.g. when the parent renders
   * its own button and only controls open state).
   */
  trigger?: ((props: { onClick: () => void }) => React.ReactNode) | null;
}

/** A flat command derived from a nav item (children flattened too). */
interface NavCommand {
  group: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  keywords?: string[];
}

function flattenNav(sections: LayoutConfig["navigation"]): NavCommand[] {
  const commands: NavCommand[] = [];
  const walk = (items: NavItem[], group: string) => {
    for (const item of items) {
      commands.push({
        group,
        label: item.label,
        href: item.href,
        icon: item.icon,
        keywords: [item.label.toLowerCase()],
      });
      if (item.children?.length) walk(item.children, group);
    }
  };
  for (const section of sections) walk(section.items, section.title);
  return commands;
}

export function CommandPalette({
  config,
  placeholder = "Search docs...",
  navigate = (href) => {
    if (typeof window !== "undefined") window.location.href = href;
  },
  search,
  quickActions,
  open: openProp,
  onOpenChange,
  trigger,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp !== undefined) {
        onOpenChange?.(next);
      } else {
        setInternalOpen(next);
      }
    },
    [openProp, onOpenChange],
  );
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [asyncResults, setAsyncResults] = React.useState<CommandResult[] | null>(null);
  const [history, setHistory] = React.useState<string[]>(() =>
    typeof window !== "undefined" ? loadHistory() : [],
  );
  const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);

  // Persist history on change.
  React.useEffect(() => {
    if (typeof window !== "undefined") saveHistory(history);
  }, [history]);

  const commands = React.useMemo(() => flattenNav(config.navigation), [config.navigation]);

  // Add a query to the recent-searches list (deduped, most recent first).
  const addToHistory = React.useCallback((term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    setHistory((prev) => [cleaned, ...prev.filter((item) => item !== cleaned)].slice(0, HISTORY_MAX));
  }, []);

  const removeFromHistory = React.useCallback((term: string) => {
    setHistory((prev) => prev.filter((item) => item !== term));
  }, []);

  // Group nav commands by section title (stable order).
  const grouped = React.useMemo(() => {
    const map = new Map<string, NavCommand[]>();
    for (const c of commands) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return Array.from(map.entries());
  }, [commands]);

  // Ctrl/Cmd+K opens the dialog. Ignored while typing in an editable.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  // Reset the query each time the dialog opens.
  React.useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  // Filter static nav commands by query (case-insensitive, keyword-aware).
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    return grouped
      .map(([group, items]) => [
        group,
        items.filter(
          (c) =>
            c.label.toLowerCase().includes(q) ||
            c.keywords?.some((k) => k.includes(q)),
        ),
      ] as const)
      .filter(([, items]) => items.length > 0);
  }, [grouped, query]);

  // Async search: debounce 200ms, show skeleton while resolving.
  React.useEffect(() => {
    if (!search) return;
    if (!query.trim()) {
      setAsyncResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const results = await search(query);
        setAsyncResults(results);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (href: string) => {
    // Record the search term before navigating (only non-empty queries).
    if (query.trim()) addToHistory(query);
    setOpen(false);
    setQuery("");
    navigate(href);
  };

  const renderQuickActions = () =>
    quickActions && quickActions.length > 0 ? (
      <>
        <CommandGroup heading="Quick actions">
          {quickActions.map((qa) => (
            <CommandItem key={qa.label} onSelect={() => handleSelect(qa.href)}>
              {qa.icon}
              {qa.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
      </>
    ) : null;

  // Recent searches: shown only when the input is empty. Each row has a
  // trash button to delete that entry, and a "Clear history" action opens
  // a confirmation dialog.
  const renderRecentSearches = () => {
    if (query.trim() !== "" || history.length === 0) return null;
    return (
      <>
        <CommandGroup heading="Recent searches">
          {history.map((term) => (
            <CommandItem
              key={term}
              onSelect={() => setQuery(term)}
              className="relative pr-8"
            >
              <span className="min-w-0 truncate">{term}</span>
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Delete search "${term}"`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromHistory(term);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-muted-foreground opacity-60 transition-opacity hover:bg-accent hover:text-foreground hover:opacity-100"
              >
                <Icon name="trash" className="size-3.5" />
              </button>
            </CommandItem>
          ))}
          <CommandItem
            onSelect={() => setConfirmClearOpen(true)}
            className="text-xs text-muted-foreground"
          >
            Clear history
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
      </>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="p-3">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
      );
    }

    if (asyncResults && asyncResults.length > 0) {
      return (
        <>
          {renderRecentSearches()}
          {renderQuickActions()}
          {groupResults(asyncResults, handleSelect)}
        </>
      );
    }

    return (
      <>
        {renderRecentSearches()}
        {renderQuickActions()}
        {filtered.map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
                keywords={item.keywords}
              >
                {item.icon}
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </>
    );
  };

  const defaultTrigger = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-40 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground sm:w-64"
    >
      <Icon name="search" className="size-4 shrink-0" />
      <span className="flex-1 truncate text-left">{placeholder}</span>
      <Kbd className="hidden items-center gap-0.5 border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline-flex">
        {getModSymbol()} K
      </Kbd>
    </button>
  );

  return (
    <>
      {trigger === null
        ? null
        : trigger
          ? trigger({ onClick: () => setOpen(true) })
          : defaultTrigger({ onClick: () => setOpen(true) })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] max-w-[640px] translate-y-0 gap-0 overflow-hidden p-0 sm:rounded-xl">
          <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5">
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[50vh]">
              <CommandEmpty>No results found.</CommandEmpty>
              {renderResults()}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Clear-history confirmation */}
      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent variant="destructive">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear search history?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all {history.length} recent {history.length === 1 ? "search" : "searches"}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setHistory([]);
                setConfirmClearOpen(false);
              }}
            >
              Clear history
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function groupResults(
  results: CommandResult[],
  onSelect: (href: string) => void,
) {
  const map = new Map<string, CommandResult[]>();
  for (const r of results) {
    if (!map.has(r.group)) map.set(r.group, []);
    map.get(r.group)!.push(r);
  }
  return Array.from(map.entries()).map(([group, items]) => (
    <CommandGroup key={group} heading={group}>
      {items.map((item) => (
        <CommandItem
          key={item.href}
          onSelect={() => onSelect(item.href)}
          keywords={item.keywords}
        >
          {item.icon}
          {item.label}
        </CommandItem>
      ))}
    </CommandGroup>
  ));
}
