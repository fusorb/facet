const fs = require("fs");
const path = require("path");

// 1. Read arc-id's ROUTES constant (the canonical contract list).
// Configurable via ARC_ID_ROUTES env var; defaults to ../arc-id relative
// to this script's location so it works on any machine without a
// hardcoded absolute path.
const ARC_ID_ROUTES =
  process.env.ARC_ID_ROUTES ||
  path.resolve(__dirname, "../../arc-id/src/lib/api/routes/index.ts");

const routesSrc = fs.readFileSync(ARC_ID_ROUTES, "utf8");

// Extract all path literals (both plain strings and template fns like (id) => `/x/${id}`).
const paths = new Set();
for (const m of routesSrc.matchAll(/"(\/[a-z0-9/-]+)"/g)) paths.add(m[1]);
for (const m of routesSrc.matchAll(/=> `(\/[a-z0-9/-]*\$?\{?[a-z0-9-]*)`/g)) {
  // normalize template paths to the static prefix
  paths.add(m[1].replace(/\$\{[^}]*\}/g, ":id"));
}
// The route index nests objects; template paths like /tenants/${id}/members also appear.
for (const m of routesSrc.matchAll(/`(\/[a-z0-9/${}.-]+)`/g)) {
  paths.add(m[1].replace(/\$\{[^}]*\}/g, ":id"));
}

// 2. Read the facet SDK source (all *.ts) to find every endpoint string used.
const sdkDir = "packages/sdk/src";
const sdkFiles = fs.readdirSync(sdkDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
const sdkPaths = new Set();
const sdkSource = sdkFiles.map((f) => fs.readFileSync(`${sdkDir}/${f}`, "utf8")).join("\n");
for (const m of sdkSource.matchAll(/"(\/[a-z0-9/-]+)"/g)) sdkPaths.add(m[1]);
// Template literals with interpolations: capture the static path prefix
// (e.g. `/audit/logs${qs ? ...}` -> `/audit/logs`, `/oauth/authorize?${qs}` -> `/oauth/authorize?`).
for (const m of sdkSource.matchAll(/`([^`]*)`/g)) {
  const withoutInterp = m[1].replace(/\$\{[^}]*\}/g, "");
  // keep only the leading path segment (up to a space, quote, or ) ).
  const pathMatch = withoutInterp.match(/^(\/[a-zA-Z0-9/._?{}-]*)/);
  if (pathMatch) sdkPaths.add(pathMatch[1]);
}

// 3. Diff: arc-id paths not covered by SDK.
const arcPaths = [...paths].sort();
const uncovered = arcPaths.filter((p) => {
  const normalized = p.replace(/\/:[a-z]+/g, "/:id");
  // Coverage = SDK references the exact path, or as a prefix (e.g.
  // `/audit/logs` in a template), or with a query-string suffix
  // (`/oauth/authorize?...`).
  return ![...sdkPaths].some((s) => {
    const sn = s.replace(/\/:[a-z]+/g, "/:id").split("?")[0];
    return sn === normalized || sn.startsWith(normalized + "/") || normalized.startsWith(sn + "/");
  });
});

console.log("=== arc-id ROUTES index paths:", arcPaths.length, "===");
for (const p of arcPaths) console.log("  ", p);

console.log("\n=== SDK endpoint strings:", sdkPaths.size, "===");
for (const p of [...sdkPaths].sort()) console.log("  ", p);

console.log("\n=== arc-id paths NOT covered by the SDK ===");
if (!uncovered.length) console.log("  (none - full coverage)");
else for (const p of uncovered) console.log("  ", p);

const covered = arcPaths.length - uncovered.length;
console.log(`\n=== Coverage: ${covered}/${arcPaths.length} arc-id routes covered by @fusorb/facet-sdk ===`);
if (uncovered.length) process.exitCode = 1;
