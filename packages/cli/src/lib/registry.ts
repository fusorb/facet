import type { PackageManager } from "./types.js";

/**
 * The @fusorb/facet-* packages we know about. Used as a fallback baseline;
 * the CLI ALSO discovers facet packages dynamically from the npm registry
 * scope + the consumer's declared deps, so a newly published package shows
 * up even before this list is updated.
 */
export const ALL_FACET_PACKAGES = [
  "@fusorb/facet-auth",
  "@fusorb/facet-cli",
  "@fusorb/facet-components",
  "@fusorb/facet-docs",
  "@fusorb/facet-emails",
  "@fusorb/facet-layout",
  "@fusorb/facet-sdk",
  "@fusorb/facet-store",
  "@fusorb/facet-tokens",
] as const;

export type AllFacetPackage = (typeof ALL_FACET_PACKAGES)[number];

/** Discover facet packages dynamically: the npm @fusorb scope (via the
 *  registry search API) merged with the static baseline. Returns a set of
 *  package names; falls back to the baseline alone if the registry is
 *  unreachable or slow (3s timeout so the CLI never hangs on the network). */
export async function discoverFacetPackages(): Promise<string[]> {
  const baseline = [...ALL_FACET_PACKAGES];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch("https://registry.npmjs.org/-/v1/search?text=scope:arcevo&size=100", {
        headers: { "User-Agent": "facet-cli" },
        signal: controller.signal,
      });
      if (!res.ok) return baseline;
      const data = (await res.json()) as {
        objects?: { package?: { name?: string } }[];
      };
      const scoped = (data.objects ?? [])
        .map((o) => o.package?.name ?? "")
        .filter((n): n is string => Boolean(n) && n.startsWith("@fusorb/facet-"));
      return Array.from(new Set([...baseline, ...scoped]));
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return baseline;
  }
}

/**
 * Facet packages a docs site depends on, with the npm registry name.
 * These are resolved to the CURRENT published version at init time, so a
 * scaffold never pins an outdated or guessed version.
 */
export const FACET_PACKAGES = [
  "@fusorb/facet-docs",
  "@fusorb/facet-tokens",
  "@fusorb/facet-components",
  "@fusorb/facet-layout",
] as const;

export type FacetPackage = (typeof FACET_PACKAGES)[number];

/** Fallback ranges used only when the registry is unreachable. These stay
 * loose (^) so the consumer's installer still pulls the latest compatible. */
const FALLBACK_RANGES: Record<FacetPackage, string> = {
  "@fusorb/facet-docs": "^1.0.0",
  "@fusorb/facet-tokens": "^1.0.0",
  "@fusorb/facet-components": "^1.0.0",
  "@fusorb/facet-layout": "^1.0.0",
};

/**
 * Resolve the current published versions of the facet packages from the
 * npm registry. Returns `name: "^x.y.z"` ranges so the consumer's
 * package manager resolves the latest compatible on install.
 *
 * Falls back to loose fallback ranges on network error. The registry is
 * only consulted for the facet scope (and the doc site's non-facet deps
 * use caret ranges), so we never claim a version we didn't verify.
 */
export async function resolveFacetVersions(): Promise<Record<FacetPackage, string>> {
  const result = { ...FALLBACK_RANGES } as Record<FacetPackage, string>;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    await Promise.all(
      FACET_PACKAGES.map(async (name) => {
        try {
          const res = await fetch(`https://registry.npmjs.org/${name}/latest`, {
            headers: { "User-Agent": "facet-cli" },
            signal: controller.signal,
          });
          if (!res.ok) return;
          const data = (await res.json()) as { version?: string };
          if (data.version) result[name] = `^${data.version}`;
        } catch {
          // Offline or registry hiccup: keep the loose fallback.
        }
      }),
    );
  } finally {
    clearTimeout(timer);
  }
  return result;
}

/** Resolve the latest published version of a single npm package. Returns
 * undefined when the registry is unreachable or the package 404s.
 *
 * Robust against registry flakiness: retries once, then falls back to the
 * full packument's dist-tags.latest (the /latest endpoint can 429 or drop
 * connections under rate limiting). This matters for `facet up`/`facet
 * update` - a missed latest must never be reported as "up to date".
 */
export async function resolveLatestVersion(name: string): Promise<string | undefined> {
  // Try the lightweight /latest endpoint first (2 attempts).
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://registry.npmjs.org/${name}/latest`, {
        headers: { "User-Agent": "facet-cli" },
      });
      if (res.ok) {
        const data = (await res.json()) as { version?: string };
        if (data.version) return data.version;
      } else if (res.status !== 429 && res.status !== 503) {
        return undefined; // 404 or other hard error: package not found.
      }
    } catch {
      // network error; retry once below
    }
  }
  // Fallback: full packument -> dist-tags.latest (single retry).
  try {
    const res = await fetch(`https://registry.npmjs.org/${name}`, {
      headers: { "User-Agent": "facet-cli" },
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { "dist-tags"?: { latest?: string } };
    return data["dist-tags"]?.latest;
  } catch {
    return undefined;
  }
}

/** One-line summary of resolved versions for the CLI's "next steps". */
export function formatVersions(versions: Record<FacetPackage, string>): string {
  return Object.entries(versions)
    .map(([name, range]) => `  ${name}@${range}`)
    .join("\n");
}

/** Install command that adds the facet packages with resolved ranges. */
export function facetInstallCommand(
  pm: PackageManager,
  versions: Record<FacetPackage, string>,
): string {
  const pkgs = Object.entries(versions)
    .map(([name, range]) => `${name}@${range}`)
    .join(" ");
  switch (pm) {
    case "pnpm": return `pnpm add ${pkgs}`;
    case "yarn": return `yarn add ${pkgs}`;
    case "bun": return `bun add ${pkgs}`;
    default: return `npm install ${pkgs}`;
  }
}
