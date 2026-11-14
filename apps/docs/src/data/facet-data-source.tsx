// @ts-expect-error - registry json is a workspace source asset
import registryJson from "@fusorb/facet-registry/src/registry.json";
import type { Example, RegistryComponent } from "@fusorb/facet-docs";
import { Button } from "@fusorb/facet-components";
import * as allExamples from "@fusorb/facet-components/examples";

function DefaultPreview({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        {name}
      </div>
      <span className="text-[10px] text-muted-foreground">Live preview</span>
    </div>
  );
}

const examplesBySlug: Record<string, Example[]> = {};
for (const value of Object.values(allExamples)) {
  if (!Array.isArray(value)) continue;
  for (const ex of value as Example[]) {
    if (!ex?.artifact) continue;
    (examplesBySlug[ex.artifact] ??= []).push(ex);
  }
}

const components = (registryJson as { components: RegistryComponent[] }).components;

export const facetDataSource = {
  getComponentManifest: () => components,
  getComponentPreview: (slug: string) => {
    if (slug === "button") {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="secondary">
            Secondary
          </Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
        </div>
      );
    }
    const entry = components.find((c) => c.slug === slug);
    return <DefaultPreview name={entry?.name ?? slug} />;
  },
  getComponentExamples: (slug: string) => examplesBySlug[slug] ?? [],
  renderExample: (example: Example) => {
    try {
      if (typeof example?.render === "function") {
        return example.render((example.defaults ?? {}) as Record<string, unknown>);
      }
    } catch {
      return <div className="text-xs text-destructive">Example failed to render.</div>;
    }
    return <div className="text-xs text-muted-foreground">No render function.</div>;
  },
  getRegistry: () => registryJson as unknown,
};
