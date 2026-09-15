import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/** What kind of content a template provides. */
export type TemplateKind = "docs" | "emails" | "any";

/** A template manifest (`template.json`) found in a consumer repo. */
export interface TemplateManifest {
  name: string;
  kind: TemplateKind;
  description?: string;
  include?: string[];
  exclude?: string[];
}

/** A discovered template directory + its manifest (when present). */
export interface TemplateInfo {
  /** Template display name (dir name, or manifest `name`). */
  name: string;
  /** Absolute path to the template directory. */
  dir: string;
  /** The manifest, when the dir has a template.json. */
  manifest: TemplateManifest | null;
  /** Directories the template is conventionally expected to fill. */
  kinds: TemplateKind[];
}

/** Parse a template.json manifest; null when invalid or absent. */
export function readTemplateManifest(dir: string): TemplateManifest | null {
  const file = path.join(dir, "template.json");
  try {
    const raw = JSON.parse(
      readFileSync(file, "utf8"),
    ) as Partial<TemplateManifest>;
    if (!raw.name) return null;
    return {
      name: raw.name,
      kind:
        raw.kind === "emails" ? "emails" : raw.kind === "any" ? "any" : "docs",
      description: raw.description,
      include: raw.include,
      exclude: raw.exclude,
    };
  } catch {
    return null;
  }
}

function readdirSafe(p: string): string[] {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

/** Is `dir` (absolute) a template directory? Has a template.json, or sits
 * under a conventional templates/ root. */
function isTemplateDir(dir: string): boolean {
  if (existsSync(path.join(dir, "template.json"))) return true;
  // Conventional roots: the parent dir is literally "templates".
  return path.basename(path.dirname(dir)) === "templates";
}

/**
 * Discover template directories in the consumer repo. Scans:
 *  - `<cwd>/templates/**`        (any depth)
 *  - `<cwd>/docs/templates/**`
 *  - `<cwd>/emails/templates/**`
 * plus any directory with a template.json manifest anywhere under those
 * roots. Returns deduplicated TemplateInfo, sorted by name.
 */
export function discoverTemplates(cwd: string): TemplateInfo[] {
  const out: TemplateInfo[] = [];
  const seen = new Set<string>();

  const roots = [
    path.join(cwd, "templates"),
    path.join(cwd, "docs", "templates"),
    path.join(cwd, "emails", "templates"),
  ];

  const add = (dir: string) => {
    const abs = path.resolve(dir);
    if (seen.has(abs)) return;
    seen.add(abs);
    const manifest = readTemplateManifest(abs);
    const kinds: TemplateKind[] = [];
    if (manifest) kinds.push(manifest.kind);
    else if (abs.includes(path.join("emails", "templates")))
      kinds.push("emails");
    else if (abs.includes(path.join("docs", "templates"))) kinds.push("docs");
    else kinds.push("any");
    out.push({
      name: manifest?.name ?? path.basename(abs),
      dir: abs,
      manifest,
      kinds,
    });
  };

  const walk = (root: string, depth: number) => {
    if (depth > 6) return; // bounded: don't crawl the whole repo
    if (!existsSync(root) || !statSync(root).isDirectory()) return;
    for (const entry of readdirSafe(root)) {
      if (entry.startsWith(".") || entry === "node_modules") continue;
      const p = path.join(root, entry);
      if (!statSync(p).isDirectory()) continue;
      if (isTemplateDir(p)) {
        add(p);
      } else {
        // A nested container (e.g. templates/docs/...) - recurse.
        walk(p, depth + 1);
      }
    }
  };

  for (const root of roots) {
    if (!existsSync(root)) continue;
    // The root itself can be a template dir.
    if (isTemplateDir(root)) add(root);
    walk(root, 1);
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** Resolve a template by name: exact match first (manifest name or dir
 * name), then a case-insensitive match. Returns null when not found. */
export function resolveTemplate(
  cwd: string,
  name: string,
): TemplateInfo | null {
  const templates = discoverTemplates(cwd);
  const exact =
    templates.find((t) => t.name === name) ??
    templates.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact;
  // Fallback: a template dir that the consumer named directly under
  // ./templates (even without a manifest).
  const direct = path.join(cwd, "templates", name);
  if (existsSync(direct) && statSync(direct).isDirectory()) {
    return {
      name,
      dir: path.resolve(direct),
      manifest: readTemplateManifest(direct),
      kinds: ["any"],
    };
  }
  return null;
}
