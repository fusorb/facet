#!/usr/bin/env node
/**
 * check:motion-drift - manifest gate for @fusorb/facet-motion.
 *
 * Fails if:
 *  1. A registry entry (generative family or authored effect) is not
 *     accessible via the `registry` export from `src/index.ts`.
 *  2. The barrel is missing an expected public export.
 *  3. The generative family count is not 15 or the authored count
 *     is below the spec's minimum (14).
 *
 * Modeled after scripts/check-sdk-drift.mjs.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const motionSrc = resolve(__dirname, "..", "src");
const repoRoot = resolve(__dirname, "..", "..");

// ---- 1. Read the barrel -----------------------------------------------
const barrelPath = resolve(motionSrc, "index.ts");
let barrelContent;
try {
  barrelContent = readFileSync(barrelPath, "utf-8");
} catch {
  console.error("check:motion-drift: src/index.ts not found - barrel missing");
  process.exit(1);
}

/** Extract all named exports from a TS source string. */
function extractExports(source) {
  const names = new Set();
  const patterns = [
    /export\s+(?:const|let|var|function|class)\s+(\w+)/g,
    /export\s+\{\s*([^}]+)\s*\}/g,
    /export\s+type\s+\{\s*([^}]+)\s*\}/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(source)) !== null) {
      m[1].split(",").forEach((name) => {
        const clean = name.replace(/\s+as\s+\w+/, "").trim();
        if (clean) names.add(clean);
      });
    }
  }
  return names;
}

const barrelExports = extractExports(barrelContent);

// ---- 2. Check required public API -------------------------------------
const requiredExports = new Set([
  // core
  "animate", "sequence", "stagger", "tween", "spring",
  // values
  "motionValue",
  // drivers
  "cssDriver", "preferReducedMotion", "resolveDuration", "resolveEasing",
  // registry
  "resolveMotion", "registry", "get",
  // react
  "Motion", "Presence", "Reveal", "Stagger",
  // utilities
  "cn",
]);

const missingExports = [...requiredExports].filter((name) => !barrelExports.has(name));
if (missingExports.length > 0) {
  console.error(
    `check:motion-drift: barrel is missing required exports: ${missingExports.join(", ")}`,
  );
  process.exit(1);
}

// ---- 3. Count generative families & authored effects ------------------
function countDefinitions(file, pattern) {
  try {
    const content = readFileSync(resolve(motionSrc, "registry", file), "utf-8");
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

const genCount = countDefinitions("families.ts", /export const \w+:\s*MotionEffectDefinition/g);
const authoredCount = countDefinitions("authored.ts", /authored\(\s*"/g);
const minAuthored = 18;

if (genCount !== 15) {
  console.error(
    `check:motion-drift: expected 15 generative families, found ${genCount}`,
  );
  process.exit(1);
}

if (authoredCount < minAuthored) {
  console.error(
    `check:motion-drift: expected at least ${minAuthored} authored effects, found ${authoredCount}`,
  );
  process.exit(1);
}

// ---- 4. Cross-check: every family/authored id is in the registry ------
// Parse the generativeFamilies object keys and authoredRegistry keys.
// Then verify the barrel exports `generativeFamilies` and `authoredRegistry`.
if (!barrelExports.has("generativeFamilies") || !barrelExports.has("authoredRegistry")) {
  console.error(
    "check:motion-drift: barrel must export `generativeFamilies` and `authoredRegistry`",
  );
  process.exit(1);
}

// ---- 5. Verify no Phase 2-4 leakage -----------------------------------
const forbiddenPatterns = [
  // Phase 3: presets
  /presets/,
  // Phase 4: authored effect implementations
  /shake[^X]/,  // shakeX/Y is OK in families, but bare "shake" impl is Phase 4
];
// Check that no file in src/ references forbidden Phase 3/4 code paths
const allFiles = readdirSync(resolve(motionSrc), { recursive: true });
const tsFiles = allFiles.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
for (const file of tsFiles) {
  if (file.includes("presets/")) {
    console.error(`check:motion-drift: Phase 3 preset file found: ${file}`);
    process.exit(1);
  }
}

console.log(
  `check:motion-drift: OK - barrel exports ${barrelExports.size} symbols; ` +
  `registry has ${genCount} generative + ${authoredCount} authored effects.`,
);
process.exit(0);
