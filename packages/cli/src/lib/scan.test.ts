import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scanRepo, detectOpenApi, draftDocs } from "./scan.js";

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "facet-scan-"));
}

function writePkg(dir: string, pkg: Record<string, unknown>) {
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify(pkg, null, 2),
  );
}

describe("scanRepo", () => {
  it("detects a plain frontend repo", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "app",
        dependencies: { "@fusorb/facet-components": "1.5.0" },
      });
      fs.writeFileSync(path.join(dir, "tsconfig.json"), "{}");
      const scan = scanRepo(dir);
      expect(scan.language).toBe("typescript");
      expect(scan.facetDeps["@fusorb/facet-components"]).toBe("1.5.0");
      expect(scan.api).toBeNull();
      expect(scan.monorepo).toBeNull();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects a Fastify + swagger API repo", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "api",
        dependencies: { "@fastify/swagger": "^9", fastify: "^5" },
      });
      fs.mkdirSync(path.join(dir, "src/api/plugins"), { recursive: true });
      fs.mkdirSync(path.join(dir, "src/api/routes"), { recursive: true });
      fs.writeFileSync(
        path.join(dir, "src/api/plugins/swagger.plugin.ts"),
        `import swagger from "@fastify/swagger";
fastify.register(swagger, {
  openapi: { info: { title: "SovGrant API", version: "1.0.0" } },
});`,
      );
      fs.writeFileSync(
        path.join(dir, "src/api/routes/auth.route.ts"),
        `fastify.get("/auth/session", { schema: { tags: ["Auth"] } }, handler);
fastify.post("/auth/login", { schema: { tags: ["Auth"] } }, handler);`,
      );
      const scan = scanRepo(dir);
      expect(scan.api).not.toBeNull();
      expect(scan.api!.info.title).toBe("SovGrant API");
      expect(scan.api!.routes.length).toBeGreaterThanOrEqual(2);
      expect(
        scan.api!.routes.some(
          (r) => r.method === "POST" && r.path === "/auth/login",
        ),
      ).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects a committed openapi.json", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "svc" });
      fs.writeFileSync(
        path.join(dir, "openapi.json"),
        JSON.stringify({
          openapi: "3.1.0",
          info: { title: "Service", version: "0.1.0" },
          paths: { "/health": { get: { summary: "Health" } } },
        }),
      );
      const api = detectOpenApi(dir, {});
      expect(api).not.toBeNull();
      expect(api!.routes).toHaveLength(1);
      expect(api!.routes[0]!.path).toBe("/health");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects existing docs", () => {
    const dir = tmp();
    try {
      writePkg(dir, { name: "app" });
      fs.writeFileSync(path.join(dir, "README.md"), "# App");
      fs.mkdirSync(path.join(dir, "docs/planning"), { recursive: true });
      fs.writeFileSync(path.join(dir, "docs/planning/notes.md"), "notes");
      const scan = scanRepo(dir);
      expect(scan.docs.readme).toBe(true);
      expect(scan.docs.markdownCount).toBeGreaterThanOrEqual(2);
      expect(scan.docs.planningFiles.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("draftDocs", () => {
  it("produces pages, config, and openapi files from a scan", () => {
    const dir = tmp();
    try {
      writePkg(dir, {
        name: "api",
        dependencies: { "@fastify/swagger": "^9" },
      });
      // The fixture uses .ts source files, so a tsconfig makes the language
      // detection agree and the draft pages/config are emitted as .ts.
      fs.writeFileSync(
        path.join(dir, "tsconfig.json"),
        JSON.stringify({ compilerOptions: {} }),
      );
      fs.mkdirSync(path.join(dir, "src/api/plugins"), { recursive: true });
      fs.mkdirSync(path.join(dir, "src/api/routes"), { recursive: true });
      fs.writeFileSync(
        path.join(dir, "src/api/plugins/swagger.plugin.ts"),
        `fastify.register(swagger, { openapi: { info: { title: "API", version: "1.0.0" } } });`,
      );
      fs.writeFileSync(
        path.join(dir, "src/api/routes/a.route.ts"),
        `fastify.get("/a", { schema: { tags: ["A"] } }, h);`,
      );
      const scan = scanRepo(dir);
      const files = draftDocs(scan, "docs");
      expect(files.some((f) => f.path.endsWith("pages.ts"))).toBe(true);
      expect(files.some((f) => f.path.endsWith("config.ts"))).toBe(true);
      expect(files.some((f) => f.path.endsWith("openapi.json"))).toBe(true);
      const pages = files.find((f) => f.path.endsWith("pages.ts"))!;
      expect(pages.content).toContain("API Reference");
      expect(pages.content).toContain("/a");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
