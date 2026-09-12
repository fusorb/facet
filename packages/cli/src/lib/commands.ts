import { readdirSync, readFileSync } from "node:fs";
import { dirname, join as pathJoin } from "node:path";
import { discoverFacetPackages, resolveLatestVersion, ALL_FACET_PACKAGES } from "./registry.js";
import { scanUnnecessaryDeps } from "./deps.js";
import {
  compareVersions,
  collectFacetDeps,
  detectMonorepo,
  detectPackageManager,
  type PackageManager,
} from "./types.js";

export interface FacetPackageInfo {
  name: string;
  latest?: string;
  installed?: string;
  /** Range the consumer declares (e.g. "^1.1.0"). */
  declared?: string;
  outdated: boolean;
  /** True when installed but latest could not be verified (registry hiccup). */
  unverified?: boolean;
}

/**
 * Gather the facet package state for the consumer at `cwd`: what is
 * published (latest), what the consumer declares (range), and what is
 * installed (resolved from node_modules). Works in single packages and
 * monorepos alike.
 *
 * `outdated` is deliberately CONSERVATIVE: a package is flagged outdated
 * whenever the installed version is older than latest. If the latest
 * could not be resolved (registry hiccup) but the package IS installed,
 * we report unknown (not "up to date") so `facet up` never falsely
 * claims everything is current.
 */
export async function collectFacetPackageState(cwd: string): Promise<FacetPackageInfo[]> {
  const declared = collectFacetDeps(cwd);
  const searchDirs = [cwd, ...workspaceMemberDirs(cwd)];
  // Discover the facet scope dynamically (npm registry @fusorb search)
  // merged with the static baseline AND whatever the consumer declares,
  // so any facet package shows up even before the CLI ships it.
  const discovered = await discoverFacetPackages();
  const names = Array.from(new Set([...discovered, ...Object.keys(declared)]));
  const infos: FacetPackageInfo[] = await Promise.all(
    names.map(async (name) => {
      const [latest, installed] = await Promise.all([
        resolveLatestVersion(name),
        readInstalledVersion(searchDirs, name),
      ]);
      const range = declared[name];
      const outdated =
        latest && installed ? compareVersions(installed, latest) < 0 : false;
      const unverified = !latest && Boolean(installed);
      return {
        name,
        latest,
        installed,
        declared: range,
        outdated,
        // True when we could not verify latest but the package is present,
        // so callers can warn instead of claiming "all up to date".
        unverified,
      };
    }),
  );
  return infos;
}

/** Directory paths to search for node_modules: cwd + each workspace member
 * dir (so non-hoisted pnpm layouts like stream-wise's client/ resolve). */
function workspaceMemberDirs(cwd: string): string[] {
  const globs = detectMonorepo(cwd) ?? [];
  const out: string[] = [];
  for (const glob of globs) {
    const base = glob.replace(/\/\*+$/, "");
    if (glob.includes("*")) {
      for (const d of readdirSafe(pathJoin(cwd, base))) {
        out.push(pathJoin(cwd, base, d));
      }
    } else {
      out.push(pathJoin(cwd, base));
    }
  }
  return out;
}

function readdirSafe(p: string): string[] {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

/** Read the resolved version of `name` from node_modules across `dirs`
 * (cwd first, then workspace members), walking up from each. */
export function readInstalledVersion(dirs: string[], name: string): string | undefined {
  const parts = name.split("/"); // "@fusorb/facet-auth" -> ["@fusorb", "facet-auth"]
  const paths: string[] = [];
  for (const dir of dirs) {
    paths.push(pathJoin(dir, "node_modules", ...parts, "package.json"));
    for (const ancestor of walkUp(dir)) {
      paths.push(pathJoin(ancestor, "node_modules", ...parts, "package.json"));
    }
  }
  for (const p of paths) {
    try {
      const pkg = JSON.parse(readFileSync(p, "utf8")) as { version?: string };
      if (pkg.version) return pkg.version;
    } catch {
      // not found at this level; keep walking
    }
  }
  return undefined;
}

function walkUp(cwd: string): string[] {
  const out: string[] = [];
  let cur = cwd;
  for (let i = 0; i < 8 && cur !== ""; i++) {
    const next = dirname(cur);
    if (next === cur) break;
    cur = next;
    out.push(cur);
  }
  return out;
}

/** Print a compact table of the facet packages for `facet pkg`. */
export function formatPackageTable(infos: FacetPackageInfo[]): string {
  const lines: string[] = [];
  lines.push("Package                 latest      installed   declared");
  lines.push("─────────────────────────────────────────────────────────");
  for (const info of infos) {
    const name = info.name.padEnd(24);
    const latest = (info.latest ?? "n/a").padEnd(12);
    const installed = info.installed ?? "-";
    const declared = info.declared ?? "-";
    const marker = info.outdated ? "  (update available)" : "";
    lines.push(`${name}${latest}${installed.padEnd(12)}${declared}${marker}`);
  }
  return lines.join("\n");
}

/** Build the `facet doctor` report for the consumer at `cwd`. */
export function buildDoctorReport(cwd: string, infos: FacetPackageInfo[]) {
  const pm: PackageManager = detectPackageManager(cwd);
  const mono = detectMonorepo(cwd);
  const findings: string[] = [];
  const suggestions: string[] = [];

  const hasComponents = infos.some((i) => i.name === "@fusorb/facet-components" && (i.declared || i.installed));
  const hasTokens = infos.some((i) => i.name === "@fusorb/facet-tokens" && (i.declared || i.installed));
  const outdated = infos.filter((i) => i.outdated);

  // Deps that @fusorb/facet-components already bundles (radix, lucide, ...).
  const unnecessary = scanUnnecessaryDeps(cwd);
  const unnecessaryNames = unnecessary.flatMap((e) => e.deps.map((d) => d.name));

  findings.push(`Package manager: ${pm}`);
  findings.push(
    mono
      ? `Repo layout: monorepo (workspaces: ${mono.join(", ")})`
      : "Repo layout: single package",
  );

  if (unnecessaryNames.length) {
    findings.push(`Unnecessary deps (bundled by @fusorb/facet-components): ${unnecessaryNames.join(", ")}`);
    suggestions.push(`These are already provided by @fusorb/facet-components. Remove them: \`facet clean\` does this automatically (rewrites imports + deletes dead local components).`);
  }

  if (!hasComponents && !hasTokens) {
    findings.push("facet usage: none detected");
    suggestions.push("Run `facet docs init` to scaffold a docs site, or add the packages with `facet add`/your package manager.");
  } else {
    findings.push(`facet usage: ${infos.filter((i) => i.declared || i.installed).map((i) => i.name.replace("@fusorb/facet-", "")).join(", ") || "none"}`);
    if (!hasTokens) {
      suggestions.push("Import @fusorb/facet-tokens (tokens.css + tailwind.css) so component styling resolves.");
    }
    if (outdated.length) {
      suggestions.push(`Update available for: ${outdated.map((i) => i.name).join(", ")}. Run \`facet update\`.`);
    }
    for (const info of infos) {
      if (info.name === "@fusorb/facet-components" && info.declared && info.declared.startsWith("workspace:")) {
        suggestions.push("You depend on facet-components via workspace:*; when publishing your package, swap it for a registry range (e.g. ^1.2.0).");
      }
    }
  }

  return { pm, monorepo: mono !== null, findings, suggestions, outdated };
}

/** The `facet update` dry-run: which packages would move to which version. */
export function planUpdates(infos: FacetPackageInfo[]): FacetPackageInfo[] {
  return infos.filter((i) => i.outdated);
}

/** Build the install/update command for the detected package manager. */
export function updateCommand(
  pm: PackageManager,
  targets: { name: string; latest: string }[],
  workspace = false,
): string {
  const pkgs = targets.map((t) => `${t.name}@^${t.latest}`).join(" ");
  const rootFlag = workspace ? " -w" : "";
  switch (pm) {
    case "pnpm": return `pnpm${rootFlag} add ${pkgs}`;
    case "yarn": return `yarn workspace add ${pkgs}`;
    case "bun": return `bun add ${pkgs}`;
    default: return `npm install ${pkgs}`;
  }
}

/**
 * A resolved facet package target: its full name and the latest published
 * version to install.
 */
export interface FacetInstallTarget {
  name: string;
  latest: string;
}

/**
 * Build a local install command for one or more facet packages with resolved
 * version ranges. Used by `facet add`/`facet install <names...>`. Multiple
 * packages are joined into a single add invocation so the consumer gets one
 * lockfile write instead of one per package.
 */
export function installFacetPackages(
  pm: PackageManager,
  targets: FacetInstallTarget[],
  workspace = false,
): string {
  const rootFlag = workspace ? " -w" : "";
  const pkgs = targets.map((t) => `${t.name}@^${t.latest}`).join(" ");
  switch (pm) {
    case "pnpm": return `pnpm${rootFlag} add ${pkgs}`;
    case "yarn": return `yarn workspace add ${pkgs}`;
    case "bun": return `bun add ${pkgs}`;
    default: return `npm install ${pkgs}`;
  }
}

/**
 * Build a global install command for one or more facet packages (e.g.
 * `pnpm add -g @fusorb/facet-cli@2.0.0`). Used by `facet install -g` so a
 * consumer can write `facet install -g facet-cli` (short name) instead of
 * the full `@fusorb/facet-cli`. Global installs never use the workspace
 * `-w` flag.
 */
export function globalInstallFacetPackages(
  pm: PackageManager,
  targets: FacetInstallTarget[],
): string {
  const pkgs = targets.map((t) => `${t.name}@${t.latest}`).join(" ");
  switch (pm) {
    case "pnpm": return `pnpm add -g ${pkgs}`;
    case "yarn": return `yarn global add ${pkgs}`;
    case "bun": return `bun add -g ${pkgs}`;
    default: return `npm i -g ${pkgs}`;
  }
}

/** True when the given name is a facet package (starts with @fusorb/facet-). */
export function isFacetPackage(name: string): boolean {
  return name.startsWith("@fusorb/facet-");
}

/**
 * Resolve a shorthand or full name to a facet package name.
 * - "@fusorb/facet-layout" → "@fusorb/facet-layout"  (full name, returned as-is)
 * - "facet-layout"         → "@fusorb/facet-layout"  (alias: drops the @fusorb/ scope,
 *   so users can write `facet install -g facet-cli` instead of `@fusorb/facet-cli`)
 * - "layout"               → "@fusorb/facet-layout"  (shorthand)
 * - "Button"               → undefined              (not a facet package → component copy)
 */
export function resolveFacetPackageName(name: string): string | undefined {
  if (isFacetPackage(name)) return name;
  // Alias that drops the @fusorb/ scope: "facet-cli" -> "@fusorb/facet-cli".
  // Lets users reference the package the short way, e.g. `npm i -g facet-cli`.
  if (name.startsWith("facet-")) {
    const scoped = `@fusorb/${name}` as const;
    if ((ALL_FACET_PACKAGES as readonly string[]).includes(scoped)) return scoped;
  }
  // Plain shorthand: "layout" -> "@fusorb/facet-layout"
  const full = `@fusorb/facet-${name}` as const;
  if ((ALL_FACET_PACKAGES as readonly string[]).includes(full)) return full;
  return undefined;
}
