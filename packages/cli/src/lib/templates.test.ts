import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  discoverTemplates,
  readTemplateManifest,
  resolveTemplate,
} from "./templates.js";
import { mergeTemplateFiles } from "./template-merge.js";
import { starterPages } from "./starter-pages.js";

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "facet-templates-"));
}

function write(dir: string, rel: string, content: string) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}

describe("readTemplateManifest", () => {
  it("parses a valid manifest", () => {
    const dir = tmpdir();
    write(
      dir,
      "template.json",
      JSON.stringify({ name: "saas", kind: "docs", description: "x" }),
    );
    const m = readTemplateManifest(dir);
    expect(m?.name).toBe("saas");
    expect(m?.kind).toBe("docs");
  });

  it("returns null for invalid/absent manifests", () => {
    const dir = tmpdir();
    expect(readTemplateManifest(dir)).toBeNull();
    write(dir, "template.json", "{ not json");
    expect(readTemplateManifest(dir)).toBeNull();
  });
});

describe("discoverTemplates", () => {
  it("finds templates under ./templates (with and without manifests)", () => {
    const root = tmpdir();
    write(
      root,
      "templates/saas/template.json",
      JSON.stringify({ name: "saas", kind: "docs" }),
    );
    write(
      root,
      "templates/api/template.json",
      JSON.stringify({ name: "api", kind: "docs" }),
    );
    write(root, "templates/plain/readme.md", "# plain");
    const found = discoverTemplates(root);
    const names = found.map((t) => t.name).sort();
    expect(names).toEqual(["api", "plain", "saas"]);
  });

  it("scans docs/templates and emails/templates roots", () => {
    const root = tmpdir();
    write(
      root,
      "docs/templates/product/template.json",
      JSON.stringify({ name: "product", kind: "docs" }),
    );
    write(
      root,
      "emails/templates/welcome/template.json",
      JSON.stringify({ name: "welcome", kind: "emails" }),
    );
    const found = discoverTemplates(root);
    expect(found.map((t) => t.name).sort()).toEqual(["product", "welcome"]);
    const welcome = found.find((t) => t.name === "welcome");
    expect(welcome?.kinds).toContain("emails");
  });
});

describe("resolveTemplate", () => {
  it("resolves by exact and case-insensitive name", () => {
    const root = tmpdir();
    write(
      root,
      "templates/saas/template.json",
      JSON.stringify({ name: "saas" }),
    );
    expect(resolveTemplate(root, "saas")?.name).toBe("saas");
    expect(resolveTemplate(root, "SAAS")?.name).toBe("saas");
    expect(resolveTemplate(root, "missing")).toBeNull();
  });

  it("resolves a template dir without a manifest", () => {
    const root = tmpdir();
    write(root, "templates/bare/thing.tsx", "export const x = 1;");
    expect(resolveTemplate(root, "bare")?.name).toBe("bare");
  });
});

describe("mergeTemplateFiles", () => {
  it("writes new files and skips identical ones", () => {
    const root = tmpdir();
    const tpl = path.join(root, "tpl");
    write(tpl, "a.ts", "export const a = 1;");
    write(tpl, "b.ts", "export const b = 2;");
    const target = root;
    write(target, "b.ts", "export const b = 2;"); // identical
    const r = mergeTemplateFiles(root, tpl, target);
    expect(r.written).toEqual(["a.ts"]);
    expect(r.skipped).toEqual(["b.ts"]);
    expect(fs.existsSync(path.join(target, "a.ts"))).toBe(true);
  });

  it("skips conflicting non-mergeable files unless force", () => {
    const root = tmpdir();
    const tpl = path.join(root, "tpl");
    write(tpl, "style.css", "body { color: red; }");
    const target = root;
    write(target, "style.css", "body { color: blue; }");
    const r = mergeTemplateFiles(root, tpl, target);
    expect(r.conflicts).toEqual(["style.css"]);
    expect(fs.readFileSync(path.join(target, "style.css"), "utf8")).toBe(
      "body { color: blue; }",
    );

    const r2 = mergeTemplateFiles(root, tpl, target, { force: true });
    expect(r2.written).toEqual(["style.css"]);
    expect(fs.readFileSync(path.join(target, "style.css"), "utf8")).toBe(
      "body { color: red; }",
    );
  });

  it("merges package.json with consumer fields winning", () => {
    const root = tmpdir();
    const tpl = path.join(root, "tpl");
    write(
      tpl,
      "package.json",
      JSON.stringify({
        name: "tpl",
        scripts: { "tpl:dev": "vite" },
        dependencies: { "tpl-dep": "^1.0.0" },
      }),
    );
    const target = root;
    write(
      target,
      "package.json",
      JSON.stringify({
        name: "consumer",
        scripts: { dev: "next dev", "tpl:dev": "keep-me" },
        dependencies: { app: "^1.0.0", "tpl-dep": "^2.0.0" },
      }),
    );
    const r = mergeTemplateFiles(root, tpl, target);
    expect(r.merged).toEqual(["package.json"]);
    const pkg = JSON.parse(
      fs.readFileSync(path.join(target, "package.json"), "utf8"),
    );
    expect(pkg.name).toBe("consumer");
    expect(pkg.scripts["tpl:dev"]).toBe("keep-me"); // consumer wins
    expect(pkg.scripts.dev).toBe("next dev");
    expect(pkg.dependencies.app).toBe("^1.0.0");
    expect(pkg.dependencies["tpl-dep"]).toBe("^2.0.0"); // consumer wins
  });

  it("appends @facet-merge marker content into existing code files", () => {
    const root = tmpdir();
    const tpl = path.join(root, "tpl");
    write(tpl, "src/index.ts", `// @facet-merge\nexport const added = 1;`);
    const target = root;
    write(target, "src/index.ts", "export const existing = 2;\n");
    const r = mergeTemplateFiles(root, tpl, target);
    expect(r.merged).toEqual(["src/index.ts"]);
    const content = fs.readFileSync(path.join(target, "src/index.ts"), "utf8");
    expect(content).toContain("export const existing = 2;");
    expect(content).toContain("export const added = 1;");
  });

  it("never copies the template manifest into the target", () => {
    const root = tmpdir();
    const tpl = path.join(root, "tpl");
    write(tpl, "template.json", JSON.stringify({ name: "saas", kind: "docs" }));
    write(tpl, "landing.tsx", "export const landing = 1;");
    const r = mergeTemplateFiles(root, tpl, root);
    expect(r.written).toEqual(["landing.tsx"]);
    expect(fs.existsSync(path.join(root, "template.json"))).toBe(false);
  });

  it("dry-run writes nothing", () => {
    const root = tmpdir();
    const tpl = path.join(root, "tpl");
    write(tpl, "a.ts", "export const a = 1;");
    const r = mergeTemplateFiles(root, tpl, root, { dryRun: true });
    expect(r.written).toEqual(["a.ts"]);
    expect(fs.existsSync(path.join(root, "a.ts"))).toBe(false);
  });
});

describe("starterPages", () => {
  it("returns the component-library overview by default", () => {
    const pages = starterPages("component-library", "demo");
    expect(pages).toHaveLength(1);
    expect(pages[0]?.title).toBe("Overview");
  });

  it("returns api-reference pages", () => {
    const pages = starterPages("api-reference", "demo");
    expect(pages.map((p) => p.path)).toContain("/endpoints");
    expect(pages.map((p) => p.path)).toContain("/types");
  });

  it("returns product-docs pages", () => {
    const pages = starterPages("product-docs", "demo");
    expect(pages.map((p) => p.path)).toEqual([
      "/",
      "/guides",
      "/faq",
      "/changelog",
    ]);
    const changelog = pages.find((p) => p.path === "/changelog");
    expect(changelog).toBeDefined();
    expect(changelog?.blocks.some((b) => b.type === "changelog")).toBe(true);
  });
});
