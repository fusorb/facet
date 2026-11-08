#!/usr/bin/env node
/**
 * Gate: check:landing-sections (M7, spec §10).
 *
 * Validates that the landing app only has / and /feedback routes (O-2 default).
 * Checks for hard-coded numbers in text content (not CSS) that should be
 * interpolations from site-data.generated.ts.
 *
 * Run: node scripts/check-landing-sections.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagesFile = path.join(root, "apps/landing/src/pages.tsx");

if (!fs.existsSync(pagesFile)) {
  console.error("check:landing-sections: pages.tsx not found");
  process.exit(2);
}

const text = fs.readFileSync(pagesFile, "utf-8");
const pathMatches = text.match(/path:\s*"([^"]+)"/g) || [];
const paths = pathMatches.map((m) => m.match(/"([^"]+)"/)[1]);

const allowed = new Set(["/", "/feedback"]);
const disallowed = paths.filter((p) => !allowed.has(p));

if (disallowed.length) {
  console.log("check:landing-sections: FAIL");
  for (const p of disallowed) console.log(`  - disallowed route: ${p}`);
  console.log("\nM7 spec: landing should only have / and /feedback.");
  process.exit(1);
}

// Check for hard-coded numbers in text content (JSX children, not CSS)
const sectionsDir = path.join(root, "apps/landing/src/components/sections");
const sectionFiles = [];
function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".tsx")) acc.push(full);
  }
}
walk(sectionsDir, sectionFiles);

// Registry-owned nouns that should use interpolation
const NOUNS = /components?|packages?|SDKs?|icons?|tokens?|examples?|motion (?:effects?|families)/i;

const errors = [];
for (const file of sectionFiles) {
  const src = fs.readFileSync(file, "utf-8");
  const lines = src.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip imports, comments, className/style attributes
    if (/^\s*(import|\/\/|\/\*|\*)/.test(line)) continue;
    if (/className=|style=/.test(line)) continue;
    // Look for numbers followed by registry nouns in text content
    const re = /\b(\d+)\s+(components?|packages?|SDKs?|icons?|tokens?|examples?|motion (?:effects?|families))\b/gi;
    let m;
    while ((m = re.exec(line)) !== null) {
      const before = line.slice(Math.max(0, m.index - 15), m.index);
      if (before.includes("${") || before.includes("SITE_")) continue;
      errors.push(`${path.relative(root, file)}:${i + 1}: hard-coded "${m[0]}" — use interpolation`);
    }
  }
}

if (errors.length) {
  console.log("check:landing-sections: FAIL");
  for (const e of errors.slice(0, 20)) console.log(`  - ${e}`);
  if (errors.length > 20) console.log(`  ... and ${errors.length - 20} more`);
  process.exit(1);
}

console.log("check:landing-sections: OK (routes: " + paths.join(", ") + ")");
