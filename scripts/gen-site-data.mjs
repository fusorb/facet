// Generates apps/landing/src/data/site-data.generated.ts from the real
// workspace packages, so the landing page never hardcodes a version or a
// count. Run: node scripts/gen-site-data.mjs
//
// Sources of truth:
//   - All packages: scanned from packages/*/package.json (auto-discovered,
//     not hardcoded — new packages appear automatically)
//   - Package versions: packages/*/package.json
//   - Component count:  packages/components/src/ui/*.tsx (excluding tests)
//   - SDK count:        exported *Sdk classes in packages/sdk/src/index.ts
//   - Layout shells:    *-layout.tsx files in packages/layout/src
//   - Auth presets:     exported *Preset consts in packages/auth/src/presets.ts
//
// Writes: apps/landing/src/data/site-data.generated.ts
// The emitted file is auto-generated: never hand-edit it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the repo root from the script location so the generator works
// regardless of the cwd it is invoked from (root scripts or the landing
// package's build script).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "apps/landing/src/data/site-data.generated.ts");

// Presentation metadata overlay — only `icon` is editorial (icons are a
// branding choice, not derivable from package.json). Descriptions and
// versions are read from each package.json at generation time.
// Order here controls the display order on the landing "Packages" section.
const PACKAGE_ORDER = [
  "@fusorb/facet-components",
  "@fusorb/facet-docs",
  "@fusorb/facet-auth",
  "@fusorb/facet-layout",
  "@fusorb/facet-sdk",
  "@fusorb/facet-tokens",
  "@fusorb/facet-emails",
  "@fusorb/facet-cli",
  "@fusorb/facet-store",
  "@fusorb/facet-motion",
  "@fusorb/facet-native",
  "@fusorb/facet-sandbox",
];

const PACKAGE_ICONS = {
  "@fusorb/facet-tokens": "palette",
  "@fusorb/facet-sdk": "zap",
  "@fusorb/facet-components": "boxes",
  "@fusorb/facet-auth": "shield-check",
  "@fusorb/facet-layout": "building",
  "@fusorb/facet-store": "store",
  "@fusorb/facet-emails": "mail",
  "@fusorb/facet-docs": "book-open",
  "@fusorb/facet-cli": "terminal",
  "@fusorb/facet-motion": "sparkle",
  "@fusorb/facet-native": "phone",
  "@fusorb/facet-sandbox": "play",
};

/**
 * Auto-discover all packages in the workspace by scanning the packages
 * directory for sub-directories containing a package.json file.
 * Returns [{ name, version, description }] sorted in the preferred display order.
 */
function discoverPackages() {
  const packagesDir = path.join(root, "packages");
  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });

  const discovered = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    if (!pkg.name || pkg.private) continue;
    discovered.push({
      name: pkg.name,
      version: pkg.version,
      description: pkg.description ?? "",
    });
  }

  // Sort by the preferred display order; any packages not in the order
  // list sort after, alphabetically.
  const orderIndex = new Map(PACKAGE_ORDER.map((name, i) => [name, i]));
  discovered.sort((a, b) => {
    const ai = orderIndex.get(a.name) ?? Infinity;
    const bi = orderIndex.get(b.name) ?? Infinity;
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name);
  });

  return discovered;
}

function countComponents() {
  const uiDir = path.join(root, "packages/components/src/ui");
  return fs
    .readdirSync(uiDir)
    .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx")).length;
}

function countSdks() {
  const src = fs.readFileSync(path.join(root, "packages/sdk/src/index.ts"), "utf-8");
  return (src.match(/export \{ \w+Sdk \} from/g) ?? []).length;
}

function countLayoutShells() {
  const dir = path.join(root, "packages/layout/src");
  return fs.readdirSync(dir).filter((f) => /-layout\.tsx$/.test(f)).length;
}

function countAuthPresets() {
  const src = fs.readFileSync(path.join(root, "packages/auth/src/presets.ts"), "utf-8");
  return (src.match(/export const \w+Preset: AuthConfig/g) ?? []).length;
}

// Count available icons from the icon-map registry.
function countIcons() {
  const mapPath = path.join(root, "packages/components/src/icon/icon-map.ts");
  const src = fs.readFileSync(mapPath, "utf-8");
  return (src.match(/^\s*"[^"]+":\s*\w+,/gm) ?? []).length;
}

const componentCount = countComponents();
const iconCount = countIcons();

const discoveredPackages = discoverPackages();

const packages = discoveredPackages.map((pkg) => ({
  name: pkg.name,
  desc: pkg.description,
  version: pkg.version,
  icon: PACKAGE_ICONS[pkg.name] ?? "package",
}));

const stats = [
  { value: String(componentCount), label: "components" },
  { value: String(countSdks()), label: "API SDKs" },
  { value: String(countLayoutShells()), label: "layout shells" },
  { value: String(countAuthPresets()), label: "auth presets" },
  { value: String(iconCount), label: "icons" },
];

// Root workspace version (e.g. "2.0.0") — resolved from the repo root
// package.json at generation time so the landing badge never hardcodes it.
const siteVersion = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf-8"),
).version;

const body = `// AUTO-GENERATED by scripts/gen-site-data.mjs, do not edit by hand.
// Regenerate with: node scripts/gen-site-data.mjs
//
// Every package version and stat on the landing page comes from this file,
// resolved from the real workspace packages at generation time.

import type { IconName } from "@fusorb/facet-components";

export interface SitePackage {
  name: string;
  desc: string;
  version: string;
  icon: IconName;
}

export const SITE_PACKAGES: SitePackage[] = ${JSON.stringify(packages, null, 2)};

export interface SiteStat {
  value: string;
  label: string;
}

export const SITE_STATS: SiteStat[] = ${JSON.stringify(stats, null, 2)};

/** Total number of workspace packages (auto-detected from the packages directory). */
export const SITE_PACKAGES_COUNT: number = ${packages.length};

/** Number of component files in packages/components (auto-detected). */
export const COMPONENT_COUNT: number = ${componentCount};

/** Number of registered icons (auto-detected from icon-map.ts). */
export const ICON_COUNT: number = ${iconCount};

// Root workspace version, resolved from the repo package.json at generation
// time.  Consumers: HeroSection version badge, changelog, etc.
export const SITE_VERSION: string = ${JSON.stringify(siteVersion)};
`;

fs.writeFileSync(outFile, body, "utf-8");
console.log(`Detected ${packages.length} packages:`);
for (const pkg of packages) {
  console.log(`  ${pkg.name}@${pkg.version} — ${pkg.desc}`);
}
console.log(`Stats: ${stats.map((s) => `${s.value} ${s.label}`).join(" | ")}`);
console.log(`Wrote site-data to ${path.relative(root, outFile)}`);
