#!/usr/bin/env node
/**
 * Gate: check:a11y (M8, spec §14).
 *
 * Static accessibility audit of component source:
 *   - Images have alt attributes
 *   - No positive tabindex values
 *   - onClick on a non-interactive element carries a keyboard handler or role
 *
 * Run: node scripts/check-a11y.mjs   (exits 1 on any violation)
 *
 * Note (audit 2026-11-10): these checks were previously pushed to an unused
 * `warnings` array, so the gate could never fail. They are real violations and
 * now populate `errors`.
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

for (const file of files) {
  const src = fs.readFileSync(path.join(componentsDir, file), "utf-8");
  const lines = src.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // <img> without an alt attribute (look ahead a few lines for multi-line JSX)
    if (/<img\b/.test(line)) {
      const imgBlock = lines.slice(i, i + 5).join(" ");
      if (!/alt=/.test(imgBlock)) {
        errors.push(`${file}:${i + 1}: <img> without alt attribute`);
      }
    }

    // Positive tabindex values (a known a11y anti-pattern)
    const tabindexMatch = line.match(/tabIndex=\{?(\d+)\}?/);
    if (tabindexMatch && parseInt(tabindexMatch[1], 10) > 0) {
      errors.push(`${file}:${i + 1}: positive tabIndex (${tabindexMatch[1]})`);
    }

    // onClick on a non-interactive element without a keyboard handler or role
    if (
      /onClick=/.test(line) &&
      /<(div|span|li|td|tr)\b/.test(line) &&
      !/onKeyDown|onKeyPress|onKeyUp|role=/.test(line)
    ) {
      errors.push(`${file}:${i + 1}: onClick on non-interactive element without keyboard handler or role`);
    }
  }
}

if (errors.length) {
  console.log("check:a11y: FAIL");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log(`check:a11y: OK (${files.length} components scanned, no issues)`);
