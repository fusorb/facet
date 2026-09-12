import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  scanUnnecessaryDeps,
  scanImports,
  buildCleanPlan,
  deleteIfUnused,
  rewriteImports,
  removeBundledDeps,
  removeCommand,
  globalRemoveCommand,
  mergeScripts,
  PRESET_SCRIPTS,
  findSourceFiles,
  isShadcnImport,
  isBundledImport,
  detectPathAliases,
  importSpecifier,
} from "./deps.js";

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "facet-deps-"));
}

function writePkg(dir: string, pkg: Record<string, unknown>) {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2));
}

function write(dir: string, rel: string, content: string) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

describe("scanUnnecessaryDeps", () => {
  it("finds radix + lucide deps declared by a consumer", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "app",
        dependencies: {
          "@fusorb/facet-components": "^1.2.0",
          "@radix-ui/react-dialog": "^1.1.6",
          "lucide-react": "^1.30.0",
          "react": "^19",
        },
      });
      const entries = scanUnnecessaryDeps(dir);
      expect(entries).toHaveLength(1);
      const names = entries[0]!.deps.map((d) => d.name);
      expect(names).toContain("@radix-ui/react-dialog");
      expect(names).toContain("lucide-react");
      expect(names).not.toContain("react");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("scans workspace members too", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "root" });
      write(dir, "pnpm-workspace.yaml", "packages:\n  - client\n");
      write(dir, "client/package.json", JSON.stringify({
        name: "client",
        dependencies: { "cmdk": "^1.0.4", "react": "^19" },
      }));
      const entries = scanUnnecessaryDeps(dir);
      expect(entries).toHaveLength(1);
      expect(entries[0]!.deps.map((d) => d.name)).toContain("cmdk");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns empty when nothing unnecessary is declared", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app", dependencies: { react: "^19" } });
      expect(scanUnnecessaryDeps(dir)).toEqual([]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("isBundledImport / isShadcnImport", () => {
  it("matches bundled dep subpaths", () => {
    expect(isBundledImport("@radix-ui/react-dialog")).toBe(true);
    expect(isBundledImport("@radix-ui/react-dialog/dist/index.js")).toBe(true);
    expect(isBundledImport("lucide-react")).toBe(true);
    expect(isBundledImport("react")).toBe(false);
  });

  it("matches shadcn-style local folders", () => {
    expect(isShadcnImport("@/components/ui/button")).toBe(true);
    expect(isShadcnImport("~/components/ui")).toBe(true);
    expect(isShadcnImport("../../components/ui/button")).toBe(true);
    expect(isShadcnImport("@/components/button")).toBe(false);
  });
});

describe("scanImports + rewriteImports", () => {
  it("finds radix + shadcn imports in source files", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      write(dir, "src/page.tsx", `import { Dialog } from "@radix-ui/react-dialog";\nimport { Button } from "@/components/ui/button";\nimport { Card } from "@/components/card";\n`);
      write(dir, "src/other.ts", `import { useForm } from "react-hook-form";\n`);
      const matches = scanImports(dir);
      const froms = matches.map((m) => m.from);
      expect(froms).toContain("@radix-ui/react-dialog");
      expect(froms).toContain("@/components/ui/button");
      // react-hook-form is bundled; it's also a bare package import.
      expect(froms).toContain("react-hook-form");
      expect(froms).not.toContain("@/components/card");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rewrites imports to the facet package", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      const file = path.join(dir, "src", "page.tsx");
      write(dir, "src/page.tsx", `import { Dialog } from "@radix-ui/react-dialog";\nimport { Button } from "@/components/ui/button";\n`);
      const matches = scanImports(dir);
      const changed = rewriteImports(matches);
      expect(changed).toContain(file);
      const source = fs.readFileSync(file, "utf8");
      expect(source).toContain('from "@fusorb/facet-components"');
      expect(source).not.toContain("@radix-ui/react-dialog");
      expect(source).not.toContain("@/components/ui/button");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("removeBundledDeps + removeCommand", () => {
  it("removes bundled deps from a manifest and returns the changed content", () => {
    const dir = tmp();
    try {
      const pkgPath = path.join(dir, "package.json");
      writePkg(dir, {
        name: "app",
        dependencies: { "@fusorb/facet-components": "^1.2.0", "@radix-ui/react-dialog": "^1.1.6" },
        devDependencies: { "lucide-react": "^1.30.0" },
      });
      const { content, removed } = removeBundledDeps(pkgPath, ["@radix-ui/react-dialog", "lucide-react"]);
      expect(removed).toEqual(expect.arrayContaining(["@radix-ui/react-dialog", "lucide-react"]));
      expect(content).toBeTruthy();
      const parsed = JSON.parse(content!) as Record<string, any>;
      expect(parsed.dependencies["@radix-ui/react-dialog"]).toBeUndefined();
      expect(parsed.dependencies["@fusorb/facet-components"]).toBe("^1.2.0");
      expect(parsed.devDependencies["lucide-react"]).toBeUndefined();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("builds the correct remove command per package manager", () => {
    expect(removeCommand("pnpm", ["@radix-ui/react-dialog", "lucide-react"])).toBe(
      "pnpm remove @radix-ui/react-dialog lucide-react",
    );
    expect(removeCommand("npm", ["lucide-react"])).toBe("npm uninstall lucide-react");
    expect(removeCommand("pnpm", ["lucide-react"], true)).toBe("pnpm -w remove lucide-react");
  });

  it("builds the correct global remove command per package manager", () => {
    expect(globalRemoveCommand("pnpm", ["@radix-ui/react-dialog", "lucide-react"])).toBe(
      "pnpm remove -g @radix-ui/react-dialog lucide-react",
    );
    expect(globalRemoveCommand("npm", ["@fusorb/facet-cli"])).toBe("npm uninstall -g @fusorb/facet-cli");
    expect(globalRemoveCommand("yarn", ["@fusorb/facet-cli"])).toBe("yarn global remove @fusorb/facet-cli");
    expect(globalRemoveCommand("bun", ["@fusorb/facet-cli"])).toBe("bun remove -g @fusorb/facet-cli");
  });
});

describe("mergeScripts", () => {
  it("adds requested presets without overwriting existing scripts", () => {
    const dir = tmp();
    try {
      const pkgPath = path.join(dir, "package.json");
      writePkg(dir, { name: "app", scripts: { build: "vite build", "docs:dev": "vite" } });
      const { content, added } = mergeScripts(pkgPath, ["docs", "quality"]);
      // docs:dev already exists -> not re-added; docs:build/docs:preview + quality added.
      expect(added).toContain("docs:build");
      expect(added).toContain("docs:preview");
      expect(added).toContain("typecheck");
      expect(added).not.toContain("docs:dev");
      const parsed = JSON.parse(content!) as Record<string, any>;
      expect(parsed.scripts["docs:dev"]).toBe("vite");
      expect(parsed.scripts["build"]).toBe("vite build");
      expect(parsed.scripts["typecheck"]).toBe("tsc --noEmit");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns null when nothing new can be added", () => {
    const dir = tmp();
    try {
      const pkgPath = path.join(dir, "package.json");
      writePkg(dir, { name: "app", scripts: { "docs:dev": "vite", "docs:build": "vite build", "docs:preview": "vite preview" } });
      const { content, added } = mergeScripts(pkgPath, ["docs"]);
      expect(added).toEqual([]);
      expect(content).toBeNull();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("exposes preset scripts for the CLI prompt", () => {
    expect(PRESET_SCRIPTS.docs!.scripts).toMatchObject({ "docs:dev": "vite" });
    expect(PRESET_SCRIPTS.quality!.scripts.typecheck).toBe("tsc --noEmit");
    expect(PRESET_SCRIPTS.facet!.scripts["facet:clean"]).toBe("facet clean --yes");
  });
});

describe("buildCleanPlan", () => {
  it("builds a plan without touching disk (dry-run)", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "app",
        dependencies: { "@radix-ui/react-dialog": "^1.1.6", react: "^19" },
      });
      write(dir, "src/page.tsx", `import { Button } from "@/components/ui/button";\n`);
      const plan = buildCleanPlan(dir);
      expect(plan.manifests).toHaveLength(1);
      expect(plan.manifests[0]!.deps.map((d) => d.name)).toContain("@radix-ui/react-dialog");
      expect(plan.imports.length).toBeGreaterThan(0);
      // Nothing written:
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
      expect(pkg.dependencies["@radix-ui/react-dialog"]).toBe("^1.1.6");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("findSourceFiles", () => {
  it("finds source files but skips node_modules and dist", () => {
    const dir = tmp();
    try {
      write(dir, "src/a.ts", "export {};\n");
      write(dir, "src/sub/b.tsx", "export {};\n");
      write(dir, "node_modules/x/index.js", "console.log(1);\n");
      write(dir, "dist/index.js", "console.log(1);\n");
      const files = findSourceFiles(dir);
      const rel = files.map((f) => path.relative(dir, f).replace(/\\/g, "/"));
      expect(rel).toContain("src/a.ts");
      expect(rel).toContain("src/sub/b.tsx");
      expect(rel).not.toContain("node_modules/x/index.js");
      expect(rel).not.toContain("dist/index.js");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("detectPathAliases + importSpecifier", () => {
  it("reads tsconfig paths and maps aliases to targets", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      fs.writeFileSync(
        path.join(dir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            baseUrl: ".",
            paths: { "@/*": ["src/*"], "@lib/*": ["src/lib/*"] },
          },
        }),
      );
      const aliases = detectPathAliases(dir);
      expect(aliases).toContainEqual({ alias: "@/", target: "src/" });
      expect(aliases).toContainEqual({ alias: "@lib/", target: "src/lib/" });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prefers a configured alias over a relative path", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      fs.writeFileSync(
        path.join(dir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: { baseUrl: ".", paths: { "@/*": ["src/*"] } },
        }),
      );
      // Route at src/app/docs/page.tsx importing from src/lib/docs.
      const spec = importSpecifier(dir, path.join(dir, "src/app/docs/page.tsx"), path.join(dir, "src/lib/docs"));
      expect(spec).toBe("@/lib/docs");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("falls back to a correct relative path when no alias fits", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      // Route at src/app/docs/page.tsx importing from src/lib/docs, no aliases.
      const spec = importSpecifier(dir, path.join(dir, "src/app/docs/page.tsx"), path.join(dir, "src/lib/docs"));
      // From src/app/docs -> ../../lib/docs (src is the common parent).
      expect(spec).toBe("../../lib/docs");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects common framework aliases without config", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      fs.mkdirSync(path.join(dir, "src"), { recursive: true });
      const aliases = detectPathAliases(dir);
      expect(aliases).toContainEqual({ alias: "@/", target: "src/" });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("deleteIfUnused", () => {
  it("does NOT delete files outside of a ui/ folder", () => {
    const dir = tmp();
    try {
      const file = path.join(dir, "src/components/modal.tsx");
      write(dir, "src/components/modal.tsx", "export const Modal = () => null;");
      const result = deleteIfUnused(file, dir);
      expect(result).toBe(false);
      expect(fs.existsSync(file)).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does NOT delete a ui component that is still imported elsewhere", () => {
    const dir = tmp();
    try {
      const file = path.join(dir, "src/components/ui/dialog.tsx");
      write(dir, "src/components/ui/dialog.tsx", "export const Dialog = () => null;");
      write(dir, "src/app.tsx", `import { Dialog } from "@/components/ui/dialog";\n`);
      const result = deleteIfUnused(file, dir);
      expect(result).toBe(false);
      expect(fs.existsSync(file)).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("deletes a ui component when nothing imports it (requires --delete-local)", () => {
    const dir = tmp();
    try {
      const file = path.join(dir, "src/components/ui/dialog.tsx");
      write(dir, "src/components/ui/button.tsx", "export const Button = () => null;");
      write(dir, "src/components/ui/dialog.tsx", "export const Dialog = () => null;");
      const result = deleteIfUnused(file, dir);
      expect(result).toBe(true);
      expect(fs.existsSync(file)).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
