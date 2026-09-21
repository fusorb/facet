import { CSSProperties, type ReactNode, useMemo, useState } from "react";
import { TOKEN_CATEGORIES } from "../data/scratchpad.js";
import type { TokenSpec } from "../data/scratchpad.js";
import { useLabDomain } from "../lib/lab-domain.js";
import { PageShell } from "../components/PageShell.js";
import { LabDomainBar, LabPanel, LabTag, CopyButton } from "../components/labs";
import { LightIcon } from "@fusorb/facet-components/light";
import { cn } from "@fusorb/facet-components";

export function TokensPage() {
  const { domain } = useLabDomain();
  const accent = domain.accent;
  const [category, setCategory] = useState(TOKEN_CATEGORIES[0]!.label);
  const [search, setSearch] = useState("");

  const active =
    TOKEN_CATEGORIES.find((c) => c.label === category) ?? TOKEN_CATEGORIES[0]!;

  const filtered = useMemo(
    () =>
      active.tokens.filter((t) =>
        (t.name + " " + t.cssVar + " " + t.value)
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [active, search],
  );

  return (
    <PageShell
      kicker={<LabTag tone="accent">Tokens</LabTag>}
      title="Token Inspector"
      description="Inspect the design tokens behind every surface. Switch domain above for live accent context."
    >
      <div
        className="lab"
        style={{ "--domain-accent": accent } as CSSProperties}
      >
        <LabDomainBar />

        <div className="flex flex-col gap-3">
          <LabTag tone="dim">Token library</LabTag>

          <div className="flex flex-wrap gap-1.5">
            {TOKEN_CATEGORIES.map((c) => {
              const isActive = category === c.label;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCategory(c.label)}
                  className={cn(
                    "rounded-lg border border-border/60 px-2.5 py-1 text-xs font-medium",
                    "hover:bg-secondary",
                    isActive
                      ? "border-transparent bg-secondary text-foreground"
                      : "text-muted-foreground",
                  )}
                  style={
                    isActive
                      ? {
                          background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <LightIcon
              name="search"
              size={14}
              className="absolute left-2.5 top-2.5 text-muted-foreground/60"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tokens..."
              className="w-full rounded-lg border border-border/60 bg-secondary/40 pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
        </div>

        <LabPanel className="lab-surface mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-14 px-3 py-2 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground/60">
                    sample
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground/60">
                    name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground/60">
                    variable
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground/60">
                    value
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-mono uppercase tracking-wider text-muted-foreground/60">
                    copy
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.cssVar} className="border-t border-border/40">
                    <td className="py-2 pl-3 pr-3">
                      {renderSample(t, active.label)}
                    </td>
                    <td className="py-2 font-medium text-foreground/90">
                      {t.name}
                    </td>
                    <td className="py-2 font-mono text-xs text-muted-foreground/70">
                      {t.cssVar}
                    </td>
                    <td className="py-2 font-mono text-xs text-muted-foreground/60">
                      {t.value}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <CopyButton value={t.cssVar} size="xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LabPanel>

        <div className="mt-4 text-xs text-muted-foreground/60">
          {filtered.length} of {active.tokens.length} tokens in{" "}
          <span style={{ color: accent }}>{active.label}</span>
        </div>
      </div>
    </PageShell>
  );
}

function renderSample(t: TokenSpec, category: string): ReactNode {
  switch (category) {
    case "Color":
      return (
        <span
          className="block h-5 w-5 rounded border border-border/30"
          style={{ background: t.value }}
        />
      );

    case "Typography":
      return (
        <span
          className="block text-2xl"
          style={{ fontFamily: t.value.replace(/"/g, "") }}
        >
          Aa
        </span>
      );

    case "Spacing":
      return (
        <span
          className="block h-2 w-10 rounded bg-muted"
          style={{ width: t.value }}
        />
      );

    case "Radius":
      return (
        <span
          className="block h-5 w-8 rounded"
          style={{ borderRadius: t.value }}
        />
      );

    case "Motion":
      return (
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase">
          <span className="lab-live block h-1.5 w-1.5 rounded-full" />
          {t.value}
        </span>
      );

    default:
      return <span className="block h-5 w-5 rounded bg-muted" />;
  }
}
