/**
 * DomainToggle - a pill-group selector that switches the active landing
 * domain.  Reads its label/availability data from the DomainContext, so
 * adding a new domain to domain-config.ts is all it takes to extend it.
 *
 * On narrow viewports it collapses to a compact "Domain: <current>" button
 * that opens a Popover menu.
 */

import { useState } from "react";
import { cn } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useDomain } from "../lib/domain-context.js";
import type { DomainId } from "../lib/domain-config.js";

export function DomainToggle({ compact = false }: { compact?: boolean }) {
  const { domainId, availableDomains, switchDomain } = useDomain();

  if (compact) {
    return (
      <DomainSelect
        domains={availableDomains}
        activeId={domainId}
        onChange={(id) => switchDomain(id as DomainId)}
      />
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted/40 p-1 text-xs font-medium text-muted-foreground/60">
      {availableDomains.map((d) => {
        const active = d.id === domainId;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => switchDomain(d.id)}
            className={cn(
              "rounded-xs px-3 py-1.5 capitalize transition-all duration-200",
              "hover:text-foreground hover:bg-muted",
              active &&
                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
            )}
            aria-pressed={active}
            aria-label={`Switch to ${d.name} domain`}
          >
            {d.name}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Compact dropdown for narrow screens ──────────────────────────── */

function DomainSelect({
  domains,
  activeId,
  onChange,
}: {
  domains: { id: string; name: string }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = domains.find((d) => d.id === activeId);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-input",
          "bg-background px-3 py-1.5 text-xs font-medium text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>Domain: {active?.name}</span>
        <LightIcon
          name="chevron-down"
          size={12}
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full right-0 z-20 mt-1 w-40 rounded-md border border-border",
            "bg-popover p-1 text-popover-foreground shadow-lg",
          )}
          role="menu"
        >
          {domains.map((d) => {
            const isActive = d.id === activeId;
            return (
              <button
                key={d.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(d.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full rounded-sm px-2 py-1.5 text-left text-xs capitalize",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary font-medium",
                )}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
