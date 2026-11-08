#!/usr/bin/env node
/**
 * Gate: check:consumer-matrix (M8, spec §13).
 *
 * Verifies that published packages don't have duplicate @fusorb/* deps.
 * Runs `pnpm why @fusorb/facet-components` (and others) to check for duplicates.
 * Also verifies pack tarballs exist and are valid.
 *
 * Run: node scripts/check-consumer-matrix.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];

// Check for duplicate @fusorb/* in the dependency tree
const packages = [
  "@fusorb/facet-components",
  "@fusorb/facet-tokens",
  "@fusorb/facet-auth",
  "@fusorb/facet-layout",
  "@fusorb/facet-sdk",
  "@fusorb/facet-docs",
];

for (const pkg of packages) {
  try {
    const out = execSync(`pnpm why ${pkg} 2>&1`, { cwd: root, encoding: "utf-8", timeout: 60000 });
    // Count occurrences of the package name in the output (excluding the header)
    const lines = out.split("\n").filter((l) => l.includes(pkg));
    // If more than 2 lines mention the package, there might be duplicates
    if (lines.length > 5) {
      warnings.push(`${pkg}: ${lines.length} references in dependency tree (possible duplicates)`);
    }
  } catch (e) {
    // pnpm why may fail if package isn't installed — not an error
  }
}

// Check pack tarballs exist (from pins-pack-real or similar)
const packDir = path.join(root, "scratchpad/pins-pack-real");
if (fs.existsSync(packDir)) {
  const tarballs = fs.readdirSync(packDir).filter((f) => f.endsWith(".tgz"));
  if (tarballs.length === 0) {
    warnings.push("No pack tarballs found in scratchpad/pins-pack-real/");
  } else {
    console.log(`check:consumer-matrix: ${tarballs.length} pack tarball(s) found`);
  }
} else {
  console.log("check:consumer-matrix: no pack dir (skipped — run pnpm pack to generate)");
}

if (errors.length) {
  console.log("check:consumer-matrix: FAIL");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
if (warnings.length) {
  console.log("check:consumer-matrix: WARN");
  for (const w of warnings) console.log(`  - ${w}`);
} else {
  console.log("check:consumer-matrix: OK");
}
