/**
 * `facet docs scan` - read the repo (stack, API surface, existing docs)
 * and draft a documentation layer (pages + sidebar + API reference) for
 * review. Rule-based, zero LLM cost. See .agent/docs-scan-design.md.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  detectFramework,
  detectMonorepo,
  detectPackageManager,
  detectStyling,
  type Framework,
  type GeneratedFile,
  type PackageManager,
} from "./types.js";

/* ── Scan result types ─────────────────────────────────────── */

export interface ApiRoute {
  method: string;
  path: string;
  /** OpenAPI operationId / summary, when available. */
  summary?: string;
  /** Tags (grouping) from the schema. */
  tags?: string[];
  /** Whether request/response schemas were found. */
  hasSchema: boolean;
}

export interface ApiInfo {
  title: string;
  description?: string;
  version?: string;
}

export interface OpenApiDoc {
  /** Where the OpenAPI source was found (plugin file, openapi.json, ...). */
  source: string;
  info: ApiInfo;
  routes: ApiRoute[];
  /** True when schemas were resolvable (zod / fastify dynamic mode). */
  typed: boolean;
}

export interface ExistingDocs {
  readme: boolean;
  docsDir: boolean;
  planningFiles: string[];
  /** Total .md/.mdx files found under docs/ and planning/. */
  markdownCount: number;
}

export interface RepoScan {
  cwd: string;
  pm: PackageManager;
  monorepo: string[] | null;
  framework: Framework;
  language: "typescript" | "javascript";
  styling: ReturnType<typeof detectStyling>;
  /** Workspace members (package.json dirs), when a monorepo. */
  members: string[];
  /** Facet deps used (name -> range). */
  facetDeps: Record<string, string>;
  api: OpenApiDoc | null;
  docs: ExistingDocs;
  /** Human-readable summary lines for the printed report. */
  summaryLines: string[];
}

/* ── Detection helpers ─────────────────────────────────────── */

function read(p: string): string {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function readJson(p: string): Record<string, any> {
  try {
    return JSON.parse(read(p)) as Record<string, any>;
  } catch {
    return {};
  }
}

function readdirSafe(p: string): string[] {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

function globDirs(cwd: string, globs: string[]): string[] {
  const out: string[] = [];
  for (const glob of globs) {
    const base = glob.replace(/\/\*+$/, "");
    if (glob.includes("*")) {
      for (const d of readdirSafe(path.join(cwd, base))) {
        out.push(path.join(cwd, base, d));
      }
    } else {
      out.push(path.join(cwd, base));
    }
  }
  return out.filter((d) => existsSync(path.join(d, "package.json")));
}

function detectLanguage(cwd: string): "typescript" | "javascript" {
  return existsSync(path.join(cwd, "tsconfig.json")) ? "typescript" : "javascript";
}

/* ── OpenAPI / swagger detection ───────────────────────────── */

/**
 * Locate a Fastify swagger setup: `@fastify/swagger` dep + a plugin file
 * that registers it. Returns the plugin's openapi.info + a best-effort
 * route inventory from files that register routes with schemas.
 */
function detectFastifySwagger(cwd: string, rootPkg: Record<string, any>): OpenApiDoc | null {
  const deps = {
    ...(rootPkg.dependencies ?? {}),
    ...(rootPkg.devDependencies ?? {}),
  } as Record<string, string>;
  if (!deps["@fastify/swagger"]) return null;

  // Find the swagger plugin file (named *swagger*, in src/api/plugins or
  // src/plugins or anywhere under src).
  const srcDirs = ["src", "src/api", "src/api/plugins", "src/plugins", "server", "app"];
  let pluginFile = "";
  for (const dir of srcDirs) {
    const abs = path.join(cwd, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSafe(abs)) {
      if (/swagger/i.test(f)) {
        pluginFile = path.join(dir, f);
        break;
      }
    }
    if (pluginFile) break;
  }

  const info: ApiInfo = { title: "API" };
  if (pluginFile) {
    const src = read(path.join(cwd, pluginFile));
    const title = src.match(/title:\s*"([^"]+)"/)?.[1];
    const desc = src.match(/description:\s*(?:SWAGGER_DESCRIPTION|`([^`]*)`|"([^"]*)")/)?.[1];
    const version = src.match(/version:\s*"([^"]+)"/)?.[1];
    if (title) info.title = title;
    if (desc) info.description = desc.trim();
    if (version) info.version = version;
  }

  // Route inventory: scan route files for `fastify.<method>("/path", { schema ... })`.
  // Bounded: only files whose name matches *route* are read (deep module
  // trees like src/modules can be huge), capped at 500 files total.
  const routes: ApiRoute[] = [];
  const seen = new Set<string>();
  const routeDirs = ["src/api/routes", "src/routes", "src/api", "src/modules"];
  let filesScanned = 0;
  const MAX_FILES = 500;
  for (const dir of routeDirs) {
    const abs = path.join(cwd, dir);
    if (!existsSync(abs)) continue;
    const walk = (d: string, depth: number) => {
      if (depth > 4 || filesScanned >= MAX_FILES) return;
      for (const f of readdirSafe(d)) {
        if (filesScanned >= MAX_FILES) return;
        const full = path.join(d, f);
        try {
          if (statSync(full).isDirectory()) {
            walk(full, depth + 1);
            continue;
          }
        } catch {
          continue;
        }
        // Only read route-like files (name contains "route" or the dir is a
        // dedicated routes dir at depth <= 2) to keep the scan fast.
        if (!/\.(ts|js)$/.test(f)) continue;
        const isRouteFile = /route/i.test(f) || /^routes?$/.test(path.basename(path.dirname(full)));
        if (!isRouteFile) continue;
        filesScanned++;
        const src = read(full);
        // Match `fastify.get("/path", ...)` or `.get("/path", { schema: ... })`.
        const re = /\.(get|post|put|patch|delete|head|options)\(\s*["']([^"']+)["']\s*,?\s*(\{[^}]*schema[^}]*\})?/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(src))) {
          const method = m[1]!.toUpperCase();
          const p = m[2]!;
          const key = `${method} ${p}`;
          if (seen.has(key)) continue;
          seen.add(key);
          routes.push({
            method,
            path: p,
            hasSchema: Boolean(m[3]),
            tags: [],
          });
        }
      }
    };
    walk(abs, 0);
  }

  return {
    source: pluginFile || "@fastify/swagger (dynamic)",
    info,
    routes,
    typed: true, // fastify-type-provider-zod / schema presence
  };
}

/** Detect a committed openapi.json / swagger.json. */
function detectOpenApiFile(cwd: string): OpenApiDoc | null {
  const candidates = ["openapi.json", "openapi.yaml", "swagger.json", "public/openapi.json"];
  for (const name of candidates) {
    const p = path.join(cwd, name);
    if (!existsSync(p)) continue;
    if (name.endsWith(".json")) {
      const doc = readJson(p);
      const paths = doc.paths ?? {};
      const routes: ApiRoute[] = [];
      for (const [routePath, methods] of Object.entries(paths)) {
        for (const [method, op] of Object.entries(methods as Record<string, any>)) {
          routes.push({
            method: method.toUpperCase(),
            path: routePath,
            summary: op?.summary,
            tags: op?.tags,
            hasSchema: Boolean(op?.requestBody || op?.responses),
          });
        }
      }
      return {
        source: name,
        info: {
          title: doc.info?.title ?? "API",
          description: doc.info?.description,
          version: doc.info?.version,
        },
        routes,
        typed: true,
      };
    }
  }
  return null;
}

/** Detect the API surface: Fastify swagger first, then committed openapi. */
export function detectOpenApi(cwd: string, rootPkg: Record<string, any>): OpenApiDoc | null {
  return detectFastifySwagger(cwd, rootPkg) ?? detectOpenApiFile(cwd);
}

/* ── Existing docs detection ───────────────────────────────── */

export function detectExistingDocs(cwd: string): ExistingDocs {
  const readme = existsSync(path.join(cwd, "README.md"));
  const docsDir = existsSync(path.join(cwd, "docs"));
  const planningFiles: string[] = [];
  let markdownCount = 0;

  for (const dir of ["docs", "docs/planning"]) {
    const abs = path.join(cwd, dir);
    if (!existsSync(abs)) continue;
    const walk = (d: string) => {
      for (const f of readdirSafe(d)) {
        const full = path.join(d, f);
        try {
          if (statSync(full).isDirectory()) walk(full);
        } catch {
          continue;
        }
        if (/\.(md|mdx)$/.test(f)) {
          markdownCount++;
          if (dir === "docs/planning") planningFiles.push(path.relative(cwd, full));
        }
      }
    };
    walk(abs);
  }

  return { readme, docsDir, planningFiles, markdownCount };
}

/* ── Main scan ─────────────────────────────────────────────── */

export function scanRepo(cwd: string): RepoScan {
  const pm = detectPackageManager(cwd);
  const monorepo = detectMonorepo(cwd);
  const framework = detectFramework(cwd);
  const language = detectLanguage(cwd);
  const styling = detectStyling(cwd);
  const rootPkg = readJson(path.join(cwd, "package.json"));
  const members = monorepo ? globDirs(cwd, monorepo) : [];
  const facetDeps = { ...(rootPkg.dependencies ?? {}), ...(rootPkg.devDependencies ?? {}) } as Record<string, string>;
  const facetDepsFiltered: Record<string, string> = {};
  for (const [name, range] of Object.entries(facetDeps)) {
    if (name.startsWith("@fusorb/facet-")) facetDepsFiltered[name] = range;
  }
  const api = detectOpenApi(cwd, rootPkg);
  const docs = detectExistingDocs(cwd);

  const summaryLines: string[] = [];
  summaryLines.push(`Package manager: ${pm}`);
  summaryLines.push(`Repo layout: ${monorepo ? `monorepo (${monorepo.join(", ")})` : "single package"}`);
  summaryLines.push(`Framework: ${framework} (${language})`);
  summaryLines.push(`Styling: ${styling}`);
  summaryLines.push(
    `Facet packages: ${Object.keys(facetDepsFiltered).length ? Object.keys(facetDepsFiltered).join(", ") : "none"}`,
  );
  summaryLines.push(
    api
      ? `API: ${api.info.title}${api.info.version ? ` v${api.info.version}` : ""} - ${api.routes.length} routes (${api.source})`
      : "API: none detected",
  );
  summaryLines.push(
    `Existing docs: ${docs.markdownCount ? `${docs.markdownCount} markdown file(s)` : "none"}${docs.readme ? " (README)" : ""}`,
  );

  return {
    cwd,
    pm,
    monorepo,
    framework,
    language,
    styling,
    members,
    facetDeps: facetDepsFiltered,
    api,
    docs,
    summaryLines,
  };
}

/* ── Draft generation ──────────────────────────────────────── */

/** A page for the facet-docs engine (DocsApp pages registry). */
export interface DraftPage {
  path: string;
  title: string;
  section: string;
  description?: string;
  blocks: {
    type: string;
    text?: string;
    items?: string[];
    headers?: string[];
    rows?: string[][];
  }[];
}

/**
 * Draft the documentation layer from a scan: an Overview, Getting
 * Started, and (when an API was detected) an API Reference page with one
 * section per route group. Returns plain JS/TS page + config source the
 * consumer reviews, plus openapi.json and docs/api/*.md.
 */
export function draftDocs(scan: RepoScan, outDir: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const { api, framework, facetDeps } = scan;
  const apiName = api?.info.title ?? "API";
  // Absolute outDir is used as-is; relative is resolved against the repo.
  const base = path.isAbsolute(outDir) ? outDir : path.join(scan.cwd, outDir);

  // Pages registry (TypeScript by default; consumers can convert).
  const pages: DraftPage[] = [];

  // Overview
  pages.push({
    path: "/",
    title: "Overview",
    section: "guides",
    description: "What this system is and how it is built.",
    blocks: [
      {
        type: "p",
        text:
          scan.docs.readme
            ? "This overview is drafted from the repo README, stack detection, and the API surface."
            : "This overview is drafted from the detected stack. Review and expand it.",
      },
      {
        type: "p",
        text: `Detected stack: ${framework} (${scan.language}), ${scan.pm}, ${
          scan.monorepo ? "monorepo" : "single package"
        }.`,
      },
      ...(api
        ? [
            {
              type: "p",
              text: `API: ${apiName}${api.info.version ? ` v${api.info.version}` : ""} - ${
                api.routes.length
              } routes detected.`,
            },
          ]
        : []),
      {
        type: "h2",
        text: "Packages in use",
      },
      {
        type: "ul",
        items: Object.keys(facetDeps).length
          ? Object.entries(facetDeps).map(([n, v]) => `${n}@${v}`)
          : ["No @fusorb/facet-* packages detected."],
      },
    ],
  });

  // Getting Started
  pages.push({
    path: "/getting-started",
    title: "Getting Started",
    section: "guides",
    description: "Install, run, and explore.",
    blocks: [
      { type: "h2", text: "Install" },
      { type: "p", text: "Detected package manager:" },
      { type: "pre", text: `${scan.pm} install` },
      { type: "h2", text: "Run" },
      { type: "pre", text: scan.framework === "next" || scan.framework === "remix" ? `${scan.pm} dev` : `${scan.pm} dev` },
      { type: "h2", text: "API" },
      {
        type: "p",
        text: api
          ? `The API is documented under /api. Source: ${api.source}.`
          : "No API surface detected. Add an OpenAPI spec to generate API docs.",
      },
    ],
  });

  // API Reference (when detected)
  if (api) {
    const groups = new Map<string, ApiRoute[]>();
    for (const route of api.routes) {
      const tag = route.tags?.[0] ?? "General";
      const list = groups.get(tag) ?? [];
      list.push(route);
      groups.set(tag, list);
    }
    pages.push({
      path: "/api",
      title: "API Reference",
      section: "guides",
      description: `${apiName} - ${api.routes.length} routes.`,
      blocks: [
        { type: "p", text: `Generated from ${api.source}.` },
        ...Array.from(groups.entries()).flatMap(([tag, routes]) => [
          { type: "h2", text: tag },
          {
            type: "table",
            headers: ["Method", "Path", "Schema"],
            rows: routes.map((r) => [
              r.method,
              `\`${r.path}\``,
               r.hasSchema ? "yes" : "n/a",
            ]),
          },
        ]),
      ],
    });
  }

  // Emit the pages registry + config for the facet-docs engine.
  const e = scan.language === "typescript" ? "ts" : "js";
  const pagesSource = `// Drafted by \`facet docs scan\` - review and refine.
export const docsPages = ${JSON.stringify(pages, null, 2)};`;
  files.push({ path: path.join(base, `pages.${e}`), content: pagesSource });

  const configSource = `// Drafted by \`facet docs scan\` - review and refine.
export const docsConfig = {
  brand: { name: ${JSON.stringify(apiName)}, tagline: "Drafted documentation" },
  navigation: [{ title: "Guides", id: "guides" }],
  ecosystem: [],
};`;
  files.push({ path: path.join(base, `config.${e}`), content: configSource });

  // openapi.json when we have an API.
  if (api) {
    const openapi = {
      openapi: "3.1.0",
      info: api.info,
      paths: Object.fromEntries(
        api.routes.map((r) => [r.path, { [r.method.toLowerCase()]: { summary: r.summary } }]),
      ),
    };
    files.push({
      path: path.join(base, "openapi.json"),
      content: JSON.stringify(openapi, null, 2) + "\n",
    });
  }

  return files;
}
