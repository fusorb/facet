import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      // Resolve facet packages to source so the docs site reflects the
      // latest component and docs-engine refinements without a dist rebuild.
      {
        find: /^@fusorb\/facet-docs$/,
        replacement: resolve(__dirname, "../../packages/docs/src/index.ts"),
      },
      {
        find: /^@fusorb\/facet-components\/light$/,
        replacement: resolve(
          __dirname,
          "../../packages/components/src/light.ts",
        ),
      },
      {
        find: /^@fusorb\/facet-components$/,
        replacement: resolve(
          __dirname,
          "../../packages/components/src/index.ts",
        ),
      },
    ],
  },
});
