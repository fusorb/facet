#!/usr/bin/env node
/**
 * Gate: LayoutSkeleton parity (D-9, spec §9).
 *
 * Checks that the LayoutSkeleton component exists and exports all 5 shell kinds.
 * Full parity (data-region attributes on real shells matching skeleton geometry)
 * is a soft check until M8; this gate verifies the skeleton contract only.
 *
 * Run: node scripts/check-layout-skeleton-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skeletonPath = path.join(root, "packages/layout/src/skeleton/index.tsx");
const errors = [];
const warnings = [];

if (!fs.existsSync(skeletonPath)) {
  errors.push("packages/layout/src/skeleton/index.tsx: missing");
} else {
  const src = fs.readFileSync(skeletonPath, "utf-8");
  const kinds = ["console", "auth", "landing", "docs", "chat"];
  for (const k of kinds) {
    if (!src.includes(`"${k}"`)) {
      errors.push(`LayoutSkeleton: missing kind "${k}"`);
    }
  }
  // Check data-region attributes exist on real shells (soft)
  const shellFiles = [
    "packages/layout/src/shells/console.tsx",
    "packages/layout/src/shells/auth.tsx",
    "packages/layout/src/shells/landing.tsx",
    "packages/layout/src/shells/docs.tsx",
    "packages/layout/src/shells/chat.tsx",
  ];
  let regionsFound = 0;
  for (const sf of shellFiles) {
    const full = path.join(root, sf);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, "utf-8");
    if (content.includes("data-region")) regionsFound++;
  }
  if (regionsFound < shellFiles.length) {
    warnings.push(
      `data-region attributes: ${regionsFound}/${shellFiles.length} shells have them (full parity is M8 work)`,
    );
  }
}

if (errors.length) {
  console.log("LayoutSkeleton parity check");
  console.log("--------------------------");
  for (const e of errors) console.log(`  ERROR: ${e}`);
  for (const w of warnings) console.log(`  WARN:  ${w}`);
  console.log(`\nFAILED: ${errors.length} error(s).`);
  process.exit(1);
}
console.log("LayoutSkeleton parity check: OK");
for (const w of warnings) console.log(`  WARN: ${w}`);
console.log(`  kinds: 5 (console, auth, landing, docs, chat)`);
