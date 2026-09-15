import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { readExistingPackageJson, type PackageJsonShape } from "./writer.js";

/** Result of a template merge. */
export interface TemplateMergeResult {
  /** Files created (template copied in). */
  written: string[];
  /** Existing target files left untouched (identical, or conflict-skipped). */
  skipped: string[];
  /** Existing target files that differed and were NOT overwritten (need --force). */
  conflicts: string[];
  /** Files the template contributed that had no target conflict. */
  merged: string[];
}

export interface MergeOptions {
  /** Overwrite conflicting non-JSON files (still skips JSON merges). */
  force?: boolean;
  /** Only report what would change; write nothing. */
  dryRun?: boolean;
}

const MARKER = "@facet-merge";

/** Merge-safe extensions: code files that can absorb template additions. */
const MERGEABLE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

/** Does this template file opt into the code-append merge? */
function hasMergeMarker(content: string): boolean {
  return content.includes(MARKER);
}

/** Recursively collect relative file paths under `dir` (no dirs, and
 * never the template manifest itself). */
function walkFiles(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSafe(dir)) {
    if (entry.startsWith(".")) continue;
    const abs = path.join(dir, entry);
    const rel = base ? path.posix.join(base, entry) : entry;
    const stat = statSafe(abs);
    if (!stat) continue;
    if (stat.isDirectory()) out.push(...walkFiles(abs, rel));
    else if (rel !== "template.json") out.push(rel);
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

function statSafe(p: string) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

/** Generic package.json merge: consumer's fields always win, template's
 * deps/scripts are added under names that don't already exist. */
function mergePackageJsonContent(
  existing: PackageJsonShape,
  incoming: PackageJsonShape,
): string {
  const merged: PackageJsonShape = {
    ...existing,
    scripts: { ...(incoming.scripts ?? {}), ...(existing.scripts ?? {}) },
    dependencies: {
      ...(incoming.dependencies ?? {}),
      ...(existing.dependencies ?? {}),
    },
    devDependencies: {
      ...(incoming.devDependencies ?? {}),
      ...(existing.devDependencies ?? {}),
    },
    peerDependencies: {
      ...(incoming.peerDependencies ?? {}),
      ...(existing.peerDependencies ?? {}),
    },
  };
  return JSON.stringify(merged, null, 2) + "\n";
}

/**
 * Append the template file's contents into an existing code file. The
 * template file must contain a `// @facet-merge` marker line; everything
 * after the marker is appended to the target before its final `}` (or at
 * the end when there is no trailing brace). This is the controlled,
 * opt-in way to "merge the implementation in" without clobbering.
 */
function appendMergedCode(
  targetAbs: string,
  templateContent: string,
): string | null {
  const markerIdx = templateContent.indexOf(MARKER);
  if (markerIdx === -1) return null;
  const addition = templateContent
    .slice(markerIdx + MARKER.length)
    .replace(/^\s*\n/, "");
  const existing = readFileSync(targetAbs, "utf8");
  const braceIdx = existing.lastIndexOf("}");
  if (braceIdx !== -1) {
    return (
      existing.slice(0, braceIdx).trimEnd() +
      "\n" +
      addition.trimEnd() +
      "\n}\n"
    );
  }
  return existing.trimEnd() + "\n" + addition.trimEnd() + "\n";
}

/**
 * Merge the files of a template directory into a target directory.
 *
 * Conflict policy (never destructive by default):
 *  - Target missing            -> copy template in.
 *  - Target exists, identical  -> skip.
 *  - Target exists, differs:
 *    - package.json            -> merge (consumer fields always win).
 *    - code file with `@facet-merge` marker -> append the addition.
 *    - any other               -> conflict: skipped unless `--force`.
 */
export function mergeTemplateFiles(
  cwd: string,
  templateDir: string,
  targetDir: string,
  options: MergeOptions = {},
): TemplateMergeResult {
  const result: TemplateMergeResult = {
    written: [],
    skipped: [],
    conflicts: [],
    merged: [],
  };
  const relFiles = walkFiles(templateDir);
  const targetAbs = path.resolve(cwd, targetDir);

  for (const rel of relFiles) {
    const templateAbs = path.join(templateDir, rel);
    const targetFile = path.join(targetAbs, rel);
    const content = readFileSync(templateAbs, "utf8");

    if (!existsSync(targetFile)) {
      // Fresh: write it.
      if (!options.dryRun) {
        mkdirSync(path.dirname(targetFile), { recursive: true });
        writeFileSync(targetFile, content, "utf8");
      }
      result.written.push(rel);
      result.merged.push(rel);
      continue;
    }

    const existing = readFileSync(targetFile, "utf8");
    if (existing === content) {
      result.skipped.push(rel);
      continue;
    }

    // Differing file. Decide how to handle it.
    const ext = path.extname(rel);
    const isJson = rel === "package.json";
    if (isJson) {
      const existingPkg = readExistingPackageJson(targetAbs);
      const incomingPkg = JSON.parse(content) as PackageJsonShape;
      if (existingPkg && incomingPkg) {
        const merged = mergePackageJsonContent(existingPkg, incomingPkg);
        if (options.dryRun) result.merged.push(rel);
        else {
          writeFileSync(targetFile, merged, "utf8");
          result.merged.push(rel);
        }
      } else {
        // Unparseable package.json: treat like a normal file.
        result.conflicts.push(rel);
      }
      continue;
    }

    if (MERGEABLE.has(ext) && hasMergeMarker(content)) {
      const mergedCode = appendMergedCode(targetFile, content);
      if (mergedCode !== null) {
        if (options.dryRun) result.merged.push(rel);
        else {
          writeFileSync(targetFile, mergedCode, "utf8");
          result.merged.push(rel);
        }
        continue;
      }
    }

    // Conflicting non-mergeable file.
    if (options.force && !options.dryRun) {
      mkdirSync(path.dirname(targetFile), { recursive: true });
      writeFileSync(targetFile, content, "utf8");
      result.written.push(rel);
    } else {
      result.conflicts.push(rel);
    }
  }

  return result;
}
