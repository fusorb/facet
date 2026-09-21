import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { AddTarget, DocsAnswers, GeneratedFile } from "./types.js";
import { importSpecifier } from "./deps.js";
import { starterPages } from "./starter-pages.js";
import { mergePackageJson, readExistingPackageJson } from "./writer.js";

/** Extension for the consumer's language (.ts vs .js). */
function ext(language: "typescript" | "javascript"): string {
  return language === "typescript" ? "ts" : "js";
}

/**
 * Generate a framework-agnostic docs scaffold: a pages registry + a
 * markdown content pipeline, with no React shell. Suitable for plain JS,
 * Python, or any non-React repo. The consumer writes markdown under
 * <location>/content and the generator compiles it into a pages array.
 *
 * Barrel: an optional `index.ts`/`index.js` re-exports `docsPages` as a
 * single entry: "auto" creates it when nothing exists yet, true always,
 * false never.
 */
export function generatePlainJs(
  answers: DocsAnswers,
  cwd: string,
): GeneratedFile[] {
  const e = ext(answers.language);
  const base = path.join(cwd, answers.location === "." ? "" : answers.location);

  const pagesFile =
    answers.language === "typescript"
      ? `import type { DocsPage } from "@fusorb/facet-docs";

/**
 * Your docs pages registry (framework-agnostic). A page is data:
 * path + title + section + content blocks. The docs engine renders these
 * from any React host, but the registry itself is plain data, so it works
 * in plain JS / Python / any stack.
 */
export const docsPages: DocsPage[] = ${JSON.stringify(starterPages(answers.template, answers.name), null, 2).replace(/"([a-z]+)":/g, "$1:")};
`
      : `/**
 * Your docs pages registry (framework-agnostic). A page is data:
 * path + title + section + content blocks. The docs engine renders these
 * from any React host, but the registry itself is plain data, so it works
 * in plain JS / Python / any stack.
 */
export const docsPages = ${JSON.stringify(starterPages(answers.template, answers.name), null, 2)};
`;

  const contentPipeline = `/**
 * Markdown -> DocsPage pipeline.
 *
 * Drop markdown files under ./content and this turns each into a DocsPage.
 * Front matter:
 *   ---
 *   title: My Page
 *   section: guides
 *   ---
 * Body is a limited markdown subset: paragraphs, ## h2, code fences,
 * bullet lists, and tables.
 */

export interface MarkdownDoc {
  title: string;
  section: string;
  path: string;
  description?: string;
  body: string;
}

export function parseFrontMatter(source: string): { front: Record<string, string>; body: string } {
  const m = source.match(/^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/);
  if (!m) return { front: {}, body: source };
  const front: Record<string, string> = {};
  for (const line of m[1].split("\\n")) {
    const [k, ...rest] = line.split(":");
    if (k) front[k.trim()] = rest.join(":").trim();
  }
  return { front, body: m[2] };
}

/** Render a markdown body into DocsBlock data (limited subset). */
export function markdownToBlocks(body: string): import("@fusorb/facet-docs").DocsBlock[] {
  const blocks: import("@fusorb/facet-docs").DocsBlock[] = [];
  const lines = body.split("\\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h2", text: line.slice(4) });
      i++;
      continue;
    }
    if (line.startsWith("\`\`\`")) {
      const lang = line.slice(3).trim();
      const fence: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("\`\`\`")) {
        fence.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push({ type: "code", text: fence.join("\\n"), lang: lang || undefined });
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    // Paragraph: accumulate until a blank line or block start.
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !lines[i].startsWith("\`\`\`") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith("* ")
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}
`;

  const files: GeneratedFile[] = [
    { path: path.join(base, `pages.${e}`), content: pagesFile },
    {
      path: path.join(base, `content-pipeline.${e}`),
      content:
        answers.language === "typescript"
          ? contentPipeline
          : stripTypes(contentPipeline),
    },
  ];

  // Barrel: re-export the pages registry so consumers can import the docs
  // from one entry. "auto" creates it for a fresh scaffold; true always;
  // false never.
  const wantsBarrel =
    answers.barrel === true ||
    (answers.barrel !== false && !existsSync(path.join(base, `index.${e}`)));
  if (wantsBarrel) {
    files.push({
      path: path.join(base, `index.${e}`),
      content: `/** Docs entry. Import the pages registry from here. */
export { docsPages } from "./pages.${e}";
`,
    });
  }

  return files;
}

/**
 * Generate a Next.js docs scaffold: a thin `app/` route that renders
 * `DocsApp` from the config + pages registry, plus a `src/lib/docs/`
 * folder holding the consumer's own content. Same content-as-data model
 * as the React+Vite scaffold, but as a real Next route.
 *
 * Files:
 * - `src/app/docs/page.tsx`   : the docs route ("use client", renders DocsApp)
 * - `src/lib/docs/config.ts`  : DocsSiteConfig for the consumer's docs
 * - `src/lib/docs/pages.ts`   : the pages registry (consumer's content)
 *
 * Barrel: an optional `index.ts` re-exports the config + pages. "auto"
 * creates it when nothing exists yet, true always, false never.
 */
export function generateNext(
  answers: DocsAnswers,
  cwd: string,
): GeneratedFile[] {
  const e = ext(answers.language);
  const tsx = answers.language === "typescript" ? "tsx" : "jsx";
  const base = path.join(cwd, answers.location === "." ? "" : answers.location);

  // The route file lives at src/app/docs/page.tsx and must reach the
  // config/pages in src/lib/docs. Prefer a configured path alias when one
  // exists (e.g. "@/lib/docs/config"), else use the correct relative path.
  const routeDir = path.posix.join(base.replace(/\\/g, "/"), "src/app/docs");
  const docsDir = path.posix.join(base.replace(/\\/g, "/"), "src/lib/docs");
  const configImport = importSpecifier(
    cwd,
    path.join(routeDir, `page.${tsx}`),
    docsDir,
  );
  const routeFile = `"use client";

import { DocsApp } from "@fusorb/facet-docs";
import { docsConfig } from "${configImport}/config.${e}";
import { docsPages } from "${configImport}/pages.${e}";

/** Docs route. Renders the facet docs app with the consumer's own content. */
export default function DocsPage() {
  return <DocsApp config={docsConfig} pages={docsPages} />;
}
`;

  const configFile = `import type { DocsSiteConfig } from "@fusorb/facet-docs";

/** Docs site configuration for ${answers.name}. */
export const docsConfig: DocsSiteConfig = {
  brand: { name: "${answers.name}", tagline: "Docs for ${answers.name}" },
  navigation: [],
  // Point these at your other products' docs, e.g. SovGrant.
  ecosystem: [],
};
`;

  const pagesFile = `import type { DocsPage } from "@fusorb/facet-docs";

/**
 * Your docs pages registry. A page is data: path + title + section +
 * content blocks. The sidebar and search derive from this array, so adding
 * a page here gives you a route, nav entry, and search hit automatically.
 */
export const docsPages: DocsPage[] = ${JSON.stringify(starterPages(answers.template, answers.name), null, 2).replace(/"([a-z]+)":/g, "$1:")};
`;

  const packageJson = mergePackageJson(readExistingPackageJson(base), {
    facetDocs: answers.facetVersions["@fusorb/facet-docs"] ?? "^1.0.0",
    facetTokens: answers.facetVersions["@fusorb/facet-tokens"] ?? "^1.0.0",
    facetComponents:
      answers.facetVersions["@fusorb/facet-components"] ?? "^1.0.0",
    facetLayout: answers.facetVersions["@fusorb/facet-layout"] ?? "^1.0.0",
    framework: answers.framework,
    language: answers.language,
  });

  const files: GeneratedFile[] = [
    { path: path.join(base, "package.json"), content: packageJson.content },
    {
      path: path.join(base, "src", "app", "docs", `page.${tsx}`),
      content: routeFile,
    },
    {
      path: path.join(base, "src", "lib", "docs", `config.${e}`),
      content: configFile,
    },
    {
      path: path.join(base, "src", "lib", "docs", `pages.${e}`),
      content: pagesFile,
    },
  ];

  // Barrel: re-export the config + pages from a single entry. "auto"
  // creates it for a fresh scaffold; true always; false never.
  const wantsBarrel =
    answers.barrel === true ||
    (answers.barrel !== false &&
      !existsSync(path.join(base, "src", "lib", "docs", `index.${e}`)));
  if (wantsBarrel) {
    files.push({
      path: path.join(base, "src", "lib", "docs", `index.${e}`),
      content: `/** Docs entry. Import the config or pages registry from here. */
export { docsConfig } from "./config.${e}";
export { docsPages } from "./pages.${e}";
`,
    });
  }

  return files;
}

/**
 * Generate a Python docs scaffold: a Python markdown -> DocsPage pipeline
 * plus a starter `pages.json`. The Python consumer keeps markdown under
 * <location>/content, runs `python docs_pipeline.py`, and gets a
 * `pages.json` the docs engine (any React host) renders. No React shell:
 * the content is plain data, so a Python backend can own it and hand the
 * JSON to a React frontend for rendering.
 *
 * Files:
 * - `docs_pipeline.py` : markdown -> DocsPage JSON compiler
 * - `pages.json`       : starter registry (empty overview page)
 *
 * Barrel: this generator emits no TS/JS barrel (it's Python); the barrel
 * option only governs the JS/TS generators. Python consumers get the
 * pipeline + JSON output.
 */
export function generatePython(
  answers: DocsAnswers,
  cwd: string,
): GeneratedFile[] {
  const base = path.join(cwd, answers.location === "." ? "" : answers.location);

  const pipeline = `#!/usr/bin/env python3
"""Compile ./content/*.md into pages.json for @fusorb/facet-docs.

The facet docs engine renders DocsPage JSON from any React host. This
pipeline lets a Python repo own its docs content in markdown and emit
the same shape the engine expects:

  python docs_pipeline.py > pages.json

Front matter per file:
  ---
  title: Getting Started
  section: guides
  path: /getting-started
  description: Boot a facet app in minutes.
  ---
Body is a limited markdown subset: paragraphs, ## h2, ### h2, code
fences (\\\`\\\`\\\`lang), bullet lists (- / *), and plain tables.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


def parse_front_matter(source: str) -> tuple[dict[str, str], str]:
    m = re.match(r"^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$", source)
    if not m:
        return {}, source
    front: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            front[key.strip()] = value.strip()
    return front, m.group(2)


def markdown_to_blocks(body: str) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    lines = body.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("## "):
            blocks.append({"type": "h2", "text": line[3:]})
            i += 1
            continue
        if line.startswith("### "):
            blocks.append({"type": "h2", "text": line[4:]})
            i += 1
            continue
        if line.startswith("\\\`\\\`\\\`"):
            lang = line[3:].strip()
            fence: list[str] = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("\\\`\\\`\\\`"):
                fence.append(lines[i])
                i += 1
            i += 1  # closing fence
            block: dict[str, Any] = {"type": "code", "text": "\\n".join(fence)}
            if lang:
                block["lang"] = lang
            blocks.append(block)
            continue
        if line.startswith("- ") or line.startswith("* "):
            items: list[str] = []
            while i < len(lines) and (
                lines[i].strip().startswith("- ") or lines[i].strip().startswith("* ")
            ):
                items.append(lines[i].strip()[2:])
                i += 1
            blocks.append({"type": "ul", "items": items})
            continue
        # Paragraph: accumulate until a blank line or block start.
        para: list[str] = [line]
        i += 1
        while (
            i < len(lines)
            and lines[i].strip()
            and not lines[i].strip().startswith("## ")
            and not lines[i].strip().startswith("### ")
            and not lines[i].strip().startswith("\\\`\\\`\\\`")
            and not lines[i].strip().startswith("- ")
            and not lines[i].strip().startswith("* ")
        ):
            para.append(lines[i].strip())
            i += 1
        blocks.append({"type": "p", "text": " ".join(para)})
    return blocks


def main() -> None:
    content_dir = Path(__file__).parent / "content"
    pages: list[dict[str, Any]] = []
    if content_dir.is_dir():
        for md in sorted(content_dir.glob("*.md")):
            front, body = parse_front_matter(md.read_text(encoding="utf-8"))
            pages.append(
                {
                    "path": front.get("path", "/" + md.stem),
                    "title": front.get("title", md.stem.replace("-", " ").title()),
                    "section": front.get("section", "guides"),
                    **({"description": front["description"]} if front.get("description") else {}),
                    "blocks": markdown_to_blocks(body),
                }
            )
    json.dump(pages, sys.stdout, indent=2)
    print()


if __name__ == "__main__":
    main()
`;

  const starterPages =
    JSON.stringify(
      [
        {
          path: "/",
          title: "Overview",
          section: "guides",
          description: `Welcome to ${answers.name}.`,
          blocks: [
            { type: "p", text: `Welcome to ${answers.name} docs.` },
            { type: "h2", text: "Quick start" },
            { type: "code", text: `pip install ${answers.name}` },
          ],
        },
      ],
      null,
      2,
    ) + "\n";

  return [
    { path: path.join(base, "docs_pipeline.py"), content: pipeline },
    { path: path.join(base, "pages.json"), content: starterPages },
  ];
}

/**
 * Generate a Remix docs scaffold: a thin `app/routes` route that renders
 * `DocsApp` from the config + pages registry, plus a `src/lib/docs/`
 * folder holding the consumer's own content. Same content-as-data model
 * as the React+Vite and Next scaffolds, but as a real Remix route.
 *
 * Files:
 * - `app/routes/docs.tsx`      : the docs route ("use client", renders DocsApp)
 * - `src/lib/docs/config.ts`   : DocsSiteConfig for the consumer's docs
 * - `src/lib/docs/pages.ts`    : the pages registry (consumer's content)
 *
 * Barrel: an optional `index.ts` re-exports the config + pages. "auto"
 * creates it when nothing exists yet, true always, false never.
 */
export function generateRemix(
  answers: DocsAnswers,
  cwd: string,
): GeneratedFile[] {
  const e = ext(answers.language);
  const tsx = answers.language === "typescript" ? "tsx" : "jsx";
  const base = path.join(cwd, answers.location === "." ? "" : answers.location);

  // The route lives at app/routes/docs.tsx and must reach src/lib/docs.
  // Prefer a configured path alias when one exists, else a correct relative.
  const routeDir = path.posix.join(base.replace(/\\/g, "/"), "app/routes");
  const docsDir = path.posix.join(base.replace(/\\/g, "/"), "src/lib/docs");
  const configImport = importSpecifier(
    cwd,
    path.join(routeDir, `docs.${tsx}`),
    docsDir,
  );
  const routeFile = `"use client";

import { DocsApp } from "@fusorb/facet-docs";
import { docsConfig } from "${configImport}/config.${e}";
import { docsPages } from "${configImport}/pages.${e}";

/** Docs route. Renders the facet docs app with the consumer's own content. */
export default function DocsRoute() {
  return <DocsApp config={docsConfig} pages={docsPages} />;
}
`;

  const configFile = `import type { DocsSiteConfig } from "@fusorb/facet-docs";

/** Docs site configuration for ${answers.name}. */
export const docsConfig: DocsSiteConfig = {
  brand: { name: "${answers.name}", tagline: "Docs for ${answers.name}" },
  navigation: [],
  // Point these at your other products' docs, e.g. SovGrant.
  ecosystem: [],
};
`;

  const pagesFile = `import type { DocsPage } from "@fusorb/facet-docs";

/**
 * Your docs pages registry. A page is data: path + title + section +
 * content blocks. The sidebar and search derive from this array, so adding
 * a page here gives you a route, nav entry, and search hit automatically.
 */
export const docsPages: DocsPage[] = ${JSON.stringify(starterPages(answers.template, answers.name), null, 2).replace(/"([a-z]+)":/g, "$1:")};
`;

  const packageJson = mergePackageJson(readExistingPackageJson(base), {
    facetDocs: answers.facetVersions["@fusorb/facet-docs"] ?? "^1.0.0",
    facetTokens: answers.facetVersions["@fusorb/facet-tokens"] ?? "^1.0.0",
    facetComponents:
      answers.facetVersions["@fusorb/facet-components"] ?? "^1.0.0",
    facetLayout: answers.facetVersions["@fusorb/facet-layout"] ?? "^1.0.0",
    framework: answers.framework,
    language: answers.language,
  });

  const files: GeneratedFile[] = [
    { path: path.join(base, "package.json"), content: packageJson.content },
    {
      path: path.join(base, "app", "routes", `docs.${tsx}`),
      content: routeFile,
    },
    {
      path: path.join(base, "src", "lib", "docs", `config.${e}`),
      content: configFile,
    },
    {
      path: path.join(base, "src", "lib", "docs", `pages.${e}`),
      content: pagesFile,
    },
  ];

  // Barrel: re-export the config + pages from a single entry. "auto"
  // creates it for a fresh scaffold; true always; false never.
  const wantsBarrel =
    answers.barrel === true ||
    (answers.barrel !== false &&
      !existsSync(path.join(base, "src", "lib", "docs", `index.${e}`)));
  if (wantsBarrel) {
    files.push({
      path: path.join(base, "src", "lib", "docs", `index.${e}`),
      content: `/** Docs entry. Import the config or pages registry from here. */
export { docsConfig } from "./config.${e}";
export { docsPages } from "./pages.${e}";
`,
    });
  }

  return files;
}

/**
 * Strip the type annotations from the generated content-pipeline so the
 * JavaScript variant is valid .js (interfaces and `: Type` annotations are
 * TS-only). The template is controlled, so a targeted strip is safe.
 */
function stripTypes(source: string): string {
  return (
    source
      // Remove the interface block entirely.
      .replace(/export interface MarkdownDoc \{[\s\S]*?\n\}/, "")
      // Drop function parameter and return type annotations.
      .replace(
        /\((source: string)\): \{ front: Record<string, string>; body: string \}/,
        "(source)",
      )
      .replace(
        /\(body: string\): import\("@fusorb\/facet-docs"\)\.DocsBlock\[\]/,
        "(body)",
      )
      // Drop variable type annotations.
      .replace(
        /const (front|blocks|lines|fence|items|para): [^=]+=/,
        "const $1 =",
      )
      // Drop remaining inline type annotations (fence/lang/undefined casts).
      .replace(/:\s*string\[\]/g, "")
      .replace(/:\s*Record<string, string>/g, "")
      .replace(/:\s*import\("@fusorb\/facet-docs"\)\.DocsBlock\[\]/g, "")
      .replace(/lang: lang \|\| undefined/, "lang: lang || undefined")
  );
}

/**
 * How `facet add` places the copied component inside the consumer's source.
 *
 * - `"decide"` (default): detect what the consumer already has and wire up
 *   the best layout without prompting. Falls back to `"subdir"`.
 * - `"subdir"`: a dedicated subdirectory inside the target, e.g.
 *   `src/components/<dir>/Button.tsx` (shadcn's `ui/` pattern, our
 *   default `dir` is `facet`).
 * - `"flat"`: components sit directly in the target root, e.g.
 *   `src/components/Button.tsx`.
 */
export type AddPlacement = "decide" | "subdir" | "flat";

export interface AddAnswers {
  /** Consumer's language. */
  language: "typescript" | "javascript";
  /** Components directory (default `src/components`). */
  target: AddTarget;
  /** Placement mode (default `"decide"`). */
  placement: AddPlacement;
  /** Subdirectory name used by `"subdir"` (default `facet`). */
  dir?: string;
  /** Whether to generate/merge a barrel export. `"auto"` (default) only
   * creates one when it already exists (preserving the consumer's root
   * barrel): set `true` to always create, `false` to never touch one. */
  barrel?: boolean | "auto";
}

/**
 * Resolve the effective layout for `facet add`. Explicit `placement` wins;
 * `"decide"` detects what the consumer already has and picks the best fit:
 * flat-in-root when the target already has a barrel (so the new component
 * is importable from it), otherwise a dedicated subdir with `dir` inside it.
 */
export function resolveAddLayout(
  answers: AddAnswers,
  cwd: string,
): { mode: "subdir" | "flat"; dir: string; base: string } {
  const isTs = answers.language === "typescript";
  const base = path.join(cwd, answers.target);
  const dir = answers.dir ?? "facet";
  const mode = answers.placement ?? "decide";
  const rootBarrel = path.join(base, `index.${isTs ? "ts" : "js"}`);

  if (mode === "subdir") return { mode: "subdir", dir, base };
  if (mode === "flat") return { mode: "flat", dir, base };
  // decide: if the consumer already has a barrel, go flat so the component
  // is importable from it immediately; otherwise use a clean subdir.
  if (existsSync(rootBarrel)) return { mode: "flat", dir, base };
  return { mode: "subdir", dir, base };
}

/**
 * Generate a `facet add <component>` style entry (secondary tier).
 * The primary consumption model is npm-package install; this exists for
 * consumers who prefer a copy-into-source workflow (shadcn-style).
 *
 * Placement is flexible: see `AddPlacement`. Defaults:
 * - `target`: `src/components`
 * - `placement`: `decide` (flat if the root already has a barrel, else a
 *   clean subdir)
 * - `dir`: `facet`
 * - `barrel`: `auto` (merge into an existing root barrel, never clobber it)
 *
 * The subdir barrel is always regenerated from files on disk, so it stays
 * in sync. When the consumer's own root barrel exists, we merge a single
 * re-export of the facet dir into it instead of overwriting it:
 *
 *   // (consumer's existing exports)
 *   export * from "./facet";
 */
export function generateComponentAdd(
  component: string,
  cwd: string,
  answers: AddAnswers,
): GeneratedFile[] {
  const isTs = answers.language === "typescript";
  const extname = isTs ? "tsx" : "jsx";
  const { mode, dir, base } = resolveAddLayout(answers, cwd);
  // The directory components actually live in.
  const componentDir = mode === "subdir" ? path.join(base, dir) : base;
  const target = path.join(componentDir, `${component}.${extname}`);

  // Discover component files already added (flat files in componentDir)
  // so the subdir barrel always lists the full set, not just the latest.
  const added: string[] = [];
  try {
    for (const entry of readdirSync(componentDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(`.${extname}`)) continue;
      const name = entry.name.slice(0, -`.${extname}`.length);
      if (name === "index") continue; // the barrel itself
      added.push(name);
    }
  } catch {
    // componentDir doesn't exist yet: nothing added before.
  }
  const names = [...new Set([...added, component])].sort();

  const barrel =
    "// Generated by @fusorb/facet-cli (facet add). Re-run `facet add` to refresh.\n" +
    names
      .map((n) => `export { default as ${n} } from "./${n}.${extname}";`)
      .join("\n") +
    "\n";

  const componentFile = `// Generated by @fusorb/facet-cli (facet add ${component}).
// Recommended: import from the package instead of copying source, so you
// get updates and the token system. Copying means you own every future fix.
import { ${component} } from "@fusorb/facet-components";

export default ${component};
`;

  const files: GeneratedFile[] = [{ path: target, content: componentFile }];

  // Barrel handling: only write a NEW barrel when the component lives in a
  // subdir (so `@/components/<dir>` works), or when the consumer asked for
  // one explicitly. When the root barrel already exists, merge a re-export
  // into it instead of overwriting: never clobber their exports.
  const rootBarrel = path.join(base, `index.${isTs ? "ts" : "js"}`);
  const wantsBarrel = answers.barrel ?? "auto";
  const rootExists = existsSync(rootBarrel);

  // barrel: false suppresses ALL barrel creation/updates.
  if (wantsBarrel === false) {
    return files;
  }

  if (wantsBarrel === true) {
    files.push({
      path: path.join(componentDir, `index.${isTs ? "ts" : "js"}`),
      content: barrel,
    });
    if (rootExists) {
      const ref = mode === "subdir" ? dir : ".";
      files.push({
        path: rootBarrel,
        content: mergeRootBarrel(rootBarrel, ref, component, isTs),
      });
    }
  } else if (mode === "subdir") {
    files.push({
      path: path.join(componentDir, `index.${isTs ? "ts" : "js"}`),
      content: barrel,
    });
    if (rootExists) {
      files.push({
        path: rootBarrel,
        content: mergeRootBarrel(rootBarrel, dir, component, isTs),
      });
    }
  } else if (rootExists) {
    files.push({
      path: rootBarrel,
      content: mergeRootBarrel(rootBarrel, ".", component, isTs),
    });
  }

  return files;
}

/**
 * Rebuild a barrel: keep the existing exports and append ONE re-export line
 * that references the just-added component without clobbering anything else.
 *
 * - Subdir mode (`ref` = the subdir): `export * from "./facet";` : makes the
 *   whole facet dir importable from the root barrel.
 * - Flat mode (`ref` = "."): `export { default as Button } from "./Button.tsx";`
 *   : exposes the single added component by name.
 */
function mergeRootBarrel(
  barrelPath: string,
  ref: string,
  component: string,
  isTs: boolean,
): string {
  const existing = readFileSync(barrelPath, "utf8");
  const extname = isTs ? "tsx" : "jsx";
  const facetExport =
    ref === "."
      ? `export { default as ${component} } from "./${component}.${extname}";`
      : `export * from "./${ref}";`;
  const lines = existing.split("\n").map((l) => l.trimEnd());
  const already = lines.some((l) => l.trim() === facetExport);
  if (already) return existing;
  // Append at the end, keeping their structure intact.
  return existing.trimEnd() + "\n" + facetExport + "\n";
}
