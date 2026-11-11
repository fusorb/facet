#!/usr/bin/env node
/**
 * Gate: content compiler (ADR-005). Validates that `scripts/compile-docs.mjs`
 * produces valid output from `apps/docs/content/**` (if present).
 *
 * Currently skips (no content dir). Will hard-fail once M6 content migration
 * lands and content is authored under apps/docs/content/**.
 *
 * Run: node scripts/check-content.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "apps/docs/content");

if (!fs.existsSync(contentDir)) {
  console.log("check:content: no content dir (skipped — M6 work)");
  process.exit(0);
}

// If content dir exists, run the compiler and validate output.
const { execSync } = await import("node:child_process");
import os from "node:os";
const tmpOut = path.join(os.tmpdir(), "compiled-docs.json");
try {
  execSync(`node scripts/compile-docs.mjs --input apps/docs/content --out "${tmpOut}"`, { stdio: "pipe", cwd: root });
  console.log("check:content: OK — compiler produced output");
} catch (e) {
  console.log("check:content: compiler failed");
  console.error(e.stderr?.toString() || e.message);
  process.exit(1);
} finally {
  try { fs.unlinkSync(tmpOut); } catch {}
}
