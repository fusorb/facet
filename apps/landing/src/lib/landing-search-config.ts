import type { LayoutConfig } from "@fusorb/facet-layout";
import { ALL_COMPONENTS, PACKAGES } from "../data/scratchpad.js";
import { getDocsUrl } from "../site.config.js";

/**
 * LayoutConfig used by the facet-layout <CommandPalette /> to derive
 * searchable command items, grouped by type (Components / Packages / Docs / Labs).
 */
export const landingSearchConfig: LayoutConfig = {
  brand: { name: "facet" },
  navigation: [
    {
      title: "Components",
      id: "components",
      items: ALL_COMPONENTS.map((c) => ({
        href: `/components/${c.name}`,
        label: c.name,
        keywords: [
          c.name.toLowerCase(),
          c.category.toLowerCase(),
          c.pkg.toLowerCase(),
        ],
      })),
    },
    {
      title: "Packages",
      id: "packages",
      items: PACKAGES.map((p) => ({
        href: `https://www.npmjs.com/package/${p.name}`,
        label: p.name,
        keywords: [
          p.name.toLowerCase(),
          p.short.toLowerCase(),
          p.desc.toLowerCase(),
        ],
      })),
    },
    {
      title: "Docs",
      id: "docs",
      items: [
        {
          href: getDocsUrl(),
          label: "Documentation",
          keywords: ["docs", "documentation", "reference", "api"],
        },
      ],
    },
    {
      title: "Labs",
      id: "labs",
      items: [
        { href: "/auth", label: "Auth Lab" },
        { href: "/motion", label: "Motion Lab" },
        { href: "/tokens", label: "Tokens Lab" },
      ],
    },
  ],
};
