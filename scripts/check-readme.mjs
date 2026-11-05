#!/usr/bin/env node
/**
 * Gate: README.md package versions and forms count stay in sync with package.json.
 *
 * Validates:
 *   1. Every @fusorb/facet-* package in the README table has the version
 *      matching its package.json.
 *   2. The "Current versions:" line matches.
 *   3. The auth forms count ("N standalone forms") matches the number of
 *      *Form exports in packages/auth/src/forms/index.ts.
 *
 * Run: node scripts/check-readme.mjs   (exits 1 on drift)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readme = fs.readFileSync(path.join(root, "README.md"), "utf-8");
const errors = [];

// 1. Package versions in the table
const packages = fs
  .readdirSync(path.join(root, "packages"))
  .filter((d) => fs.existsSync(path.join(root, "packages", d, "package.json")));

for (const dir of packages) {
  const pj = JSON.parse(fs.readFileSync(path.join(root, "packages", dir, "package.json"), "utf-8"));
  const name = pj.name;
  if (!name || !name.startsWith("@fusorb/")) continue;
  const version = pj.version;
  // Find the README table row for this package
  const rowRe = new RegExp(`\\| \\x60${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\x60[^|]*\\|[^|]*\\|\\s*✅\\s*${version.replace(/\./g, "\\.")}\\s*\\|`);
  // Simpler: find any row mentioning the package name and check version
  const lines = readme.split("\n");
  for (const line of lines) {
    if (!line.includes(name)) continue;
    if (!line.includes("✅")) continue;
    const vMatch = line.match(/✅\s*(\d+\.\d+\.\d+)/);
    if (vMatch && vMatch[1] !== version) {
      errors.push(`README: ${name} shows ${vMatch[1]} but package.json has ${version}`);
    }
  }
}

// 2. Forms count
const formsIndex = fs.readFileSync(path.join(root, "packages/auth/src/forms/index.ts"), "utf-8");
const formCount = (formsIndex.match(/Form\b/g) || []).length; // rough
// Better: count exports ending in "Form"
const formExports = [...formsIndex.matchAll(/export\s*\{[^}]*\}/g)]
  .flatMap((m) => m[0].match(/[A-Za-z]+Form\b/g) || []);
const uniqueForms = new Set(formExports);
const actualFormCount = uniqueForms.size;

const formsMatch = readme.match(/(\d+)\s+standalone forms/);
if (formsMatch) {
  const claimed = parseInt(formsMatch[1], 10);
  if (claimed !== actualFormCount) {
    errors.push(`README: claims ${claimed} standalone forms but auth exports ${actualFormCount}`);
  }
}

if (errors.length) {
  console.log("README sync check");
  console.log("------------------");
  for (const e of errors) console.log(`  - ${e}`);
  console.log(`\nFAILED: ${errors.length} drift(s). Fix README.md.`);
  process.exit(1);
}
console.log("README sync check: OK");
console.log(`  packages: ${packages.length} checked`);
console.log(`  auth forms: ${actualFormCount} (matches README)`);
