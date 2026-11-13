import { Button, Icon } from "@fusorb/facet-components";
import {
  Inspector,
  type ControlRenderer,
} from "@fusorb/facet-sandbox/react";
import type {
  ControlSchema,
  ControlType,
} from "@fusorb/facet-sandbox/core";

export interface InspectorSidebarProps {
  summary?: string;
  schema: ControlSchema;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onReset: () => void;
  controlRenderers?: Partial<Record<ControlType, ControlRenderer>>;
}

export function InspectorSidebar({
  summary,
  schema,
  values,
  onChange,
  onReset,
  controlRenderers,
}: InspectorSidebarProps) {
  const fields = schema.fields.filter((field) => !field.hidden);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Controls</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <Icon name="refresh-cw" className="mr-1 size-4" aria-hidden="true" />
          Reset to defaults
        </Button>
      </div>

      {fields.length > 0 ? (
        <Inspector schema={schema} values={values} onChange={onChange} controlRenderers={controlRenderers} />
      ) : (
        <p className="text-sm text-muted-foreground">No controls for this example.</p>
      )}

      {summary && (
        <div className="border-t pt-4">
          <h3 className="pg-stage-label">About</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
      )}
    </div>
  );
}
