import { create } from "zustand";
import type { Tenant } from "@fusorb/facet-sdk";

export type { Tenant };

export interface TenantState {
  activeTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  setActiveTenant: (tenant: Tenant | null) => void;
  setTenants: (tenants: Tenant[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  activeTenant: null,
  tenants: [],
  isLoading: false,
  setActiveTenant: (activeTenant) => set({ activeTenant }),
  setTenants: (tenants) => set({ tenants }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ activeTenant: null, tenants: [], isLoading: false }),
}));
