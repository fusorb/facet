import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import { Combobox, type ComboboxOption } from "./combobox.js";

export interface ComboboxExampleProps {
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

const OPTIONS: ComboboxOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "angular", label: "Angular" },
];

function DemoCombobox({ placeholder, searchPlaceholder, emptyMessage }: ComboboxExampleProps) {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  return (
    <div className="w-72">
      <Combobox
        options={OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        label="Framework"
      />
    </div>
  );
}

export const comboboxExamples: Example<ComboboxExampleProps>[] = [
  {
    id: "default",
    artifact: "combobox",
    title: "Default",
    description: "Searchable single-select combobox. Placeholder, search hint, and empty message are configurable.",
    defaults: {
      placeholder: "Select a framework...",
      searchPlaceholder: "Search frameworks...",
      emptyMessage: "No framework found.",
    },
    controls: {
      placeholder: { label: "Placeholder", group: "content" },
      searchPlaceholder: { label: "Search placeholder", group: "content" },
      emptyMessage: { label: "Empty message", group: "content" },
    },
    render: (p) => (
      <DemoCombobox
        placeholder={p.placeholder}
        searchPlaceholder={p.searchPlaceholder}
        emptyMessage={p.emptyMessage}
      />
    ),
    code: (p) =>
      `const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

<Combobox
  options={options}
  value={value}
  onValueChange={setValue}
  placeholder="${p.placeholder ?? "Select a framework..."}"
  searchPlaceholder="${p.searchPlaceholder ?? "Search frameworks..."}"
  emptyMessage="${p.emptyMessage ?? "No framework found."}"
/>`,
    tags: ["input", "combobox"],
  },
];
