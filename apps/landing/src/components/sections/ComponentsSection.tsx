import * as React from "react";
import { cn, Pill } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import {
  ALL_COMPONENTS,
  COMPONENT_CATEGORIES_LIST,
} from "../../data/scratchpad.js";
import type { ComponentEntry } from "../../data/scratchpad.js";

const SEARCH_PLACEHOLDER = "Search components…";
const CATEGORY_COLORS: Record<string, string> = {
  Foundations: "text-emerald-400",
  Inputs: "text-sky-400",
  "Data Display": "text-blue-400",
  Feedback: "text-violet-400",
  Layout: "text-amber-400",
  "Ready-to-use": "text-pink-400",
  Motion: "text-green-400",
};

export function ComponentsSection() {
  const [category, setCategory] = React.useState("All");
  const [query, setQuery] = React.useState("");

  const categories = ["All", ...COMPONENT_CATEGORIES_LIST];

  const visible = React.useMemo(() => {
    return ALL_COMPONENTS.filter((c) => {
      const catMatch = category === "All" || c.category === category;
      const q = query.toLowerCase();
      const searchMatch =
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.pkg.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [category, query]);

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-8 py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-1">
          <Pill
            color="primary"
            indicator="icon"
            icon={<LightIcon name="boxes" size={12} />}
          >
            Components
          </Pill>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Building blocks for every surface
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            {ALL_COMPONENTS.length}+ components across {ALL_COMPONENTS.length}{" "}
            entries, all wired to the same design system and independently
            versionable.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-[2px] border border-border px-3 py-1.5 text-xs font-medium font-mono tracking-tighter transition-all hover:bg-panel-hover hover:text-text",
                  active
                    ? "border-accent bg-accent-dim text-accent"
                    : "bg-panel text-text-muted",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search + count */}
        <div className="mb-6 flex items-center justify-between">
          <input
            type="text"
            placeholder={SEARCH_PLACEHOLDER}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder-text-dim focus:outline-none"
          />
          <span className="text-xs text-text-dim">
            {visible.length} components
          </span>
        </div>

        {/* Component grid */}
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(152px,1fr))] gap-px overflow-hidden rounded-md border border-border bg-border"
          role="list"
        >
          {visible.map((c) => (
            <ComponentCard key={`${c.category}-${c.name}`} component={c} />
          ))}
          {visible.length === 0 && (
            <div className="col-span-full p-8 text-center text-sm text-text-muted">
              No components match your search.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ComponentCard({ component }: { component: ComponentEntry }) {
  const colorClass = CATEGORY_COLORS[component.category] ?? "text-text-dim";
  return (
    <div className="bg-panel p-3">
      <div className="text-sm font-medium text-foreground">
        {component.name}
      </div>
      <div className={cn("text-xs", colorClass)}>{component.pkg}</div>
    </div>
  );
}
