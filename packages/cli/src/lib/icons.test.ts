import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  scanIcons,
  scanFileNames,
  toKebab,
  detectIconTargetDir,
  buildLucideCatalog,
  resolveUsedIcons,
  generateIconRegistry,
  DEFAULT_SEMANTIC_NAMES,
} from "./icons.js";

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "facet-icons-"));
}

function writeFile(dir: string, rel: string, content: string) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

describe("toKebab", () => {
  it("normalizes camelCase and mixed names", () => {
    expect(toKebab("chevronDown")).toBe("chevron-down");
    expect(toKebab("chevron-down")).toBe("chevron-down");
    expect(toKebab("LayoutDashboard")).toBe("layout-dashboard");
    expect(toKebab("fingerprintPattern")).toBe("fingerprint-pattern");
  });
});

describe("scanFileNames", () => {
  it("finds Icon and LightIcon name props", () => {
    const src = `
      import { Icon } from "@fusorb/facet-components";
      <Icon name="settings" />
      <LightIcon name="chevron-down" />
      <Icon name="trash" className="size-4" />
    `;
    const names = scanFileNames(src);
    expect(names).toContain("settings");
    expect(names).toContain("chevron-down");
    expect(names).toContain("trash");
  });

  it("finds registerIcon and overrides keys", () => {
    const src = `
      registerIcon("custom-icon", MyIcon);
      <IconProvider overrides={{ settings: MySettings, "chevron-down": MyChevron }}>
    `;
    const names = scanFileNames(src);
    expect(names).toContain("custom-icon");
    expect(names).toContain("settings");
    expect(names).toContain("chevron-down");
  });

  it("finds object-literal icon values (nav configs, feature grids)", () => {
    const src = `
      const NAV = [
        { href: "/dashboard", label: "Dashboard", icon: "chart-column" },
        { href: "/admin", label: "Admin", icon: "shield" },
      ];
      const FEATURES = [
        { title: "Passkeys", icon: "key-round" as const },
        { title: "OAuth", icon: "shield-check" as const },
      ];
    `;
    const names = scanFileNames(src);
    expect(names).toContain("chart-column");
    expect(names).toContain("shield");
    expect(names).toContain("key-round");
    expect(names).toContain("shield-check");
  });

  it("does not treat icon prop assignments as object values", () => {
    const src = `
      <Icon name={item.icon} />
      const obj = { icon: someVariable };
    `;
    // No string literal under `icon:` here, so nothing is captured.
    expect(scanFileNames(src)).toHaveLength(0);
  });

  it("ignores non-icon name props", () => {
    const src = `
      <input name="firstName" />
      <Button size="sm">Hi</Button>
      const x = { name: "not-an-icon" };
    `;
    expect(scanFileNames(src)).toHaveLength(0);
  });

  it("ignores meta/link tags and property assignments", () => {
    const src = `
      <meta name="color-scheme" content="light" />
      <link name="theme-color" />
      this.name = "ApiError";
      const obj = { name: "x" };
      <Icon name="settings" />
    `;
    const names = scanFileNames(src);
    expect(names).toEqual(["settings"]);
  });
});

describe("scanIcons", () => {
  it("scans a consumer repo and resolves kebab names + placement", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      writeFile(
        dir,
        "src/components/App.tsx",
        `import { Icon } from "facet"; <Icon name="Heart" />`,
      );
      writeFile(
        dir,
        "src/lib/use-thing.ts",
        `export function x() { return registerIcon("settings", S); }`,
      );
      const scan = scanIcons(dir);
      expect(scan.kebabNames).toContain("heart");
      expect(scan.kebabNames).toContain("settings");
      // Detection: src/lib exists -> target lib/ui? No: detectIconTargetDir
      // checks lib/ui, src/components/ui, src/lib in order. src/lib wins.
      expect(scan.targetDir.split(path.sep).slice(-2).join("/")).toBe(
        "src/lib",
      );
      expect(scan.hasExisting).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("falls back to the repo root when no source dir exists", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      const scan = scanIcons(dir);
      // No src/ lib/ etc. -> default to <cwd>/src
      expect(scan.targetDir.endsWith("src")).toBe(true);
      expect(scan.kebabNames).toEqual([]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prefers lib/ui when it exists", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      writeFile(dir, "lib/ui/index.ts", `export const x = 1;`);
      const scan = scanIcons(dir);
      expect(scan.targetDir.split(path.sep).slice(-2).join("/")).toBe("lib/ui");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("scans monorepo app dirs (client/src) and detects placement there", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      writeFile(
        dir,
        "client/package.json",
        JSON.stringify({ name: "app-client" }),
      );
      writeFile(
        dir,
        "client/src/pages/Home.tsx",
        `import { Icon } from "@fusorb/facet-components"; <Icon name="heart" />`,
      );
      const scan = scanIcons(dir);
      expect(scan.kebabNames).toContain("heart");
      expect(
        scan.files.some((f) => f.includes("client") && f.includes("Home")),
      ).toBe(true);
      expect(scan.targetDir.split(path.sep).slice(-2).join("/")).toBe(
        "client/src",
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("scans apps/*/src monorepo layouts", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      writeFile(dir, "apps/web/package.json", JSON.stringify({ name: "web" }));
      writeFile(
        dir,
        "apps/web/src/lib/thing.ts",
        `registerIcon("settings", S);`,
      );
      const scan = scanIcons(dir);
      expect(scan.kebabNames).toContain("settings");
      expect(
        scan.files.some((f) => f.includes("apps") && f.includes("web")),
      ).toBe(true);
      expect(path.relative(dir, scan.targetDir).split(path.sep).join("/")).toBe(
        "apps/web/src/lib",
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prefers a populated client/src over a stale empty root src", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      // Stale/empty root src dir that lingers (e.g. only an old generated file).
      writeFile(dir, "src/icons.generated.tsx", `export {};\n`);
      writeFile(
        dir,
        "client/package.json",
        JSON.stringify({ name: "app-client" }),
      );
      writeFile(dir, "client/src/App.tsx", `<Icon name="heart" />`);
      const scan = scanIcons(dir);
      expect(scan.kebabNames).toContain("heart");
      expect(path.relative(dir, scan.targetDir).split(path.sep).join("/")).toBe(
        "client/src",
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("detectIconTargetDir", () => {
  it("detects conventional dirs in order", () => {
    const dir = tmp();
    try {
      expect(detectIconTargetDir(dir)).toContain("src");
      writeFile(dir, "lib/ui/x.ts", "");
      expect(detectIconTargetDir(dir).split(path.sep).slice(-2).join("/")).toBe(
        "lib/ui",
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("resolveUsedIcons + generateIconRegistry", () => {
  it("resolves used icons against a catalog and emits direct imports", () => {
    const catalog = {
      byName: new Map([
        ["settings", "Settings"],
        ["heart", "Heart"],
        ["chevron-down", "ChevronDown"],
      ]),
      version: "1.30.0",
    };
    const scan = {
      files: [],
      names: ["heart"],
      kebabNames: ["heart"],
      targetDir: "/tmp/app/src/lib",
      hasExisting: false,
    };
    const resolved = resolveUsedIcons(scan.kebabNames, catalog);
    // Default semantic set (minus ones not in this tiny catalog) + heart.
    expect(resolved.used.has("heart")).toBe(true);
    expect(resolved.used.has("settings")).toBe(true);
    // Chevron-down IS a default semantic name and resolvable.
    expect(resolved.used.has("chevron-down")).toBe(true);
    // Unresolved: anything in the defaults that the tiny catalog lacks.
    expect(resolved.unresolved.length).toBeGreaterThan(0);

    const file = generateIconRegistry(scan, resolved);
    expect(file.path.split(path.sep).slice(-2).join("/")).toBe(
      "lib/icons.generated.tsx",
    );
    expect(file.content).toContain("import {");
    expect(file.content).toContain("Settings,");
    expect(file.content).toContain("Heart,");
    expect(file.content).toContain('"heart": Heart,');
    expect(file.content).toContain("AUTO-GENERATED");
    expect(file.content).toContain("DO NOT EDIT");
    // The generated module must import from facet's icons subpath (the
    // consumer has facet-components, not necessarily lucide-react), and
    // import SVGProps (React namespace isn't in scope under react-jsx).
    expect(file.content).toContain('from "@fusorb/facet-components/icons"');
    expect(file.content).toContain('import type { SVGProps } from "react"');
  });

  it("dedupes lucide imports when aliases map to the same export", () => {
    const catalog = {
      byName: new Map([
        ["file-text", "FileText"],
        ["layout-dashboard", "LayoutDashboard"],
        ["log-out", "LogOut"],
      ]),
      version: "1.30.0",
    };
    const scan = {
      files: [],
      names: ["document", "dashboard", "logout"],
      kebabNames: ["document", "dashboard", "logout"],
      targetDir: "/tmp/app/src",
      hasExisting: false,
    };
    const resolved = resolveUsedIcons(scan.kebabNames, catalog);
    const file = generateIconRegistry(scan, resolved);
    // Only inspect the import block (entries legitimately repeat exports).
    const importBlock = file.content.slice(
      file.content.indexOf("import {"),
      file.content.indexOf('} from "@fusorb/facet-components/icons"') +
        '} from "@fusorb/facet-components/icons"'.length,
    );
    const count = (needle: string) => importBlock.split(needle).length - 1;
    // Each export appears exactly once in the import block.
    expect(count("FileText,")).toBe(1);
    expect(count("LayoutDashboard,")).toBe(1);
    expect(count("LogOut,")).toBe(1);
  });

  it("always includes the default semantic set", () => {
    expect(DEFAULT_SEMANTIC_NAMES.length).toBeGreaterThan(30);
    expect(DEFAULT_SEMANTIC_NAMES).toContain("settings");
    expect(DEFAULT_SEMANTIC_NAMES).toContain("chevron-down");
  });

  it("every default semantic name resolves against the real lucide catalog", () => {
    // Guards against stale/renamed lucide names (close, grid, document,
    // logout, dashboard were old aliases; current names are x, layout-grid,
    // file-text, log-out, layout-dashboard).
    const catalog = buildLucideCatalog(process.cwd());
    const unresolved = DEFAULT_SEMANTIC_NAMES.filter(
      (n) => !catalog.byName.has(n),
    );
    expect(unresolved).toEqual([]);
  });

  it("maps legacy call-site names through LUCIDE_ALIASES", () => {
    const catalog = {
      byName: new Map([
        ["settings", "Settings"],
        ["x", "X"],
        ["file-text", "FileText"],
        ["building2", "Building2"],
      ]),
      version: "1.30.0",
    };
    const resolved = resolveUsedIcons(
      ["close", "document", "building-2"],
      catalog,
    );
    // close -> x, document -> file-text, building-2 -> building2 via the alias map.
    expect(resolved.used.get("close")).toBe("X");
    expect(resolved.used.get("document")).toBe("FileText");
    expect(resolved.used.get("building-2")).toBe("Building2");
    expect(resolved.renamed).toContain("close -> x");
    expect(resolved.renamed).toContain("document -> file-text");
    expect(resolved.unresolved).not.toContain("close");
    expect(resolved.unresolved).not.toContain("document");
    expect(resolved.unresolved).not.toContain("building-2");
  });

  it("buildLucideCatalog resolves from a real lucide package", () => {
    // The CLI's own node_modules should have lucide-react via facet-components.
    const catalog = buildLucideCatalog(process.cwd());
    expect(catalog.byName.size).toBeGreaterThan(0);
    expect(catalog.byName.get("chevron-down")).toBe("ChevronDown");
  });
});
