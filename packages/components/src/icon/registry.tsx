/**
 * @arcevo/facet-components: Icon registry
 *
 * Resolves semantic + lowercase kebab lucide icon names to components, so
 * consumers and domain presets can override icons without forking
 * components, and never need lucide-react installed themselves.
 *
 * Naming is lucide-style kebab-case throughout:
 *   <Icon name="settings" /> <Icon name="chevron-down" /> <Icon name="heart" />
 * (camelCase aliases like "chevronDown" still resolve for back-compat.)
 *
 * Resolution order:
 *   1. IconProvider context overrides (per-app / per-domain).
 *   2. registerIcon global overrides/additions.
 *   3. Built-in semantic map (settings, logout, github, ...).
 *   4. Lowercase lucide name map (any of lucide's 1.5k+ icons, e.g. "heart").
 *
 * Usage:
 *   import { Icon, registerIcon, IconProvider } from "@arcevo/facet-components";
 *
 *   registerIcon("settings", MyCustomSettingsIcon);
 *
 *   <IconProvider overrides={{ logout: Shield }}>   // domain override
 *     <Icon name="logout" size={16} />
 *   </IconProvider>
 *
 *   <Icon name="heart" />                          // any lucide icon
 */

import * as React from "react";
import { X, Building2, Trash2 } from "lucide-react";
import type { LucideIconName } from "./icon-map.js";
import { SEMANTIC_ICONS } from "./semantic-icons.js";
import { brandIcons } from "./brand-icons.js";

export type { LucideIconName } from "./icon-map.js";

/* ── Lazy icon catalog (deferred, cached) ──────────────────── */

// The full ~1,500-icon map (./icon-map.js) is the source of truth for
// ARBITRARY lucide icons ("heart", "alarm-clock", ...). It is NOT imported
// here at module scope: doing so would pull all 1,500 static named imports
// into every consumer's eager bundle (bundlers can't tree-shake it because
// the map is read via dynamic indexing). Instead it is loaded as a separate,
// cached chunk on demand. The fetch starts at module evaluation and the
// namespace is cached, so resolveIcon is synchronous once it has loaded;
// `Icon` re-renders via useSyncExternalStore when the chunk lands.
//
// Built-in semantic icons resolve through SEMANTIC_ICONS (direct imports) and
// are therefore synchronous on first paint - no flash, no catalog dependency.
// The full ~1,500-icon catalog (./icon-map.js) is loaded ON DEMAND - not at
// module evaluation - so consumers that only use semantic icons never fetch it
// at all (the catalog is only pulled when an arbitrary icon like "heart" is
// first resolved). The namespace and promise are cached; `Icon` re-renders via
// useSyncExternalStore when the deferred chunk lands so arbitrary lucide icons
// appear after first use.
let catalog: typeof import("./icon-map.js") | null = null;
let catalogPromise: Promise<typeof import("./icon-map.js")> | null = null;
const catalogListeners = new Set<() => void>();

export function iconCatalogReady(): Promise<typeof import("./icon-map.js")> {
  if (!catalogPromise) {
    catalogPromise = import("./icon-map.js").then((m) => {
      catalog = m;
      for (const l of catalogListeners) l();
      return m;
    });
  }
  return catalogPromise;
}

function subscribeCatalog(fn: () => void): () => void {
  catalogListeners.add(fn);
  return () => {
    catalogListeners.delete(fn);
  };
}
function getCatalog(): typeof import("./icon-map.js") | null {
  return catalog;
}

/* ── Types ────────────────────────────────────────────────── */

export type IconComponent = React.ComponentType<{ className?: string; size?: number | string }>;

/**
 * Icon names accepted by the registry: the built-in semantic names (shown
 * for autocomplete) plus any lowercase lucide icon name. The `string & {}`
 * keeps the literals autocompleting while allowing any name at compile time.
 */
export type IconName = SemanticIconName | (string & {});

/** The built-in semantic names (lucide-style kebab-case). */
export type SemanticIconName =
  | "settings"
  | "logout"
  | "chevron-down"
  | "search"
  | "check"
  | "moon"
  | "sun"
  | "bell"
  | "menu"
  | "close"
  | "chevron-left"
  | "chevron-right"
  | "calendar"
  | "arrow-right"
  | "sparkles"
  | "github"
  | "book-open"
  | "building"
  | "users"
  | "shield"
  | "credit-card"
  | "dashboard"
  | "document"
  | "help"
  | "grid"
  | "list"
  | "triangle-alert"
  | "copy"
  | "chevron-up-down"
  | "chevrons-up"
  | "chevrons-down"
  | "more-horizontal"
  | "more-vertical"
  | "eye"
  | "eye-off"
  | "compass"
  | "layers"
  | "palette"
  | "key-round"
  | "user"
  | "upload"
  | "qrcode"
  | "trash"
  | "minus"
  | "plus"
  | "grip-horizontal"
  | "grip-vertical"
  | "ellipsis"
  /* Brand icons (inline SVG, independent of lucide) */
  | "linkedin"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "x"
  | "twitter"
  | "youtube"
  | "slack"
  | "discord"
  | "telegram"
  | "figma"
  | "spotify";

/** Partial map used for overrides (IconProvider / registerIcon). */
export type IconOverrides = Partial<Record<IconName, IconComponent>>;

/* ── Built-in map ─────────────────────────────────────────── */

/** Icons that don't resolve through the lucide name map (X glyph, -2 variants). */
const SEMANTIC_DIRECT: Partial<Record<SemanticIconName, IconComponent>> = {
  close: X,
  building: Building2,
  trash: Trash2,
};

// Built-in defaults. Semantic icons come from SEMANTIC_ICONS (direct
// imports), so every built-in icon is synchronous on first paint and never
// depends on the lazy catalog. SEMANTIC_DIRECT (-2 variants / X glyph) and
// brand icons (inline SVGs) override/augment as needed.
const defaultIcons: Partial<Record<IconName, IconComponent>> = {
  ...SEMANTIC_ICONS,
  ...SEMANTIC_DIRECT,
  ...brandIcons,
};

/* ── Global registry ──────────────────────────────────────── */

const globalRegistry: Partial<Record<IconName, IconComponent>> = { ...defaultIcons };

/** Normalize camelCase (or mixed) names to the lucide kebab form: "chevronDown" -> "chevron-down". */
export function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** Resolve a raw name (as typed) through the full lookup chain. */
function resolveIcon(
  name: string,
  catalogSnapshot: typeof import("./icon-map.js") | null = catalog,
): IconComponent | undefined {
  const kebab = toKebab(name);
  const direct = globalRegistry[name] ?? globalRegistry[kebab];
  if (direct) return direct;
  // Arbitrary lucide icon: kick off the lazy catalog load on first lookup
  // (cached, so the chunk is fetched only once). Until it lands this returns
  // undefined; `Icon` re-renders via useSyncExternalStore when it resolves.
  if (catalogSnapshot) {
    return (
      catalogSnapshot.lucideIconMap[name as LucideIconName] ??
      catalogSnapshot.lucideIconMap[kebab as LucideIconName]
    );
  }
  void iconCatalogReady();
  return undefined;
}

/** Register (or override) a global icon. */
export function registerIcon(name: IconName, icon: IconComponent): void {
  globalRegistry[name] = icon;
}

/** Reset the global registry back to the built-in defaults (clears registerIcon overrides). */
export function resetIconRegistry(): void {
  for (const key of Object.keys(globalRegistry)) delete globalRegistry[key];
  Object.assign(globalRegistry, defaultIcons);
}

/** Get the global icon for a name (semantic, registered, or lucide). */
export function getIcon(name: IconName): IconComponent | undefined {
  return resolveIcon(name);
}

/* ── Context (per-app / domain overrides) ─────────────────── */

const IconContext = React.createContext<IconOverrides | null>(null);

export interface IconProviderProps {
  /** Per-app overrides: { settings: MyIcon } */
  overrides?: IconOverrides;
  children: React.ReactNode;
}

export function IconProvider({ overrides, children }: IconProviderProps) {
  const parent = React.useContext(IconContext);
  // Normalize override keys (camelCase -> kebab) so consumers can pass either.
  const normalized = React.useMemo(() => {
    if (!overrides) return null;
    const out: IconOverrides = {};
    for (const [key, icon] of Object.entries(overrides)) out[toKebab(key)] = icon;
    return out;
  }, [overrides]);
  const merged = React.useMemo(
    () => (parent ? { ...parent, ...normalized } : normalized),
    [parent, normalized],
  );
  return <IconContext.Provider value={merged}>{children}</IconContext.Provider>;
}

/* ── Icon component ───────────────────────────────────────── */

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  className?: string;
  size?: number | string;
}

/** Renders the resolved icon for a name (context overrides win, then global, then lucide). */
export function Icon({ name, className, size, ...props }: IconProps) {
  const overrides = React.useContext(IconContext);
  // Re-render when the lazy catalog lands so arbitrary lucide icons appear
  // after their deferred chunk loads. Semantic / registered / brand icons
  // resolve synchronously via globalRegistry and never depend on the catalog.
  const catalogNow = React.useSyncExternalStore(subscribeCatalog, getCatalog, getCatalog);
  const kebab = toKebab(name);
  const Component =
    overrides?.[kebab] ?? overrides?.[name] ?? resolveIcon(name, catalogNow);
  if (!Component) return null;
  return <Component className={className} size={size} {...props} />;
}
