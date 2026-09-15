/**
 * Shared types and helpers for the facet docs scaffold.
 *
 * The scaffold is intentionally framework/language-agnostic: the wizard
 * asks for the consumer's stack up front and the generator tailors the
 * output accordingly. Not everyone uses TypeScript or React+Vite.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export type Language = "typescript" | "javascript";

/** Frontend frameworks only. Backend stacks (Fastify, Express, Nest, ...)
 * don't affect the docs scaffold: docs are a frontend concern. */
export type Framework = "react-vite" | "next" | "remix" | "plain-js" | "python";

/**
 * Where the generated docs live. Root (`.`) is recommended; consumers who
 * prefer their docs under the source tree choose `src/docs` or `docs`.
 */
export type DocsLocation = "." | "src/docs" | "docs";

/**
 * Where `facet add <component>` drops the copied source. A free-form
 * relative dir (default `src/components`), because it targets the
 * consumer's source tree, not the docs site. Components are written flat
 * into a dedicated subdirectory inside it (`src/components/facet/` by
 * default) so the consumer's own components root stays untouched.
 */
export type AddTarget = string;

/** What kind of documentation the consumer is publishing. */
export type TemplateKind =
  "component-library" | "api-reference" | "product-docs";

/** Styling setup detected in the consumer's repo. */
export type Styling = "facet-tokens" | "tailwind" | "plain-css" | "none";

export interface DocsAnswers {
  /** Docs site name (defaults to "docs"). */
  name: string;
  /** Where the scaffold lands. "." recommended. */
  location: DocsLocation;
  /** Consumer's language. */
  language: Language;
  /** Consumer's framework. */
  framework: Framework;
  /** Consumer's styling setup. */
  styling: Styling;
  /** Whether to wire @fusorb/facet-tokens (recommended). */
  useFacetTokens: boolean;
  /** Docs template kind. */
  template: TemplateKind;
  /** Optional: merge a consumer template directory into the scaffold. */
  useTemplate?: string;
  /** Whether to create a barrel export for the generated site. `"auto"`
   * (default) creates one when it fits the layout, `true` always creates,
   * `false` never touches a barrel. */
  barrel: boolean | "auto";
  /** Resolved current versions of the facet packages (npm registry). */
  facetVersions: Record<string, string>;
}

export interface GeneratedFile {
  /** Absolute path to write. */
  path: string;
  /** File contents. */
  content: string;
}

/**
 * Detect the consumer's styling setup from the cwd. Returns what's found
 * on disk so the wizard can recommend the facet path accurately.
 */
export function detectStyling(cwd: string): Styling {
  const has = (p: string) => existsSync(path.join(cwd, p));
  const read = (p: string) => {
    try {
      return readFileSync(path.join(cwd, p), "utf8");
    } catch {
      return "";
    }
  };
  const readJson = (p: string): Record<string, any> => {
    try {
      return JSON.parse(read(p)) as Record<string, any>;
    } catch {
      return {};
    }
  };

  // Facet tokens: tokens.css imported or @fusorb/facet-tokens in deps.
  const pkg = has("package.json") ? readJson("package.json") : {};
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  } as Record<string, string>;
  if (
    deps["@fusorb/facet-tokens"] ||
    read("src/app.css").includes("facet-tokens")
  ) {
    return "facet-tokens";
  }
  if (
    deps.tailwindcss ||
    has("tailwind.config.js") ||
    has("tailwind.config.ts")
  ) {
    return "tailwind";
  }
  if (
    has("src") &&
    readdirSafe(path.join(cwd, "src")).some((f) => f.endsWith(".css"))
  ) {
    return "plain-css";
  }
  return "none";
}

/** Package manager, detected so the "next steps" recommend the right
 * install command and the lockfile is generated fresh by the real tool. */
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/**
 * Detect the consumer's package manager from lockfiles in cwd. Falls back
 * to npm (the safest default). Used to recommend the correct install
 * command after scaffolding instead of assuming pnpm.
 */
export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (
    existsSync(path.join(cwd, "bun.lockb")) ||
    existsSync(path.join(cwd, "bun.lock"))
  )
    return "bun";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

/** Human-readable install command for the detected package manager. */
export function installCommand(pm: PackageManager): string {
  switch (pm) {
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn install";
    case "bun":
      return "bun install";
    default:
      return "npm install";
  }
}

/**
 * Detect whether cwd is a monorepo/workspace root. Returns the workspace
 * globs from the manifest, or null when the repo is a single package.
 *
 * - pnpm: `pnpm-workspace.yaml` (or `workspace:` deps in package.json)
 * - yarn/npm: a `workspaces` field in package.json
 */
export function detectMonorepo(cwd: string): string[] | null {
  const read = (p: string) => {
    try {
      return readFileSync(path.join(cwd, p), "utf8");
    } catch {
      return "";
    }
  };
  // pnpm workspace file wins: `packages: [...]` globs.
  const pnpmYaml = read("pnpm-workspace.yaml");
  if (pnpmYaml.trim()) {
    const m = pnpmYaml.match(/packages:\s*\n((?:\s*-\s*[^\n]+\n?)+)/);
    if (m) {
      const globs = m[1]!
        .split("\n")
        .map((l) => l.trim().replace(/^-/, "").trim().replace(/['"]/g, ""))
        .filter(Boolean);
      if (globs.length) return globs;
    }
  }
  // package.json `workspaces` field (yarn/npm).
  try {
    const pkg = JSON.parse(read("package.json")) as Record<string, unknown>;
    const workspaces = pkg.workspaces;
    if (Array.isArray(workspaces) && workspaces.length) {
      return workspaces as string[];
    }
    if (workspaces && typeof workspaces === "object") {
      const pkgs = (workspaces as { packages?: string[] }).packages;
      if (Array.isArray(pkgs) && pkgs.length) return pkgs;
    }
  } catch {
    // fall through
  }
  return null;
}

/** Read a consumer's dependency manifests (root + workspace packages) and
 * collect every declared facet dependency. Returns name -> declared range. */
export function collectFacetDeps(cwd: string): Record<string, string> {
  const read = (p: string) => {
    try {
      return JSON.parse(readFileSync(p, "utf8")) as Record<string, any>;
    } catch {
      return null;
    }
  };
  const merged: Record<string, string> = {};
  const pkg = read(path.join(cwd, "package.json"));
  if (pkg) {
    for (const section of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]) {
      const deps = (pkg[section] ?? {}) as Record<string, string>;
      for (const [name, range] of Object.entries(deps)) {
        if (name.startsWith("@fusorb/facet-")) merged[name] = range;
      }
    }
  }
  // Workspace members (best effort: expand workspace globs). A glob can be
  // a direct member dir ("client") or a wildcard ("packages/*").
  const globs = detectMonorepo(cwd) ?? [];
  const memberDirs = new Set<string>();
  for (const glob of globs) {
    const base = glob.replace(/\/\*+$/, "");
    if (glob.includes("*")) {
      for (const d of readdirSafe(path.join(cwd, base))) {
        memberDirs.add(path.join(cwd, base, d));
      }
    } else {
      memberDirs.add(path.join(cwd, base));
    }
  }
  for (const member of memberDirs) {
    const mpkg = read(path.join(member, "package.json"));
    if (!mpkg) continue;
    for (const section of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]) {
      const deps = (mpkg[section] ?? {}) as Record<string, string>;
      for (const [name, range] of Object.entries(deps)) {
        if (name.startsWith("@fusorb/facet-")) merged[name] = range;
      }
    }
  }
  return merged;
}

/**
 * Compare two semver strings. Returns a negative number when a < b,
 * positive when a > b, 0 when equal. Handles pre-release suffixes by
 * stripping them (sufficient for the CLI's update checks).
 */
export function compareVersions(a: string, b: string): number {
  const strip = (v: string) => v.replace(/[-+].*$/, "");
  const pa = strip(a).split(".").map(Number);
  const pb = strip(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

/**
 * Detect the consumer's FRONTEND framework from cwd. Backend-only markers
 * (fastify, express, nest, etc.) are deliberately ignored: a fullstack
 * repo like SovGrant (Next.js + Fastify) should be detected as Next.js, and
 * the docs scaffold is a frontend concern.
 */
export function detectFramework(cwd: string): Framework {
  const has = (p: string) => existsSync(path.join(cwd, p));
  const read = (p: string) => {
    try {
      return readFileSync(path.join(cwd, p), "utf8");
    } catch {
      return "";
    }
  };
  const readJson = (p: string): Record<string, any> => {
    try {
      return JSON.parse(read(p)) as Record<string, any>;
    } catch {
      return {};
    }
  };
  const pkg = has("package.json") ? readJson("package.json") : {};
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  } as Record<string, string>;

  // Frontend-only signals, checked in priority order.
  if (
    deps.next ||
    has("next.config.js") ||
    has("next.config.mjs") ||
    has("next.config.ts")
  ) {
    return "next";
  }
  if (
    deps.remix ||
    has("remix.config.js") ||
    has("remix.config.mjs") ||
    has("app/root.tsx")
  ) {
    return "remix";
  }
  if (
    deps.vite ||
    has("vite.config.ts") ||
    has("vite.config.js") ||
    has("vite.config.mjs")
  ) {
    return "react-vite";
  }
  // If a package.json exists but no frontend framework is detected, the
  // repo is backend-only or unknown: plain-js is the safe fallback.
  if (has("package.json")) {
    return "plain-js";
  }
  if (has("pyproject.toml") || has("requirements.txt") || has("Pipfile")) {
    return "python";
  }
  return "plain-js";
}

/** Dev-server script for the detected frontend framework. */
export function devCommand(framework: Framework): string {
  switch (framework) {
    case "next":
      return "pnpm dev";
    case "remix":
      return "pnpm dev";
    case "react-vite":
      return "pnpm dev";
    case "python":
      return "python docs_pipeline.py";
    default:
      return "Run the content pipeline";
  }
}

function readdirSafe(p: string): string[] {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}
