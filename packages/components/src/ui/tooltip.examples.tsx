import type { Example } from "@fusorb/facet-sandbox/core";
import { Button } from "./button.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip.js";

export interface TooltipExampleProps {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  variant?: "brand" | "neutral";
  content?: string;
}

const SIDES: NonNullable<TooltipExampleProps["side"]>[] = ["top", "right", "bottom", "left"];
const VARIANTS: NonNullable<TooltipExampleProps["variant"]>[] = ["brand", "neutral"];

export const tooltipExamples: Example<TooltipExampleProps>[] = [
  {
    id: "default",
    artifact: "tooltip",
    title: "Default",
    description: "Contextual hint shown on hover/focus. Side, offset, variant, and content are configurable.",
    defaults: {
      side: "top",
      sideOffset: 4,
      variant: "brand",
      content: "Helpful tooltip text",
    },
    controls: {
      side: { label: "Side", group: "layout", options: SIDES },
      sideOffset: { label: "Side offset", group: "layout", min: 0, max: 24, step: 1 },
      variant: { label: "Variant", group: "appearance", options: VARIANTS },
      content: { label: "Content", group: "content" },
    },
    render: (p) => (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover or focus</Button>
          </TooltipTrigger>
          <TooltipContent side={p.side} sideOffset={p.sideOffset} variant={p.variant}>
            {p.content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    code: (p) =>
      `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover or focus</Button>
    </TooltipTrigger>
    <TooltipContent side="${p.side ?? "top"}" sideOffset={${p.sideOffset ?? 4}} variant="${p.variant ?? "brand"}">
      ${p.content ?? "Helpful tooltip text"}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    tags: ["overlay", "tooltip"],
  },
];
