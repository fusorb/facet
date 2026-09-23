#!/usr/bin/env node
/* §21 package-boundary guard (dependency-layer discipline).
 *
 * Enforces:
 *  1. Acyclic: the @fusorb/* dependency graph has no cycles.
 *  2. Native-isolated: @fusorb/facet-native is its OWN package
 *     (packages/native with its own package.json, NOT nested under
 *     packages/motion) and depends only on @fusorb/facet-tokens. It stays a
 *     SovGrant/SovPort leaf that consumers bind via `bindAnimated` — never
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
  const illegal = [];
  for (const field of ["dependencies", "peerDependencies"]) {
    if (npj[field]) for (const k of Object.keys(npj[field]).filter((x) => x.startsWith("@fusorb/"))) if (k !== "@fusorb/facet-tokens") illegal.push(k);
  }
  if (illegal.length) violations.push(`${NATIVE_NAME} depends on ${illegal.join(", ")} — allowed: @fusorb/facet-tokens only.`);
}

if (cyclic || violations.length) {
  if (cyclic) console.error("FAILED (§21): dependency cycle detected above.");
  if (violations.length) {
    console.error("\nFAILED (§21): native package-boundary violation:");
    for (const v of violations) console.error(`  - ${v}`);
  }
  process.exit(1);
}
console.log(`Boundaries OK (§21): ${scopes.size} packages; acyclic graph; ${NATIVE_NAME} is a separate package (packages/native) depending only on @fusorb/facet-tokens.`);
