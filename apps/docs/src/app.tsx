import { DocsApp } from "@fusorb/facet-docs";
import type { PageActionItem } from "@fusorb/facet-docs";
import { demoConfig, demoPages } from "./demo-config.js";
import { surfaces } from "../../../surfaces.config.mjs";

const pageActions: PageActionItem[] = [
  {
    label: "Ask question",
    description: "Get help from the docs assistant",
    icon: "help-circle",
    separatorBefore: true,
    onClick: () => {
      // Hook this up to an AI agent integration for contextual help.
      window.open(`${surfaces.github}/discussions`, "_blank");
    },
  },
];

/**
 * facet's own docs site: a thin consumer of @fusorb/facet-docs.
 * Everything renders from the config + pages passed below.
 */
export default function App() {
  return (
    <DocsApp
      config={demoConfig}
      pages={demoPages}
      showTableOfContents
      topbar={
        <a
          href={surfaces.github}
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
        >
          GitHub
        </a>
      }
      links={[
        {
          label: "GitHub",
           href: surfaces.github,
          icon: "github",
        },
      ]}
      pageActions={pageActions}
    />
  );
}
