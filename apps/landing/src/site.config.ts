import type { IconName } from "@fusorb/facet-components";

/**
 * Single source of truth for the landing site.
 *
 * Every brand string, link, and contact value lives here so nothing is
 * duplicated across section/page files. Package versions and stats are
 * NOT here: they are generated at build time into
 * `data/site-data.generated.ts` by `scripts/gen-site-data.mjs`.
 */

/** Resolves the facet docs URL for the current environment.
 *  During `vite dev` we point at the local docs site (port 5173) so the
 *  landing and docs sites can be validated together before release. */
export function getDocsUrl(): string {
  return import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://github.com/fusorb/facet/tree/main/packages/docs";
}

export interface SiteSocial {
  label: string;
  href: string;
  icon: IconName;
}

const socials: SiteSocial[] = [
  { label: "GitHub", href: "https://github.com/fusorb/facet", icon: "github" },
];

export const site = {
  brand: {
    name: "facet",
    tagline: "Domain-customizable auth-first component system",
    /** Letter used by the minimal monogram mark until a final logo lands. */
    monogram: "f",
  },
  links: {
    github: "https://github.com/fusorb/facet",
  },
  feedbackEmail: "feedback@facet.dev",
  socials,
} as const;

export type SiteConfig = typeof site;
