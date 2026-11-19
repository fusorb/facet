import type { Example } from "@fusorb/facet-sandbox/core";
import { Button } from "./button.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

export interface PopoverExampleProps {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  content?: string;
}

const SIDES: NonNullable<PopoverExampleProps["side"]>[] = ["top", "right", "bottom", "left"];
const ALIGNS: NonNullable<PopoverExampleProps["align"]>[] = ["start", "center", "end"];

export const popoverExamples: Example<PopoverExampleProps>[] = [
  {
    id: "default",
    artifact: "popover",
    title: "Default",
    description: "Floating content anchored to a trigger. Side, alignment, and offset are configurable.",
    defaults: {
      side: "bottom",
      align: "center",
      sideOffset: 4,
      content: "This is popover content. Place any elements here.",
    },
    controls: {
      side: { label: "Side", group: "layout", options: SIDES },
      align: { label: "Align", group: "layout", options: ALIGNS },
      sideOffset: { label: "Side offset", group: "layout", min: 0, max: 24, step: 1 },
      content: { label: "Content", group: "content" },
    },
    render: (p) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent side={p.side} align={p.align} sideOffset={p.sideOffset}>
          <p className="text-sm">{p.content}</p>
        </PopoverContent>
      </Popover>
    ),
    code: (p) =>
      `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent side="${p.side ?? "bottom"}" align="${p.align ?? "center"}" sideOffset={${p.sideOffset ?? 4}}>
    <p className="text-sm">${p.content ?? "Popover content"}</p>
  </PopoverContent>
</Popover>`,
    tags: ["overlay", "popover"],
  },
];
