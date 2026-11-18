import type { DocsSiteConfig } from "@fusorb/facet-docs";
import { Icon } from "@fusorb/facet-components";
import { surfaces } from "../../../surfaces.config.mjs";

export const docsConfig: DocsSiteConfig = {
  brand: {
    name: "facet",
    tagline: "Domain-customizable, auth-first UI for the Fusorb ecosystem.",
  },
  navigation: [
    {
      label: "Ecosystem",
      items: [
        {
          label: "Playground",
          href: surfaces.playground.dev,
          external: true,
          icon: <Icon name="play" className="size-4" aria-hidden="true" />,
        },
        {
          label: "Landing",
          href: surfaces.landing.dev,
          external: true,
          icon: <Icon name="globe" className="size-4" aria-hidden="true" />,
        },
        {
          label: "GitHub",
          href: surfaces.github,
          external: true,
          icon: <Icon name="github" className="size-4" aria-hidden="true" />,
        },
      ],
    },
  ],
};
