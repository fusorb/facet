/**
 * Domain preset registry for @fusorb/facet-auth.
 *
 * Lets consumers register custom domain presets (and override built-ins)
 * without forking the package. Presets are plain AuthConfig objects, so
 * they can also be spread and extended inline.
 *
 * Usage:
 *   import { registerPreset, getPreset, resolvePreset } from "@fusorb/facet-auth";
 *
 *   registerPreset("gov", {
 *     requireMfa: true,
 *     allowPasskey: false,
 *     sessionTtl: 20,
 *     ...
 *   });
 *
 *   <ArcProvider client={client} config={resolvePreset("gov")}>
 *   <SignIn config={getPreset("gov")} />
 */

import type { AuthConfig } from "./types.js";
import { fintechPreset, medPreset, eduPreset, enterprisePreset, defaultPreset } from "./presets.js";

/** Name of a built-in or registered preset. */
export type PresetName = string;

const registry = new Map<string, AuthConfig>([
  ["fintech", fintechPreset],
  ["med", medPreset],
  ["edu", eduPreset],
  ["enterprise", enterprisePreset],
  ["default", defaultPreset],
]);

/**
 * Register a custom domain preset (or override a built-in one).
 * Later registrations win.
 */
export function registerPreset(name: PresetName, config: AuthConfig): void {
  registry.set(name, config);
}

/** Get a registered preset. Throws if the name is unknown. */
export function getPreset(name: PresetName): AuthConfig {
  const preset = registry.get(name);
  if (!preset) {
    throw new Error(
      `Unknown auth preset "${name}". ` + `Registered presets: ${[...registry.keys()].join(", ")}`,
    );
  }
  return preset;
}

/** Check whether a preset name exists. */
export function hasPreset(name: PresetName): boolean {
  return registry.has(name);
}

/** List all registered preset names. */
export function listPresets(): PresetName[] {
  return [...registry.keys()];
}

/**
 * Resolve a preset into a concrete AuthConfig, applying a partial
 * override on top. Accepts a preset name or an inline config.
 *
 *   resolvePreset("edu", { sessionTtl: 720 })   // edu + 12h override
 *   resolvePreset({ requireMfa: true })          // inline, defaults applied
 */
export function resolvePreset(
  preset: PresetName | AuthConfig,
  overrides: Partial<AuthConfig> = {},
): AuthConfig {
  const base = typeof preset === "string" ? getPreset(preset) : preset;
  return { ...defaultPreset, ...base, ...overrides };
}
