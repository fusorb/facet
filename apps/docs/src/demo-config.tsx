import type { DocsPage, DocsSiteConfig } from "@fusorb/facet-docs";
import { docsPages } from "./pages.js";
import { BrandMark } from "./components/brand.js";

/**
 * Demo instance configuration for facet's own docs site.
 *
 * This is exactly what an external consumer (SovGrant, Relnex, SovPort)
 * would write: a DocsSiteConfig (brand + nav + ecosystem links) plus their
 * own pages. facet dogfoods its docs package here: the pages registry
 * (./pages.ts) is facet's own content, kept out of the package.
 */

export const demoConfig: DocsSiteConfig = {
  brand: {
    name: "facet",
    tagline: "Domain-customizable auth-first component system",
    logo: <BrandMark className="h-5 w-5 text-sm" />,
  },
  navigation: [],
  // Ecosystem links are intentionally omitted; the registry's ecosystem
  // pages render under the sidebar's "Ecosystem" section.
};

export const demoPages: DocsPage[] = docsPages;
