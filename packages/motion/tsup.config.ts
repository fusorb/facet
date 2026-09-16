import { defineConfig } from "tsup";

/**
 * facet-motion bundles both framework-agnostic core (generators, values,
 * drivers, registry) and thin React bindings (react/). The `"use client"`
 * banner marks the published ESM entry as a client boundary so Next.js
 * (App Router / Turbopack) resolves `react` against the browser entry
 * instead of the `react-server` condition. It is harmless under Vite/webpack
 * and keeps the library usable in RSC trees.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/react/index.ts"],
  format: "esm",
  dts: true,
  clean: true,
  banner: {
    js: '"use client";',
  },
});
