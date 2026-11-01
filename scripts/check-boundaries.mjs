#!/usr/bin/env node
/* §21 package-boundary guard (dependency-layer discipline).
 *
 * Enforces:
 *  1. Acyclic: the @fusorb/* dependency graph has no cycles.
 *  2. Native-isolated: @fusorb/facet-native is its OWN package
 *     (packages/native with its own package.json, NOT nested under
 *     packages/motion) and depends only on @fusorb/facet-tokens and
 *     @fusorb/facet-motion (the host runtime it auto-registers its driver
 *     into; the Animated API itself is consumer-provided via 'bindAnimated').
 *     It stays a SovGrant/SovPort leaf  - never
 *     merged into motion's src or bundled into the web build.
 *
 * Zero runtime deps; exits non-zero on drift so CI (check:boundaries) catches
 * regressions. Mirrors scripts/check-component-flexibility.mjs (the §14 gate). */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkgsDir = path.join(root, "packages");
const isDir = (p) => fs.statSync(p, { throwIfNoEntry: false })?.isDirectory() ?? false;
const pkgDirs = fs.readdirSync(pkgsDir).filter((d) => isDir(path.join(pkgsDir, d)) && fs.existsSync(path.join(pkgsDir, d, "package.json")));

const scopes = new Set();
const graph = new Map(); // package name -> Set(fusorb dep names)
for (const d of pkgDirs) {
  const pj = JSON.parse(fs.readFileSync(path.join(pkgsDir, d, "package.json"), "utf8"));
  if (!pj.name) continue;
  scopes.add(pj.name);
  const deps = new Set();
  for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    if (pj[field]) for (const k of Object.keys(pj[field])) if (k.startsWith("@fusorb/")) deps.add(k);
  }
  graph.set(pj.name, deps);
}

// 1) Acyclicity (DFS).
let cyclic = false;
const visiting = new Set(), seen = new Set();
const visit = (node, stack) => {
  if (seen.has(node)) return;
  if (visiting.has(node)) { console.error(`\nCYCLE: ${[...stack, node].join(" -> ")}`); cyclic = true; return; }
  visiting.add(node); stack.push(node);
  for (const dep of graph.get(node) || []) if (scopes.has(dep)) visit(dep, stack);
  stack.pop(); visiting.delete(node); seen.add(node);
};
for (const n of scopes) visit(n, []);

// 2) Native isolation: own package, not nested under motion, deps ⊆ tokens.
const NATIVE_NAME = "@fusorb/facet-native";
const nativeDir = path.join(pkgsDir, "native");
const violations = [];
if (!fs.existsSync(path.join(nativeDir, "package.json"))) {
  violations.push("@fusorb/facet-native is not a separate package (no packages/native/package.json).");
} else if (fs.existsSync(path.join(pkgsDir, "motion", "native"))) {
  violations.push("@fusorb/facet-native is nested under motion (packages/motion/native). It must be its own package so SovGrant/SovPort consumers can bind it.");
} else {
  const npj = JSON.parse(fs.readFileSync(path.join(nativeDir, "package.json"), "utf8"));
  const ALLOWED_NATIVE_DEPS = new Set(["@fusorb/facet-tokens", "@fusorb/facet-motion"]);
  const illegal = [];
  for (const field of ["dependencies", "peerDependencies"]) {
    if (npj[field]) for (const k of Object.keys(npj[field]).filter((x) => x.startsWith("@fusorb/"))) if (!ALLOWED_NATIVE_DEPS.has(k)) illegal.push(k);
  }
  if (illegal.length) violations.push(`${NATIVE_NAME} depends on ${illegal.join(", ")}  - allowed: @fusorb/facet-tokens + @fusorb/facet-motion (driver registry + core engine types; the Animated API itself is consumer-provided via 'bindAnimated').`);
}

// 3) M2 boundaries: layout and docs may not depend on auth/sdk.
for (const [name, deps] of graph) {
  if (name === "@fusorb/facet-layout" || name === "@fusorb/facet-docs") {
    for (const d of deps) {
      if (d === "@fusorb/facet-auth" || d === "@fusorb/facet-sdk") {
        violations.push(`${name} depends on ${d} (forbidden by M2: layout/docs must not depend on auth/sdk).`);
      }
    }
  }
}
// 4) sandbox has no @fusorb/* dependency (facet-agnostic, L1/L3).
const sandboxPj = graph.has("@fusorb/facet-sandbox") ? null : null;
const sandboxDeps = graph.get("@fusorb/facet-sandbox") || new Set();
if (sandboxDeps.size > 0) {
  violations.push(`@fusorb/facet-sandbox depends on ${[...sandboxDeps].join(", ")} (forbidden: sandbox has no @fusorb/* dependency).`);
}
// 5) No published package depends on registry.
const registryName = "@fusorb/facet-registry";
for (const [name, deps] of graph) {
  if (deps.has(registryName)) {
    violations.push(`${name} depends on ${registryName} (forbidden: published packages must not depend on the private registry package).`);
  }
}
// 6) Apps may not deep-import src/ of packages (runtime source). Dev aliases
//    (vite.config.ts) and generated data files are excluded.
function walkApps(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist") continue;
      walkApps(full, acc);
    } else {
      acc.push(full);
    }
  }
}
const appFiles = [];
walkApps(path.join(root, "apps"), appFiles);
for (const f of appFiles) {
  const base = path.basename(f);
  if (base.endsWith(".config.ts") || base.endsWith(".config.js") || base.endsWith(".generated.ts") || base === "changelog.ts") continue;
  if (!/\.(ts|tsx|js|jsx)$/.test(base)) continue;
  const content = fs.readFileSync(f, "utf-8");
  const m = content.match(/packages\/[a-z-]+\/src\//g);
  if (m) violations.push(`${path.relative(root, f)} deep-imports package src/ (${[...new Set(m)].join(", ")}) — apps must import from package barrels.`);
}

if (cyclic || violations.length) {
  if (cyclic) console.error("FAILED (§21): dependency cycle detected above.");
  if (violations.length) {
    console.error("\nFAILED (§21): boundary violation:");
    for (const v of violations) console.error(`  - ${v}`);
  }
  process.exit(1);
}
console.log(`Boundaries OK (§21): ${scopes.size} packages; acyclic graph; ${NATIVE_NAME} isolated; M2 boundaries (layout/docs no auth/sdk, sandbox no @fusorb/*, no registry dep, no app deep-import src/) enforced.`);
