import { defineConfig } from "tsup";

/**
 * facet-docs is a config-driven docs engine. The `"use client"` banner marks
 * the published ESM entry as a client boundary so Next.js (App Router /
 * Turbopack) resolves `react-router-dom` against the browser entry instead of
 * the `react-server` condition where DOM APIs are absent.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  clean: true,
  banner: {
    js: '"use client";',
  },
});
