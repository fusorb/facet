import * as React from "react";
import { LiveCodePlayground } from "./LiveCodePlayground.js";
import { usageCode } from "../lib/usage.js";
import { extendedManifest, type DocsManifestEntry } from "../lib/manifest.js";
import { playgroundComponents } from "./playground-registry.js";

export interface PlaygroundPageProps {
  /** Manifest slug to pre-select. Defaults to "button". */
  defaultSlug?: string;
}

// Registry includes auth + layout + doc placeholders + demo-data wrappers so
// every manifest entry renders in the live preview (see playground-registry).
const liveComponents = playgroundComponents;

function useCategoryGroups(
  entries: DocsManifestEntry[],
): Array<{ category: string; entries: DocsManifestEntry[] }> {
  return React.useMemo(() => {
    const map = new Map<string, DocsManifestEntry[]>();
    for (const entry of entries) {
      const label = entry.category
        ? `${entry.category.charAt(0).toUpperCase()}${entry.category.slice(1)}`
        : "Components";
      const group = map.get(label) ?? [];
      group.push(entry);
      map.set(label, group);
    }
    return Array.from(map, ([category, entries]) => ({
      category,
      entries,
    })).sort((a, b) => a.category.localeCompare(b.category));
  }, [entries]);
}

/**
 * Centralised live playground. Renders a manifest-driven component selector
 * above a {@link LiveCodePlayground}, so any component can be edited live from
 * a single place instead of being hardcoded per component page.
 */
export function PlaygroundPage({ defaultSlug }: PlaygroundPageProps) {
  const initialSlug = React.useMemo(
    () =>
      defaultSlug ??
      extendedManifest.find((e) => e.slug === "button")?.slug ??
      extendedManifest[0]?.slug ??
      "button",
    [defaultSlug],
  );
  const [selectedSlug, setSelectedSlug] = React.useState(initialSlug);
  const groups = useCategoryGroups(extendedManifest);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="facet-playground-component"
          className="text-sm font-medium text-foreground"
        >
          Component
        </label>
        <select
          id="facet-playground-component"
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="max-w-sm rounded-md border bg-background px-3 py-1.5 text-sm text-foreground outline-none ring-1 ring-border"
        >
          {groups.map(({ category, entries }) => (
            <optgroup key={category} label={category}>
              {entries.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <LiveCodePlayground
        defaultCode={usageCode(selectedSlug)}
        components={liveComponents}
      />
    </div>
  );
}
