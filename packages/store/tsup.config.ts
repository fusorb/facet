import { defineConfig } from "tsup";

/**
 * `./native` is a second entry that bundles the React-Native SecureStore-backed
 * auth store, keeping the core `index` entry framework-agnostic.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/native.ts"],
  format: "esm",
  dts: true,
  clean: true,
});
