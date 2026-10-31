import { defineConfig } from "tsup";

/**
 * facet-components is a client-only React component library. The `"use
 * client"` banner marks the published ESM entry points as client boundaries so
 * that Next.js (App Router / Turbopack) resolves `react-hook-form` and other
 * client-only imports against the browser entry instead of the `react-server`
 * condition (where `Controller`, `FormProvider`, `useForm`, ... are absent and
 * the build throws "Export X doesn't exist in target module"). It is harmless
 * under Vite/webpack and keeps the library usable in RSC trees.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/theme/index.ts", "src/icons.ts", "src/light.ts", "src/examples.ts"],
  format: "esm",
  dts: true,
  clean: true,
  banner: {
    js: '"use client";',
  },
});
