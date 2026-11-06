#!/usr/bin/env node
/**
 * Gate: check:claims (M6, spec §9).
 *
 * Scans authored docs content (apps/docs/content/**) for hard-coded numbers
 * next to registry-owned nouns. A number adjacent to a registry-owned noun
 * must be an interpolation ({{facts.X}}), not a literal.
 *
 * Currently skips (no content dir beyond the PoC). Will hard-fail once M6
 * content migration lands.
 *
 * Run: node scripts/check-claims.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "apps/docs/content");

if (!fs.existsSync(contentDir)) {
  console.log("check:claims: no content dir (skipped — M6 work)");
  process.exit(0);
}

// Registry-owned nouns and their fact keys
const NOUNS = [
  { noun: /components?\b/i, fact: "components.count" },
  { noun: /packages?\b/i, fact: "packages.count" },
  { noun: /SDKs?\b/i, fact: "sdkClasses.count" },
  { noun: /layout shells?\b/i, fact: "layoutShells.count" },
  { noun: /auth presets?\b/i, fact: "authPresets.count" },
  { noun: /motion (?:effects?|families)\b/i, fact: "motionTotal.count" },
  { noun: /icons?\b/i, fact: "icons.count" },
  { noun: /examples?\b/i, fact: "examples.count" },
];

const facts = JSON.parse(fs.readFileSync(path.join(root, "packages/registry/src/registry.json"), "utf-8")).facts;

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".md")) acc.push(full);
  }
}

const files = [];
walk(contentDir, files);

const errors = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf-8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip frontmatter
    if (line.trim() === "---") continue;
    // Check for literal number + noun patterns (not interpolated)
    for (const { noun, fact } of NOUNS) {
      // Match: digit(s) followed by optional space and noun (e.g., "112 components")
      const re = new RegExp(`(\\d+)\\s+(${noun.source})`, "gi");
      let m;
      while ((m = re.exec(line)) !== null) {
        // Check if this is inside an interpolation {{facts.X}}
        const before = line.slice(0, m.index);
        if (before.includes("{{facts.") && !before.includes("}}")) {
          // Inside interpolation — OK
          continue;
        }
        // Check if the number is part of {{facts.X}}
        const fullMatch = m[0];
        const context = line.slice(Math.max(0, m.index - 10), m.index + fullMatch.length + 5);
        if (context.includes("{{facts.")) continue;
        errors.push(`${path.relative(root, file)}:${i + 1}: hard-coded "${fullMatch}" — use {{facts.${fact}}} instead`);
      }
    }
  }
}

if (errors.length) {
  console.log("check:claims: FAIL");
  for (const e of errors) console.log(`  - ${e}`);
  console.log(`\n${errors.length} claim(s) not interpolated.`);
  process.exit(1);
}
console.log("check:claims: OK (no hard-coded claims in content)");
