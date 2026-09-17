import { defineConfig } from "tsup";

/**
 * facet-sandbox bundles a framework-agnostic host (src/index.ts) and a thin
 * React adapter (src/react/index.tsx). The `"use client"` banner marks the
 * published ESM entry as a client boundary so Vite/Next.js resolves `react`
 * against the browser entry instead of the `react-server` condition. It is
 * harmless under plain <script> usage and keeps the library usable in RSC trees.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/react/index.tsx"],
  format: "esm",
  dts: true,
  clean: true,
  // react is an (optional) peer dependency and is externalized automatically;
  // prettier is optional — formatting degrades to a no-op when it's absent.
  external: [/^react/, /^react-dom/, /^prettier/],
  banner: {
    js: '"use client";',
  },
});
