import { defineConfig } from "vitest/config";

/**
 * @fusorb/facet-native is framework-agnostic (no React DOM, no RN).
 * Tests run in the node environment — no jsdom or React plugin needed.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    globals: true,
    css: false,
    pool: "vmThreads",
    env: { NODE_ENV: "test" },
  },
});
