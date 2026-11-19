import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import { MultiCombobox, type MultiComboboxOption } from "./multi-combobox.js";

export interface MultiComboboxExampleProps {
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  maxItems?: number;
  wrap?: boolean;
}

const OPTIONS: MultiComboboxOption[] = [
  { id: "react", label: "React", description: "UI library" },
  { id: "vue", label: "Vue", description: "Progressive framework" },
  { id: "svelte", label: "Svelte", description: "Compiler-first UI" },
  { id: "solid", label: "Solid", description: "Fine-grained reactivity" },
  { id: "angular", label: "Angular", description: "Full framework" },
  { id: "nextjs", label: "Next.js", description: "React framework" },
];

function DemoMultiCombobox({
  placeholder,
  searchable,
  disabled,
  maxItems,
  wrap,
}: MultiComboboxExampleProps) {
  const [value, setValue] = React.useState<string[]>(["react"]);
  return (
    <div className="w-80">
      <MultiCombobox
        options={OPTIONS}
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        searchable={searchable}
        disabled={disabled}
        maxItems={maxItems}
        wrap={wrap}
        ariaLabel="Select frameworks"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Selected: {value.length ? value.join(", ") : "none"}
      </p>
    </div>
  );
}

export const multiComboboxExamples: Example<MultiComboboxExampleProps>[] = [
  {
    id: "default",
    artifact: "multi-combobox",
    title: "Default",
    description:
      "Searchable multi-select combobox with chips and keyboard navigation. Max items, search, and wrapping are configurable.",
    defaults: {
      placeholder: "Pick options…",
      searchable: true,
      disabled: false,
      maxItems: 4,
      wrap: true,
    },
    controls: {
      placeholder: { label: "Placeholder", group: "content" },
      searchable: { label: "Searchable", group: "state" },
      disabled: { label: "Disabled", group: "state" },
      maxItems: { label: "Max items", group: "state", min: 0, max: 6, step: 1 },
      wrap: { label: "Wrap chips", group: "layout" },
    },
    render: (p) => (
      <DemoMultiCombobox
        placeholder={p.placeholder}
        searchable={p.searchable}
        disabled={p.disabled}
        maxItems={p.maxItems}
        wrap={p.wrap}
      />
    ),
    code: (p) =>
      `const options = [
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "svelte", label: "Svelte" },
];

<MultiCombobox
  options={options}
  value={value}
  onChange={setValue}
  placeholder="${p.placeholder}"
  searchable={${p.searchable}}
  disabled={${p.disabled}}
  maxItems={${p.maxItems}}
  wrap={${p.wrap}}
/>`,
  },
];
