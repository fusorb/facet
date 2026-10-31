// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { docsManifest } from "./manifest";

// packages/docs/src -> packages/docs -> packages -> workspace root
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../",
);
const uiDir = path.join(root, "packages/components/src/ui");

const EXCLUDED = new Set(["typewriter-text"]);
const VALID_CATEGORIES = new Set([
  "layout",
  "feedback",
  "inputs",
  "data-display",
  "ready-to-use",
  "animation",
  "pages",
  "foundations",
  "general",
]);

// Regression guard for the "one manifest bug breaks all consumer docs sites"
// risk: the committed manifest must stay in lock-step with the real component
// sources, with no stale/hand-edited entries.
describe("docs manifest parity (packages/docs/src/manifest.ts)", () => {
  it("documents every shipped component and nothing stale", () => {
    const uiFiles = fs
      .readdirSync(uiDir)
      .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx") && !f.endsWith(".examples.tsx"))
      .map((f) => f.replace(/\.tsx$/, ""))
      .filter((s) => !EXCLUDED.has(s))
      .sort();

    const componentSlugs = docsManifest
      .filter((e) => e.category !== "foundations")
      .map((e) => e.slug)
      .sort();

    expect(componentSlugs).toEqual(uiFiles);
  });

  it("does not duplicate any slug", () => {
    const slugs = docsManifest.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only uses known sidebar category groups", () => {
    for (const e of docsManifest) {
      expect(
        VALID_CATEGORIES.has(e.category),
        `unknown category for ${e.slug}: ${e.category}`,
      ).toBe(true);
    }
  });
});
