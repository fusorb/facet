import { describe, expect, it, vi } from "vitest";
import prompts from "prompts";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runInitWizard } from "./wizard.js";
import { generateReactVite } from "./generators.js";
import { writeFiles } from "./writer.js";
import { resolveFacetVersions } from "./registry.js";

// Simulate a consumer answering the wizard. The first prompts call is the
// mode question (decide-for-me vs walk); the second is the walk-through
// questions. Return both based on call order.
vi.mock("prompts", () => ({
  default: vi.fn(async () => {
    const call = vi.mocked(prompts).mock.calls.length - 1;
    if (call === 0) {
      // Mode question: "walk me through it".
      return { decide: "walk" };
    }
    // Walk-through questions.
    return {
      name: "demo",
      location: ".",
      language: true, // TypeScript toggle
      framework: "react-vite",
      styling: "facet-tokens",
      useFacetTokens: true,
      template: "component-library",
      barrel: "auto",
    };
  }),
}));

const mockPrompts = vi.mocked(prompts);

describe("facet docs init end-to-end (wizard + write)", () => {
  it("resolves current versions from the registry", async () => {
    const versions = await resolveFacetVersions();
    expect(versions["@fusorb/facet-docs"]).toMatch(/^\^/);
  });

  it("runs the wizard and writes a real scaffold to disk", async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "facet-e2e-"));
    try {
      const { answers } = await runInitWizard(cwd);
      expect(answers.name).toBe("demo");
      expect(answers.framework).toBe("react-vite");

      const files = generateReactVite(answers, cwd);
      const written = writeFiles(files);
      expect(written.length).toBeGreaterThan(0);

      // The scaffolded package.json exists and carries resolved ranges.
      const pkg = JSON.parse(
        fs.readFileSync(path.join(cwd, "package.json"), "utf8"),
      );
      expect(pkg.dependencies["@fusorb/facet-docs"]).toMatch(/^\^/);

      // The consumer's own pages file exists (never facet's authored docs).
      const pages = fs.readFileSync(path.join(cwd, "src", "pages.ts"), "utf8");
      expect(pages).toContain("docsPages");
      expect(pages).not.toContain("DocsApp");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("--yes runs non-interactive (decide for me) with detected defaults", async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "facet-e2e-"));
    try {
      // A Vite consumer repo, so detection picks react-vite.
      fs.mkdirSync(path.join(cwd, "src"), { recursive: true });
      fs.writeFileSync(path.join(cwd, "vite.config.ts"), "");
      const { answers, decided } = await runInitWizard(cwd, { yes: true });
      expect(decided).toBe(true);
      expect(answers.framework).toBe("react-vite");
      expect(answers.location).toBe(".");
      expect(answers.name).toBe("Facet");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("explicit options override decided defaults", async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "facet-e2e-"));
    try {
      const { answers } = await runInitWizard(cwd, {
        yes: true,
        name: "my-docs",
        framework: "plain-js",
        language: "javascript",
      });
      expect(answers.name).toBe("my-docs");
      expect(answers.framework).toBe("plain-js");
      expect(answers.language).toBe("javascript");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("wizard-level 'decide for me' short-circuits to detected defaults", async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "facet-e2e-"));
    try {
      // Simulate a consumer picking "Decide for me" at the first prompt.
      mockPrompts.mockReturnValue({ decide: "decide" } as never);
      const { answers, decided } = await runInitWizard(cwd);
      expect(decided).toBe(true);
      expect(answers.name).toBe("Facet"); // default when blank
      expect(answers.barrel).toBe("auto");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("blank name falls back to the default", async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "facet-e2e-"));
    try {
      mockPrompts.mockReturnValue({
        decide: "walk",
        name: "",
        location: ".",
        language: true,
        framework: "react-vite",
        styling: "facet-tokens",
        useFacetTokens: true,
        template: "component-library",
        barrel: "never",
      } as never);
      const { answers, decided } = await runInitWizard(cwd);
      expect(decided).toBe(false);
      expect(answers.name).toBe("Facet");
      expect(answers.barrel).toBe(false);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });
});
