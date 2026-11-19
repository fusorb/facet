import type { Example } from "@fusorb/facet-sandbox/core";
import { ChevronDown } from "lucide-react";
import { Button } from "./button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible.js";

export interface CollapsibleExampleProps {
  defaultOpen?: boolean;
  title?: string;
}

export const collapsibleExamples: Example<CollapsibleExampleProps>[] = [
  {
    id: "default",
    artifact: "collapsible",
    title: "Default",
    description: "Simple expand/collapse section. Default open state and title are configurable.",
    defaults: {
      defaultOpen: false,
      title: "Can I use this in my project?",
    },
    controls: {
      defaultOpen: { label: "Default open", group: "state" },
      title: { label: "Trigger title", group: "content" },
    },
    render: (p) => (
      <Collapsible defaultOpen={p.defaultOpen} className="w-full max-w-md space-y-2">
        <div className="flex items-center justify-between rounded-md border px-4 py-2">
          <span className="text-sm font-medium">{p.title}</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Toggle">
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
            Yes. Collapsible sections are useful for progressive disclosure and compact layouts.
          </div>
          <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
            You can control them or use them uncontrolled with a default open state.
          </div>
        </CollapsibleContent>
      </Collapsible>
    ),
    code: (p) =>
      `<Collapsible defaultOpen={${p.defaultOpen ?? false}} className="w-full max-w-md space-y-2">
  <div className="flex items-center justify-between rounded-md border px-4 py-2">
    <span className="text-sm font-medium">${p.title ?? "Can I use this in my project?"}</span>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm">Toggle</Button>
    </CollapsibleTrigger>
  </div>
  <CollapsibleContent>
    <div className="rounded-md border px-4 py-3 text-sm">Collapsible content</div>
  </CollapsibleContent>
</Collapsible>`,
    tags: ["layout", "disclosure"],
  },
];
