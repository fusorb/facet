const fs = require("fs");
const path = require("path");

// 1. Load SovGrant's ROUTES contract.
// Prefer a live source (ARC_ID_ROUTES env or sibling SovGrant checkout) so
// coverage can be revalidated against the canonical contract when available.
// Fall back to the committed snapshot fixture so the gate is deterministic and
// meaningful in CI/checkouts without a sibling SovGrant repo.
const DEFAULT_ROUTES_SRC = path.resolve(__dirname, "../../SovGrant/src/lib/api/routes/index.ts");
const SNAPSHOT_PATH = path.resolve(__dirname, "fixtures/sovgrant-routes.json");
const routesSource = process.env.ARC_ID_ROUTES || (fs.existsSync(DEFAULT_ROUTES_SRC) ? DEFAULT_ROUTES_SRC : null);

let paths = new Set();
let contractLabel = "";

if (routesSource) {
  if (!fs.existsSync(routesSource)) {
    console.error("SovGrant routes source not found at", routesSource);
    process.exit(1);
  }
  const routesSrc = fs.readFileSync(routesSource, "utf8");
  // Extract all path literals (both plain strings and template fns like (id) => `/x/${id}`).
  for (const m of routesSrc.matchAll(/"(\/[a-z0-9/-]+)"/g)) paths.add(m[1]);
  for (const m of routesSrc.matchAll(/=> `(\/[a-z0-9/-]*\$?\{?[a-z0-9-]*)`/g)) {
    // normalize template paths to the static prefix
    paths.add(m[1].replace(/\$\{[^}]*\}/g, ":id"));
  }
  // The route index nests objects; template paths like /tenants/${id}/members also appear.
  for (const m of routesSrc.matchAll(/`(\/[a-z0-9/${}.-]+)`/g)) {
    paths.add(m[1].replace(/\$\{[^}]*\}/g, ":id"));
  }
  contractLabel = `source: ${path.relative(process.cwd(), routesSource)}`;
} else if (fs.existsSync(SNAPSHOT_PATH)) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
  if (!Array.isArray(snapshot) || snapshot.length === 0) {
    console.error("Invalid SovGrant routes snapshot at", SNAPSHOT_PATH);
    process.exit(1);
  }
  paths = new Set(snapshot);
  contractLabel = `snapshot: ${path.relative(process.cwd(), SNAPSHOT_PATH)}`;
} else {
  console.error(
    "No SovGrant routes source or snapshot found. Set ARC_ID_ROUTES or provide scripts/fixtures/sovgrant-routes.json.",
  );
  process.exit(1);
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
  const withoutInterp = m[1].replace(/\$\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, ":id");
  // keep only the leading path segment (up to a space, quote, or ) ).
  const pathMatch = withoutInterp.match(/^(\/[a-zA-Z0-9/._?{}:-]*)/);
  if (pathMatch) sdkPaths.add(pathMatch[1]);
}

// 3. Diff: SovGrant paths not covered by SDK.
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

console.log("=== SovGrant ROUTES contract paths:", arcPaths.length, `(${contractLabel}) ===`);
for (const p of arcPaths) console.log("  ", p);

console.log("\n=== SDK endpoint strings:", sdkPaths.size, "===");
for (const p of [...sdkPaths].sort()) console.log("  ", p);

console.log("\n=== SovGrant paths NOT covered by the SDK ===");
if (!uncovered.length) console.log("  (none - full coverage)");
else for (const p of uncovered) console.log("  ", p);

const covered = arcPaths.length - uncovered.length;
console.log(`\n=== Coverage: ${covered}/${arcPaths.length} SovGrant routes covered by @fusorb/facet-sdk (${contractLabel}) ===`);
if (uncovered.length) process.exitCode = 1;
