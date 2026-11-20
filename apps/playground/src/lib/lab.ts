import type { Example } from "@fusorb/facet-sandbox/core";
import { listComponents } from "@fusorb/facet-registry";
import { buildExampleMap } from "./example-map.js";
import { layoutExamples, layoutItemMeta } from "../examples/layout-examples.js";
import { motionExamples, motionItemMeta } from "../examples/motion-examples.js";

export type PlaygroundKind = "components" | "layouts" | "motion";

export interface LabItem {
  kind: PlaygroundKind;
  id: string;
  name: string;
  category: string;
  summary: string;
  exampleCount: number;
}

export interface LabCatalog {
  kind: PlaygroundKind;
  label: string;
  items: LabItem[];
  examplesById: Record<string, Example<Record<string, unknown>>[]>;
}

const KIND_LABELS: Record<PlaygroundKind, string> = {
  components: "Components",
  layouts: "Layouts",
  motion: "Motion",
};

export const PLAYGROUND_KINDS: PlaygroundKind[] = ["components", "layouts", "motion"];

function buildComponentsCatalog(): LabCatalog {
  const examplesById = buildExampleMap() as Record<string, Example<Record<string, unknown>>[]>;
  const items: LabItem[] = listComponents().map((component) => ({
    kind: "components",
    id: component.slug,
    name: component.name,
    category: component.category || "components",
    summary: component.summary,
    exampleCount: (examplesById[component.slug] ?? []).length,
  }));
  return { kind: "components", label: KIND_LABELS.components, items, examplesById };
}

function buildLayoutsCatalog(): LabCatalog {
  const examplesById = layoutExamples as Record<string, Example<Record<string, unknown>>[]>;
  const items: LabItem[] = layoutItemMeta.map((meta) => ({
    kind: "layouts",
    id: meta.id,
    name: meta.name,
    category: meta.category,
    summary: meta.summary,
    exampleCount: (examplesById[meta.id] ?? []).length,
  }));
  return { kind: "layouts", label: KIND_LABELS.layouts, items, examplesById };
}

function buildMotionCatalog(): LabCatalog {
  const examplesById = motionExamples as Record<string, Example<Record<string, unknown>>[]>;
  const items: LabItem[] = motionItemMeta.map((meta) => ({
    kind: "motion",
    id: meta.id,
    name: meta.name,
    category: meta.category,
    summary: meta.summary,
    exampleCount: (examplesById[meta.id] ?? []).length,
  }));
  return { kind: "motion", label: KIND_LABELS.motion, items, examplesById };
}

export function buildLabCatalogs(): Record<PlaygroundKind, LabCatalog> {
  return {
    components: buildComponentsCatalog(),
    layouts: buildLayoutsCatalog(),
    motion: buildMotionCatalog(),
  };
}

export function isPlaygroundKind(value: string): value is PlaygroundKind {
  return (PLAYGROUND_KINDS as string[]).includes(value);
}

export function kindLabel(kind: PlaygroundKind): string {
  return KIND_LABELS[kind];
}
