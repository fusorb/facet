#!/usr/bin/env node
/**
 * Gate: published packages may not use bare `workspace:*` for sibling deps/peers.
 *
 * `workspace:*` resolves to an exact version on publish, pinning consumers to
 * one copy and forcing duplicate installs when versions mix. Published siblings
 * must use `workspace:^` (or `workspace:~`) so the published range keeps the
 * caret/tilde and stays composable (ADR-008, M1).
 *
 * Scans every non-private package under packages/ and fails on any
 * `workspace:*` entry in dependencies/peerDependencies/devDependencies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(root, "packages");

const SECTIONS = ["dependencies", "peerDependencies", "devDependencies"];
let failures = 0;

for (const dir of fs.readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const pkgPath = path.join(packagesDir, dir.name, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  if (pkg.private) continue;

  for (const section of SECTIONS) {
    const deps = pkg[section];
    if (!deps) continue;
    for (const [name, range] of Object.entries(deps)) {
      if (name.startsWith("@fusorb/") && range === "workspace:*") {
        console.error(
          `FAIL: ${pkg.name} ${section} "${name}": "workspace:*" (bare)`,
        );
        console.error(
          `  fix: change to "workspace:^" (or "workspace:~") in packages/${dir.name}/package.json`,
        );
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck:pins: ${failures} bare workspace:* sibling dep(s) found.`);
  process.exit(1);
}
console.log("check:pins: OK - no bare workspace:* sibling deps in published packages.");
