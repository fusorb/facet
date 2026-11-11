// Drift gate for docs/component inventory.
//
// Enforces the invariants that keep the docs and library in sync:
//   1. Every ui/ component is re-exported from the package barrel.
//   2. CLAUDE.md documents the correct component count.
//
// Run: node scripts/check-docs-inventory.mjs
// Fails (exit 1) with a report on any drift.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiDir = path.join(root, "packages/components/src/ui");
const barrelPath = path.join(root, "packages/components/src/index.ts");
const claudePath = path.join(root, "CLAUDE.md");

const errors = [];
const ok = [];

function componentNames(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx") && !f.endsWith(".examples.tsx"))
    .map((f) => f.replace(/\.tsx$/, ""));
}

// 1. Barrel parity: every component file is re-exported from index.ts.
const components = componentNames(uiDir).sort();
const barrel = fs.readFileSync(barrelPath, "utf-8");
const missingExports = components.filter(
  (c) => !barrel.includes(`/${c}`) && !barrel.includes(`"../ui/${c}`),
);
if (missingExports.length) {
  errors.push(
    `Missing barrel exports (${missingExports.length}): ${missingExports.join(", ")}`,
  );
} else {
  ok.push(`All ${components.length} ui components are barrel-exported.`);
}

// 2. Doc count assertion against CLAUDE.md.
const claude = fs.readFileSync(claudePath, "utf-8");
const componentCount = components.length;
const componentDoc = claude.match(/(\d+)\+? styled Radix components/);
if (componentDoc && Number(componentDoc[1]) !== componentCount) {
  errors.push(
    `CLAUDE.md says ${componentDoc[1]} components, actual is ${componentCount}.`,
  );
} else {
  ok.push(`CLAUDE.md component count matches (${componentCount}).`);
}

// Report.
console.log("Docs inventory check");
console.log("-------------------");
for (const line of ok) console.log(`  ok: ${line}`);
if (errors.length) {
  console.log("\nFAILED:");
  for (const line of errors) console.log(`  - ${line}`);
  console.log("\nFix the drift, then re-run node scripts/check-docs-inventory.mjs");
  process.exit(1);
}
console.log(`\nAll checks passed (${components.length} components).`);
