/**
 * Drift gate: @fusorb/facet-sdk barrel exports vs the docs SDK-module table.
 *
 * The docs site renders a hand-authored "Modules" table of SDK classes in
 * `apps/docs/src/pages.ts` (e.g. `` [`AuthSdk`, "..."] ``). That table is NOT
 * generated from the SDK barrel, so a rename in `packages/sdk` can silently
 * drift out of sync with the docs (this is exactly how the stale
 * `CredentialsSdk` claim slipped through before it was corrected to `VcSdk`).
 *
 * This gate asserts the two stay in lock-step:
 *   - every `Sdk` value-exported from packages/sdk/src/index.ts is shown in the
 *     docs table, and
 *   - every `` `XxxSdk` `` referenced in the docs table is actually exported by
 *     the barrel (no stale / unexported names).
 *
 * Run:  node scripts/check-sdk-table-drift.mjs
 * Fails (exit 1) with a diff report on any drift.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const barrelPath = path.join(root, "packages/sdk/src/index.ts");
const docsPagesPath = path.join(root, "apps/docs/src/pages.ts");

const errors = [];
const ok = [];

/**
 * Value-exported SDK class names from the barrel.
 *
 * Matches `export { Name }` / `export { A, B }` value exports only - `export
 * type { ... }` is excluded because the regex requires `{` immediately after
 * `export`. Non-SDK exports (e.g. `ArcIdClient`) are dropped by the `Sdk`
 * suffix filter. Handles `export { A as B }` renames by stripping the alias.
 */
function sdkExportsFromBarrel(src) {
  const set = new Set();
  const re = /^export\s*\{([^}]*)\}\s*from/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().replace(/\s+as\s+\w+/, "").trim();
      if (name && name.endsWith("Sdk")) set.add(name);
    }
  }
  return set;
}

/**
 * SDK class names shown in the docs "Modules" table rows.
 *
 * Each row's first cell is a double-quoted string whose value is the backtick-
 * wrapped class name, e.g. `"``AuthSdk``"`. Scoping to that exact cell shape
 * (double-quote, backtick, name, backtick, double-quote, comma) is deliberate:
 * it pins the match to a table first-cell so a stale table entry cannot be
 * masked when the same name is merely mentioned in prose elsewhere.
 */
function sdkNamesFromDocs(src) {
  const set = new Set();
  const re = /"`([A-Z][A-Za-z0-9]*Sdk)`",/g;
  let m;
  while ((m = re.exec(src)) !== null) set.add(m[1]);
  return set;
}

const barrel = fs.readFileSync(barrelPath, "utf-8");
const docsSrc = fs.readFileSync(docsPagesPath, "utf-8");

const barrelSdks = sdkExportsFromBarrel(barrel);
const docsSdks = sdkNamesFromDocs(docsSrc);

const missingFromDocs = [...barrelSdks].filter((n) => !docsSdks.has(n)).sort();
const missingFromSdk = [...docsSdks].filter((n) => !barrelSdks.has(n)).sort();

if (missingFromDocs.length) {
  errors.push(
    `SDK classes exported from the barrel but missing from the docs table (${missingFromDocs.length}): ${missingFromDocs.join(", ")}`,
  );
} else {
  ok.push(`All ${barrelSdks.size} SDK classes are documented in the docs table.`);
}

if (missingFromSdk.length) {
  errors.push(
    `Docs table references SDK classes not exported from the barrel (${missingFromSdk.length}): ${missingFromSdk.join(", ")}`,
  );
} else {
  ok.push("Docs table has no stale or unexported SDK names.");
}

// Report (mirrors scripts/check-docs-inventory.mjs style).
console.log("SDK table <-> barrel drift check");
console.log("--------------------------------");
for (const line of ok) console.log(`  ok: ${line}`);
if (errors.length) {
  console.log("\nFAILED:");
  for (const line of errors) console.log(`  - ${line}`);
  console.log("\nFix the drift, then re-run node scripts/check-sdk-table-drift.mjs");
  process.exit(1);
}
console.log(`\nAll checks passed (${barrelSdks.size} SDK classes documented).`);
