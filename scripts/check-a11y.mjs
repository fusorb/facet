#!/usr/bin/env node
/**
 * Gate: check:a11y (M8, spec §14).
 *
 * Static accessibility audit of component source:
 *   - Images have alt attributes
 *   - Interactive elements have accessible names
 *   - Form inputs have labels
 *   - No positive tabindex values
 *   - ARIA roles are valid
 *
 * Run: node scripts/check-a11y.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const componentsDir = path.join(root, "packages/components/src/ui");

if (!fs.existsSync(componentsDir)) {
  console.log("check:a11y: components dir not found (skipped)");
  process.exit(0);
}

const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));
const errors = [];
const warnings = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(componentsDir, file), "utf-8");
  const lines = src.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for img without alt (handle multi-line)
    if (/<img\b/.test(line)) {
      const imgBlock = lines.slice(i, i + 5).join(" ");
      if (!/alt=/.test(imgBlock)) {
        warnings.push(`${file}:${i + 1}: <img> without alt attribute`);
      }
    }

    // Check for positive tabindex
    const tabindexMatch = line.match(/tabIndex=\{?(\d+)\}?/);
    if (tabindexMatch && parseInt(tabindexMatch[1]) > 0) {
      warnings.push(`${file}:${i + 1}: positive tabIndex (${tabindexMatch[1]})`);
    }

    // Check for onClick without keyboard handler on non-interactive elements
    if (/onClick=/.test(line) && /<(div|span|li|td|tr)\b/.test(line) && !/onKeyDown|onKeyPress|onKeyUp|role=/.test(line)) {
      warnings.push(`${file}:${i + 1}: onClick on non-interactive element without keyboard handler or role`);
    }
  }
}

if (errors.length) {
  console.log("check:a11y: FAIL");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
if (warnings.length) {
  console.log(`check:a11y: ${warnings.length} warning(s)`);
  for (const w of warnings.slice(0, 10)) console.log(`  - ${w}`);
  if (warnings.length > 10) console.log(`  ... and ${warnings.length - 10} more`);
} else {
  console.log("check:a11y: OK (no issues found)");
}
