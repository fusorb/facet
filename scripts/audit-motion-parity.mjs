/**
 * Audit: @fusorb/facet-motion token tables vs @fusorb/facet-tokens CSS variables.
 *
 * Verifies that the DURATION_VALUES and EASING_FUNCTIONS lookup tables in
 * packages/motion/src/drivers/resolve.ts stay in sync with the
 * --facet-motion-duration-* / --facet-motion-ease-* CSS custom properties
 * in packages/tokens/src/tokens.css.
 *
 * The --facet-motion-* tokens resolve to --motion-duration-* / --motion-ease-*
 * values in the same CSS file, so this script resolves those var() chains and
 * compares the final numeric/cubic-bezier values against the JS tables.
 *
 * Run:  node scripts/audit-motion-parity.mjs
 * Fails (exit 1) with a diff report on any drift.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const resolvePath = path.join(root, "packages/motion/src/drivers/resolve.ts");
const tokensPath = path.join(root, "packages/tokens/src/tokens.css");

const resolveSrc = fs.readFileSync(resolvePath, "utf8");
const tokensSrc = fs.readFileSync(tokensPath, "utf8");

/* ── Parse DURATION_VALUES from resolve.ts ────────────────────────── */

const durationBlock = resolveSrc.match(/DURATION_VALUES[^{]*\{([\s\S]*?)\}/);
if (!durationBlock) {
  console.error("DURATION_VALUES not found in resolve.ts");
  process.exit(1);
}
const jsDurations = {};
for (const m of durationBlock[1].matchAll(/(\w+):\s*(\d+),?/g)) {
  jsDurations[m[1]] = Number(m[2]);
}

/* ── Parse EASING_FUNCTIONS from resolve.ts ──────────────────────── */

const easingBlock = resolveSrc.match(/EASING_FUNCTIONS[^{]*\{([\s\S]*?)\}/);
if (!easingBlock) {
  console.error("EASING_FUNCTIONS not found in resolve.ts");
  process.exit(1);
}
const jsEasings = {};
for (const m of easingBlock[1].matchAll(/(\w+):\s*(cubicBezier\(([\d., ]+)\)|.*?\bt\b.*?=>\s*t)/g)) {
  const name = m[1];
  const expr = m[2];
  if (expr.includes("cubicBezier")) {
    const nums = expr.match(/([\d.]+)/g);
    jsEasings[name] = nums.map(Number);
  } else {
    // (t: number) => t  →  linear  →  [0, 0, 1, 1]
    jsEasings[name] = [0, 0, 1, 1];
  }
}

/* ── Parse ALL --motion-* custom properties from tokens.css ──────── */

const cssVars = {};
for (const m of tokensSrc.matchAll(/--(motion-[a-z]+-[0-9a-z-]+):\s*([^;]+);/g)) {
  cssVars[m[1]] = m[2].trim();
}

/* ── Resolve var() chains to concrete values ───────────────────────── */

function resolveVar(value) {
  let v = value;
  for (let i = 0; i < 10; i++) {
    const ref = v.match(/var\(--([^)]+)\)/);
    if (!ref) break;
    const resolved = cssVars[ref[1]];
    if (resolved === undefined) {
      const fallback = tokensSrc.match(
        new RegExp(`--${ref[1]}:[^;]*;`),
      );
      if (fallback) {
        v = v.replace(ref[0], fallback[0].split(":")[1].trim().replace(/;$/, ""));
      } else {
        break;
      }
    } else {
      v = v.replace(ref[0], resolved);
    }
  }
  return v;
}

/* ── Extract --facet-motion-duration-* and --facet-motion-ease-* ──── */

const cssDurations = {};
const cssEasings = {};

for (const m of tokensSrc.matchAll(
  /--facet-motion-duration-([a-z]+):\s*([^;]+);/g,
)) {
  const resolved = resolveVar(m[2]);
  const num = Number(resolved.match(/([\d.]+)/)?.[0]);
  cssDurations[m[1]] = num;
}

for (const m of tokensSrc.matchAll(
  /--facet-motion-ease-([a-z]+):\s*([^;]+);/g,
)) {
  const resolved = resolveVar(m[2]).trim();
  const coords = parseEasingValue(resolved);
  cssEasings[m[1]] = coords;
}

function parseEasingValue(v) {
  if (v === "linear") return [0, 0, 1, 1];
  const be = v.match(/cubic-bezier\(([\d., ]+)\)/);
  if (be) return be[1].split(",").map((n) => Number(n.trim()));
  return null;
}

/* ── Compare ─────────────────────────────────────────────────────── */

const errors = [];
const ok = [];

// Duration tokens
const jsDurKeys = new Set(Object.keys(jsDurations));
const cssDurKeys = new Set(Object.keys(cssDurations));

const durMissingFromCss = [...jsDurKeys].filter((k) => !cssDurKeys.has(k)).sort();
const durMissingFromJs = [...cssDurKeys].filter((k) => !jsDurKeys.has(k)).sort();

if (durMissingFromCss.length) {
  errors.push(`Durations in resolve.ts DURATION_VALUES but missing from CSS --facet-motion-duration-* (${durMissingFromCss.length}): ${durMissingFromCss.join(", ")}`);
} else {
  ok.push(`All ${jsDurKeys.size} duration tokens present in both resolve.ts and CSS.`);
}

if (durMissingFromJs.length) {
  errors.push(`Durations in CSS --facet-motion-duration-* but missing from DURATION_VALUES (${durMissingFromJs.length}): ${durMissingFromJs.join(", ")}`);
}

for (const key of [...jsDurKeys].sort()) {
  if (cssDurations[key] !== undefined && cssDurations[key] !== jsDurations[key]) {
    errors.push(`Duration mismatch for "${key}": resolve.ts=${jsDurations[key]} vs CSS=${cssDurations[key]}ms`);
  }
}

// Easing tokens
const jsEaseKeys = new Set(Object.keys(jsEasings));
const cssEaseKeys = new Set(Object.keys(cssEasings));

const easeMissingFromCss = [...jsEaseKeys].filter((k) => !cssEaseKeys.has(k)).sort();
const easeMissingFromJs = [...cssEaseKeys].filter((k) => !jsEaseKeys.has(k)).sort();

if (easeMissingFromCss.length) {
  errors.push(`Easings in resolve.ts EASING_FUNCTIONS but missing from CSS --facet-motion-ease-* (${easeMissingFromCss.length}): ${easeMissingFromCss.join(", ")}`);
} else {
  ok.push(`All ${jsEaseKeys.size} easing tokens present in both resolve.ts and CSS.`);
}

if (easeMissingFromJs.length) {
  errors.push(`Easings in CSS --facet-motion-ease-* but missing from EASING_FUNCTIONS (${easeMissingFromJs.length}): ${easeMissingFromJs.join(", ")}`);
}

for (const key of [...jsEaseKeys].sort()) {
  if (cssEasings[key] !== null && cssEasings[key] !== undefined) {
    const jsCoords = jsEasings[key];
    const cssCoords = cssEasings[key];
    if (jsCoords.length !== cssCoords.length || jsCoords.some((v, i) => v !== cssCoords[i])) {
      errors.push(`Easing mismatch for "${key}": resolve.ts=${JSON.stringify(jsCoords)} vs CSS=${JSON.stringify(cssCoords)}`);
    }
  }
}

/* ── Report ──────────────────────────────────────────────────────── */

console.log("Motion drift check");
console.log("------------------");
for (const line of ok) console.log(`  ok: ${line}`);
if (errors.length) {
  console.log("\nFAILED:");
  for (const line of errors) console.log(`  - ${line}`);
  console.log("\nDrift detected between resolve.ts and tokens.css. Fix the values, then re-run:");
  console.log("  node scripts/audit-motion-parity.mjs");
  process.exit(1);
}
console.log(`\nAll checks passed (${jsDurKeys.size} durations + ${jsEaseKeys.size} easings in sync).`);
