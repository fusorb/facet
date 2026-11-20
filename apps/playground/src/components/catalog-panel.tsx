import { useMemo, useState } from "react";
import { Input, Icon, Tabs, TabsList, TabsTrigger } from "@fusorb/facet-components";
import type { LabCatalog, LabItem, PlaygroundKind } from "../lib/lab.js";

export interface CatalogPanelProps {
  catalogs: Record<PlaygroundKind, LabCatalog>;
  activeKind: PlaygroundKind;
  onKindChange: (kind: PlaygroundKind) => void;
  selectedId: string;
  onSelect: (kind: PlaygroundKind, id: string) => void;
}

export function CatalogPanel({
  catalogs,
  activeKind,
  onKindChange,
  selectedId,
  onSelect,
}: CatalogPanelProps) {
  const [query, setQuery] = useState("");
  const catalog = catalogs[activeKind];

  const grouped = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const rows: LabItem[] = normalized
      ? catalog.items.filter(
          (item) =>
            item.name.toLowerCase().includes(normalized) ||
            item.id.toLowerCase().includes(normalized) ||
            item.summary.toLowerCase().includes(normalized) ||
            item.category.toLowerCase().includes(normalized),
        )
      : catalog.items;

    const byCategory = new Map<string, LabItem[]>();
    for (const item of rows) {
      const category = item.category || "general";
      const bucket = byCategory.get(category);
      if (bucket) bucket.push(item);
      else byCategory.set(category, [item]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [catalog.items, query]);

  const kinds = Object.keys(catalogs) as PlaygroundKind[];

  return (
    <div className="flex h-full flex-col gap-3">
      <Tabs value={activeKind} onValueChange={(v) => onKindChange(v as PlaygroundKind)}>
        <TabsList className="grid w-full grid-cols-3" aria-label="Playground kind">
          {kinds.map((kind) => (
            <TabsTrigger key={kind} value={kind} className="text-xs">
              {catalogs[kind].label}
              <span className="ml-1 text-muted-foreground">({catalogs[kind].items.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${catalog.label.toLowerCase()}...`}
          aria-label={`Search ${catalog.label}`}
          className="pl-8"
        />
      </div>

      <nav aria-label={`${catalog.label} catalog`} className="min-h-0 flex-1 overflow-y-auto">
        {grouped.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground">No items match "{query}".</p>
        )}
        {grouped.map(([category, rows]) => (
          <div key={category} className="mb-3">
            <h2 className="px-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {category}
            </h2>
            <ul className="space-y-0.5">
              {rows.map((item) => {
                const active = item.id === selectedId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="pg-catalog-item"
                      data-active={active}
                      aria-pressed={active}
                      onClick={() => onSelect(activeKind, item.id)}
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="pg-code-inline shrink-0" aria-hidden="true">
                        {item.exampleCount}
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
