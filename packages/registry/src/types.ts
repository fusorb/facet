/**
 * Type definitions for the Facet registry.
 *
 * These types describe the shape of `registry.json` produced by `scan.mjs`.
 * They are the single source of truth for the registry schema version.
 */

/** Current registry schema version. Bump on any structural change. */
export const SCHEMA_VERSION = 1 as const;

/** A build-time fact derivable from the workspace (committed, stable). */
export type FactValue = string | number;

export interface PackageEntry {
  name: string;
  version: string;
  summary: string;
  description: string;
  category: PackageCategory;
  icon: string;
  order: number;
  private: boolean;
  deps: string[];
  devDeps: string[];
  peers: string[];
  exports: string[];
  mainExport: string | null;
  installCommand: string;
}

export type PackageCategory =
  | "foundation"
  | "data"
  | "ui"
  | "tooling";

export interface ComponentEntry {
  slug: string;
  name: string;
  package: string;
  category: string;
  summary: string;
  /**
   * Props extracted from the component's JSDoc or signature.
   * Empty until Phase 5 (TS compiler API). For now: name + inferred type.
   */
  props: ComponentProp[];
  examples: string[];
}

export interface ComponentProp {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

export interface LayoutEntry {
  id: string;
  name: string;
  package: string;
  summary: string;
  /** Preset names exported from the layout package. */
  presets: string[];
  /** Region names the shell exposes (data-region attributes). */
  regions: string[];
  /** Modes the shell accepts (e.g. ["full", "rail", "collapsed"]). */
  modes: string[];
  /** Stable props the shell accepts (from the component's TypeScript signature). */
  props: string[];
}

export interface MotionRegistryEntry {
  families: string[];
  authored: string[];
  domains: string[];
  total: number;
}

export interface TokenGroup {
  name: string;
  vars: string[];
}

export interface TokenRegistryEntry {
  groups: TokenGroup[];
  colorSpace: "OKLCH" | "OKLAB" | "sRGB";
  totalVars: number;
  vars: string[];
}

export interface PresetEntry {
  id: string;
  label: string;
  package: string;
  category: string;
  summary: string;
}

export interface ExampleEntry {
  id: string;
  artifact: string;
  title: string;
  description?: string;
  tags: string[];
}

export interface SurfaceMap {
  /** Canonical origins for each surface, dev vs prod. */
  landing: { dev: string; prod: string };
  playground: { dev: string; prod: string };
  docs: { dev: string; prod: string };
  github: string;
  npm: string;
}

export interface FacetRegistry {
  schemaVersion: typeof SCHEMA_VERSION;
  generatedFrom: {
    commit: string;
    at: string;
  };
  packages: PackageEntry[];
  components: ComponentEntry[];
  layouts: LayoutEntry[];
  motion: MotionRegistryEntry;
  tokens: TokenRegistryEntry;
  presets: PresetEntry[];
  examples: ExampleEntry[];
  facts: Record<string, FactValue>;
  surfaces: SurfaceMap;
}

/**
 * Viewport spec for the lab kit.
 * Derived from the ArtifactKind interface in the spec (§5.2).
 */
export interface ViewportSpec {
  fit: "content" | "frame";
  aspect?: "16:9" | "4:3" | "1:1" | "9:16" | number;
  minHeight?: number;
  resizable?: boolean;
  scroll: "none" | "inside";
}
