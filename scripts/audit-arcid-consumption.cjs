const fs = require("fs");
const path = require("path");

// Configurable via ARC_ID_DIR; defaults to a sibling ../SovGrant relative to
// this script so it works on any machine without a hardcoded absolute path.
// Skips gracefully when the SovGrant repo is not present.
const ARC_ID_DIR = process.env.ARC_ID_DIR || path.resolve(__dirname, "../../SovGrant");
const ARC_ID_ROUTES = path.join(ARC_ID_DIR, "src/lib/api/routes/index.ts");

if (!fs.existsSync(ARC_ID_ROUTES)) {
  console.log("SovGrant not found at", ARC_ID_DIR, "- skipping cross-repo consumption audit.");
  process.exit(0);
}

// 1. Every SovGrant endpoint (from the ROUTES index + actual route files).
const routesSrc = fs.readFileSync(ARC_ID_ROUTES, "utf8");
const paths = new Set();
for (const m of routesSrc.matchAll(/"(\/[a-z0-9/-]+)"/g)) paths.add(m[1]);
for (const m of routesSrc.matchAll(/`(\/[a-z0-9/${}.-]+)`/g)) {
  paths.add(m[1].replace(/\$\{[^}]*\}/g, ":id"));
}

// 2. SDK endpoint strings (the published facet-sdk the app consumes).
const sdkDir = "packages/sdk/src";
const sdkFiles = fs.readdirSync(sdkDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
const sdkSource = sdkFiles.map((f) => fs.readFileSync(`${sdkDir}/${f}`, "utf8")).join("\n");
const sdkPaths = new Set();
for (const m of sdkSource.matchAll(/"(\/[a-z0-9/-]+)"/g)) sdkPaths.add(m[1]);
for (const m of sdkSource.matchAll(/`([^`]*)`/g)) {
  const withoutInterp = m[1].replace(/\$\{[^}]*\}/g, "");
  const pathMatch = withoutInterp.match(/^(\/[a-zA-Z0-9/._?{}-]*)/);
  if (pathMatch) sdkPaths.add(pathMatch[1]);
}

// 3. SovGrant app source: which SDK methods does the app actually call?
//    Scan the app's src for sdk usage patterns.
function walk(d, acc = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!["node_modules", ".next", "dist", "coverage", "public", ".turbo"].includes(f)) walk(p, acc);
    } else if (/\.(ts|tsx)$/.test(f) && !f.includes(".test.")) acc.push(p);
  }
  return acc;
}
// Only the client-facing dirs (not the server modules).
const appFiles = [
  ...walk(path.join(ARC_ID_DIR, "src/app")),
  ...walk(path.join(ARC_ID_DIR, "src/components")),
  ...walk(path.join(ARC_ID_DIR, "src/store")),
  ...walk(path.join(ARC_ID_DIR, "src/hooks")),
  ...walk(path.join(ARC_ID_DIR, "src/providers")),
  ...walk(path.join(ARC_ID_DIR, "src/lib")),
  ...walk(path.join(ARC_ID_DIR, "src/sdk")),
];
const appSource = appFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

// SDK module singletons used + the methods called on them.
const moduleNames = ["auth", "tenants", "billing", "credentials", "audit", "identity", "oauth", "webhooks", "passkeys", "idp"];
console.log("=== SDK modules referenced in SovGrant app ===");
for (const m of moduleNames) {
  const uses = (appSource.match(new RegExp(`\\b${m}\\.(\\w+)\\(`, "g")) || []).map((x) => x.split(".")[1]);
  if (uses.length) console.log(`  ${m}: ${[...new Set(uses)].join(", ")}`);
}

console.log("\n=== SovGrant endpoints NOT called by any SDK module in the app ===");
const sdkMethodsUsed = new Set(
  [...appSource.matchAll(/\b(auth|tenants|billing|credentials|audit|identity|oauth|webhooks|passkeys|idp)\.(\w+)\(/g)]
    .map((m) => m[2]),
);

// Map: which SDK methods exist per module.
const methodNames = {};
for (const f of sdkFiles) {
  const src = fs.readFileSync(`${sdkDir}/${f}`, "utf8");
  const cls = (src.match(/export class (\w+)Sdk/) || [])[1];
  if (cls) {
    const methods = [...src.matchAll(/^\s{2}(?:async\s+)?(\w+)\(/gm)].map((m) => m[1]);
    methodNames[cls] = methods;
  }
}

console.log("\n=== SDK methods NOT used anywhere in SovGrant app ===");
for (const [cls, methods] of Object.entries(methodNames)) {
  const unused = methods.filter((m) => !sdkMethodsUsed.has(m));
  if (unused.length) console.log(`  ${cls}: ${unused.join(", ")}`);
}
