import { useMemo, useState } from "react";
import { Input, Icon } from "@fusorb/facet-components";
import type { ComponentEntry } from "@fusorb/facet-registry";
import type { Example } from "@fusorb/facet-sandbox/core";

export interface CatalogPanelProps {
  components: ComponentEntry[];
  examplesBySlug: Record<string, Example<Record<string, unknown>>[]>;
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

export function CatalogPanel({
  components,
  examplesBySlug,
  selectedSlug,
  onSelect,
}: CatalogPanelProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const rows = normalized
      ? components.filter(
          (component) =>
            component.name.toLowerCase().includes(normalized) ||
            component.slug.includes(normalized) ||
            component.summary.toLowerCase().includes(normalized),
        )
      : components;

    const byCategory = new Map<string, ComponentEntry[]>();
    for (const component of rows) {
      const category = component.category || "components";
      const bucket = byCategory.get(category);
      if (bucket) bucket.push(component);
      else byCategory.set(category, [component]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [components, query]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search components..."
          aria-label="Search components"
          className="pl-8"
        />
      </div>

      <nav aria-label="Component catalog" className="min-h-0 flex-1 overflow-y-auto">
        {grouped.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground">No components match "{query}".</p>
        )}
        {grouped.map(([category, rows]) => (
          <div key={category} className="mb-3">
            <h2 className="px-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {category}
            </h2>
            <ul className="space-y-0.5">
              {rows.map((component) => {
                const active = component.slug === selectedSlug;
                const exampleCount = examplesBySlug[component.slug]?.length ?? 0;
                return (
                  <li key={component.slug}>
                    <button
                      type="button"
                      className="pg-catalog-item"
                      data-active={active}
                      aria-pressed={active}
                      onClick={() => onSelect(component.slug)}
                    >
                      <span className="truncate">{component.name}</span>
                      <span className="pg-code-inline shrink-0" aria-hidden="true">
                        {exampleCount}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
