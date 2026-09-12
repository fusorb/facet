import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: { port: 5174 },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      // Resolve facet packages to source during dev so the landing app
      // always reflects the latest component refinements - no stale
      // dist rebuild needed.
      { find: /^@fusorb\/facet-components\/light$/, replacement: resolve(__dirname, "../../packages/components/src/light.ts") },
      { find: /^@fusorb\/facet-components$/, replacement: resolve(__dirname, "../../packages/components/src/index.ts") },
      { find: /^@fusorb\/facet-layout$/, replacement: resolve(__dirname, "../../packages/layout/src/index.ts") },
    ],
  },
});
