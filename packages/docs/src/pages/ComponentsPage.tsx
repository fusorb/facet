import * as React from "react";
import { Link } from "react-router-dom";
import { useDocsDataSource } from "../context.js";
import { PageNav } from "../components/Guide.js";
import { useDocsKeyboardNav, useDocsNavigation } from "../lib/keyboard-nav.js";

export function ComponentsPage() {
  const { prev, next } = useDocsNavigation();
  useDocsKeyboardNav();
  const dataSource = useDocsDataSource();
  const items = React.useMemo(
    () => dataSource?.getComponentManifest?.() ?? [],
    [dataSource],
  );
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.slug.includes(q) ||
        (e.category ?? "").toLowerCase().includes(q) ||
        (e.summary ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <article>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Components</h1>
          <p className="mt-2 text-muted-foreground">
            {items.length} components from the registry with live previews.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            aria-label="Search components"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <h3 className="text-base font-semibold text-foreground">No components found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing matches &quot;{query.trim()}&quot;.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => {
            const preview = dataSource?.getComponentPreview?.(entry.slug);
            return (
              <Link
                key={entry.slug}
                to={`/components/${entry.slug}`}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary">
                    {entry.name}
                  </h2>
                  {entry.package ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {entry.package.replace("@fusorb/facet-", "")}
                    </span>
                  ) : null}
                </div>
                {entry.summary ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {entry.summary}
                  </p>
                ) : null}
                <div className="mt-3 flex min-h-[80px] items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20 p-3">
                  {preview ?? (
                    <span className="text-xs text-muted-foreground">Open for details</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <PageNav
        prev={prev ? { label: prev.label, to: prev.path } : undefined}
        next={next ? { label: next.label, to: next.path } : undefined}
      />
    </article>
  );
}
