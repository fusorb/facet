import * as React from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@fusorb/facet-components";
import { Playground, type Control } from "./Playground.js";
import { ThemePreviewFrame } from "./ThemePreviewFrame.js";

export interface ComponentDemoCardProps {
  /** Component display name. */
  name: string;
  /** Optional one-line description. */
  description?: string;
  /** Collapsed (static) preview, e.g. a default <Button />. */
  collapsed: React.ReactNode;
  /** Optional live variant controls, shown when expanded. */
  controls?: Control[];
  /** Expanded content: the interactive demo. */
  expanded: React.ReactNode;
}

/**
 * Collapsible component demo card. Collapsed state shows a static
 * snapshot; expanding reveals a live Playground with variant controls.
 * Built on facet's own Collapsible primitive.
 */
export function ComponentDemoCard({
  name,
  description,
  collapsed,
  controls,
  expanded,
}: ComponentDemoCardProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-border"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/60"
        >
          <span>
            <span className="block font-semibold text-foreground">{name}</span>
            {description && (
              <span className="block text-sm text-muted-foreground">{description}</span>
            )}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </CollapsibleTrigger>

      {/* Collapsed: static preview */}
      {!open && (
        <ThemePreviewFrame>
          <div className="flex w-full items-start justify-start gap-4">{collapsed}</div>
        </ThemePreviewFrame>
      )}

      {/* Expanded: interactive playground with controls */}
      <CollapsibleContent>
        <Playground controls={controls} note="Live preview. Interactive variants ship with the component.">
          <ThemePreviewFrame>{expanded}</ThemePreviewFrame>
        </Playground>
      </CollapsibleContent>
    </Collapsible>
  );
}
