#!/usr/bin/env node
/**
 * Gate: docs and sandbox engines are facet-agnostic (L3).
 *
 * Scans packages/docs/src/ and packages/sandbox/src/ for facet-specific
 * imports, string literals, and URLs. Exits 1 if any are found in non-test
 * source files.
 *
 * Allow-list (explicit, reviewed per spec):
 *   - *.test.{ts,tsx} files
 *   - JSDoc comment lines (line, star-prefixed, or block comments)
 *   - Type-only references to facet types in .d.ts files
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DIRS_TO_SCAN = [
  "packages/docs/src",
  "packages/sandbox/src",
];

const FACET_IMPORTS = [
  "@fusorb/facet-auth",
  "@fusorb/facet-sdk",
  "@fusorb/facet-layout",
  "@fusorb/facet-components",
  "@fusorb/facet-tokens",
  "@fusorb/facet-store",
  "@fusorb/facet-emails",
  "@fusorb/facet-native",
];

const FACET_NAMES = [
  "SgClient",
  "DEMO_CLIENT",
  "AuthDemo",
  "AuthPreviews",
  "LayoutPreviews",
  "ReadyToUseDemos",
  "ComponentDemoCard",
  "PlaygroundRegistry",
  "useOptionalAuth",
];

const FACET_STRINGS = [
  "facet.so",
  "localhost:5173",
  "localhost:5174",
  "localhost:5175",
  "github.com/fusorb/facet",
  "https://demo.invalid",
  "https://acme.dev/dashboard",
  "https://auth.example.com/api/v1",
  "https://app.example.com/callback",
  "ada.lovelace@acme.dev",
];

const FACET_SECTIONS = [
  "getting-started",
  "ready-to-use",
  "pages-section",
  "animation-section",
];

function isTestFile(file) {
  return file.includes(".test.") || file.endsWith(".spec.ts") || file.endsWith(".spec.tsx");
}

function stripComments(src) {
  // Remove /* ... */ block comments and // line comments
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");
}

function checkFile(filePath, relPath) {
  const src = fs.readFileSync(filePath, "utf-8");
  if (isTestFile(filePath)) return [];
  const code = stripComments(src);
  const violations = [];

  for (const imp of FACET_IMPORTS) {
    if (code.includes(imp)) violations.push(`import "${imp}"`);
  }
  for (const name of FACET_NAMES) {
    if (code.includes(name)) violations.push(`facet name "${name}"`);
  }
  for (const str of FACET_STRINGS) {
    if (code.includes(str)) violations.push(`facet string "${str}"`);
  }
  for (const section of FACET_SECTIONS) {
    if (code.includes(`"${section}"`)) violations.push(`facet section "${section}"`);
  }

  return violations;
}

function walkDir(dir, acc) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, acc);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      acc.push(full);
    }
  }
}

let failed = false;

for (const dir of DIRS_TO_SCAN) {
  const full = path.join(root, dir);
  const files = [];
  walkDir(full, files);
  for (const file of files) {
    const relPath = path.relative(root, file);
    const violations = checkFile(file, relPath);
    if (violations.length) {
      failed = true;
      console.error(`  ${relPath}:`);
      for (const v of violations) {
        console.error(`     - ${v}`);
      }
    }
  }
}

if (!failed) {
  console.log("ok: docs and sandbox engines are facet-agnostic");
  process.exit(0);
} else {
  console.error("\nFacet-specific references found in engine source.");
  console.error("See L3: engines must be facet-agnostic.\n");
  console.error("Move facet-specific code to app-layer or the registry-backed data source.");
  process.exit(1);
}
