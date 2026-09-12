/**
 * @fusorb/facet-layout: Core types
 *
 * LayoutConfig drives the entire app shell: sidebar nav, brand identity,
 * and feature toggles. Domain presets in presets.ts provide pre-built
 * configs for fintech / med / edu / enterprise / default.
 */

import type { ReactNode } from "react";
import type { RouterAdapter } from "./router.js";

/* ── Nav shape (mirrors arc-id's navConfig structure) ──────── */

export interface NavItem {
  /** Full route path e.g. "/dashboard" or "/security/sessions" */
  href: string;
  /** Display label */
  label: string;
  /** Optional icon element (consumer passes e.g. lucide <BarChart3 />) */
  icon?: ReactNode;
  /** Optional badge count or label (e.g. "3", "New") */
  badge?: string | number;
  /** Optional RBAC permission string: reserved for future gating */
  requiredPermission?: string;
  /**
   * Optional nested children. When present, the item renders as a
   * collapsible group that expands to reveal its children inline.
   */
  children?: NavItem[];
}

export interface NavSection {
  /** Section heading in the sidebar */
  title: string;
  /** Items in this section */
  items: NavItem[];
  /**
   * Optional stable id used to persist the section's collapsed state.
   * Falls back to `title` when omitted.
   */
  id?: string;
}

/* ── Brand identity (used in AuthLayout left panel) ────────── */

export interface BrandConfig {
  /** Product / company name */
  name: string;
  /** Optional custom logo element (defaults to a shield icon) */
  logo?: ReactNode;
  /** Tagline displayed in the auth page left panel */
  tagline?: string;
  /** Benefit bullet points in the auth page left panel */
  benefits?: string[];
  /** Small footer text in the auth page left panel (e.g. "© 2026 Acme") */
  footerText?: string;
}

/* ── Feature toggles ──────────────────────────────────────── */

export interface LayoutFeatures {
  /** Show the tenant/organisation switcher in the topbar. Default: true */
  tenantSwitcher?: boolean;
  /** Show a theme toggle in the topbar. Default: false */
  themeToggle?: boolean;
  /** Show a search trigger in the topbar. Default: false */
  search?: boolean;
}

/* ── Main config ──────────────────────────────────────────── */

export interface LayoutConfig {
  brand: BrandConfig;
  navigation: NavSection[];
  features?: LayoutFeatures;
}

/* ── Tenant shape (consumer provides this) ────────────────── */

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  plan?: string;
}

/* ── Layout modes ──────────────────────────────────────────── */

/** ConsoleLayout sidebar mode. "full" = always-labeled sidebar, "rail" = collapsible icon-only sidebar. */
export type ConsoleLayoutMode = "full" | "rail";

/* ── Layout context value ─────────────────────────────────── */

export interface LayoutContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  /** Whether the sidebar is pinned open (survives hover-leave). Reset on page navigation. */
  sidebarPinned: boolean;
  /** Pin the sidebar open (click-to-stay-open). */
  pinSidebar: () => void;
  /** Unpin + close the sidebar (e.g. after a page navigation). */
  unpinSidebar: () => void;
  /** Open the sidebar as a hover preview - closes on mouse-leave unless pinned. */
  hoverEnterSidebar: () => void;
  /** Arm the close timer for hover preview - closes the sidebar after a short delay unless the mouse re-enters. */
  hoverLeaveSidebar: () => void;
  /** Rail mode: sidebar collapsed to icon-only (desktop only). Default: false */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  /** Rail mode: current expanded sidebar width in px (resizable). Default: 260 */
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  /** Per-section collapse state keyed by section id (or title). */
  collapsedSections: Record<string, boolean>;
  /** Toggle a section's collapsed state (persisted to localStorage). */
  toggleSection: (sectionId: string) => void;
  /** Accordion mode: open one section, collapse the rest (persisted). */
  openSection: (sectionId: string, sectionIds?: string[]) => void;
  /** Collapse every known section. Pass the ids the Sidebar renders. */
  collapseAll: (sectionIds: string[]) => void;
  /** Expand every known section. Pass the ids the Sidebar renders. */
  expandAll: (sectionIds: string[]) => void;
  /** Framework-aware navigation. Defaults to window.location + plain <a>. */
  router?: RouterAdapter;
}

/* ── Component props ──────────────────────────────────────── */

export interface LayoutProviderProps {
  config: LayoutConfig;
  children: ReactNode;
}
