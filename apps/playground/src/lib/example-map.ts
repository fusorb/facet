import type { Example } from "@fusorb/facet-sandbox/core";
import * as examplesNs from "@fusorb/facet-components/examples";

export type ExampleList = Example<Record<string, unknown>>[];
export type ExampleMap = Record<string, ExampleList>;

/**
 * Build a map from component slug -> Example[] by scanning every exported
 * `*Examples` array in @fusorb/facet-components/examples. Each Example
 * declares its own `artifact` (the slug), so the barrel is self-describing.
 */
export function buildExampleMap(): ExampleMap {
  const map: ExampleMap = {};
  for (const value of Object.values(examplesNs)) {
    if (!Array.isArray(value) || value.length === 0) continue;
    const first = value[0] as Example<Record<string, unknown>> | undefined;
    const artifact = first?.artifact;
    if (typeof artifact !== "string" || !artifact) continue;
    map[artifact] = value as ExampleList;
  }
  return map;
}
