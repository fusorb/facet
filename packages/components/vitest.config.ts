import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // React 19.2: react-dom/test-utils.act is a throwing deprecation stub.
      // RTL 16 imports act from there: point it at React's own act.
      "react-dom/test-utils": fileURLToPath(
        new URL("../../scripts/react-test-utils-shim.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["../../scripts/test-setup.ts"],
    css: true,
    // Components under test render large option lists (Select dropdowns with 80+
    // or 100+ items).  In jsdom the DOM cost is high, so the default 5s timeout is
    // too tight - bump to 30s to avoid CI flakes on slower runners.
    testTimeout: 30_000,
    // Windows worker spawn is unreliable for forks/threads: vmThreads is stable here.
    pool: "vmThreads",
    // React only exposes `act` in its development build.
    env: { NODE_ENV: "test" },
    // Radix portals / jest-dom keep DOM and spies across tests without this,
    // which falsely fails interaction tests (stale execCommand spies, etc.).
    restoreMocks: true,
    clearMocks: true,
  },
});
