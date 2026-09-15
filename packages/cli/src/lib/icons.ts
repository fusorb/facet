/**
 * `facet icons generate` - scan a consumer repo for icon call sites and
 * build the exact slim registry that repo needs.
 *
 * The generated registry imports ONLY the lucide icons the consumer
 * actually uses (plus a small semantic default set), so bundlers
 * tree-shake to exactly the used subset. Consumers never bundle the full
 * ~1763-icon lucide map, which is what protects them from the memory-heap
 * blowups that importing the whole map can cause in large builds.
 *
 * Rule-based, zero LLM cost - the same muscle as `facet docs scan`.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { GeneratedFile } from "./types.js";

/* ── Call-site scanning ────────────────────────────────────── */

/**
 * Every icon name referenced in a consumer's source as a string literal:
 * `<Icon name="x">`, `<LightIcon name="x">`, `name="x"` on any component
 * that receives an icon, `registerIcon("x", ...)`, and `overrides={{ x:
 * ... }}` keys. Names are the raw literals; kebab-normalization happens
 * later so `chevronDown` and `chevron-down` count as the same icon.
 */
export interface IconScan {
  /** Absolute paths of source files that referenced an icon. */
  files: string[];
  /** Raw icon-name literals seen (may be camelCase or kebab). */
  names: string[];
  /** Names after kebab normalization, deduped, sorted. */
  kebabNames: string[];
  /** Placement heuristic for the generated file. */
  targetDir: string;
  /** True when the repo already has a generated registry. */
  hasExisting: boolean;
}

/** Directories we skip when scanning the consumer's source. */
const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".git",
  "coverage",
  ".turbo",
  ".cache",
]);

const IGNORED_FILES = /\.(?:map|d\.ts)$/;

/** Walk the consumer's source tree and collect icon call sites. */
function collectIconFiles(cwd: string): string[] {
  const roots = ["src", "app", "lib", "pages", "components", "ui"]
    .map((r) => path.join(cwd, r))
    .filter((r) => existsSync(r));

  // Monorepos: also walk conventional app dirs (client/, apps/*/,
  // web/, frontend/), scanning their own src/ when present. This catches
  // stream-wise-style layouts where the app lives at <root>/client/src.
  for (const appDir of ["client", "web", "frontend", "apps"]) {
    const base = path.join(cwd, appDir);
    if (!existsSync(base)) continue;
    if (appDir === "apps" && statSync(base).isDirectory()) {
      for (const child of readdirSafe(base)) {
        const childPath = path.join(base, child);
        if (!statSync(childPath).isDirectory()) continue;
        const childSrc = ["src", "app", "lib", "pages", "components", "ui"]
          .map((r) => path.join(childPath, r))
          .find((p) => existsSync(p));
        roots.push(childSrc ?? childPath);
      }
    } else {
      const appSrc = ["src", "app", "lib", "pages", "components", "ui"]
        .map((r) => path.join(base, r))
        .find((p) => existsSync(p));
      roots.push(appSrc ?? base);
    }
  }

  // Fall back to the repo root when no conventional source dir exists.
  if (roots.length === 0) roots.push(cwd);

  const files: string[] = [];
  const MAX_FILES = 2000;
  const walk = (dir: string, depth: number) => {
    if (depth > 8 || files.length >= MAX_FILES) return;
    let entries: string[] = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (files.length >= MAX_FILES) return;
      const full = path.join(dir, name);
      let stat: ReturnType<typeof statSync>;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        if (IGNORED_DIRS.has(name)) continue;
        walk(full, depth + 1);
        continue;
      }
      if (stat.size > 256 * 1024) continue; // skip huge generated bundles
      if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) continue;
      if (IGNORED_FILES.test(name)) continue;
      files.push(full);
    }
  };
  for (const root of roots) walk(root, 0);
  return files;
}

/** Normalize a camelCase/mixed icon name to lucide's kebab form. */
export function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Extract icon-name string literals from a source file. Matches:
 *   - `name="icon-name"` / `name='icon-name'` on Icon/LightIcon or any
 *     component that receives an icon prop (icon=, leftIcon=, ...)
 *   - `registerIcon("icon-name", ...)` / `registerIcon('...')`
 *   - `overrides={{ iconName: ... }}` (IconProvider) - camelCase keys
 *     normalize to kebab later
 *   - Object-literal `icon: "name"` values (nav configs, feature grids,
 *     data arrays), with optional `as const`
 *
 * The regexes are deliberately broad (any `name="x"` literal that looks
 * like an icon) and then filtered: a string that matches a known
 * kebab icon shape (lowercase letters/digits/dashes) is kept, which
 * discards non-icon `name="firstName"`-style props almost entirely.
 */
export function scanFileNames(src: string): string[] {
  const out: string[] = [];
  const push = (raw: string | undefined) => {
    if (!raw) return;
    const trimmed = raw.trim();
    // Only accept icon-like names: kebab/camel of letters+digits+dashes.
    if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(trimmed)) return;
    if (trimmed.length < 2) return;
    out.push(trimmed);
  };

  // <Icon name="x" /> / <LightIcon name='x' /> / <SomeComp icon="x" />.
  // Plain form controls (<input name="...">, <select name>, <textarea
  // name>) are NOT icon call sites - those names are field names, and
  // HTML metadata tags (<meta name="...">, <link name="...">) are not
  // icons either. Property assignments (`this.name = "..."`,
  // `obj.name = "..."`) are not icons. Match only when the tag is NOT one
  // of those and the key is not a property access.
  const propRe =
    /\b(?:name|icon|leftIcon|rightIcon|startIcon|endIcon)\s*=\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = propRe.exec(src))) {
    const before = src.slice(Math.max(0, m.index - 24), m.index);
    if (/<(?:input|select|textarea|meta|link)\s*$/i.test(before)) continue;
    // `this.name = "..."` / `obj.name = "..."` - property assignment, not a
    // JSX attribute. The char right before the key is `.` in that case.
    if (/[.)\]]$/.test(before)) continue;
    push(m[1]);
  }

  // registerIcon("x", ...) - string literal first arg.
  const registerRe = /\bregisterIcon\s*\(\s*["']([^"']+)["']/g;
  while ((m = registerRe.exec(src))) push(m[1]);

  // overrides={{ settings: X, "chevron-down": Y, ... }} - object keys
  // inside an IconProvider overrides block.
  const overridesRe = /\boverrides\s*=\s*\{\{\s*([\s\S]*?)\s*\}\}/g;
  while ((m = overridesRe.exec(src))) {
    const block = m[1]!;
    for (const key of block.matchAll(/(["']?)([A-Za-z][A-Za-z0-9-]*)\1\s*:/g)) {
      push(key[2]!);
    }
  }

  // Object-literal `icon: "name"` values (nav configs, feature grids, data
  // arrays): `{ href, label, icon: "chart-column" }`, `icon: "key-round" as
  // const`. The value is the icon name; the `icon` key here is a property,
  // NOT a JSX prop (that was handled above), so a string literal value is
  // always the icon name. Optional `as const` / trailing whitespace.
  const objectIconRe = /\bicon:\s*["']([^"']+)["'](?:\s*as\s+const)?/g;
  while ((m = objectIconRe.exec(src))) {
    push(m[1]!);
  }

  return out;
}

/** The default semantic set every generated registry carries, so a fresh
 * consumer with zero icon call sites still gets a working common set. */
export const DEFAULT_SEMANTIC_NAMES = [
  "settings",
  "search",
  "check",
  "x",
  "menu",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevrons-up-down",
  "arrow-right",
  "arrow-left",
  "moon",
  "sun",
  "bell",
  "user",
  "users",
  "sparkles",
  "book-open",
  "copy",
  "trash",
  "building",
  "list",
  "layout-grid",
  "file-text",
  "triangle-alert",
  "mail",
  "message-square",
  "message-circle",
  "zap",
  "palette",
  "layout-dashboard",
  "circle-question-mark",
  "credit-card",
  "log-out",
  "upload",
  "qr-code",
  "panel-left",
  "layout-panel-left",
  "compass",
  "layers",
  "key-round",
  "boxes",
  "shield-check",
  "terminal",
  "puzzle",
  "lock",
  "ruler",
  "fingerprint-pattern",
  "store",
  "globe",
  "external-link",
];

/** Resolve a placement for the generated registry from the consumer layout. */
export function detectIconTargetDir(cwd: string): string {
  const candidates = ["lib/ui", "src/components/ui", "src/lib", "lib", "src"];
  const hasSource = (dir: string) => {
    if (!existsSync(dir)) return false;
    // A dir counts as a home only if it actually holds source files
    // (an empty/stale src/ that only lingers should not win over a
    // populated client/src).
    let found = false;
    const walk = (d: string, depth: number) => {
      if (found || depth > 4) return;
      for (const name of readdirSafe(d)) {
        if (found) return;
        const full = path.join(d, name);
        let isDir = false;
        try {
          isDir = statSync(full).isDirectory();
        } catch {
          continue;
        }
        if (isDir) {
          if (IGNORED_DIRS.has(name)) continue;
          walk(full, depth + 1);
        } else if (
          !IGNORED_FILES.test(name) &&
          !name.includes(".generated.") &&
          /\.(ts|tsx|js|jsx)$/.test(name)
        ) {
          found = true;
          return;
        }
      }
    };
    walk(dir, 0);
    return found;
  };

  for (const c of candidates) {
    if (hasSource(path.join(cwd, c))) return path.join(cwd, c);
  }
  // Monorepo: prefer the app dir's own source over the repo root.
  for (const appDir of ["client", "web", "frontend", "apps"]) {
    const base = path.join(cwd, appDir);
    if (!existsSync(base)) continue;
    if (appDir === "apps" && statSync(base).isDirectory()) {
      for (const child of readdirSafe(base)) {
        const childPath = path.join(base, child);
        if (!statSync(childPath).isDirectory()) continue;
        const match = candidates
          .map((c) => path.join(childPath, c))
          .find((p) => hasSource(p));
        if (match) return match;
      }
    } else {
      const match = candidates
        .map((c) => path.join(base, c))
        .find((p) => hasSource(p));
      if (match) return match;
    }
  }
  // Fall back: any existing candidate dir, then <cwd>/src.
  for (const c of candidates) {
    if (existsSync(path.join(cwd, c))) return path.join(cwd, c);
  }
  for (const appDir of ["client", "web", "frontend", "apps"]) {
    const base = path.join(cwd, appDir);
    if (!existsSync(base)) continue;
    const match = candidates
      .map((c) => path.join(base, c))
      .find((p) => existsSync(p));
    if (match) return match;
  }
  return path.join(cwd, "src");
}

/** Scan the consumer repo at `cwd` for icon call sites. */
export function scanIcons(cwd: string): IconScan {
  const files = collectIconFiles(cwd);
  const rawNames: string[] = [];
  const fileList: string[] = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const found = scanFileNames(src);
    if (found.length) {
      fileList.push(f);
      rawNames.push(...found);
    }
  }
  const kebab = new Set<string>();
  for (const n of rawNames) kebab.add(toKebab(n));
  const names = [...kebab].sort();
  const targetDir = detectIconTargetDir(cwd);
  const generatedFile = path.join(targetDir, "icons.generated.tsx");
  return {
    files: fileList,
    names: [...new Set(rawNames)].sort(),
    kebabNames: names,
    targetDir,
    hasExisting: existsSync(generatedFile),
  };
}

/* ── Lucide resolution ─────────────────────────────────────── */

/**
 * Resolve the lucide component export for a kebab icon name. We do NOT
 * ship a static icon map in the CLI (that would go stale and force a
 * release every time lucide renames an icon). Instead we parse lucide's
 * own type declarations at generation time - the same approach as
 * scripts/gen-icon-map.mjs - and build a name -> component lookup for
 * just the icons the consumer needs.
 */
export interface LucideCatalog {
  /** kebab name -> PascalCase export (e.g. "chevron-down" -> "ChevronDown"). */
  byName: Map<string, string>;
  version: string;
}

/** Locate lucide-react from the consumer's node_modules and build the
 * kebab -> export catalog. Falls back to the CLI's own copy when the
 * consumer hasn't installed lucide (they may not need to, since facet
 * bundles it). */
export function buildLucideCatalog(cwd: string): LucideCatalog {
  const byName = new Map<string, string>();
  let version = "unknown";

  // Find lucide-react: consumer's node_modules first, then the CLI's own.
  // The CLI's copy is resolved from this module's own package directory
  // (packages/cli), covering both the source-tree and built/published
  // layouts under pnpm's non-hoisted node_modules.
  const selfDir = path.dirname(fileURLToPath(import.meta.url));
  const cliRoot = findUp(selfDir, "package.json", (p) => isFacetCliPackage(p));
  const cliCopy = cliRoot
    ? path.join(cliRoot, "node_modules", "lucide-react")
    : findUp(selfDir, "lucide-react");
  const candidates = [
    path.join(cwd, "node_modules", "lucide-react"),
    path.join(cwd, "node_modules", ".pnpm"),
    ...(cliCopy ? [cliCopy] : []),
  ];
  let dtsPath = "";
  for (const c of candidates) {
    if (!existsSync(c)) continue;
    // pnpm: <store>/lucide-react@1.30.0_react@19/node_modules/lucide-react
    const dirs = existsSync(path.join(c, "package.json"))
      ? [c]
      : readdirSafe(c)
          .filter((d) => d.startsWith("lucide-react@"))
          .sort()
          .reverse()
          .map((d) => path.join(c, d, "node_modules", "lucide-react"))
          .filter((p) => existsSync(path.join(p, "package.json")));
    for (const dir of dirs) {
      const pkgDir = dir;
      const pkgJson = path.join(pkgDir, "package.json");
      if (!existsSync(pkgJson)) continue;
      try {
        version =
          (JSON.parse(readFileSync(pkgJson, "utf8")) as { version?: string })
            .version ?? version;
      } catch {
        // ignore
      }
      const dts = [
        "dist/lucide-react.d.ts",
        "dist/types/lucide-react.d.ts",
        "lucide-react.d.ts",
      ]
        .map((p) => path.join(pkgDir, p))
        .find((p) => existsSync(p));
      if (dts) {
        dtsPath = dts;
        break;
      }
    }
    if (dtsPath) break;
  }

  // Parse `declare const ChevronDown: ...LucideIcon` + the @name for the
  // canonical kebab key. Fall back to toKebab(export) when no @name block.
  if (dtsPath) {
    const dts = readFileSync(dtsPath, "utf8");
    const names = new Map<string, string>(); // kebab -> export
    for (const block of dts.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
      const comment = block[1]!;
      if (comment.includes("@deprecated")) continue;
      const name = comment.match(/@name (\w+)/)?.[1];
      if (name) {
        const exportName = comment.match(/@component @name (\w+)/)?.[1];
        if (exportName) names.set(toKebab(name), exportName);
      }
    }
    // Backfill any icons not annotated (declared but not in a doc block).
    for (const decl of dts.matchAll(
      /declare const ([A-Z]\w+)\s*:\s*ForwardRefExoticComponent/g,
    )) {
      const exportName = decl[1]!;
      const key = toKebab(exportName);
      if (!names.has(key)) names.set(key, exportName);
    }
    for (const [k, v] of names) byName.set(k, v);
  }

  return { byName, version };
}

/** Names the consumer uses that resolve to a lucide icon. */
export interface ResolvedIcons {
  /** kebab name -> export, for icons found in lucide. */
  used: Map<string, string>;
  /** kebab names NOT resolvable (removed/renamed in lucide) - reported. */
  unresolved: string[];
  /** Legacy names mapped through LUCIDE_ALIASES to a current icon. */
  renamed: string[];
  version: string;
}

/** Old lucide names (renamed/removed) -> the current name that replaced
 * them, so consumer call sites that use a legacy name still resolve to a
 * real icon instead of silently rendering nothing. */
export const LUCIDE_ALIASES: Record<string, string> = {
  close: "x",
  grid: "layout-grid",
  "grid-3x3": "grid-3x3",
  document: "file-text",
  logout: "log-out",
  dashboard: "layout-dashboard",
  "chevron-up-down": "chevrons-up-down",
  "alert-triangle": "triangle-alert",
  "alert-circle": "circle-alert",
  "circle-alert": "circle-alert",
  "check-circle": "circle-check",
  "x-circle": "circle-x",
  "info-circle": "circle-info",
  "help-circle": "circle-question-mark",
  "arrow-circle-right": "circle-arrow-right",
  "arrow-circle-left": "circle-arrow-left",
  "edit-3": "pen",
  "edit-2": "pen",
  edit: "pen",
  "more-horizontal": "ellipsis",
  "more-vertical": "ellipsis-vertical",
  "external-link": "external-link",
  "lock-pattern": "fingerprint-pattern",
  "fingerprint-pattern": "fingerprint-pattern",
  "bar-chart": "chart-column",
  "bar-chart-2": "chart-column",
  "bar-chart-3": "chart-column",
  "line-chart": "chart-line",
  "pie-chart": "chart-pie",
  loader: "loader-circle",
  spinner: "loader-circle",
  crosshair: "crosshair",
  shield: "shield",
  "shield-alert": "shield-alert",
  "shield-check": "shield-check",
  "shield-x": "shield-x",
  // lucide kebab names that differ from the exported camelCase (the
  // catalog is built from lucide's type declarations, which use the
  // camelCase export names).
  "building-2": "building2",
  "building-3": "building3",
  github: "github",
  twitter: "twitter",
  slack: "slack",
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  youtube: "youtube",
};

/** Resolve the used set (call sites + defaults) through the catalog. */
export function resolveUsedIcons(
  kebabNames: string[],
  catalog: LucideCatalog,
): ResolvedIcons {
  const used = new Map<string, string>();
  const unresolved: string[] = [];
  const renamed: string[] = [];
  const merged = new Set([...DEFAULT_SEMANTIC_NAMES, ...kebabNames]);
  for (const name of merged) {
    const exportName = catalog.byName.get(name);
    if (exportName) {
      used.set(name, exportName);
      continue;
    }
    const alias = LUCIDE_ALIASES[name];
    if (alias) {
      const aliasedExport = catalog.byName.get(alias);
      if (aliasedExport) {
        used.set(name, aliasedExport);
        renamed.push(`${name} -> ${alias}`);
        continue;
      }
    }
    unresolved.push(name);
  }
  return { used, unresolved, renamed, version: catalog.version };
}

/* ── Generation ────────────────────────────────────────────── */

/** The generated registry module: a self-contained Icon component that
 * resolves the consumer's used set via direct lucide imports. */
export function generateIconRegistry(
  scan: IconScan,
  resolved: ResolvedIcons,
): GeneratedFile {
  const imports = [...new Set(resolved.used.values())]
    .sort()
    .map((n) => `  ${n},`)
    .join("\n");
  const entries = [...resolved.used.entries()]
    .map(([kebab, exportName]) => `  "${kebab}": ${exportName},`)
    .join("\n");

  const content = `/**
 * AUTO-GENERATED by \`facet icons generate\` - DO NOT EDIT BY HAND.
 *
 * The exact lucide icon subset this app uses (${resolved.used.size} icons
 * resolved against lucide-react v${resolved.version}), plus the default
 * semantic set. Importing from here instead of the full lucide map keeps
 * the bundle tree-shaken: only these icons ship, which avoids pulling the
 * ~1700-icon map (and the memory/heap cost that comes with it).
 *
 * Regenerate when you add or remove icons:
 *   npx facet icons generate
 */

import type { SVGProps } from "react";
import {
${imports}
} from "@fusorb/facet-components/icons";
import type { LucideIcon } from "@fusorb/facet-components/icons";

const ICONS: Record<string, LucideIcon> = {
${entries}
};

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  size?: number | string;
}

/** Renders a used icon by name. Unknown names render nothing. */
export function GeneratedIcon({ name, className, size, ...props }: GeneratedIconProps) {
  const kebab = name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
  const Component = ICONS[kebab] ?? ICONS[name];
  if (!Component) return null;
  return <Component className={className} size={size} {...props} />;
}

export default GeneratedIcon;
`;

  const filePath = path.join(scan.targetDir, "icons.generated.tsx");
  return { path: filePath, content };
}

function readdirSafe(p: string): string[] {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

/** Walk up from `fromDir` looking for <dir>/<name>, optionally gated by a
 * matcher on the candidate path. Returns the absolute path or "" when
 * not found. */
function findUp(
  fromDir: string,
  name: string,
  match?: (candidate: string) => boolean,
): string {
  let dir = path.resolve(fromDir);
  for (;;) {
    const candidate = path.join(dir, name);
    if (existsSync(candidate) && (!match || match(candidate))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return "";
    dir = parent;
  }
}

/** True when `pkgPath` is the CLI's own package.json. */
function isFacetCliPackage(pkgPath: string): boolean {
  try {
    const j = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
    return j.name === "@fusorb/facet-cli";
  } catch {
    return false;
  }
}
