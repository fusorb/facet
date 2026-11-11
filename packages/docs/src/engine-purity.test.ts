// @vitest-environment node
import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("engine purity (L3)", () => {
  it("packages/docs/src contains no @fusorb/* runtime imports", { timeout: 15000 }, () => {
    const root = path.resolve(__dirname, "..");
    const srcDir = path.join(root, "src");
    const violations: string[] = [];
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === "dist") return;
          walk(full);
        } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes(".test.")) {
          const src = fs.readFileSync(full, "utf-8");
          const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
          if (/@fusorb\/facet-(auth|sdk)/.test(code)) {
            violations.push(full);
          }
        }
      }
    }
    walk(srcDir);
    expect(violations).toEqual([]);
  });
});
