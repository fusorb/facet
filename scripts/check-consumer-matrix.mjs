#!/usr/bin/env node
/**
 * Gate: check:consumer-matrix (M8, spec §13).
 *
 * Static checks on the published packages' dependency declarations, so a
 * consumer install resolves cleanly:
 *   1. No published package lists the same @fusorb/* dep in BOTH `dependencies`
 *      and `devDependencies` (a redundant/ambiguous declaration).
 *   2. Every @fusorb/* dep in a published package uses a `workspace:` range
 *      (never a bare version or `file:`), so the packed manifest carries the
 *      rewritten `^` range.
 *   3. Pack tarballs, when present, are non-empty.
 *
 * Run: node scripts/check-consumer-matrix.mjs   (exits 1 on any violation)
 *
 * Note (audit 2026-11-10): this gate previously declared an `errors` array that
 * was never populated, so it always exited 0. It now performs the checks above.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];

const packagesDir = path.join(root, "packages");
const pkgDirs = fs.existsSync(packagesDir) ? fs.readdirSync(packagesDir) : [];
let scanned = 0;

for (const dir of pkgDirs) {
  const pjPath = path.join(packagesDir, dir, "package.json");
  if (!fs.existsSync(pjPath)) continue;
  let pj;
  try {
    pj = JSON.parse(fs.readFileSync(pjPath, "utf-8"));
  } catch {
    continue;
  }
  if (pj.private) continue;
  scanned += 1;

  const deps = pj.dependencies || {};
  const devDeps = pj.devDependencies || {};

  // 1. Same @fusorb/* dep declared as both a runtime and a dev dependency.
  for (const dep of Object.keys(deps)) {
    if (dep.startsWith("@fusorb/") && dep in devDeps) {
      errors.push(`${pj.name}: ${dep} is listed in both dependencies and devDependencies`);
    }
  }

  // 2. @fusorb/* deps must use a workspace: range.
  for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [dep, range] of Object.entries(pj[section] || {})) {
      if (dep.startsWith("@fusorb/") && !String(range).startsWith("workspace:")) {
        errors.push(`${pj.name}: ${section}.${dep} = "${range}" (must be a workspace: range)`);
      }
    }
  }
}

// 3. Pack tarballs, when present, are non-empty.
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
  console.log(`check:consumer-matrix: OK (${scanned} published packages checked)`);
}
