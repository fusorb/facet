/**
 * Dep scanning + repo hygiene for the facet CLI.
 *
 * `facet clean` finds dependencies that are already bundled by
 * `@fusorb/facet-components` (radix primitives, lucide, cmdk, ...) and
 * removes them from the consumer's manifests; it also rewrites imports
 * that point at shadcn/ui-style local component folders to the facet
 * package. `facet scripts` writes the npm scripts the consumer asks for.
 * `facet prep` runs the pre-go-live sync (facet pkg + doctor + the
 * consumer's own build/typecheck + changeset status).
 *
 * Everything is non-destructive by default: scans return data, and the
 * commands that change files do so only after confirmation (or `--yes`),
 * and print the exact install/remove command instead of auto-running it.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  detectMonorepo,
  detectPackageManager,
  type PackageManager,
} from "./types.js";
import { readExistingPackageJson } from "./writer.js";

/**
 * Detect path aliases from tsconfig.json / jsconfig.json (the `paths`
 * map), so generated files and import rewrites can prefer a configured
 * alias over fragile relative paths. Returns `{ alias, target }` pairs,
 * e.g. `{ "@/*": "src/*" }`. Also detects common single-token aliases
 * (`@/`, `~/`, `@components/`) that frameworks resolve without config.
 */
export interface PathAlias {
  /** The alias prefix, e.g. "@/". */
  alias: string;
  /** The path it maps to (relative to the config's baseUrl/cwd), e.g. "src/". */
  target: string;
}

export function detectPathAliases(cwd: string): PathAlias[] {
  const out: PathAlias[] = [];
  const read = (p: string): string => {
    try {
      return readFileSync(path.join(cwd, p), "utf8");
    } catch {
      return "";
    }
  };
  const parse = (source: string, base: string): PathAlias[] => {
    try {
      const json = JSON.parse(source) as {
        compilerOptions?: {
          paths?: Record<string, string[]>;
          baseUrl?: string;
        };
      };
      const paths = json.compilerOptions?.paths;
      if (!paths) return [];
      const baseUrl = json.compilerOptions?.baseUrl ?? ".";
      return Object.entries(paths)
        .filter(([, targets]) => targets.length > 0)
        .map(([alias, targets]) => ({
          alias: alias.endsWith("*") ? alias.slice(0, -1) : alias,
          target: path.posix.join(
            base,
            baseUrl,
            (targets[0] ?? "").replace(/\*$/, ""),
          ),
        }));
    } catch {
      return [];
    }
  };
  // Prefer the nearest tsconfig, then jsconfig (Vue/Svelte-style repos).
  for (const file of ["tsconfig.json", "jsconfig.json"]) {
    const source = read(file);
    if (source.trim()) {
      const found = parse(source, "");
      out.push(...found);
    }
  }
  // Common framework aliases that need no config.
  const known = [
    { alias: "@/", target: "src/" },
    { alias: "~/", target: "src/" },
    { alias: "@app/", target: "app/" },
  ];
  for (const k of known) {
    if (
      !out.some((a) => a.alias === k.alias) &&
      existsSync(path.join(cwd, k.target))
    ) {
      out.push(k);
    }
  }
  // Dedupe by alias.
  const seen = new Set<string>();
  return out.filter((a) =>
    seen.has(a.alias) ? false : (seen.add(a.alias), true),
  );
}

/** Best alias for importing from a generated file at `fromFile` that wants
 * to reach `targetPath` (a dir relative to cwd, e.g. "src/lib/docs").
 * Returns a module specifier using a configured alias when one fits, else
 * a relative path from `fromFile` to `targetPath`. */
export function importSpecifier(
  cwd: string,
  fromFile: string,
  targetPath: string,
): string {
  const aliases = detectPathAliases(cwd);
  // Match alias targets against the path RELATIVE to cwd (tsconfig paths
  // are cwd-relative). Absolute input paths are normalized first.
  const norm = path
    .relative(cwd, targetPath)
    .replace(/\\/g, "/")
    .replace(/\/$/, "");
  for (const a of aliases) {
    const aTarget = a.target.replace(/\\/g, "/").replace(/\/$/, "");
    if (norm === aTarget || norm.startsWith(aTarget + "/")) {
      const rest = norm.slice(aTarget.length).replace(/^\//, "");
      return `${a.alias}${rest}`;
    }
  }
  // Relative fallback from the importing file's dir (absolute both sides).
  // Strip any Windows drive letter first: path.posix treats "C:" as one
  // path segment, so relative("C:/a/b", "C:/a/c") would drop the "a".
  const stripDrive = (p: string) => p.replace(/^[A-Za-z]:/, "");
  const fromDir = path.posix.dirname(stripDrive(fromFile.replace(/\\/g, "/")));
  const absTarget = stripDrive(targetPath.replace(/\\/g, "/")).replace(
    /\/$/,
    "",
  );
  let rel = path.posix.relative(fromDir, absTarget);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

/** Dependency names that @fusorb/facet-components already bundles, so a
 * consumer that imports components from the package does not need them. */
export const BUNDLED_DEPS: { name: string; why: string }[] = [
  {
    name: "@radix-ui/react-accordion",
    why: "bundled by @fusorb/facet-components (Accordion)",
  },
  {
    name: "@radix-ui/react-alert-dialog",
    why: "bundled by @fusorb/facet-components (AlertDialog)",
  },
  {
    name: "@radix-ui/react-aspect-ratio",
    why: "bundled by @fusorb/facet-components (AspectRatio)",
  },
  {
    name: "@radix-ui/react-avatar",
    why: "bundled by @fusorb/facet-components (Avatar)",
  },
  {
    name: "@radix-ui/react-checkbox",
    why: "bundled by @fusorb/facet-components (Checkbox)",
  },
  {
    name: "@radix-ui/react-collapsible",
    why: "bundled by @fusorb/facet-components (Collapsible)",
  },
  {
    name: "@radix-ui/react-context-menu",
    why: "bundled by @fusorb/facet-components (ContextMenu)",
  },
  {
    name: "@radix-ui/react-dialog",
    why: "bundled by @fusorb/facet-components (Dialog)",
  },
  {
    name: "@radix-ui/react-dropdown-menu",
    why: "bundled by @fusorb/facet-components (DropdownMenu)",
  },
  {
    name: "@radix-ui/react-hover-card",
    why: "bundled by @fusorb/facet-components (HoverCard)",
  },
  {
    name: "@radix-ui/react-label",
    why: "bundled by @fusorb/facet-components (Label)",
  },
  {
    name: "@radix-ui/react-menubar",
    why: "bundled by @fusorb/facet-components (Menubar)",
  },
  {
    name: "@radix-ui/react-navigation-menu",
    why: "bundled by @fusorb/facet-components (NavigationMenu)",
  },
  {
    name: "@radix-ui/react-popover",
    why: "bundled by @fusorb/facet-components (Popover)",
  },
  {
    name: "@radix-ui/react-progress",
    why: "bundled by @fusorb/facet-components (Progress)",
  },
  {
    name: "@radix-ui/react-radio-group",
    why: "bundled by @fusorb/facet-components (RadioGroup)",
  },
  {
    name: "@radix-ui/react-scroll-area",
    why: "bundled by @fusorb/facet-components (ScrollArea)",
  },
  {
    name: "@radix-ui/react-select",
    why: "bundled by @fusorb/facet-components (Select)",
  },
  {
    name: "@radix-ui/react-separator",
    why: "bundled by @fusorb/facet-components (Separator)",
  },
  {
    name: "@radix-ui/react-slider",
    why: "bundled by @fusorb/facet-components (Slider)",
  },
  {
    name: "@radix-ui/react-switch",
    why: "bundled by @fusorb/facet-components (Switch)",
  },
  {
    name: "@radix-ui/react-tabs",
    why: "bundled by @fusorb/facet-components (Tabs)",
  },
  {
    name: "@radix-ui/react-toggle",
    why: "bundled by @fusorb/facet-components (Toggle)",
  },
  {
    name: "@radix-ui/react-toggle-group",
    why: "bundled by @fusorb/facet-components (ToggleGroup)",
  },
  {
    name: "@radix-ui/react-tooltip",
    why: "bundled by @fusorb/facet-components (Tooltip)",
  },
  {
    name: "lucide-react",
    why: "use the facet Icon registry (<Icon name=... />) instead",
  },
  { name: "cmdk", why: "bundled by @fusorb/facet-components (Command)" },
  {
    name: "embla-carousel-react",
    why: "bundled by @fusorb/facet-components (Carousel)",
  },
  { name: "input-otp", why: "bundled by @fusorb/facet-components (InputOTP)" },
  { name: "qrcode.react", why: "bundled by @fusorb/facet-components (QRCode)" },
  {
    name: "react-hook-form",
    why: "bundled by @fusorb/facet-components (Form)",
  },
  {
    name: "react-resizable-panels",
    why: "bundled by @fusorb/facet-components (Resizable)",
  },
  { name: "sonner", why: "bundled by @fusorb/facet-components (Toast)" },
  { name: "vaul", why: "bundled by @fusorb/facet-components (Drawer)" },
  {
    name: "class-variance-authority",
    why: "bundled by @fusorb/facet-components",
  },
  { name: "clsx", why: "bundled by @fusorb/facet-components" },
  { name: "tailwind-merge", why: "bundled by @fusorb/facet-components" },
];

/** Static why-map built from BUNDLED_DEPS - used to annotate deps discovered
 * at runtime so the CLI shows which component bundles each one. */
const WHY_MAP = new Map(BUNDLED_DEPS.map((d) => [d.name, d.why]));

/**
 * Dynamically resolve which dependencies @fusorb/facet-components bundles by
 * reading its **installed** package.json from the consumer's node_modules.
 * Falls back to the static BUNDLED_DEPS when the package isn't installed or
 * can't be read (offline, edge cases, older versions).
 *
 * This keeps `facet clean` in sync with whichever version of
 * facet-components is actually present - no manual BUNDLED_DEPS update needed
 * when a new bundled dep is added upstream.
 */
export function resolveBundledDeps(
  cwd: string,
): { name: string; why: string }[] {
  try {
    const pkgPath = path.join(
      cwd,
      "node_modules/@fusorb/facet-components/package.json",
    );
    if (!existsSync(pkgPath)) return BUNDLED_DEPS;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
      dependencies?: Record<string, string>;
    };
    const deps = pkg.dependencies ?? {};
    // Exclude facet's own workspace peers and React (peer dep) - those are
    // not "bundled" in the sense that consumers should also install them.
    const bundled = Object.keys(deps).filter(
      (name) =>
        !name.startsWith("@fusorb/") &&
        name !== "react" &&
        name !== "react-dom",
    );
    if (!bundled.length) return BUNDLED_DEPS;
    return bundled.map((name) => ({
      name,
      why: WHY_MAP.get(name) ?? "bundled by @fusorb/facet-components",
    }));
  } catch {
    return BUNDLED_DEPS;
  }
}

/** A manifest (root or workspace member) that declares unnecessary deps. */
export interface UnnecessaryDepEntry {
  /** Absolute path to the package.json. */
  pkgPath: string;
  /** Package name (for messaging). */
  pkgName: string;
  /** Deps found that the facet package already bundles. */
  deps: { name: string; why: string }[];
}

/** Every package.json manifest in the repo (root + workspace members). */
export function findManifests(cwd: string): string[] {
  const out = new Set<string>([path.join(cwd, "package.json")]);
  const globs = detectMonorepo(cwd) ?? [];
  for (const glob of globs) {
    const base = glob.replace(/\/\*+$/, "");
    if (glob.includes("*")) {
      let entries: string[] = [];
      try {
        entries = readdirSync(path.join(cwd, base));
      } catch {
        // glob base doesn't exist
      }
      for (const d of entries) {
        const p = path.join(cwd, base, d, "package.json");
        if (existsSync(p)) out.add(p);
      }
    } else {
      const p = path.join(cwd, glob, "package.json");
      if (existsSync(p)) out.add(p);
    }
  }
  return [...out];
}

/** Scan every manifest for deps that @fusorb/facet-components bundles. */
export function scanUnnecessaryDeps(cwd: string): UnnecessaryDepEntry[] {
  const deps = resolveBundledDeps(cwd);
  const bundled = new Set(deps.map((d) => d.name));
  const why = new Map(deps.map((d) => [d.name, d.why]));
  const entries: UnnecessaryDepEntry[] = [];
  for (const pkgPath of findManifests(cwd)) {
    const pkg = readExistingPackageJson(path.dirname(pkgPath));
    if (!pkg) continue;
    const declared: Record<string, string> = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };
    const found = Object.keys(declared)
      .filter((name) => bundled.has(name))
      .map((name) => ({
        name,
        why: why.get(name) ?? "bundled by @fusorb/facet-components",
      }));
    if (found.length) {
      entries.push({
        pkgPath,
        pkgName: pkg.name ?? path.basename(path.dirname(pkgPath)),
        deps: found,
      });
    }
  }
  return entries;
}

/** Source files under `cwd` that could reference the bundled deps or a
 * shadcn-style local component folder. Skips node_modules and dist. */
export function findSourceFiles(cwd: string, maxDepth = 6): string[] {
  const exts = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
  const out: string[] = [];
  const walk = (dir: string, depth: number) => {
    if (depth > maxDepth) return;
    let entries: { name: string; isDirectory: () => boolean }[] = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === ".git"
      )
        continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
      } else if (exts.some((e) => entry.name.endsWith(e))) {
        out.push(full);
      }
    }
  };
  walk(cwd, 0);
  return out;
}

/** Import specifiers that point at a shadcn/ui-style local component
 * folder, or directly at a bundled dep. */
const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"`]*?\s+from\s+)?["'`]([^"'`]*)["'`]/g;

/** A detected import that should be redirected to the facet package. */
export interface ImportMatch {
  file: string;
  /** The import specifier as written, e.g. "@/components/ui/button". */
  from: string;
  /** What it resolves to: a bundled dep, or a shadcn-style local folder. */
  kind: "radix" | "lucide" | "other-bundled" | "shadcn";
}

/** True when the import specifier points at one of the bundled deps.
 * @param deps  optional resolved deps list (use resolveBundledDeps for dynamic discovery) */
export function isBundledImport(
  from: string,
  deps: { name: string }[] = BUNDLED_DEPS,
): boolean {
  return deps.some((d) => from === d.name || from.startsWith(d.name + "/"));
}

/** The bundled dep an import points at, if any. */
export function bundledDepFor(
  from: string,
  deps: { name: string }[] = BUNDLED_DEPS,
): string | undefined {
  return deps.find((d) => from === d.name || from.startsWith(d.name + "/"))
    ?.name;
}

/** True when the specifier looks like a shadcn/ui-style local folder
 * (`@/components/ui`, `~/components/ui`, `../../components/ui`, or a
 * `ui/` folder directly under the consumer's components dir). */
export function isShadcnImport(from: string): boolean {
  return /(?:@\/|~\/|\.\.\/|\.\/).*(?:components\/ui|\/ui\/)/.test(from);
}

/**
 * Scan source files for imports that point at bundled deps or at a
 * shadcn/ui-style folder. Returns deduped matches.
 */
export function scanImports(cwd: string): ImportMatch[] {
  const deps = resolveBundledDeps(cwd);
  const out: ImportMatch[] = [];
  const seen = new Set<string>();
  for (const file of findSourceFiles(cwd)) {
    let source = "";
    try {
      source = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const m of source.matchAll(IMPORT_RE)) {
      const from = m[1]!;
      let kind: ImportMatch["kind"] | undefined;
      if (isBundledImport(from, deps)) {
        const bundled = bundledDepFor(from, deps)!;
        kind = bundled.startsWith("@radix-ui/")
          ? "radix"
          : bundled === "lucide-react"
            ? "lucide"
            : "other-bundled";
      } else if (isShadcnImport(from)) {
        kind = "shadcn";
      }
      if (!kind) continue;
      const key = `${file}::${from}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ file, from, kind });
    }
  }
  return out;
}

/** Remove bundled deps from a manifest's dep sections. Returns the changed
 * package.json content (or null when nothing changed) + removed names. */
export function removeBundledDeps(
  pkgPath: string,
  toRemove: string[],
): { content: string | null; removed: string[] } {
  const pkg = readExistingPackageJson(path.dirname(pkgPath));
  if (!pkg) return { content: null, removed: [] };
  const removeSet = new Set(toRemove);
  const removed: string[] = [];
  for (const section of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
  ] as const) {
    const deps = pkg[section] as Record<string, string> | undefined;
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (removeSet.has(name)) {
        delete deps[name];
        removed.push(name);
      }
    }
  }
  if (!removed.length) return { content: null, removed };
  return { content: JSON.stringify(pkg, null, 2) + "\n", removed };
}

/** Compute the remove command for the detected package manager. */
export function removeCommand(
  pm: PackageManager,
  names: string[],
  workspace = false,
): string {
  const pkgs = names.join(" ");
  const rootFlag = workspace ? " -w" : "";
  switch (pm) {
    case "pnpm":
      return `pnpm${rootFlag} remove ${pkgs}`;
    case "yarn":
      return `yarn workspace remove ${pkgs}`;
    case "bun":
      return `bun remove ${pkgs}`;
    default:
      return `npm uninstall ${pkgs}`;
  }
}

/** Compute the global remove/uninstall command for the detected package manager. */
export function globalRemoveCommand(
  pm: PackageManager,
  names: string[],
): string {
  const pkgs = names.join(" ");
  switch (pm) {
    case "pnpm":
      return `pnpm remove -g ${pkgs}`;
    case "yarn":
      return `yarn global remove ${pkgs}`;
    case "bun":
      return `bun remove -g ${pkgs}`;
    default:
      return `npm uninstall -g ${pkgs}`;
  }
}

/** Rewrite imports that point at bundled deps or a shadcn-style folder to
 * `@fusorb/facet-components`. Returns the files changed. */
export function rewriteImports(matches: ImportMatch[]): string[] {
  const changed: string[] = [];
  const byFile = new Map<string, string[]>();
  for (const m of matches) {
    const list = byFile.get(m.file) ?? [];
    list.push(m.from);
    byFile.set(m.file, list);
  }
  for (const [file, froms] of byFile) {
    let source = "";
    try {
      source = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    let next = source;
    for (const from of froms) {
      // Only rewrite when the import is a named import from the bundled
      // dep or a shadcn folder. Bare imports (`import "x"`) are left alone.
      next = next
        .split(`from "${from}"`)
        .join(`from "@fusorb/facet-components"`);
      next = next
        .split(`from '${from}'`)
        .join(`from '@fusorb/facet-components'`);
    }
    if (next !== source) {
      writeFileSync(file, next, "utf8");
      changed.push(file);
    }
  }
  return changed;
}

/** Delete a file when nothing else imports it. Returns true when deleted. */
export function deleteIfUnused(file: string, cwd: string): boolean {
  const base = path.basename(file, path.extname(file));
  const name = base.split(".")[0]!; // strip .test, .stories, ...
  let importedElsewhere = false;
  for (const src of findSourceFiles(cwd)) {
    if (src === file) continue;
    try {
      const source = readFileSync(src, "utf8");
      if (
        source.includes(`/ui/${name}"`) ||
        source.includes(`/ui/${name}'`) ||
        source.includes(`"${name}"`) ||
        source.includes(`'${name}'`)
      ) {
        importedElsewhere = true;
        break;
      }
    } catch {
      // skip unreadable file
    }
  }
  if (importedElsewhere) return false;
  // Only delete shadcn-style component files under a ui/ folder.
  if (!/[/\\]ui[/\\]/.test(file) && !/components[/\\]ui/.test(file))
    return false;
  try {
    const dir = path.dirname(file);
    const remaining = readdirSync(dir).filter(
      (f) =>
        f.endsWith(".tsx") ||
        f.endsWith(".ts") ||
        f.endsWith(".jsx") ||
        f.endsWith(".js"),
    );
    if (remaining.length <= 1) {
      // Last file in the folder: leave the folder alone.
      return false;
    }
  } catch {
    return false;
  }
  try {
    unlinkSync(file);
    return true;
  } catch {
    return false;
  }
}

/** Present a `facet clean` plan (what would change) without touching disk. */
export interface CleanPlan {
  /** Manifests with bundled deps to remove. */
  manifests: UnnecessaryDepEntry[];
  /** Import rewrites to apply. */
  imports: ImportMatch[];
  /** Local shadcn-style component files that would be deleted (unused). */
  deletableFiles: string[];
}

/** Build the non-destructive plan for `facet clean`. */
export function buildCleanPlan(cwd: string): CleanPlan {
  const manifests = scanUnnecessaryDeps(cwd);
  const imports = scanImports(cwd);
  // Files that are shadcn-style and currently unused by other sources.
  const deletableFiles = findSourceFiles(cwd)
    .filter((f) => /[/\\]ui[/\\]/.test(f) || /components[/\\]ui/.test(f))
    .filter((f) => {
      const base = path.basename(f).split(".")[0]!;
      for (const src of findSourceFiles(cwd)) {
        if (src === f) continue;
        try {
          if (readFileSync(src, "utf8").includes(`/ui/${base}`)) return false;
        } catch {
          // unreadable -> treat as unused
        }
      }
      return true;
    });
  return { manifests, imports, deletableFiles };
}

/** Preset scripts the CLI can offer. Keyed by a stable id. */
export const PRESET_SCRIPTS: Record<
  string,
  { label: string; scripts: Record<string, string> }
> = {
  docs: {
    label: "Docs scripts (docs:dev, docs:build, docs:preview)",
    scripts: {
      "docs:dev": "vite",
      "docs:build": "vite build",
      "docs:preview": "vite preview",
    },
  },
  quality: {
    label: "Quality (lint, typecheck, test, build)",
    scripts: {
      lint: "eslint .",
      typecheck: "tsc --noEmit",
      test: "vitest run",
      build: "vite build",
    },
  },
  facet: {
    label: "facet convenience (facet:doctor, facet:clean, facet:prep)",
    scripts: {
      "facet:doctor": "facet doctor",
      "facet:clean": "facet clean --yes",
      "facet:prep": "facet prep",
    },
  },
  prep: {
    label: "Pre-go-live sync (facet:prep + build)",
    scripts: {
      "facet:prep": "facet prep",
    },
  },
};

/** Merge the requested scripts into a manifest, preserving existing ones.
 * Returns the changed content (or null when nothing new was added). */
export function mergeScripts(
  pkgPath: string,
  requested: string[],
): { content: string | null; added: string[] } {
  const pkg = readExistingPackageJson(path.dirname(pkgPath));
  if (!pkg) return { content: null, added: [] };
  const existing = pkg.scripts ?? {};
  const scripts = { ...existing };
  const added: string[] = [];
  for (const id of requested) {
    const preset = PRESET_SCRIPTS[id];
    if (!preset) continue;
    for (const [name, cmd] of Object.entries(preset.scripts)) {
      // Never overwrite a script the consumer already has.
      if (name in scripts) continue;
      scripts[name] = cmd;
      added.push(name);
    }
  }
  if (!added.length) return { content: null, added };
  pkg.scripts = scripts;
  return { content: JSON.stringify(pkg, null, 2) + "\n", added };
}

/** What `facet prep` should run. Each step is a labeled, non-destructive
 * check. The build/typecheck/test steps only run when the consumer has the
 * matching script. */
export function buildPrepPlan(cwd: string): { steps: string[] } {
  const pm = detectPackageManager(cwd);
  const pkg = readExistingPackageJson(cwd);
  const scripts = pkg?.scripts ?? {};
  const steps: string[] = [];
  steps.push("facet pkg - check facet deps are current");
  steps.push("facet doctor - audit repo health");
  if (scripts.typecheck)
    steps.push(`${pm} typecheck - run the consumer's typecheck`);
  if (scripts.build) steps.push(`${pm} build - run the consumer's build`);
  if (scripts.test) steps.push(`${pm} test - run the consumer's tests`);
  if (detectMonorepo(cwd))
    steps.push("pnpm changeset status - pending release set");
  return { steps };
}
