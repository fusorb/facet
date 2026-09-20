#!/usr/bin/env node
/**
 * Audit: @fusorb/facet-tokens motion values vs CSS custom properties.
 *
 * The motion driver (`packages/motion/src/drivers/resolve.ts`) derives its
 * `DURATION_VALUES` and `EASING_FUNCTIONS` lookup tables from `motionValues`
 * (`packages/tokens/src/motion.ts`) - a single source of truth with no
 * hardcoded literals. The React Native driver (`@fusorb/facet-native`) reads
 * the same `motionValues`.
 *
 * This script verifies that the canonical JS values (`motionValues.facetDuration`
 * and `motionValues.facetEasing`) stay in sync with the `--facet-motion-duration-*`
 * and `--facet-motion-ease-*` CSS custom properties in
 * `packages/tokens/src/tokens.css`. It also asserts that `resolve.ts` derives
 * its tables from `motionValues` (i.e. the web driver does not re-introduce
 * hardcoded literals that could drift from the CSS variables).
 *
 * Run:  node scripts/audit-motion-parity.mjs
 * Fails (exit 1) with a diff report on any drift.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const motionValuesPath = path.join(root, "packages/tokens/src/motion.ts");
const resolvePath = path.join(root, "packages/motion/src/drivers/resolve.ts");
const tokensPath = path.join(root, "packages/tokens/src/tokens.css");

const motionValuesSrc = fs.readFileSync(motionValuesPath, "utf8");
const resolveSrc = fs.readFileSync(resolvePath, "utf8");
const tokensSrc = fs.readFileSync(tokensPath, "utf8");

/* ── 1. Structural guard: resolve.ts must derive from motionValues ── */

const derivesFromTokens =
  /\bmotionValues\.facetDuration/.test(resolveSrc) &&
  /\bmotionValues\.facetEasing/.test(resolveSrc) &&
  /\beasingValueToFunction\b/.test(resolveSrc);

if (!derivesFromTokens) {
  console.error(
    "audit:motion-parity: resolve.ts must derive DURATION_VALUES / EASING_FUNCTIONS\n" +
      "  from `motionValues` (@fusorb/facet-tokens) - hardcoded literals detected.\n" +
      "  Expected an import of { motionValues } and tables built via\n" +
      "  { ...motionValues.facetDuration } and Object.entries(motionValues.facetEasing).",
  );
  process.exit(1);
}

/* ── 2. Parse facetDuration + facetEasing from motionValues (motion.ts) ── */

// Anchor on the `motionValues` const so we read its numeric block, not the
// `motion` const above it (which holds CSS-var strings, not numbers).
const mvStart = motionValuesSrc.indexOf("export const motionValues");
const mvSrc = mvStart === -1 ? "" : motionValuesSrc.slice(mvStart);

const jsDurations = {};
const durBlock = mvSrc.match(/facetDuration:\s*\{([\s\S]*?)\}/);
if (durBlock) {
  for (const m of durBlock[1].matchAll(/(\w+):\s*(\d+)/g)) {
    jsDurations[m[1]] = Number(m[2]);
  }
}

const jsEasings = {};
const easeBlock = mvSrc.match(/facetEasing:\s*\{([\s\S]*?)\}/);
if (easeBlock) {
  for (
    const m of easeBlock[1].matchAll(
      /(\w+):\s*(?:"linear"|\[\s*([\d., ]+)\s*\])/g,
    )
  ) {
    const name = m[1];
    const beArgs = m[2]; // undefined for "linear"
    jsEasings[name] = beArgs
      ? beArgs.split(",").map((n) => Number(n.trim()))
      : [0, 0, 1, 1];
  }
}

if (!jsDurations["base"] || !jsEasings["standard"]) {
  console.error(
    "audit:motion-parity: could not parse facetDuration/facetEasing from motionValues.",
  );
  process.exit(1);
}

/* ── 3. Parse ALL --motion-* custom properties from tokens.css ── */

const cssVars = {};
for (const m of tokensSrc.matchAll(/--(motion-[a-z]+-[0-9a-z-]+):\s*([^;]+);/g)) {
  cssVars[m[1]] = m[2].trim();
}

/* ── Resolve var() chains to concrete values ── */

function resolveVar(value) {
  let v = value;
  for (let i = 0; i < 10; i++) {
    const ref = v.match(/var\(--([^)]+)\)/);
    if (!ref) break;
    const resolved = cssVars[ref[1]];
    if (resolved === undefined) {
      const fallback = tokensSrc.match(new RegExp(`--${ref[1]}:[^;]*;`));
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

/* ── Extract --facet-motion-duration-* and --facet-motion-ease-* ── */

const cssDurations = {};
const cssEasings = {};

for (const m of tokensSrc.matchAll(/--facet-motion-duration-([a-z]+):\s*([^;]+);/g)) {
  const resolved = resolveVar(m[2]);
  const num = Number(resolved.match(/([\d.]+)/)?.[0]);
  cssDurations[m[1]] = num;
}

for (const m of tokensSrc.matchAll(/--facet-motion-ease-([a-z]+):\s*([^;]+);/g)) {
  const resolved = resolveVar(m[2]).trim();
  cssEasings[m[1]] = parseEasingValue(resolved);
}

function parseEasingValue(v) {
  if (v === "linear") return [0, 0, 1, 1];
  const be = v.match(/cubic-bezier\(([\d., ]+)\)/);
  if (be) return be[1].split(",").map((n) => Number(n.trim()));
  return null;
}

/* ── 4. Compare motionValues ↔ CSS ── */

const errors = [];
const ok = [];

// Duration tokens
const jsDurKeys = new Set(Object.keys(jsDurations));
const cssDurKeys = new Set(Object.keys(cssDurations));

const durMissingFromCss = [...jsDurKeys].filter((k) => !cssDurKeys.has(k)).sort();
const durMissingFromJs = [...cssDurKeys].filter((k) => !jsDurKeys.has(k)).sort();

if (durMissingFromCss.length) {
  errors.push(
    `Durations in motionValues.facetDuration but missing from CSS --facet-motion-duration-* (${durMissingFromCss.length}): ${durMissingFromCss.join(", ")}`,
  );
} else {
  ok.push(`All ${jsDurKeys.size} duration tokens present in both motionValues and CSS.`);
}

if (durMissingFromJs.length) {
  errors.push(
    `Durations in CSS --facet-motion-duration-* but missing from motionValues.facetDuration (${durMissingFromJs.length}): ${durMissingFromJs.join(", ")}`,
  );
}

for (const key of [...jsDurKeys].sort()) {
  if (cssDurations[key] !== undefined && cssDurations[key] !== jsDurations[key]) {
    errors.push(`Duration mismatch for "${key}": motionValues=${jsDurations[key]} vs CSS=${cssDurations[key]}ms`);
  }
}

// Easing tokens
const jsEaseKeys = new Set(Object.keys(jsEasings));
const cssEaseKeys = new Set(Object.keys(cssEasings));

const easeMissingFromCss = [...jsEaseKeys].filter((k) => !cssEaseKeys.has(k)).sort();
const easeMissingFromJs = [...cssEaseKeys].filter((k) => !jsEaseKeys.has(k)).sort();

if (easeMissingFromCss.length) {
  errors.push(
    `Easings in motionValues.facetEasing but missing from CSS --facet-motion-ease-* (${easeMissingFromCss.length}): ${easeMissingFromCss.join(", ")}`,
  );
} else {
  ok.push(`All ${jsEaseKeys.size} easing tokens present in both motionValues and CSS.`);
}

if (easeMissingFromJs.length) {
  errors.push(
    `Easings in CSS --facet-motion-ease-* but missing from motionValues.facetEasing (${easeMissingFromJs.length}): ${easeMissingFromJs.join(", ")}`,
  );
}

for (const key of [...jsEaseKeys].sort()) {
  if (cssEasings[key] != null) {
    const jsCoords = jsEasings[key];
    const cssCoords = cssEasings[key];
    if (
      jsCoords.length !== cssCoords.length ||
      jsCoords.some((v, i) => v !== cssCoords[i])
    ) {
      errors.push(
        `Easing mismatch for "${key}": motionValues=${JSON.stringify(jsCoords)} vs CSS=${JSON.stringify(cssCoords)}`,
      );
    }
  }
}

/* ── Report ── */

console.log("Motion token parity check");
console.log("-------------------------");
for (const line of ok) console.log(`  ok: ${line}`);
if (errors.length) {
  console.log("\nFAILED:");
  for (const line of errors) console.log(`  - ${line}`);
  console.log("\nDrift detected between motionValues and tokens.css. Fix the values, then re-run:");
  console.log("  node scripts/audit-motion-parity.mjs");
  process.exit(1);
}
console.log(
  `\nAll checks passed (${jsDurKeys.size} durations + ${jsEaseKeys.size} easings in sync; resolve.ts derives from motionValues).`,
);
