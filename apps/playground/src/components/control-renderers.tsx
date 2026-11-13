import type { ControlField, ControlType } from "@fusorb/facet-sandbox/core";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@fusorb/facet-components";
import type { ControlRenderer } from "@fusorb/facet-sandbox/react";

function ControlLabel({ field }: { field: ControlField }) {
  return (
    <Label className="text-xs font-medium text-muted-foreground">
      {field.label ?? field.name}
    </Label>
  );
}

const stringRenderer: ControlRenderer = (field, value, onChange) => (
  <div className="flex flex-col gap-1.5">
    <ControlLabel field={field} />
    <Input
      value={typeof value === "string" ? value : String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
      aria-label={field.label ?? field.name}
    />
  </div>
);

const numberRenderer: ControlRenderer = (field, value, onChange) => (
  <div className="flex flex-col gap-1.5">
    <ControlLabel field={field} />
    <Input
      type="number"
      value={typeof value === "number" ? value : Number(value ?? 0)}
      min={field.min}
      max={field.max}
      step={field.step}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next === "" ? undefined : Number(next));
      }}
      aria-label={field.label ?? field.name}
    />
  </div>
);

const booleanRenderer: ControlRenderer = (field, value, onChange) => (
  <div className="flex items-center justify-between gap-3">
    <ControlLabel field={field} />
    <Switch
      checked={Boolean(value)}
      onCheckedChange={(checked: boolean) => onChange(checked)}
      aria-label={field.label ?? field.name}
    />
  </div>
);

const selectRenderer: ControlRenderer = (field, value, onChange) => (
  <div className="flex flex-col gap-1.5">
    <ControlLabel field={field} />
    <Select
      value={value == null ? undefined : String(value)}
      onValueChange={(next) => onChange(next)}
    >
      <SelectTrigger aria-label={field.label ?? field.name}>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {(field.options ?? []).map((option) => (
          <SelectItem key={String(option)} value={String(option)}>
            {String(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const codeRenderer: ControlRenderer = (field, value, onChange) => (
  <div className="flex flex-col gap-1.5">
    <ControlLabel field={field} />
    <Textarea
      value={typeof value === "string" ? value : String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      spellCheck={false}
      className="font-mono text-xs"
      aria-label={field.label ?? field.name}
    />
  </div>
);

export const facetControlRenderers: Partial<Record<ControlType, ControlRenderer>> = {
  string: stringRenderer,
  number: numberRenderer,
  boolean: booleanRenderer,
  select: selectRenderer,
  code: codeRenderer,
};
