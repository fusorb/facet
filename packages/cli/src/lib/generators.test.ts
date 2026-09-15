import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generateReactVite } from "./generators.js";
import {
  generateComponentAdd,
  generatePlainJs,
  generateNext,
  generatePython,
  generateRemix,
} from "./generators-plain.js";
import {
  detectFramework,
  detectPackageManager,
  installCommand,
} from "./types.js";
import { facetInstallCommand } from "./registry.js";
import { mergePackageJson } from "./writer.js";

const answers = {
  name: "demo",
  location: "." as const,
  language: "typescript" as const,
  framework: "react-vite" as const,
  styling: "none" as const,
  useFacetTokens: true,
  template: "component-library" as const,
  barrel: "auto" as const,
  facetVersions: {
    "@fusorb/facet-docs": "^1.2.0",
    "@fusorb/facet-tokens": "^1.0.2",
    "@fusorb/facet-components": "^1.1.1",
    "@fusorb/facet-layout": "^1.0.3",
  },
};

describe("generateReactVite", () => {
  it("produces the thin-consumer file set", () => {
    const files = generateReactVite(answers, "/repo");
    const names = files.map((f) => f.path.replace(/\\/g, "/").split("/").pop());
    expect(names).toEqual([
      "package.json",
      "vite.config.ts",
      "index.html",
      "main.tsx",
      "app.tsx",
      "config.ts",
      "pages.ts",
      "app.css",
      "index.ts",
    ]);
  });

  it("wires facet tokens when requested", () => {
    const files = generateReactVite(answers, "/repo");
    const css = files.find((f) => f.path.endsWith("app.css"))!.content;
    expect(css).toContain('@import "@fusorb/facet-tokens/tokens.css"');
    expect(css).toContain("tailwind.css");
  });

  it("keeps the consumer's own pages separate from the engine", () => {
    const files = generateReactVite(answers, "/repo");
    const pages = files.find((f) => f.path.endsWith("pages.ts"))!.content;
    expect(pages).toContain("docsPages");
    // The consumer's own pages file is plain data: the engine only supplies
    // the DocsPage type, never authored content.
    expect(pages).toContain('from "@fusorb/facet-docs"'); // type-only import
    expect(pages).not.toContain("DocsApp");
  });
});

describe("generatePlainJs", () => {
  it("emits a valid pages registry + content pipeline", () => {
    for (const language of ["typescript", "javascript"] as const) {
      const files = generatePlainJs({ ...answers, language }, "/repo");
      const names = files.map((f) =>
        f.path.replace(/\\/g, "/").split("/").pop(),
      );
      expect(names).toEqual([
        `pages.${language === "typescript" ? "ts" : "js"}`,
        `content-pipeline.${language === "typescript" ? "ts" : "js"}`,
        `index.${language === "typescript" ? "ts" : "js"}`,
      ]);
    }
  });

  it("strips type annotations for the JS pipeline", () => {
    const js = generatePlainJs(
      { ...answers, language: "javascript" },
      "/repo",
    ).find((f) => f.path.endsWith("content-pipeline.js"))!.content;
    expect(js).not.toContain("interface MarkdownDoc");
    expect(js).toContain("function markdownToBlocks(body) {");
  });
});

describe("generateNext", () => {
  it("emits a Next app route + config + pages registry", () => {
    const files = generateNext(answers, "/repo");
    const names = files.map((f) => f.path.replace(/\\/g, "/").split("/").pop());
    expect(names).toEqual(["page.tsx", "config.ts", "pages.ts", "index.ts"]);
    const route = files.find((f) => f.path.endsWith("page.tsx"))!.content;
    expect(route).toContain('"use client"');
    expect(route).toContain("DocsApp");
    expect(route).not.toContain("DocsAppProps");
  });

  it("routes land under src/app/docs/", () => {
    const files = generateNext(answers, "/repo");
    expect(
      files.some((f) =>
        f.path.replace(/\\/g, "/").includes("src/app/docs/page.tsx"),
      ),
    ).toBe(true);
  });

  it("creates the barrel by default (auto)", () => {
    const files = generateNext({ ...answers, barrel: "auto" }, "/repo");
    expect(
      files.some((f) =>
        f.path.replace(/\\/g, "/").endsWith("src/lib/docs/index.ts"),
      ),
    ).toBe(true);
  });

  it("barrel: false suppresses the barrel", () => {
    const files = generateNext({ ...answers, barrel: false }, "/repo");
    expect(files.some((f) => f.path.endsWith("index.ts"))).toBe(false);
  });
});

describe("generatePython", () => {
  it("emits a Python pipeline + starter pages.json", () => {
    const files = generatePython(answers, "/repo");
    const names = files.map((f) => f.path.replace(/\\/g, "/").split("/").pop());
    expect(names).toEqual(["docs_pipeline.py", "pages.json"]);
    const pipeline = files.find((f) =>
      f.path.endsWith("docs_pipeline.py"),
    )!.content;
    expect(pipeline).toContain("python docs_pipeline.py > pages.json");
    expect(pipeline).toContain("markdown_to_blocks");
    expect(pipeline).toContain("parse_front_matter");
    const pages = files.find((f) => f.path.endsWith("pages.json"))!.content;
    expect(JSON.parse(pages)[0]).toMatchObject({
      path: "/",
      title: "Overview",
    });
  });

  it("emits no TS barrel", () => {
    const files = generatePython(answers, "/repo");
    expect(files.some((f) => f.path.endsWith("index.ts"))).toBe(false);
  });
});

describe("generateRemix", () => {
  it("emits a Remix route + config + pages registry", () => {
    const files = generateRemix(answers, "/repo");
    const names = files.map((f) => f.path.replace(/\\/g, "/").split("/").pop());
    expect(names).toEqual(["docs.tsx", "config.ts", "pages.ts", "index.ts"]);
    const route = files.find((f) => f.path.endsWith("docs.tsx"))!.content;
    expect(route).toContain('"use client"');
    expect(route).toContain("DocsApp");
    expect(route).toContain("../../src/lib/docs/config.ts");
  });

  it("routes land under app/routes/", () => {
    const files = generateRemix(answers, "/repo");
    expect(
      files.some((f) =>
        f.path.replace(/\\/g, "/").includes("app/routes/docs.tsx"),
      ),
    ).toBe(true);
  });

  it("creates the barrel by default", () => {
    const files = generateRemix({ ...answers, barrel: "auto" }, "/repo");
    expect(
      files.some((f) =>
        f.path.replace(/\\/g, "/").endsWith("src/lib/docs/index.ts"),
      ),
    ).toBe(true);
  });
});

describe("generateReactVite barrel", () => {
  it("creates the src/index barrel by default", () => {
    const files = generateReactVite({ ...answers, barrel: "auto" }, "/repo");
    expect(
      files.some((f) => f.path.replace(/\\/g, "/").endsWith("src/index.ts")),
    ).toBe(true);
  });

  it("barrel: false suppresses the src/index barrel", () => {
    const files = generateReactVite({ ...answers, barrel: false }, "/repo");
    expect(files.some((f) => f.path.endsWith("index.ts"))).toBe(false);
  });
});

describe("generateComponentAdd", () => {
  it("writes the component into the facet subdir + a barrel", () => {
    const files = generateComponentAdd("Button", "/repo", {
      language: "typescript",
      target: "src/components",
      placement: "decide",
    });
    expect(files).toHaveLength(2);
    const file = files.find((f) =>
      f.path.replace(/\\/g, "/").endsWith("facet/Button.tsx"),
    )!;
    expect(file.path.replace(/\\/g, "/")).toContain(
      "src/components/facet/Button.tsx",
    );
    expect(file.content).toContain(
      'import { Button } from "@fusorb/facet-components"',
    );
    expect(file.content).toContain(
      "Recommended: import from the package instead of copying source",
    );

    const barrel = files.find((f) =>
      f.path.replace(/\\/g, "/").endsWith("src/components/facet/index.ts"),
    )!;
    expect(barrel.content).toContain(
      'export { default as Button } from "./Button.tsx"',
    );
  });

  it("flat placement writes the component to the root", () => {
    const files = generateComponentAdd("Button", "/repo", {
      language: "typescript",
      target: "src/components",
      placement: "flat",
    });
    const file = files.find((f) =>
      f.path.replace(/\\/g, "/").endsWith("src/components/Button.tsx"),
    )!;
    expect(file.path.replace(/\\/g, "/")).toContain(
      "src/components/Button.tsx",
    );
  });
});

describe("mergePackageJson", () => {
  it("creates a fresh minimal package.json when none exists", () => {
    const result = mergePackageJson(null, {
      facetDocs: "^1.2.0",
      facetTokens: "^1.0.2",
      facetComponents: "^1.1.1",
      facetLayout: "^1.0.3",
      framework: "react-vite",
      language: "typescript",
    });
    expect(result.existed).toBe(false);
    const parsed = JSON.parse(result.content);
    expect(parsed.dependencies["@fusorb/facet-docs"]).toBe("^1.2.0");
    expect(parsed.scripts["docs:dev"]).toBe("vite");
  });

  it("patches an existing package.json, preserving the consumer's deps", () => {
    const existing = {
      name: "my-backend",
      scripts: { start: "node server.js" },
      dependencies: { fastify: "^4.0.0" },
    };
    const result = mergePackageJson(existing, {
      facetDocs: "^1.2.0",
      facetTokens: "^1.0.2",
      facetComponents: "^1.1.1",
      facetLayout: "^1.0.3",
      framework: "react-vite",
      language: "typescript",
    });
    expect(result.existed).toBe(true);
    const parsed = JSON.parse(result.content);
    // Consumer's own deps and scripts survive.
    expect(parsed.dependencies.fastify).toBe("^4.0.0");
    expect(parsed.scripts.start).toBe("node server.js");
    // Facet deps added, distinct docs scripts added.
    expect(parsed.dependencies["@fusorb/facet-docs"]).toBe("^1.2.0");
    expect(parsed.scripts["docs:dev"]).toBe("vite");
  });

  it("creates a Next scaffold with next/react deps and next scripts", () => {
    const result = mergePackageJson(null, {
      facetDocs: "^1.2.0",
      facetTokens: "^1.0.2",
      facetComponents: "^1.1.1",
      facetLayout: "^1.0.3",
      framework: "next",
      language: "typescript",
    });
    expect(result.existed).toBe(false);
    const parsed = JSON.parse(result.content);
    expect(parsed.dependencies.next).toBe("^15");
    expect(parsed.dependencies.react).toBe("^19");
    expect(parsed.scripts["docs:dev"]).toBe("next dev");
    expect(parsed.scripts.dev).toBe("next dev");
  });

  it("creates a Remix scaffold with remix/react deps and remix scripts", () => {
    const result = mergePackageJson(null, {
      facetDocs: "^1.2.0",
      facetTokens: "^1.0.2",
      facetComponents: "^1.1.1",
      facetLayout: "^1.0.3",
      framework: "remix",
      language: "typescript",
    });
    expect(result.existed).toBe(false);
    const parsed = JSON.parse(result.content);
    expect(parsed.dependencies["@remix-run/react"]).toBe("^2");
    expect(parsed.dependencies.react).toBe("^19");
    expect(parsed.scripts["docs:dev"]).toBe("remix dev");
    expect(parsed.scripts.dev).toBe("remix dev");
  });
});

describe("detectFramework (frontend-first, ignores backend)", () => {
  it("detects Next.js in a fullstack repo (Next + Fastify)", () => {
    // Simulate a package.json with next AND fastify: Next wins.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "facet-detect-"));
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ dependencies: { next: "^15", fastify: "^4" } }),
    );
    expect(detectFramework(dir)).toBe("next");
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("detects Vite from a vite.config", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "facet-detect-"));
    fs.writeFileSync(path.join(dir, "vite.config.ts"), "");
    expect(detectFramework(dir)).toBe("react-vite");
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("detectPackageManager + install commands", () => {
  it("falls back to npm when no lockfile exists", () => {
    expect(detectPackageManager("C:/nonexistent")).toBe("npm");
  });

  it("returns the right install command per manager", () => {
    expect(installCommand("pnpm")).toBe("pnpm install");
    expect(installCommand("yarn")).toBe("yarn install");
    expect(installCommand("bun")).toBe("bun install");
    expect(installCommand("npm")).toBe("npm install");
  });

  it("builds a facet install command with resolved ranges", () => {
    const cmd = facetInstallCommand("pnpm", {
      "@fusorb/facet-docs": "^1.2.0",
      "@fusorb/facet-tokens": "^1.0.2",
      "@fusorb/facet-components": "^1.1.1",
      "@fusorb/facet-layout": "^1.0.3",
    });
    expect(cmd).toContain("@fusorb/facet-docs@^1.2.0");
    expect(cmd).toContain("pnpm add");
  });
});
