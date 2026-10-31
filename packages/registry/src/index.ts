/**
 * @fusorb/facet-registry  - typed accessors for the compiled workspace registry.
 *
 * This package is private (workspace-only). Apps and tooling import from here;
 * no published package depends on it.
 */

import type {
  FacetRegistry,
  PackageEntry,
  ComponentEntry,
  LayoutEntry,
  TokenGroup,
  PresetEntry,
  SurfaceMap,
  MotionFamilyEntry,
  MotionAuthoredEntry,
  MotionDomainEntry,
} from "./types.js";
import data from "./registry.json" with { type: "json" };

const registry: FacetRegistry = data as unknown as FacetRegistry;

export { registry as default };
export { registry as facetRegistry };

export type {
  FacetRegistry,
  PackageEntry,
  ComponentEntry,
  LayoutEntry,
  TokenGroup,
  PresetEntry,
  ExampleEntry,
  SurfaceMap,
  ViewportSpec,
  MotionFamilyEntry,
  MotionAuthoredEntry,
  MotionDomainEntry,
} from "./types.js";

/* ── Packages ───────────────────────────────────────────── */

export function getPackage(name: string): PackageEntry | undefined {
  return registry.packages.find((p) => p.name === name);
}

export function listPackages(): PackageEntry[] {
  return [...registry.packages].sort((a, b) => a.order - b.order);
}

/* ── Components ─────────────────────────────────────────── */

export function getComponent(slug: string): ComponentEntry | undefined {
  return registry.components.find((c) => c.slug === slug);
}

export function listComponents(): ComponentEntry[] {
  return registry.components;
}

export function listComponentsByCategory(): Record<string, ComponentEntry[]> {
  return registry.components.reduce((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {} as Record<string, ComponentEntry[]>);
}

/* ── Layouts ────────────────────────────────────────────── */

export function getLayout(id: string): LayoutEntry | undefined {
  return registry.layouts.find((l) => l.id === id);
}

export function listLayouts(): LayoutEntry[] {
  return registry.layouts;
}

/* ── Motion ─────────────────────────────────────────────── */

export function listMotionFamilies(): MotionFamilyEntry[] {
  return registry.motion.families;
}

export function listMotionAuthored(): MotionAuthoredEntry[] {
  return registry.motion.authored;
}

export function listMotionDomains(): MotionDomainEntry[] {
  return registry.motion.domains;
}

/* ── Tokens ─────────────────────────────────────────────── */

export function getTokenGroups(): TokenGroup[] {
  return registry.tokens.groups;
}

export function getTokenVars(group?: string): string[] {
  if (!group) return registry.tokens.vars;
  const groupEntry = registry.tokens.groups.find((g) => g.name === group);
  return groupEntry?.vars ?? [];
}

/* ── Presets ────────────────────────────────────────────── */

export function listPresets(): PresetEntry[] {
  return registry.presets;
}

/* ── Facts ──────────────────────────────────────────────── */

export function getFact(name: string): string | number | undefined {
  return registry.facts[name];
}

export function getFacts(): Record<string, string | number> {
  return registry.facts;
}

/* ── Surfaces ───────────────────────────────────────────── */

export function getSurface(name: keyof SurfaceMap): string {
  return registry.surfaces[name as keyof SurfaceMap] as string;
}

export function getSurfaces(): SurfaceMap {
  return registry.surfaces;
}

/* ── Convenience ────────────────────────────────────────── */

export const schemaVersion = registry.schemaVersion;
export const generatedFrom = registry.generatedFrom;
