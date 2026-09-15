import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { GeneratedFile } from "./types.js";

/** Write generated files to disk, creating parent dirs. Returns written paths. */
export function writeFiles(files: GeneratedFile[]): string[] {
  const written: string[] = [];
  for (const file of files) {
    mkdirSync(path.dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.content, "utf8");
    written.push(file.path);
  }
  return written;
}

export interface PackageJsonShape {
  name?: string;
  version?: string;
  private?: boolean;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export interface MergeResult {
  /** Final package.json content (stringified). */
  content: string;
  /** Whether a package.json already existed (true = patched, false = created). */
  existed: boolean;
}

/**
 * Build the target package.json for the docs site.
 *
 * If a package.json already exists in the consumer's repo, it is PATCHED:
 * the consumer's own scripts, deps, name, and metadata are preserved, and
 * the docs scripts/deps are added on top (never overwriting existing
 * values: the docs scripts use distinct names). If none exists, a fresh
 * minimal package.json is created.
 *
 * Dependencies use the resolved ranges passed in (from the npm registry),
 * so we never pin an outdated or guessed version.
 */
export function mergePackageJson(
  existing: PackageJsonShape | null,
  resolved: {
    facetDocs: string;
    facetTokens: string;
    facetComponents: string;
    facetLayout: string;
    framework: "react-vite" | "next" | "remix" | "plain-js" | "python";
    language: "typescript" | "javascript";
  },
): MergeResult {
  const existed = existing !== null;

  // Docs scripts, added under distinct names so they never clobber a
  // consumer's existing "dev"/"build" scripts. For Next/Remix the docs
  // site IS the app route, so scripts drive the framework's dev server.
  const docsScripts: Record<string, string> =
    resolved.framework === "react-vite"
      ? {
          "docs:dev": "vite",
          "docs:build": "vite build",
          "docs:preview": "vite preview",
        }
      : resolved.framework === "next"
        ? {
            "docs:dev": "next dev",
            "docs:build": "next build",
            "docs:start": "next start",
          }
        : resolved.framework === "remix"
          ? {
              "docs:dev": "remix dev",
              "docs:build": "remix build",
            }
          : {};

  const facetDeps = {
    "@fusorb/facet-docs": resolved.facetDocs,
    "@fusorb/facet-tokens": resolved.facetTokens,
    "@fusorb/facet-components": resolved.facetComponents,
    "@fusorb/facet-layout": resolved.facetLayout,
  };

  // Fresh Next/Remix scaffolds need the framework + React runtime.
  const frameworkDeps: Record<string, string> =
    resolved.framework === "next"
      ? { next: "^15", react: "^19", "react-dom": "^19" }
      : resolved.framework === "remix"
        ? {
            "@remix-run/react": "^2",
            "@remix-run/node": "^2",
            react: "^19",
            "react-dom": "^19",
          }
        : {};

  if (existed) {
    const merged: PackageJsonShape = {
      ...existing,
      scripts: { ...(existing.scripts ?? {}), ...docsScripts },
      dependencies: {
        ...(existing.dependencies ?? {}),
        ...facetDeps,
        ...frameworkDeps,
      },
    };
    return { content: JSON.stringify(merged, null, 2) + "\n", existed };
  }

  // Fresh minimal scaffold. The consumer's package manager generates the
  // lockfile on install; react/vite peer deps are resolved by npm/pnpm.
  const fresh: PackageJsonShape = {
    name: "docs",
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      ...docsScripts,
      dev:
        resolved.framework === "next" || resolved.framework === "remix"
          ? resolved.framework === "next"
            ? "next dev"
            : "remix dev"
          : "vite",
      build:
        resolved.framework === "next" || resolved.framework === "remix"
          ? resolved.framework === "next"
            ? "next build"
            : "remix build"
          : "vite build",
      preview:
        resolved.framework === "next" || resolved.framework === "remix"
          ? resolved.framework === "next"
            ? "next start"
            : "remix-serve build"
          : "vite preview",
    },
    dependencies: { ...facetDeps, ...frameworkDeps },
  };
  return { content: JSON.stringify(fresh, null, 2) + "\n", existed };
}

/** Read an existing package.json from a dir, or null if absent/invalid. */
export function readExistingPackageJson(
  targetDir: string,
): PackageJsonShape | null {
  const p = path.join(targetDir, "package.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as PackageJsonShape;
  } catch {
    return null;
  }
}
