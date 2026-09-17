import { defineConfig } from "tsup";

/**
 * facet-native: single ESM entry, externalizes @fusorb/facet-tokens
 * so consumers resolve motion tokens from their own install.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  clean: true,
  external: ["@fusorb/facet-tokens"],
});
