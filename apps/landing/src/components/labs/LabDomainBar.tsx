import { useLabDomain, LAB_DOMAINS } from "../../lib/lab-domain.js";
import { cn } from "@fusorb/facet-components";
import { LabTag } from "./LabSurface.js";
import type { DomainId } from "../../lib/domain-config.js";

/**
 * In-lab domain preset explorer (mirrors the scratchpad's domain buttons).
 *
 * Wired to the shared `useDomain` switch, so toggling here or in the navbar
 * re-themes every lab in real time via `--domain-accent`.
 */
export function LabDomainBar({ className }: { className?: string }) {
  const { domain, switchDomain } = useLabDomain();

  return (
    <div
      className={cn(
        "mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <LabTag tone="dim">Domain</LabTag>
        {LAB_DOMAINS.map((d) => {
          const active = domain.id === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => switchDomain(d.id as DomainId)}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-lg border border-border/60",
                "px-3 py-1.5 text-xs font-medium transition-all hover:bg-secondary",
                active ? "text-foreground" : "text-muted-foreground",
              )}
              style={
                active
                  ? {
                      borderColor: d.accent,
                      boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${d.accent}`,
                    }
                  : undefined
              }
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: d.accent }}
                aria-hidden
              />
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 text-xs font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: domain.accent }}
            aria-hidden
          />
          <span>{domain.label}</span>
        </span>
        <span>·</span>
        <span className="text-muted-foreground/70">{domain.density}</span>
        <span>·</span>
        <span className="text-muted-foreground/70">
          {domain.authMethods.join(" · ")}
        </span>
      </div>
    </div>
  );
}
