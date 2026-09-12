import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  generateComponentAdd,
  resolveAddLayout,
  type AddAnswers,
} from "./generators-plain.js";
import { writeFiles } from "./writer.js";

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "facet-add-"));
}

function runAdd(component: string, cwd: string, answers: AddAnswers) {
  const files = generateComponentAdd(component, cwd, answers);
  return { files, written: writeFiles(files) };
}

describe("facet add <component> end-to-end", () => {
  it("decide (no existing barrel) -> subdir with facet barrel", () => {
    const cwd = tmp();
    try {
      const { written } = runAdd("Button", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "decide",
      });
      const file = path.join(cwd, "src", "components", "facet", "Button.tsx");
      expect(written).toContain(file);
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf8");
      expect(content).toContain('import { Button } from "@fusorb/facet-components"');
      expect(content).toContain("export default Button");

      // The facet barrel re-exports the component by name.
      const barrel = fs.readFileSync(
        path.join(cwd, "src", "components", "facet", "index.ts"),
        "utf8",
      );
      expect(barrel).toContain('export { default as Button } from "./Button.tsx"');
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("keeps the facet barrel current as components are added", () => {
    const cwd = tmp();
    try {
      runAdd("Button", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "decide",
      });
      runAdd("Badge", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "decide",
      });
      const barrel = fs.readFileSync(
        path.join(cwd, "src", "components", "facet", "index.ts"),
        "utf8",
      );
      expect(barrel).toContain('export { default as Button } from "./Button.tsx"');
      expect(barrel).toContain('export { default as Badge } from "./Badge.tsx"');
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("flat mode places the component in the root and merges into the existing root barrel", () => {
    const cwd = tmp();
    try {
      // Pre-existing consumer root barrel with their own export.
      const root = path.join(cwd, "src", "components");
      fs.mkdirSync(root, { recursive: true });
      fs.writeFileSync(
        path.join(root, "index.ts"),
        "export { default as TheirThing } from \"./TheirThing\";\n",
      );

      const { written } = runAdd("Button", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "flat",
      });
      expect(written).toContain(path.join(root, "Button.tsx"));

      const barrel = fs.readFileSync(path.join(root, "index.ts"), "utf8");
      // Consumer's own export preserved.
      expect(barrel).toContain("TheirThing");
      // Flat component exposed by name.
      expect(barrel).toContain('export { default as Button } from "./Button.tsx"');
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("decide with an existing root barrel -> flat (no facet subdir)", () => {
    const cwd = tmp();
    try {
      const root = path.join(cwd, "src", "components");
      fs.mkdirSync(root, { recursive: true });
      fs.writeFileSync(path.join(root, "index.ts"), "export {};\n");

      const { written } = runAdd("Card", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "decide",
      });
      expect(written).toContain(path.join(root, "Card.tsx"));
      expect(written).not.toContain(path.join(root, "facet", "Card.tsx"));
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("barrel: false never creates or touches a barrel", () => {
    const cwd = tmp();
    try {
      const { written } = runAdd("Button", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "decide",
        barrel: false,
      });
      const facetBarrel = path.join(cwd, "src", "components", "facet", "index.ts");
      expect(fs.existsSync(facetBarrel)).toBe(false);
      expect(written.some((f) => f.endsWith("/index.ts"))).toBe(false);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("barrel: true creates a facet barrel even when no root barrel exists", () => {
    const cwd = tmp();
    try {
      const { written } = runAdd("Button", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "decide",
        barrel: true,
      });
      expect(written).toContain(
        path.join(cwd, "src", "components", "facet", "index.ts"),
      );
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("custom --ui-dir name is honored", () => {
    const cwd = tmp();
    try {
      const { written } = runAdd("Button", cwd, {
        language: "typescript",
        target: "src/components",
        placement: "subdir",
        dir: "ui",
      });
      expect(written).toContain(path.join(cwd, "src", "components", "ui", "Button.tsx"));
      expect(written).toContain(path.join(cwd, "src", "components", "ui", "index.ts"));
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("resolveAddLayout picks flat when a root barrel exists", () => {
    const cwd = tmp();
    try {
      const root = path.join(cwd, "src", "components");
      fs.mkdirSync(root, { recursive: true });
      fs.writeFileSync(path.join(root, "index.ts"), "export {};\n");
      const layout = resolveAddLayout(
        { language: "typescript", target: "src/components", placement: "decide" },
        cwd,
      );
      expect(layout.mode).toBe("flat");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });
});
