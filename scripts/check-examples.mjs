#!/usr/bin/env node
/**
 * Gate: colocated component examples are well-formed and wired (Phase 5 / ADR-001).
 *
 * Validates every `packages/components/src/ui/<slug>.examples.tsx`:
 *   1. the file's `artifact` equals the component slug, and that slug is a real
 *      component (not a typo, not an orphan file);
 *   2. example `id`s are unique within the file;
 *   3. every `controls` key references a prop the example actually advertises;
 *   4. the export name follows the `<slug>Examples` convention;
 *   5. the file is re-exported from the published `src/examples.ts` barrel
 *      (the `./examples` subpath).
 *
 * Compilation itself is enforced by `pnpm -r typecheck` / `pnpm build` (tsup
 * builds `src/examples.ts`), so this gate stays a fast, dependency-free scan.
 *
 * Run: node scripts/check-examples.mjs   (exits 1 on drift)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiDir = path.join(root, "packages/components/src/ui");
const barrelPath = path.join(root, "packages/components/src/examples.ts");

const isComponentFile = (f) =>
  f.endsWith(".tsx") && !f.endsWith(".test.tsx") && !f.endsWith(".examples.tsx");

const components = new Set(
  fs.readdirSync(uiDir).filter(isComponentFile).map((f) => f.replace(/\.tsx$/, "")),
);

const exampleFiles = fs
  .readdirSync(uiDir)
  .filter((f) => f.endsWith(".examples.tsx"))
  .sort();

const barrel = fs.existsSync(barrelPath) ? fs.readFileSync(barrelPath, "utf-8") : "";

const kebabToPascal = (s) =>
  s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

const kebabToCamel = (s) => {
  const pascal = kebabToPascal(s);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/** Skip a quoted/template literal starting at `i` (returns index after it). */
function skipString(src, i) {
  const quote = src[i];
  i++;
  while (i < src.length) {
    if (src[i] === "\\") {
      i += 2;
      continue;
    }
    if (src[i] === quote) return i + 1;
    i++;
  }
  return i;
}

/** Top-level object-literal keys of `src` (nested objects/arrays are skipped). */
function topLevelKeys(src) {
  const keys = [];
  let depth = 0;
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(src, i);
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "[") {
      depth++;
      i++;
      continue;
    }
    if (ch === "}" || ch === ")" || ch === "]") {
      depth--;
      i++;
      continue;
    }
    if (depth === 0 && /[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const word = src.slice(i, j);
      let k = j;
      while (k < src.length && /[\s?]/.test(src[k])) k++;
      if (src[k] === ":") keys.push(word);
      i = j;
      continue;
    }
    i++;
  }
  return keys;
}

/** Return the balanced `{ ... }` block starting at the `{` at `openIndex`. */
function braceBlock(src, openIndex) {
  let depth = 0;
  let i = openIndex;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(src, i);
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(openIndex + 1, i);
    }
    i++;
  }
  return src.slice(openIndex + 1);
}

const errors = [];
let exampleCount = 0;

for (const file of exampleFiles) {
  const slug = file.replace(/\.examples\.tsx$/, "");
  const rel = `ui/${file}`;
  const src = fs.readFileSync(path.join(uiDir, file), "utf-8");

  if (!components.has(slug)) {
    errors.push(`${rel}: no component "ui/${slug}.tsx" exists - examples are orphaned`);
    continue;
  }

  // 4. export-name convention
  const exportName = (src.match(/export\s+const\s+([A-Za-z0-9_$]+)/) ?? [])[1];
  const expectedExport = `${kebabToCamel(slug)}Examples`;
  if (!exportName) {
    errors.push(`${rel}: expected "export const ${expectedExport}" - no exported array found`);
  } else if (exportName !== expectedExport) {
    errors.push(`${rel}: export "${exportName}" should be "${expectedExport}"`);
  }

  // 5. barrel wiring
  if (exportName && !new RegExp(`\\b${exportName}\\b`).test(barrel)) {
    errors.push(`${rel}: "${exportName}" is not re-exported from src/examples.ts`);
  }

  // 3. advertised props (used to validate control keys)
  const ifaceMatch = src.match(/export\s+interface\s+([A-Za-z0-9_$]+)(?:\s+extends[^{]+)?\s*\{/);
  const expectedProps = `${kebabToPascal(slug)}ExampleProps`;
  let propKeys = null;
  if (ifaceMatch) {
    if (ifaceMatch[1] !== expectedProps) {
      errors.push(`${rel}: props interface "${ifaceMatch[1]}" should be "${expectedProps}"`);
    }
    propKeys = new Set(topLevelKeys(braceBlock(src, src.indexOf("{", ifaceMatch.index))));
  }

  // Split into example objects on line-anchored `id: "..."` (nested data rows
  // like `{ id: "m1", ... }` sit inline, so `^\s*id:` never matches them).
  const idMatches = [...src.matchAll(/^[ \t]*id:\s*"([^"]+)"/gm)];
  if (idMatches.length === 0) {
    errors.push(`${rel}: no examples found (expected at least one)`);
    continue;
  }

  const seenIds = new Set();
  idMatches.forEach((m, idx) => {
    const chunk = src.slice(m.index, idMatches[idx + 1]?.index ?? src.length);
    const id = m[1];
    exampleCount++;

    if (seenIds.has(id)) errors.push(`${rel}: duplicate example id "${id}"`);
    seenIds.add(id);

    const artifact = (chunk.match(/artifact:\s*"([^"]+)"/) ?? [])[1];
    if (!artifact) {
      errors.push(`${rel} (${id}): missing "artifact"`);
    } else if (artifact !== slug) {
      errors.push(`${rel} (${id}): artifact "${artifact}" must equal the slug "${slug}"`);
    }

    if (!/title:\s*"/.test(chunk)) errors.push(`${rel} (${id}): missing "title"`);
    if (!/\brender\s*[:(]/.test(chunk)) errors.push(`${rel} (${id}): missing "render"`);

    const controlsIdx = chunk.search(/\bcontrols:\s*\{/);
    if (controlsIdx !== -1) {
      const open = chunk.indexOf("{", controlsIdx);
      const keys = topLevelKeys(braceBlock(chunk, open));
      if (propKeys) {
        for (const key of keys) {
          if (!propKeys.has(key)) {
            errors.push(
              `${rel} (${id}): control "${key}" is not an advertised prop of ${expectedProps}`,
            );
          }
        }
      }
    }
  });
}

console.log("Colocated examples audit (ADR-001)");
console.log("----------------------------------");
console.log(`  files:    ${exampleFiles.length}`);
console.log(`  examples: ${exampleCount}`);
if (errors.length) {
  console.log("\nProblems:");
  for (const e of errors) console.log(`  - ${e}`);
  console.log(`\nFAILED: ${errors.length} example problem(s). See messages above.`);
  process.exit(1);
}
console.log(`\nok: ${exampleCount} example(s) across ${exampleFiles.length} file(s) are well-formed.`);
