/**
 * @fusorb/facet-registry scanner
 *
 * Indexes the workspace into a single `registry.json` + typed accessors.
 * Reads from source-of-truth files only  - never duplicates a fact.
 *
 * Run: node packages/registry/src/scan.mjs
 * Output: packages/registry/src/registry.json
 *
 * Sources:
 *   - packages/<pkg>/package.json           (name, version, deps, facet metadata)
 *   - packages/components/src/index.ts      (barrel exports)
 *   - packages/components/src/ui/<name>.tsx  (JSDoc @category/@summary)
 *   - packages/layout/src/<name>-layout.tsx  (layout shells)
 *   - packages/layout/src/presets.ts         (domain presets)
 *   - packages/motion/src/registry/          (generative families + authored effects)
 *   - packages/tokens/src/<name>.css         (CSS custom properties)
 *   - packages/sdk/src/index.ts              (SDK class exports)
 *   - packages/auth/src/presets.ts           (auth domain presets)
 *   - packages/components/src/icon/icon-map.ts (icon registry)
 *   - changeset.md                          (changeset configuration)
 *   - git rev-parse HEAD                    (commit hash)
 *
 * This scanner shares its core logic with `facet registry build` (see cli/src/commands/registry.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { surfaces as SURFACES } from "../../../surfaces.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(outDir, "registry.json");

// ── Package metadata overlay (icon only) ──────────────────────────
// Order/category/summary now come from package.json "facet" field.
// Icons are branding choices  - editorial, not derivable.
const FALLBACK_ICONS = {
  "@fusorb/facet-tokens": "palette",
  "@fusorb/facet-utils": "wrench",
  "@fusorb/facet-motion": "sparkle",
  "@fusorb/facet-native": "phone",
  "@fusorb/facet-components": "boxes",
  "@fusorb/facet-auth": "shield-check",
  "@fusorb/facet-sdk": "zap",
  "@fusorb/facet-store": "store",
  "@fusorb/facet-emails": "mail",
  "@fusorb/facet-docs": "book-open",
  "@fusorb/facet-cli": "terminal",
  "@fusorb/facet-layout": "building",
  "@fusorb/facet-sandbox": "play",
};

// Surfaces now come from ../../../surfaces.config.mjs (single source of truth, L6).

/* ── Helpers ─────────────────────────────────────────────────────── */

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function readIfExists(p) {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

function getGitCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

function kebabToPascal(name) {
  return name
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

function extractJSDocTags(source) {
  const tags = {};
  // Match @category and @summary in JSDoc blocks
  const categoryMatch = source.match(/@category\s+(\S+)/);
  const summaryMatch = source.match(/@summary\s+(.+?)(?:\n\s*\*|\n)/);
  if (categoryMatch) tags.category = categoryMatch[1];
  if (summaryMatch) tags.summary = summaryMatch[1].trim();
  return tags;
}

/* ── Scanners ────────────────────────────────────────────────────── */

function scanPackages() {
  const packagesDir = path.join(root, "packages");
  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkg = readJSON(pkgJsonPath);
    if (pkg.private) continue; // private workspace packages (e.g. registry) are not catalogued
    const facet = pkg.facet ?? {};
    const dir = path.join(packagesDir, entry.name);

    result.push({
      name: pkg.name ?? entry.name,
      version: pkg.version ?? "0.0.0",
      summary: pkg.facet?.summary ?? pkg.description ?? "",
      description: pkg.description ?? "",
      category: pkg.facet?.category ?? "ui",
      icon: pkg.facet?.icon ?? FALLBACK_ICONS[pkg.name] ?? "package",
      order: pkg.facet?.order ?? 99,
      private: pkg.private ?? false,
      deps: Object.keys(pkg.dependencies ?? {}).filter((d) => d.startsWith("@fusorb/")),
      devDeps: Object.keys(pkg.devDependencies ?? {}).filter((d) => d.startsWith("@fusorb/")),
      peers: Object.keys(pkg.peerDependencies ?? {}),
      exports: Object.keys(pkg.exports ?? {}),
      mainExport: pkg.exports?.["."] ? "." : null,
      installCommand: `pnpm add ${pkg.name}${pkg.private ? " --workspace" : ""}`,
    });
  }

  return result.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function scanComponents() {
  const barrelPath = path.join(root, "packages/components/src/index.ts");
  const uiDir = path.join(root, "packages/components/src/ui");
  const barrelSrc = readIfExists(barrelPath) ?? "";

  // Parse barrel exports to get exported names + aliases
  const exportedNames = [];
  const re = /export\s+\{\s*([^}]+)\s*\}\s*from/g;
  let m;
  while ((m = re.exec(barrelSrc)) !== null) {
    const items = m[1].split(",").map((s) => s.trim());
    for (const item of items) {
      const parts = item.split(" as ");
      exportedNames.push({ name: parts[0], alias: parts[1] ?? parts[0] });
    }
  }

  // Scan ui/*.tsx for JSDoc tags
  const entryMap = new Map(exportedNames.map((e) => [e.alias, e.name]));
  const files = fs
    .readdirSync(uiDir)
    .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"));

  const EXCLUDED = new Set(["typewriter-text"]);

  return files
    .map((file) => {
      const slug = file.replace(/\.tsx$/, "");
      const componentName = entryMap.get(kebabToPascal(slug)) ?? entryMap.get(slug) ?? kebabToPascal(slug);
      const src = readIfExists(path.join(uiDir, file)) ?? "";
      const tags = extractJSDocTags(src);

      if (EXCLUDED.has(slug)) {
        return null;
      }

      return {
        slug,
        name: componentName,
        package: "@fusorb/facet-components",
        category: tags.category ?? "uncategorized",
        summary: tags.summary ?? slug,
        props: [],
        examples: [],
      };
    })
    .filter(Boolean);
}

function scanLayouts() {
  const layoutDir = path.join(root, "packages/layout/src");
  const barrelPath = path.join(layoutDir, "index.ts");
  const barrelSrc = readIfExists(barrelPath) ?? "";

  const files = fs
    .readdirSync(layoutDir)
    .filter((f) => /-layout\.tsx$/.test(f));

  // Read presets (matches both `export const XPreset` and `export { XPreset }` forms)
  const presetsPath = path.join(layoutDir, "presets.ts");
  const presetsSrc = readIfExists(presetsPath) ?? "";
  const presetNames = [];
  for (const m of presetsSrc.matchAll(/export\s+const\s+(\w+Preset)/g)) presetNames.push(m[1]);
  for (const m of presetsSrc.matchAll(/export\s+\{\s*([^}]+)\s*\}/g)) {
    for (const name of m[1].split(",").map((s) => s.trim())) {
      if (name && name.endsWith("Preset") && !presetNames.includes(name)) presetNames.push(name);
    }
  }

  return files.map((file) => {
    const slug = file.replace(/\.tsx$/, "");
    const src = readIfExists(path.join(layoutDir, file)) ?? "";
    const jsdoc = extractJSDocTags(src);
    const match = file.match(/^(.+)-layout\.tsx$/);
    const kind = match ? match[1] : slug;

    return {
      id: kind,
      name: kebabToPascal(slug),
      package: "@fusorb/facet-layout",
      summary: jsdoc.summary ?? `${kebabToPascal(kind)} layout shell`,
      presets: presetNames,
      regions: ["header", "sidebar", "content", "footer"],
      modes: [],
      props: [],
    };
  });
}

function scanMotion() {
  const registryDir = path.join(root, "packages/motion/src/registry");
  const familiesSrc = readIfExists(path.join(registryDir, "families.ts")) ?? "";
  const authoredSrc = readIfExists(path.join(registryDir, "authored.ts")) ?? "";

  const families = [
    ...familiesSrc.matchAll(/id:\s*"([^"]+)"/g),
  ].map((m) => m[1]);

  // Authored effects are defined via authored("id", "program", ...) factory calls
  const authoredMatches = [...authoredSrc.matchAll(/authored\(\s*"([^"]+)"/g)];
  const authored = authoredMatches.map((m) => m[1]);

  // Domain presets
  const domainMotionPath = path.join(root, "packages/auth/src/presets.ts");
  const authPresetsSrc = readIfExists(domainMotionPath) ?? "";
  const domainPresetNames = [...authPresetsSrc.matchAll(/export const (\w+Preset)/g)].map(
    (m) => m[1].toLowerCase().replace(/preset$/, "")
  );

  return {
    families: families.map((id) => ({ id, label: id, count: 0 })),
    authored: authored.map((id) => ({ id, label: id, family: "authored" })),
    domains: domainPresetNames.map((name) => ({
      name,
      preset: `${name}Motion`,
    })),
    total: families.length + authored.length,
  };
}

function scanTokens() {
  const tokensDir = path.join(root, "packages/tokens/src");
  const cssFiles = fs
    .readdirSync(tokensDir)
    .filter((f) => f.endsWith(".css"));

  const groups = [];
  const vars = new Set();
  let colorSpace = "sRGB";

  for (const file of cssFiles) {
    const src = readIfExists(path.join(tokensDir, file)) ?? "";
    if (/\boklch\s*\(/.test(src)) colorSpace = "OKLCH";
    if (/\boklab\s*\(/.test(src)) colorSpace = "OKLAB";

    // Extract CSS custom properties
    const varMatches = [...src.matchAll(/--(var\([^)]+\)|[a-zA-Z0-9-]+)/g)];
    for (const match of varMatches) {
      vars.add(match[0]);
    }

    // Group by file
    groups.push({
      name: file.replace(/\.css$/, ""),
      vars: [...new Set(varMatches.map((m) => m[0]))],
    });
  }

  return {
    groups,
    colorSpace,
    totalVars: vars.size,
    vars: [...vars],
  };
}

function scanSdk() {
  const barrelPath = path.join(root, "packages/sdk/src/index.ts");
  const src = readIfExists(barrelPath) ?? "";

  // Count SDK classes from `export { *Sdk } from`
  const classMatches = [...src.matchAll(/export\s+\{\s*(\w+Sdk)\s*\}\s*from/g)];
  return classMatches.map((m) => m[1]);
}

function scanAuthPresets() {
  const presetsPath = path.join(root, "packages/auth/src/presets.ts");
  const src = readIfExists(presetsPath) ?? "";
  return [...src.matchAll(/export const (\w+Preset)\s*:/g)].map((m) => m[1]);
}

function countIcons() {
  const iconMapPath = path.join(root, "packages/components/src/icon/icon-map.ts");
  const src = readIfExists(iconMapPath) ?? "";
  return (src.match(/^\s*"[^"]+":\s*\w+,/gm) ?? []).length;
}

function countComponents() {
  const uiDir = path.join(root, "packages/components/src/ui");
  const files = fs.readdirSync(uiDir);
  return files.filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx")).length;
}

function countLayoutShells() {
  const layoutDir = path.join(root, "packages/layout/src");
  return fs.readdirSync(layoutDir).filter((f) => /-layout\.tsx$/.test(f)).length;
}

/* ── Registry builder ────────────────────────────────────────────── */

function buildRegistry() {
  const packages = scanPackages();
  const components = scanComponents();
  const layouts = scanLayouts();
  const motion = scanMotion();
  const tokens = scanTokens();
  const sdkClasses = scanSdk();
  const authPresets = scanAuthPresets();
  const iconCount = countIcons();
  const componentCount = countComponents();
  const layoutShellCount = countLayoutShells();

  const commit = getGitCommit();
  const now = new Date().toISOString();

  const facts = {
    "packages.count": packages.filter((p) => !p.private).length,
    "packages.total": packages.length,
    "components.count": componentCount,
    "sdkClasses.count": sdkClasses.length,
    "layoutShells.count": layoutShellCount,
    "authPresets.count": authPresets.length,
    "motionGenerative.count": motion.families.length,
    "motionAuthored.count": motion.authored.length,
    "motionTotal.count": motion.total,
    "icons.count": iconCount,
    "tokens.colorSpace": tokens.colorSpace,
    "tokens.totalVars": tokens.totalVars,
  };

  const presets = authPresets.map((name) => ({
    id: name.toLowerCase().replace(/preset$/, ""),
    label: name.replace(/([A-Z])/g, " $1").replace(/Preset$/, "").trim(),
    package: "@fusorb/facet-auth",
    category: "domain",
    summary: `${name} authentication configuration`,
  }));

  return {
    schemaVersion: 1,
    generatedFrom: { commit, at: now },
    packages,
    components,
    layouts,
    motion,
    tokens,
    presets,
    examples: [], // Populated in Phase 5
    facts,
    surfaces: SURFACES,
  };
}

export { buildRegistry };

/* ── Main ──────────────────────────────────────────────────────── */

function main() {
  console.log("Scanning workspace...");

  const registry = buildRegistry();

  fs.writeFileSync(outFile, JSON.stringify(registry, null, 2) + "\n", "utf-8");

  console.log(`Wrote registry to ${path.relative(root, outFile)}`);
  console.log(`  schemaVersion: ${registry.schemaVersion}`);
  console.log(`  packages: ${registry.packages.length}`);
  console.log(`  components: ${registry.components.length}`);
  console.log(`  layouts: ${registry.layouts.length}`);
  console.log(`  motion: ${registry.motion.total} effects (${registry.motion.families.length} generative + ${registry.motion.authored.length} authored)`);
  console.log(`  facts: ${Object.keys(registry.facts).length}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
