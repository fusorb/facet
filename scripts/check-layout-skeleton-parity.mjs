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
let regionsFound = 0;

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
  // Check data-region attributes exist on real shells (hard-fail in M8)
  const shellFiles = [
    "packages/layout/src/console-layout.tsx",
    "packages/layout/src/auth-layout.tsx",
    "packages/layout/src/landing-layout.tsx",
    "packages/layout/src/docs-layout.tsx",
    "packages/layout/src/chat-layout.tsx",
  ];
  for (const sf of shellFiles) {
    const full = path.join(root, sf);
    if (!fs.existsSync(full)) { errors.push(`${sf}: missing`); continue; }
    const content = fs.readFileSync(full, "utf-8");
    if (content.includes("data-region")) regionsFound++;
    else errors.push(`${sf}: missing data-region attribute`);
  }
}

if (errors.length) {
  console.log("LayoutSkeleton parity check");
  console.log("--------------------------");
  for (const e of errors) console.log(`  ERROR: ${e}`);
  console.log(`\nFAILED: ${errors.length} error(s).`);
  process.exit(1);
}
console.log("LayoutSkeleton parity check: OK");
console.log(`  kinds: 5 (console, auth, landing, docs, chat)`);
console.log(`  data-region: ${regionsFound}/5 shells`);
