import type { DocsPage, DocsSiteConfig } from "@fusorb/facet-docs";
import { docsPages } from "./pages.js";
import { createElement } from "react";

/**
 * Demo instance configuration for facet's own docs site.
 *
 * This is exactly what an external consumer (arc-id, arcbase, arc-wallet)
 * would write: a DocsSiteConfig (brand + nav + ecosystem links) plus their
 * own pages. facet dogfoods its docs package here: the pages registry
 * (./pages.ts) is facet's own content, kept out of the package.
 */

export const demoConfig: DocsSiteConfig = {
  brand: {
    name: "facet",
    tagline: "Component library for the Arcevo ecosystem",
    logo: createElement("img", {
      src: "/facet-b&w.png",
      alt: "facet",
      className: "h-5 w-auto dark:invert",
    }),
  },
  navigation: [],
  // arc-id is an ecosystem page in the registry (section "ecosystem"), so
  // it already renders under the sidebar's "Ecosystem" section. External
  // consumers point config.ecosystem links at their own hosted docs
  // instead of adding in-tree pages.
};

export const demoPages: DocsPage[] = docsPages;
