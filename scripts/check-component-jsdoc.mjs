#!/usr/bin/env node
/**
 * Gate: every ui component carries editorial JSDoc metadata (Phase 5 / Stage 4).
 *
 * The registry scanner (packages/registry/src/scan.mjs) and the docs manifest
 * generator (scripts/gen-docs-manifest.mjs) read `@category`/`@summary` from
 * component source, so the source file is the single source of truth for that
 * metadata. This gate fails when a component is added without them, so the
 * migration from the old hard-coded category map can't silently regress.
 *
 * Run: node scripts/check-component-jsdoc.mjs   (exits 1 on a missing tag)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiDir = path.join(root, "packages/components/src/ui");

const ALLOWED_CATEGORIES = new Set([
  "layout",
  "inputs",
  "feedback",
  "data-display",
  "ready-to-use",
  "animation",
  "pages",
  "general",
]);

const files = fs
  .readdirSync(uiDir)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx") && !f.endsWith(".examples.tsx"))
  .sort();

const problems = [];

for (const file of files) {
  const rel = `ui/${file}`;
  const src = fs.readFileSync(path.join(uiDir, file), "utf-8");

  const category = (src.match(/@category\s+(\S+)/) ?? [])[1];
  const summary = (src.match(/@summary\s+(.+)/) ?? [])[1]?.trim();

  if (!category) {
    problems.push(`${rel}: missing @category JSDoc tag`);
  } else if (!ALLOWED_CATEGORIES.has(category)) {
    problems.push(
      `${rel}: unknown @category "${category}" (allowed: ${[...ALLOWED_CATEGORIES].join(", ")})`,
    );
  }
  if (!summary) problems.push(`${rel}: missing @summary JSDoc tag`);
}

console.log("Component JSDoc metadata audit");
console.log("------------------------------");
console.log(`  components: ${files.length}`);
console.log(`  categories: ${ALLOWED_CATEGORIES.size} allowed`);
if (problems.length) {
  console.log("\nProblems:");
  for (const p of problems) console.log(`  - ${p}`);
  console.log(`\nFAILED: ${problems.length} component(s) lack @category/@summary metadata.`);
  process.exit(1);
}
console.log(`\nok: all ${files.length} components carry @category + @summary.`);
