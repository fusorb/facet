import * as React from "react";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { extendedManifest } from "../lib/manifest.js";
import { isExtendedLayoutSlug } from "../lib/nav.js";
import { ComponentPreview } from "../components/previews.js";
import { ThemePreviewFrame } from "../components/ThemePreviewFrame.js";

/** Page-size choices (min 5, max 50). */
const PAGE_SIZE_OPTIONS = [5, 10, 12, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 12;
/** Manual column choices. Small screens always render 1 column. */
const GRID_COLUMNS = [3, 4, 5] as const;

/** Range of page numbers to show, e.g. [1, 2, "...", 4] for many pages. */
function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

type ViewMode = "grid" | "list";

/** True at the desktop (lg) breakpoint or wider (where the manual
 *  column control takes effect). */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function ComponentsPage() {
  // Only base UI primitives in the gallery. Auth/layout guide surfaces,
  // foundations, and ready-to-use extras have their own pages; base layout
  // components (Accordion, Tabs, ...) stay in the gallery.
  const allComponents = extendedManifest.filter(
    (entry) =>
      entry.category !== "foundations" &&
      entry.category !== "ready-to-use" &&
      entry.category !== "auth" &&
      !(entry.category === "layout" && isExtendedLayoutSlug(entry.slug)),
  );
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const [view, setView] = React.useState<ViewMode>("grid");
  const [columns, setColumns] = React.useState<number>(4);
  const [query, setQuery] = React.useState("");
  const isDesktop = useIsDesktop();

  // Local search scoped to this gallery (independent of the global
  // search palette in the topbar). Matches name + description.
  const components = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allComponents;
    return allComponents.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.slug.includes(q) ||
        entry.category.replace("-", " ").includes(q),
    );
  }, [allComponents, query]);

  const totalPages = Math.max(1, Math.ceil(components.length / perPage));

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Clamp the current page when the page size changes or the search
  // filter shrinks the result set (fewer pages now).
  React.useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  // Reset to page 1 when the search query changes.
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  // Alt + ArrowLeft/ArrowRight moves between pages.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      if (event.key === "ArrowLeft") {
        setPage((p) => Math.max(1, p - 1));
      } else {
        setPage((p) => Math.min(totalPages, p + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [totalPages]);

  const start = (page - 1) * perPage;
  const visible = components.slice(start, start + perPage);

  return (
    <article>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Components</h1>
          <p className="mt-2 text-muted-foreground">
            {query.trim()
              ? `${components.length} of ${allComponents.length} components match your search.`
              : `${components.length} styled Radix components. Each card shows a live preview by default; collapse it to show only the name. Click a component to see all its variants.`}
          </p>
        </div>

        {/* Local search for this gallery (not the global search palette). */}
        <div className="relative w-full max-w-xs">
          <LightIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search components..."
            aria-label="Search components"
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* View controls: grid/list toggle + dynamic grid columns */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(perPage)}
            onValueChange={(value) => setPerPage(Number(value))}
          >
            <SelectTrigger
              aria-label="Items per page"
              className="h-8 w-auto gap-2 text-xs font-medium"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {view === "grid" && isDesktop && (
            <div className="hidden items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 md:flex">
              {GRID_COLUMNS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setColumns(n)}
                  aria-pressed={columns === n}
                  aria-label={`${n} columns`}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    columns === n
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
              className={`rounded-md p-1.5 transition-colors ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <LightIcon name="grid" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
              className={`rounded-md p-1.5 transition-colors ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <LightIcon name="list" className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid view: 1 column on mobile, up to 3 on medium, up to 4-5 on
          large (the manual column control only affects large screens). */}
      {view === "grid" ? (
        <div
          className={`mt-6 grid grid-cols-1 gap-3 md:grid-cols-3 ${
            columns >= 5
              ? "lg:grid-cols-5"
              : columns === 4
                ? "lg:grid-cols-4"
                : "lg:grid-cols-3"
          }`}
        >
          {visible.map((entry) => (
            <ComponentCard
              key={entry.slug}
              slug={entry.slug}
              name={entry.name}
              description={entry.description}
            />
          ))}
        </div>
      ) : (
        /* List view: compact rows */
        <div className="mt-6 space-y-3">
          {visible.map((entry) => (
            <ComponentListRow
              key={entry.slug}
              slug={entry.slug}
              name={entry.name}
              description={entry.description}
            />
          ))}
        </div>
      )}

      {components.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <LightIcon name="search" className="size-8 text-muted-foreground/40" />
          <h3 className="text-base font-semibold text-foreground">No components found</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Nothing matches "{query.trim()}". Try a different name, slug, or category.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {components.length > 0 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                onClick={(event) => {
                  event.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page === 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
            {pageNumbers(page, totalPages).map((n, i) =>
              n === "ellipsis" ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={n === page}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === totalPages}
                onClick={(event) => {
                  event.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page === totalPages ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {components.length > 0 && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      )}
    </article>
  );
}

function ComponentCard({
  slug,
  name,
  description,
}: {
  slug: string;
  name: string;
  description: string;
}) {
  const [open, setOpen] = React.useState(true);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-border"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/60"
        >
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{name}</span>
            {description && (
              <span className="block truncate text-sm text-muted-foreground">{description}</span>
            )}
          </span>
          <LightIcon
            name="chevron-down"
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>

      {open && (
        <ThemePreviewFrame>
          <ComponentPreview slug={slug} />
        </ThemePreviewFrame>
      )}

      <CollapsibleContent>
        <div className="flex justify-end px-4 py-2">
          <Link
            to={`/components/${slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all variants →
          </Link>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ComponentListRow({
  slug,
  name,
  description,
}: {
  slug: string;
  name: string;
  description: string;
}) {
  return (
    <Link
      to={`/components/${slug}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-accent/40"
    >
      <span className="min-w-0">
        <span className="block font-semibold text-foreground">{name}</span>
        {description && (
          <span className="block truncate text-sm text-muted-foreground">{description}</span>
        )}
      </span>
      <span className="shrink-0 text-sm font-medium text-primary">View →</span>
    </Link>
  );
}
