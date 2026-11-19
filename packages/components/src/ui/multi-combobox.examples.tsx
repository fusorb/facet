import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import { MultiCombobox } from "./multi-combobox.js";

export interface MultiComboboxExampleProps {
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxSelections?: number;
}

const OPTIONS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "angular", label: "Angular" },
  { value: "nextjs", label: "Next.js" },
];

function DemoMultiCombobox({
  placeholder,
  searchPlaceholder,
  emptyMessage,
  maxSelections,
}: MultiComboboxExampleProps) {
  const [values, setValues] = React.useState<string[]>(["react"]);
  return (
    <div className="w-80">
      <MultiCombobox
        options={OPTIONS}
        values={values}
        onValuesChange={setValues}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        maxSelections={maxSelections}
        label="Frameworks"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Selected: {values.length ? values.join(", ") : "none"}
      </p>
    </div>
  );
}

export const multiComboboxExamples: Example<MultiComboboxExampleProps>[] = [
  {
    id: "default",
    artifact: "multi-combobox",
    title: "Default",
    description: "Searchable multi-select combobox with tag chips. Placeholders and max selections are configurable.",
    defaults: {
      placeholder: "Select frameworks...",
      searchPlaceholder: "Search...",
      emptyMessage: "No results found.",
      maxSelections: 4,
    },
    controls: {
      placeholder: { label: "Placeholder", group: "content" },
      searchPlaceholder: { label: "Search placeholder", group: "content" },
      emptyMessage: { label: "Empty message", group: "content" },
      maxSelections: { label: "Max selections", group: "state", min: 1, max: 6, step: 1 },
    },
    render: (p) => (
      <DemoMultiCombobox
        placeholder={p.placeholder}
        searchPlaceholder={p.searchPlaceholder}
        emptyMessage={p.emptyMessage}
        maxSelections={p.maxSelections}
      />
    ),
    code: (p) =>
      `const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

<MultiCombobox
  options={options}
  values={values}
  onValuesChange={setValues}
  placeholder="${p.placeholder ?? "Select frameworks..."}"
  searchPlaceholder="${p.searchPlaceholder ?? "Search..."}"
  emptyMessage="${p.emptyMessage ?? "No results found."}"
  maxSelections={${p.maxSelections ?? 4}}
/>`,
    tags: ["input", "combobox"],
  },
];
