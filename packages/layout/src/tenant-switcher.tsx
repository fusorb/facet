/**
 * @fusorb/facet-layout: Tenant Switcher
 *
 * Select dropdown for switching between organisations/tenants.
 * Auto-hidden when there's only one tenant.
 * Consumer provides the data (typically loaded via ArcProvider onSessionRestore).
 */

import * as React from "react";
import type { TenantReference } from "./types.js";

export interface TenantSwitcherProps {
  tenants: TenantReference[];
  activeTenant: TenantReference | null;
  onSwitch: (tenantId: string) => void;
  /**
   * Customize a tenant list item. Receives the tenant + a `selectTenant`
   * handler (switch + close); defaults to the built-in button.
   */
  renderTenant?: (
    tenant: TenantReference,
    selectTenant: (tenant: TenantReference) => void,
  ) => React.ReactNode;
}

/** Default tenant item: built-in button with name + optional plan badge. */
function DefaultTenant({
  tenant,
  activeTenant,
  selectTenant,
}: {
  tenant: TenantReference;
  activeTenant: TenantReference | null;
  selectTenant: (tenant: TenantReference) => void;
}) {
  return (
    <button
      onClick={() => selectTenant(tenant)}
      className={`flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm ${
        tenant.id === activeTenant?.id
          ? "bg-accent text-accent-foreground"
          : "text-foreground/80 hover:bg-accent"
      }`}
    >
      <span className="size-1.5 rounded-full bg-primary" />
      <span>{tenant.name}</span>
      {tenant.plan && (
        <span className="ml-auto text-[10px] uppercase text-muted-foreground">
          {tenant.plan}
        </span>
      )}
    </button>
  );
}

export function TenantSwitcher({
  tenants,
  activeTenant,
  onSwitch,
  renderTenant,
}: TenantSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  // Auto-hide when there's 0 or 1 tenants
  if (tenants.length <= 1) return null;

  const selectTenant = (tenant: TenantReference) => {
    onSwitch(tenant.id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-foreground/80 hover:bg-accent"
      >
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="max-w-[140px] truncate">
          {activeTenant?.name ?? "Select organisation"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-muted-foreground"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-50 w-[200px] rounded-lg border bg-popover p-1 shadow-lg">
            {tenants.map((t) => {
              const item = renderTenant
                ? renderTenant(t, selectTenant)
                : (
                  <DefaultTenant
                    tenant={t}
                    activeTenant={activeTenant}
                    selectTenant={selectTenant}
                  />
                );
              return <React.Fragment key={t.id}>{item}</React.Fragment>;
            })}
          </div>
        </>
      )}
    </div>
  );
}
