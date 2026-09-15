/**
 * Domain preset registry for @fusorb/facet-layout.
 *
 * Mirrors the @fusorb/facet-auth registry: register custom layout presets
 * (or override built-ins) without forking the package.
 *
 * Usage:
 *   import { registerLayoutPreset, resolveLayoutPreset } from "@fusorb/facet-layout";
 *
 *   registerLayoutPreset("gov", {
 *     brand: { name: "GovPort", tagline: "Citizen Identity" },
 *     navigation: [...],
 *   });
 *
 *   <ConsoleLayout config={resolveLayoutPreset("gov")}>
 */

import type { LayoutConfig } from "./types.js";
import {
  fintechLayoutPreset,
  medLayoutPreset,
  eduLayoutPreset,
  enterpriseLayoutPreset,
  defaultLayoutPreset,
} from "./presets.js";

/** Name of a built-in or registered layout preset. */
export type LayoutPresetName = string;

const registry = new Map<string, LayoutConfig>([
  ["fintech", fintechLayoutPreset],
  ["med", medLayoutPreset],
  ["edu", eduLayoutPreset],
  ["enterprise", enterpriseLayoutPreset],
  ["default", defaultLayoutPreset],
]);

/** Register a custom layout preset (or override a built-in one). */
export function registerLayoutPreset(
  name: LayoutPresetName,
  config: LayoutConfig,
): void {
  registry.set(name, config);
}

/** Get a registered layout preset. Throws if the name is unknown. */
export function getLayoutPreset(name: LayoutPresetName): LayoutConfig {
  const preset = registry.get(name);
  if (!preset) {
    throw new Error(
      `Unknown layout preset "${name}". ` +
        `Registered presets: ${[...registry.keys()].join(", ")}`,
    );
  }
  return preset;
}

/** Check whether a layout preset name exists. */
export function hasLayoutPreset(name: LayoutPresetName): boolean {
  return registry.has(name);
}

/** List all registered layout preset names. */
export function listLayoutPresets(): LayoutPresetName[] {
  return [...registry.keys()];
}

/**
 * Resolve a layout preset into a concrete LayoutConfig, applying
 * partial overrides. Navigation overrides replace the section list
 * wholesale (merge semantics for nav arrays are ambiguous).
 *
 *   resolveLayoutPreset("enterprise", { features: { tenantSwitcher: false } })
 */
export function resolveLayoutPreset(
  preset: LayoutPresetName | LayoutConfig,
  overrides: Partial<LayoutConfig> = {},
): LayoutConfig {
  const base = typeof preset === "string" ? getLayoutPreset(preset) : preset;
  return {
    ...defaultLayoutPreset,
    ...base,
    ...overrides,
    features: { ...base.features, ...overrides.features },
  };
}
