import { defineConfig } from "vitest/config";

// Some environments set NODE_ENV=production globally; React then ships its
// production build and `react-dom/test-utils.act` becomes a throwing stub.
// Force the test environment so React exposes `act` for @testing-library/react.
process.env.NODE_ENV = "test";

// Vitest 4: workspace is configured via `test.projects` (the old
// `vitest.workspace.ts` / `defineWorkspace` API was removed). Each entry
// resolves a package's own vitest.config.ts, so root, environment, and
// include patterns stay package-local.
export default defineConfig({
  test: {
    projects: [
      "packages/sdk/vitest.config.ts",
      "packages/store/vitest.config.ts",
      "packages/components/vitest.config.ts",
      "packages/auth/vitest.config.ts",
      "packages/layout/vitest.config.ts",
      "packages/cli/vitest.config.ts",
      "packages/motion/vitest.config.ts",
      "packages/emails/vitest.config.ts",
      "packages/native/vitest.config.ts",
      "packages/docs/vitest.config.ts",
    ],
  },
});
