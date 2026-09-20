// Drift gate for component flexibility / composability / customizability.
// Mirrors scripts/check-docs-inventory.mjs: a small, dependency-free scan that
// asserts an invariant across every ui/ component and fails (exit 1) on drift.
//
// Invariant (from CLAUDE.md -> Architecture -> 3 customization axes):
//   appearance  - style overrides: className passthrough styled with design
//                 tokens (cn/cva/clsx/tailwind-merge) so consumers can theme.
//   config       - a typed props surface for behavior/data (extends
//                 *HTMLAttributes, or cva/VariantProps, or named typed props).
//   slots        - content/render injection (render* props, ReactNode/ReactElement
//                 props, asChild/as element substitution, or children).
//
// Layer-aware: leaf primitives (styled inputs, labels, etc.) are expected to
// expose appearance + config; only *composite* components (those that wire >=2
// sibling ui components together) are additionally expected to expose slots.
//
// Run:  node scripts/check-component-flexibility.mjs
// Fails (exit 1) when any component is missing appearance or config (hard gap).

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiDir = path.join(root, "packages/components/src/ui");

const HARD_GAPS = [];   // missing appearance or config
const SOFT_GAPS = [];   // composite missing slots (warning)
const SCORED = [];      // every component, for the summary

// Components that are data/types/stylesheets, not UI components.
const components = fs
  .readdirSync(uiDir)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .sort();

const compSet = new Set(components);

// Appearance: className is consumed AND styling utility (cn/cva/clsx) used, OR
// props extend HTMLAttributes (which carry className).
function hasAppearance(src) {
  const hasClassName = /\bclassName\b/.test(src);
  const usesTokens = /cn\(|cva\(|clsx\(|twMerge\(/.test(src);
  const extendsHTML = /extends\s+React\.\w*HTMLAttributes/.test(src);
  return hasClassName && (usesTokens || extendsHTML);
}

// Config: a real typed props surface (not just spread HTML).
function hasConfig(src) {
  return (
    /extends\s+React\.\w*HTMLAttributes/.test(src) ||
    /VariantProps/.test(src) ||
    /\bcva\(/.test(src) ||
    /export\s+(interface|type)\s+\w+Props\b/.test(src) ||
    /:\s*\??\s*(boolean|string|number|"\w+"\s*\|\s*"\w+"|\{[^}]*\})\s*[,;=]/.test(src)
  );
}

// Slots: render props / node-typed props / asChild / children.
function hasSlots(src) {
  return (
    /render[A-Z]\w*\s*[?:]/.test(src) ||
    /React\.(ReactNode|ReactElement|React\.Node|React\.ReactElement)\b/.test(src) ||
    /\bchildren\b/.test(src) ||
    /asChild/.test(src)
  );
}

// Composite: imports >= 2 sibling ui components (wires multiple parts).
function isComposed(src, name) {
  const siblings = new Set();
  for (const m of src.matchAll(/from\s+"\.\.\/ui\/(\w+)\.js"/g)) {
    if (m[1] !== name) siblings.add(m[1]);
  }
  for (const m of src.matchAll(/from\s+"\.\/(\w+)\.js"/g)) {
    if (compSet.has(m[1]) && m[1] !== name) siblings.add(m[1]);
  }
  return siblings.size >= 2;
}

for (const name of components) {
  const src = fs.readFileSync(path.join(uiDir, name + ".tsx"), "utf-8");
  const appearance = hasAppearance(src);
  const config = hasConfig(src);
  const slots = hasSlots(src);
  const composed = isComposed(src, name);

  const axes = [appearance, config, slots];
  const missing = [];
  if (!appearance) missing.push("appearance");
  if (!config) missing.push("config");
  if (composed && !slots) missing.push("slots(composed)");

  SCORED.push({ name, appearance, config, slots, composed, missing: missing.length });
  if (!appearance || !config) {
    HARD_GAPS.push(`${name}: missing ${missing.join(", ")}`);
  }
  if (composed && !slots) {
    SOFT_GAPS.push(`${name}: composite missing slots`);
  }
}

const withAppearance = SCORED.filter((c) => c.appearance).length;
const withConfig = SCORED.filter((c) => c.config).length;
const withSlots = SCORED.filter((c) => c.slots).length;
const composites = SCORED.filter((c) => c.composed);
const compositesWithSlots = composites.filter((c) => c.slots).length;

console.log("Component flexibility / composability / customizability audit");
console.log("----------------------------------------------------------------");
console.log(`  appearance  (className + design tokens): ${withAppearance}/${components.length}`);
console.log(`  config      (typed props / cva / HTML attrs): ${withConfig}/${components.length}`);
console.log(`  slots       (render/children/asChild): ${withSlots}/${components.length}`);
console.log(`  composites wire >=2 siblings: ${composites.length} (${compositesWithSlots} expose slots)`);
console.log("\nHARD gaps (missing appearance or config):");
if (HARD_GAPS.length) for (const g of HARD_GAPS) console.log(`  - ${g}`);
else console.log("  (none)");
console.log("\nSOFT warnings (composite without slots):");
if (SOFT_GAPS.length) for (const g of SOFT_GAPS) console.log(`  - ${g}`);
else console.log("  (none)");

if (HARD_GAPS.length) {
  console.log("\nFAILED: some components lack required axes.");
  process.exit(1);
}
console.log(`\nAll ${components.length} components expose the required axes (appearance + config).`);
