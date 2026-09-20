import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ALL_COMPONENTS } from "../data/scratchpad.js";
import { useLabDomain } from "../lib/lab-domain.js";
import { PageShell } from "../components/PageShell.js";
import {
  LabDomainBar,
  LabTag,
  CodeLine,
  CopyButton,
} from "../components/labs";
import { LightIcon } from "@fusorb/facet-components/light";
import { cn } from "@fusorb/facet-components";

function pkgLabel(pkg: string): string {
  return pkg === "@fusorb/facet-motion" ? "facet-motion" : "facet-components";
}

function categoryLabel(cat: string): string {
  return cat === "all"
    ? "All"
    : cat.charAt(0).toUpperCase() + cat.slice(1);
}

function importSegments(name: string, pkg: string) {
  return [
    { text: "import ", role: "keyword" as const },
    { text: "{ ", role: "dim" as const },
    { text: name, role: "ident" as const },
    { text: " } ", role: "dim" as const },
    { text: "from ", role: "keyword" as const },
    { text: `"${pkg}"`, role: "string" as const },
    { text: ";", role: "dim" as const },
  ];
}

export function ComponentsPage() {
  const { domain } = useLabDomain();
  const accent = domain.accent;
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () =>
      ["all", ...new Set(ALL_COMPONENTS.map((c) => c.category))] as string[],
    [],
  );

  const filtered = useMemo(() => {
    return ALL_COMPONENTS.filter((c) => {
      const matchesCategory =
        category === "all" || c.category === category;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const rootStyle: CSSProperties = { "--domain-accent": accent } as CSSProperties;

  return (
    <PageShell
      kicker={<LabTag tone="accent">Components</LabTag>}
      title="Component Catalog"
      description="Composable building blocks wired to the facet SDK: search by category or name and copy ready-to-use imports."
    >
      <div className="lab" style={rootStyle}>
        <LabDomainBar />

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <LabTag>Density</LabTag>
          {categories.map((c) => {
            const active = c === category;
            const isAccent = c === "all";
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "text-foreground"
                    : "border-border/60 text-muted-foreground hover:bg-secondary",
                )}
                style={
                  active && isAccent
                    ? {
                        borderColor: accent,
                        boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${accent}`,
                      }
                    : active
                      ? { borderColor: accent, boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${accent}` }
                      : undefined
                }
              >
                {categoryLabel(c)}
              </button>
            );
          })}
        </div>

        <div className="relative rounded-xl border border-border/60 bg-card">
          <div className="relative px-3 pt-2">
            <LightIcon
              name="search"
              size={14}
              className="absolute left-3 top-2.5 text-muted-foreground/60"
            />
            <input
              type="search"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-0 bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    Component
                  </th>
                  <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    Package
                  </th>
                  <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    Import
                  </th>
                  <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    Copy
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No components match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.name}
                      className="border-b border-border/40 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {c.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-xs font-mono"
                          style={{
                            color:
                              c.pkg === "@fusorb/facet-motion"
                                ? "var(--amber)"
                                : "var(--primary)",
                          }}
                        >
                          {pkgLabel(c.pkg)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs text-muted-foreground">
                          <CodeLine segments={importSegments(c.name, c.pkg)} />
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <CopyButton
                          value={`import { ${c.name} } from "${c.pkg}";`}
                          size="xs"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground/70">
            {filtered.length} component{filtered.length === 1 ? "" : "s"} of{" "}
            {ALL_COMPONENTS.length}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
