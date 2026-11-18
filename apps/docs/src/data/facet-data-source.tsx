import type { DocsDataSource, DocsPage, Example, RegistryComponent } from "@fusorb/facet-docs";
import registryJson from "@fusorb/facet-registry/registry.json";
import * as allExamples from "@fusorb/facet-components/examples";

const examplesBySlug: Record<string, Example[]> = {};
for (const value of Object.values(allExamples)) {
  if (!Array.isArray(value)) continue;
  for (const ex of value as Example[]) {
    if (!ex || typeof ex !== "object" || !("artifact" in ex)) continue;
    const artifact = (ex as Example).artifact;
    (examplesBySlug[artifact] ??= []).push(ex as Example);
  }
}

const components = (registryJson as { components: RegistryComponent[] }).components;

export const docsPages: DocsPage[] = [
  {
    path: "/",
    title: "Overview",
    section: "guides",
    description: "Facet documentation (rebuilding).",
    blocks: [
      { type: "p", text: "Facet is a domain-customizable, auth-first UI ecosystem for Fusorb/SovGrant. This docs app is being rebuilt from scratch on top of @fusorb/facet-docs." },
      { type: "h2", text: "What’s here now" },
      { type: "ul", items: [
        "A clean docs shell consuming the installable docs engine.",
        "Component gallery powered by @fusorb/facet-components/examples and @fusorb/facet-registry.",
        "Guides/content to be restored and expanded incrementally.",
      ]},
    ],
  },
];

export const facetDocsDataSource: DocsDataSource = {
  getComponentManifest: () => components,
  getComponentExamples: (slug: string) => examplesBySlug[slug] ?? [],
  renderExample: (example: Example) => {
    try {
      if (typeof example?.render === "function") {
        return example.render((example.defaults ?? {}) as Record<string, unknown>);
      }
    } catch {
      return null;
    }
    return null;
  },
  getRegistry: () => registryJson as unknown,
};
