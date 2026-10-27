import { defineConfig } from "tsup";

/**
 * facet-layout is a client-only React app-shell (Sidebar, Topbar, providers).
 * The `"use client"` banner keeps it usable inside Next.js App Router RSC
 * trees by resolving its React/client imports against the browser entry.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/skeleton/index.tsx"],
  format: "esm",
  dts: true,
  clean: true,
  banner: {
    js: '"use client";',
  },
});
