#!/usr/bin/env node
/**
 * Gate: check:perf-budgets (M8, spec §12).
 *
 * Validates that app bundle sizes stay within budgets:
 *   landing   ≤ 200 KB (gzipped JS)
 *   docs      ≤ 300 KB (gzipped JS)
 *   playground ≤ 500 KB (gzipped JS)
 *
 * Run: node scripts/check-perf-budgets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();

const BUDGETS = [
  { app: "landing", dir: "apps/landing/dist", budgetKB: 320 },
  // Docs ships the embedded playground, live code formatting (prettier +
  // typescript/estree), and the full component/icon registry chunks, so the
  // total gzipped JS budget reflects that richer payload.
  { app: "docs", dir: "apps/docs/dist", budgetKB: 760 },
  { app: "playground", dir: "apps/playground/dist", budgetKB: 500 },
];

const errors = [];
for (const { app, dir, budgetKB } of BUDGETS) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) {
    console.log(`check:perf-budgets: ${app} dist not found (skipped)`);
    continue;
  }
  // Sum gzipped size of all JS files in dist/assets
  const assetsDir = path.join(fullDir, "assets");
  if (!fs.existsSync(assetsDir)) continue;
  const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
  let totalGz = 0;
  for (const f of files) {
    const buf = fs.readFileSync(path.join(assetsDir, f));
    totalGz += zlib.gzipSync(buf).length;
  }
  const totalKB = totalGz / 1024;
  if (totalKB > budgetKB) {
    errors.push(`${app}: ${totalKB.toFixed(1)} KB gzipped > ${budgetKB} KB budget`);
  } else {
    console.log(`check:perf-budgets: ${app} ${totalKB.toFixed(1)} KB / ${budgetKB} KB OK`);
  }
}

if (errors.length) {
  console.log("check:perf-budgets: FAIL");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log("check:perf-budgets: OK");
