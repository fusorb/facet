import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildDoctorReport,
  formatPackageTable,
  planUpdates,
  readInstalledVersion,
  updateCommand,
  installFacetPackages,
  globalInstallFacetPackages,
  isFacetPackage,
  resolveFacetPackageName,
  type FacetPackageInfo,
} from "./commands.js";
import { discoverFacetPackages, ALL_FACET_PACKAGES } from "./registry.js";
import {
  compareVersions,
  collectFacetDeps,
  detectMonorepo,
  detectPackageManager,
} from "./types.js";

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "facet-cmd-"));
}

function writePkg(dir: string, pkg: Record<string, unknown>) {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2));
}

const SAMPLE: FacetPackageInfo[] = [
  { name: "@fusorb/facet-auth", latest: "1.1.0", outdated: false },
  { name: "@fusorb/facet-cli", latest: "0.2.0", outdated: false },
  {
    name: "@fusorb/facet-components",
    latest: "1.2.0",
    installed: "1.1.0",
    declared: "^1.1.0",
    outdated: true,
  },
  { name: "@fusorb/facet-docs", latest: "1.2.0", outdated: false },
  { name: "@fusorb/facet-layout", latest: "1.1.1", outdated: false },
  { name: "@fusorb/facet-sdk", latest: "1.0.1", outdated: false },
  { name: "@fusorb/facet-tokens", latest: "1.1.0", outdated: false },
];

describe("planUpdates", () => {
  it("returns only outdated packages", () => {
    const updates = planUpdates(SAMPLE);
    expect(updates).toHaveLength(1);
    expect(updates[0]!.name).toBe("@fusorb/facet-components");
  });
});

describe("updateCommand", () => {
  it("builds a pnpm command", () => {
    expect(updateCommand("pnpm", [{ name: "@fusorb/facet-components", latest: "1.2.0" }])).toBe(
      "pnpm add @fusorb/facet-components@^1.2.0",
    );
  });

  it("adds -w for pnpm workspaces", () => {
    expect(
      updateCommand("pnpm", [{ name: "@fusorb/facet-components", latest: "1.2.0" }], true),
    ).toBe("pnpm -w add @fusorb/facet-components@^1.2.0");
  });

  it("builds npm and yarn commands", () => {
    expect(updateCommand("npm", [{ name: "@fusorb/facet-tokens", latest: "1.1.0" }])).toBe(
      "npm install @fusorb/facet-tokens@^1.1.0",
    );
    expect(updateCommand("yarn", [{ name: "@fusorb/facet-tokens", latest: "1.1.0" }])).toBe(
      "yarn workspace add @fusorb/facet-tokens@^1.1.0",
    );
  });
});

describe("formatPackageTable", () => {
  it("renders the header and rows", () => {
    const table = formatPackageTable(SAMPLE);
    expect(table).toContain("Package");
    expect(table).toContain("@fusorb/facet-components");
    expect(table).toContain("(update available)");
  });
});

describe("buildDoctorReport", () => {
  it("flags outdated packages and suggests update", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "app",
        dependencies: { "@fusorb/facet-components": "^1.1.0" },
      });
      const report = buildDoctorReport(dir, SAMPLE);
      expect(report.pm).toBe("npm");
      expect(report.monorepo).toBe(false);
      expect(report.outdated.map((i) => i.name)).toContain("@fusorb/facet-components");
      expect(report.suggestions.some((s) => s.includes("facet update"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("suggests tokens when components are used without tokens", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "app",
        dependencies: { "@fusorb/facet-components": "^1.2.0" },
      });
      const infos: FacetPackageInfo[] = [
        { name: "@fusorb/facet-components", latest: "1.2.0", declared: "^1.2.0", outdated: false },
        ...SAMPLE.filter((i) => i.name !== "@fusorb/facet-components"),
      ];
      const report = buildDoctorReport(dir, infos);
      expect(report.suggestions.some((s) => s.includes("facet-tokens"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("warns on workspace:* dependency for publish-time", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "app",
        dependencies: { "@fusorb/facet-components": "workspace:*" },
      });
      const infos: FacetPackageInfo[] = [
        { name: "@fusorb/facet-components", latest: "1.2.0", declared: "workspace:*", outdated: false },
        ...SAMPLE.filter((i) => i.name !== "@fusorb/facet-components"),
      ];
      const report = buildDoctorReport(dir, infos);
      expect(report.suggestions.some((s) => s.includes("workspace:*"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("detectMonorepo", () => {
  it("detects pnpm workspaces from pnpm-workspace.yaml", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "root" });
      fs.writeFileSync(
        path.join(dir, "pnpm-workspace.yaml"),
        "packages:\n  - \"client\"\n  - \"server\"\n",
      );
      expect(detectMonorepo(dir)).toEqual(["client", "server"]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects package.json workspaces field", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "root", workspaces: ["packages/*", "apps/*"] });
      expect(detectMonorepo(dir)).toEqual(["packages/*", "apps/*"]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns null for a single package", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app", dependencies: { react: "^19" } });
      expect(detectMonorepo(dir)).toBeNull();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("collectFacetDeps", () => {
  it("collects facet deps from workspace members (direct-dir globs)", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "root" });
      fs.writeFileSync(path.join(dir, "pnpm-workspace.yaml"), "packages:\n  - client\n");
      fs.mkdirSync(path.join(dir, "client"));
      writePkg(path.join(dir, "client"), {
        name: "client",
        dependencies: {
          "@fusorb/facet-components": "1.2.0",
          "@fusorb/facet-tokens": "1.1.0",
        },
      });
      const deps = collectFacetDeps(dir);
      expect(deps["@fusorb/facet-components"]).toBe("1.2.0");
      expect(deps["@fusorb/facet-tokens"]).toBe("1.1.0");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("readInstalledVersion", () => {
  it("reads the version from node_modules/<pkg>/package.json", () => {
    const dir = tmp();
    try {
      const pkgDir = path.join(dir, "node_modules", "@fusorb", "facet-auth");
      fs.mkdirSync(pkgDir, { recursive: true });
      writePkg(pkgDir, { name: "@fusorb/facet-auth", version: "1.1.1" });
      expect(readInstalledVersion([dir], "@fusorb/facet-auth")).toBe("1.1.1");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns undefined when the package is not installed", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      expect(readInstalledVersion([dir], "@fusorb/facet-not-there")).toBeUndefined();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("compareVersions", () => {
  it("compares semver strings", () => {
    expect(compareVersions("1.2.0", "1.1.0")).toBeGreaterThan(0);
    expect(compareVersions("1.1.0", "1.2.0")).toBeLessThan(0);
    expect(compareVersions("1.2.0", "1.2.0")).toBe(0);
  });
});

describe("discoverFacetPackages", () => {
  it("always includes the baseline facet packages", async () => {
    const names = await discoverFacetPackages();
    for (const pkg of ALL_FACET_PACKAGES) {
      expect(names).toContain(pkg);
    }
  });

  it("only returns @fusorb/facet-* scoped packages", async () => {
    const names = await discoverFacetPackages();
    for (const n of names) {
      expect(n.startsWith("@fusorb/facet-")).toBe(true);
    }
  });
});

describe("detectPackageManager", () => {
  it("detects pnpm from the lockfile", () => {
    const dir = tmp();
    try {
      fs.writeFileSync(path.join(dir, "pnpm-lock.yaml"), "");
      expect(detectPackageManager(dir)).toBe("pnpm");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("isFacetPackage", () => {
  it("returns true for @fusorb/facet-* names", () => {
    expect(isFacetPackage("@fusorb/facet-layout")).toBe(true);
    expect(isFacetPackage("@fusorb/facet-components")).toBe(true);
  });

  it("returns false for non-facet names", () => {
    expect(isFacetPackage("react")).toBe(false);
    expect(isFacetPackage("Button")).toBe(false);
    expect(isFacetPackage("@radix-ui/react-dialog")).toBe(false);
  });
});

describe("resolveFacetPackageName", () => {
  it("resolves full package names as-is", () => {
    expect(resolveFacetPackageName("@fusorb/facet-components")).toBe("@fusorb/facet-components");
    expect(resolveFacetPackageName("@fusorb/facet-layout")).toBe("@fusorb/facet-layout");
  });

  it("resolves shorthand names to full facet packages", () => {
    expect(resolveFacetPackageName("components")).toBe("@fusorb/facet-components");
    expect(resolveFacetPackageName("layout")).toBe("@fusorb/facet-layout");
    expect(resolveFacetPackageName("tokens")).toBe("@fusorb/facet-tokens");
    expect(resolveFacetPackageName("store")).toBe("@fusorb/facet-store");
    expect(resolveFacetPackageName("@fusorb/facet-store")).toBe("@fusorb/facet-store");
  });

  it("resolves scoped-dropped aliases (facet-cli -> @fusorb/facet-cli)", () => {
    expect(resolveFacetPackageName("facet-cli")).toBe("@fusorb/facet-cli");
    expect(resolveFacetPackageName("facet-components")).toBe("@fusorb/facet-components");
    expect(resolveFacetPackageName("facet-layout")).toBe("@fusorb/facet-layout");
  });

  it("returns undefined for non-facet component names (falls through to copy)", () => {
    expect(resolveFacetPackageName("Button")).toBeUndefined();
    expect(resolveFacetPackageName("react")).toBeUndefined();
    expect(resolveFacetPackageName("not-a-real-pkg")).toBeUndefined();
  });
});

describe("installFacetPackages", () => {
  it("builds a pnpm command with version", () => {
    expect(
      installFacetPackages("pnpm", [{ name: "@fusorb/facet-layout", latest: "1.2.0" }]),
    ).toBe("pnpm add @fusorb/facet-layout@^1.2.0");
  });

  it("adds -w for pnpm workspaces", () => {
    expect(
      installFacetPackages("pnpm", [{ name: "@fusorb/facet-layout", latest: "1.2.0" }], true),
    ).toBe("pnpm -w add @fusorb/facet-layout@^1.2.0");
  });

  it("joins multiple packages into one command", () => {
    expect(
      installFacetPackages("pnpm", [
        { name: "@fusorb/facet-layout", latest: "1.2.0" },
        { name: "@fusorb/facet-tokens", latest: "1.1.0" },
      ]),
    ).toBe("pnpm add @fusorb/facet-layout@^1.2.0 @fusorb/facet-tokens@^1.1.0");
  });

  it("builds npm and yarn commands", () => {
    expect(
      installFacetPackages("npm", [{ name: "@fusorb/facet-tokens", latest: "1.1.0" }]),
    ).toBe("npm install @fusorb/facet-tokens@^1.1.0");
    expect(
      installFacetPackages("yarn", [{ name: "@fusorb/facet-tokens", latest: "1.1.0" }]),
    ).toBe("yarn workspace add @fusorb/facet-tokens@^1.1.0");
  });
});

describe("globalInstallFacetPackages", () => {
  it("builds npm command with -g and no caret", () => {
    expect(
      globalInstallFacetPackages("npm", [{ name: "@fusorb/facet-cli", latest: "0.8.0" }]),
    ).toBe("npm i -g @fusorb/facet-cli@0.8.0");
  });

  it("builds pnpm global command", () => {
    expect(
      globalInstallFacetPackages("pnpm", [{ name: "@fusorb/facet-cli", latest: "0.8.0" }]),
    ).toBe("pnpm add -g @fusorb/facet-cli@0.8.0");
  });

  it("builds yarn global command", () => {
    expect(
      globalInstallFacetPackages("yarn", [{ name: "@fusorb/facet-cli", latest: "0.8.0" }]),
    ).toBe("yarn global add @fusorb/facet-cli@0.8.0");
  });

  it("builds bun global command", () => {
    expect(
      globalInstallFacetPackages("bun", [{ name: "@fusorb/facet-cli", latest: "0.8.0" }]),
    ).toBe("bun add -g @fusorb/facet-cli@0.8.0");
  });

  it("joins multiple packages into one global command", () => {
    expect(
      globalInstallFacetPackages("pnpm", [
        { name: "@fusorb/facet-cli", latest: "0.8.0" },
        { name: "@fusorb/facet-layout", latest: "1.2.0" },
      ]),
    ).toBe("pnpm add -g @fusorb/facet-cli@0.8.0 @fusorb/facet-layout@1.2.0");
  });

  it("never emits a workspace -w flag", () => {
    expect(
      globalInstallFacetPackages("pnpm", [{ name: "@fusorb/facet-cli", latest: "0.8.0" }]),
    ).not.toContain(" -w");
  });
});
