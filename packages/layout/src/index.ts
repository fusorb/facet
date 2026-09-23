/**
 * @fusorb/facet-layout: Domain-configurable app shell components.
 *
 * Usage:
 *   import { ConsoleLayout, Sidebar, PageHeader } from "@fusorb/facet-layout";
 *   import { defaultLayoutPreset } from "@fusorb/facet-layout";
 *
 *   <ConsoleLayout config={defaultLayoutPreset}>
 *     <PageHeader title="Dashboard" />
 *     ...
 *   </ConsoleLayout>
 */

/* ── Types ────────────────────────────────────────────────── */
export type {
  NavItem,
  NavSection,
  BrandConfig,
  LayoutFeatures,
  LayoutConfig,
  TenantReference,
  LayoutContextValue,
  LayoutProviderProps,
  ConsoleLayoutMode,
} from "./types.js";

/* ── Presets ──────────────────────────────────────────────── */
export {
  fintechLayoutPreset,
  medLayoutPreset,
  eduLayoutPreset,
  enterpriseLayoutPreset,
  defaultLayoutPreset,
} from "./presets.js";

/* ── Preset Registry ──────────────────────────────────────── */
export {
  registerLayoutPreset,
  getLayoutPreset,
  hasLayoutPreset,
  listLayoutPresets,
  resolveLayoutPreset,
} from "./registry.js";
export type { LayoutPresetName } from "./registry.js";

/* ── Context ──────────────────────────────────────────────── */
export { LayoutProvider, useLayout } from "./layout-context.js";

/* ── Router adapter ───────────────────────────────────────── */
export { createDefaultAdapter, matchPath } from "./router.js";
export type { RouterAdapter, RouterLinkProps } from "./router.js";

/* ── Components ───────────────────────────────────────────── */
export { type SidebarProps, Sidebar } from "./sidebar.js";

export { type TopbarProps, Topbar } from "./topbar.js";

export { type UserMenuProps, UserMenu } from "./user-menu.js";

export { type TenantSwitcherProps, TenantSwitcher } from "./tenant-switcher.js";

export { type PageHeaderProps, PageHeader } from "./page-header.js";

export { type AuthLayoutProps, AuthLayout } from "./auth-layout.js";
/** @deprecated Use AuthLayout. Kept as an alias for backwards compatibility. */
export { AppLayout } from "./auth-layout.js";

export { type ConsoleLayoutProps, ConsoleLayout } from "./console-layout.js";

export { type LandingLayoutProps, LandingLayout } from "./landing-layout.js";

/* ── Chat layout ──────────────────────────────────── */
export {
  type ChatInputProps,
  type ChatLayoutProps,
  ChatInput,
  ChatLayout,
} from "./chat-layout.js";

/* ── Command palette (search) ─────────────────────────────── */
export {
  type CommandPaletteProps,
  type CommandResult,
  CommandPalette,
} from "./search.js";
