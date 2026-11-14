/**
 * Canonical surface configuration for the Facet workspace.
 *
 * Single source of truth for origins, routes, and shared presets.
 * Imported by:
 *   - packages/registry/src/scan.mjs (generates registry.surfaces)
 *   - apps/landing/src/site.config.ts (site URLs, replaces F10 hard-coding)
 *   - apps/docs/src/app.tsx (GitHub links)
 *   - apps/playground/src/App.tsx (cross-app links)
 *
 * L6: No app writes another app's URL by hand  -  they read from here.
 */

export const surfaces = {
  landing: {
    dev: "http://localhost:5174",
    // Planned domain (not yet purchased): facet as a product on fusorb.com.
    prod: "https://facet.fusorb.com",
  },
  docs: {
    dev: "http://localhost:5173",
    prod: "https://docs.facet.fusorb.com",
  },
  playground: {
    dev: "http://localhost:5175",
    prod: "https://playground.facet.fusorb.com",
  },
  github: "https://github.com/fusorb/facet",
  npm: "https://www.npmjs.com/org/fusorb",
  npmPackageScope: "https://www.npmjs.com/package",
};

export const domains = ["default", "fintech", "med", "edu", "enterprise"];
export const viewportPresets = ["desktop", "tablet", "mobile", "16:9", "4:3", "1:1", "9:16"];
export const themes = { light: "app", dark: "app-dark" };
export const colorSpace = "OKLCH";
