import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select.js";

export interface SelectExampleProps {
  placeholder?: string;
  disabled?: boolean;
}

function DemoSelect({ placeholder, disabled }: SelectExampleProps) {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  return (
    <div className="w-64">
      <Select value={value} onValueChange={setValue} disabled={disabled}>
        <SelectTrigger aria-label="Choose a fruit">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="grape">Grape</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export const selectExamples: Example<SelectExampleProps>[] = [
  {
    id: "default",
    artifact: "select",
    title: "Default",
    description: "Single-choice select with grouped options. Placeholder and disabled state are configurable.",
    defaults: {
      placeholder: "Select a fruit",
      disabled: false,
    },
    controls: {
      placeholder: { label: "Placeholder", group: "content" },
      disabled: { label: "Disabled", group: "state" },
    },
    render: (p) => <DemoSelect placeholder={p.placeholder} disabled={p.disabled} />,
    code: (p) =>
      `<Select${p.disabled ? " disabled" : ""}>
  <SelectTrigger aria-label="Choose a fruit">
    <SelectValue placeholder="${p.placeholder ?? "Select a fruit"}" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="orange">Orange</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
    tags: ["input", "select"],
  },
];
