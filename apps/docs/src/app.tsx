import { DocsApp } from "@fusorb/facet-docs";
import { demoConfig, demoPages } from "./demo-config.js";

/**
 * facet's own docs site: a thin consumer of @fusorb/facet-docs.
 * Everything renders from the config + pages passed below.
 */
export default function App() {
  return (
    <DocsApp
      config={demoConfig}
      pages={demoPages}
      topbar={
        <a
          href="https://github.com/fusorb/facet"
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
          href: "https://github.com/fusorb/facet",
          icon: "github",
        },
      ]}
    />
  );
}
