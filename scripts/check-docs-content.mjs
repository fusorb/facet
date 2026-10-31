#!/usr/bin/env node
/**
 * Gate: docs content compiles and (if a generated file is present) is up-to-date.
 *
 * Usage: node scripts/check-docs-content.mjs [--input <dir>] [--generated <file>]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
}
const inputDir = path.resolve(root, getArg("--input", "apps/docs/content"));
const generatedFile = path.resolve(root, getArg("--generated", "apps/docs/src/pages.generated.ts"));

if (!fs.existsSync(inputDir)) {
  console.log("ok: no docs content dir (skipped)");
  process.exit(0);
}

const tmpOut = path.join(root, ".tmp-docs-content-check.ts");
try {
  execFileSync(process.execPath, [path.join(root, "scripts/compile-docs.mjs"), "--input", inputDir, "--out", tmpOut], {
    stdio: "inherit",
  });
} catch {
  console.error("FAIL: docs content does not compile");
  try { fs.unlinkSync(tmpOut); } catch {}
  process.exit(1);
}

if (fs.existsSync(generatedFile)) {
  const a = fs.readFileSync(tmpOut, "utf-8");
  const b = fs.readFileSync(generatedFile, "utf-8");
  if (a !== b) {
    console.error("FAIL: generated docs content is stale. Run: node scripts/compile-docs.mjs --input " + path.relative(root, inputDir) + " --out " + path.relative(root, generatedFile));
    try { fs.unlinkSync(tmpOut); } catch {}
    process.exit(1);
  }
}

try { fs.unlinkSync(tmpOut); } catch {}
console.log("ok: docs content compiles" + (fs.existsSync(generatedFile) ? " and is up-to-date" : ""));
process.exit(0);