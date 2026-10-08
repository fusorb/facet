#!/usr/bin/env node
/**
 * Gate: registry.json is up-to-date with the workspace scan.
 *
 * Re-runs the scanner's buildRegistry() and diffs against the committed
 * packages/registry/src/registry.json. Exits 1 if stale.
 *
 * Usage: node scripts/check-registry.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry } from "../packages/registry/src/scan.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const committedPath = path.join(root, "packages/registry/src/registry.json");

const committed = JSON.parse(fs.readFileSync(committedPath, "utf-8"));
const fresh = buildRegistry();

const committedJson = JSON.stringify(committed, null, 2) + "\n";
const freshJson = JSON.stringify(fresh, null, 2) + "\n";

if (committedJson === freshJson) {
  console.log("ok: registry.json is up-to-date");
  process.exit(0);
} else {
  console.error("registry.json is STALE");
  console.error("Run: node packages/registry/src/scan.mjs");
  console.error("Then re-run check:registry");
  process.exit(1);
}
