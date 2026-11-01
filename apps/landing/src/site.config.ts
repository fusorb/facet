import type { IconName } from "@fusorb/facet-components";
import { surfaces } from "../../../surfaces.config.mjs";

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
  return import.meta.env.DEV ? surfaces.docs.dev : surfaces.docs.prod;
}

/** Resolves the facet docs changelog URL for the current environment. */
export function getDocsChangelogUrl(): string {
  return `${getDocsUrl()}/changelog`;
}

/** Resolves the facet playground URL for the current environment. */
export function getPlaygroundUrl(): string {
  return import.meta.env.DEV ? surfaces.playground.dev : surfaces.playground.prod;
}

export interface SiteSocial {
  label: string;
  href: string;
  icon: IconName;
}

const socials: SiteSocial[] = [
  { label: "GitHub", href: surfaces.github, icon: "github" },
];

export const site = {
  brand: {
    name: "facet",
    tagline: "Domain-customizable auth-first component system",
    /** Letter used by the minimal monogram mark until a final logo lands. */
    monogram: "f",
  },
  links: {
    github: surfaces.github,
  },
  feedbackEmail: "feedback@facet.dev",
  socials,
  techBadges: ["React 19", "TypeScript", "Radix UI", "Tailwind CSS v4"],
} as const;

export type SiteConfig = typeof site;
