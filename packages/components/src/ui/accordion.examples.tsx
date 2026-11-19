import type { Example } from "@fusorb/facet-sandbox/core";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion.js";

export interface AccordionExampleProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  showThreeItems?: boolean;
}

const TYPES: NonNullable<AccordionExampleProps["type"]>[] = ["single", "multiple"];

export const accordionExamples: Example<AccordionExampleProps>[] = [
  {
    id: "default",
    artifact: "accordion",
    title: "Default",
    description: "Vertically stacked, collapsible sections. Type and collapsible behavior are configurable.",
    defaults: {
      type: "single",
      collapsible: true,
      showThreeItems: true,
    },
    controls: {
      type: { label: "Type", group: "behavior", options: TYPES },
      collapsible: { label: "Collapsible (single)", group: "behavior" },
      showThreeItems: { label: "Show third item", group: "content" },
    },
    render: (p) => {
      const items = (
        <>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern and uses Radix primitives.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It ships with Facet token-based styles and can be customized via className.
            </AccordionContent>
          </AccordionItem>
          {p.showThreeItems && (
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                Yes. Content expands and collapses with facet accordion animations.
              </AccordionContent>
            </AccordionItem>
          )}
        </>
      );

      if (p.type === "multiple") {
        return (
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full max-w-md">
            {items}
          </Accordion>
        );
      }
      return (
        <Accordion type="single" collapsible={p.collapsible ?? true} defaultValue="item-1" className="w-full max-w-md">
          {items}
        </Accordion>
      );
    },
    code: (p) =>
      p.type === "multiple"
        ? `<Accordion type="multiple" defaultValue={["item-1"]} className="w-full max-w-md">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>Yes. Token-based and customizable.</AccordionContent>
  </AccordionItem>
</Accordion>`
        : `<Accordion type="single" collapsible={${p.collapsible ?? true}} defaultValue="item-1" className="w-full max-w-md">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>Yes. Token-based and customizable.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    tags: ["layout", "disclosure"],
  },
];
