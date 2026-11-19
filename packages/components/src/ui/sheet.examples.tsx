import type { Example } from "@fusorb/facet-sandbox/core";
import { Button } from "./button.js";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet.js";

export interface SheetExampleProps {
  side?: "top" | "right" | "bottom" | "left";
  title?: string;
  description?: string;
}

const SIDES: NonNullable<SheetExampleProps["side"]>[] = ["top", "right", "bottom", "left"];

export const sheetExamples: Example<SheetExampleProps>[] = [
  {
    id: "default",
    artifact: "sheet",
    title: "Default",
    description: "Slide-over panel anchored to a screen edge. Side and copy are configurable.",
    defaults: {
      side: "right",
      title: "Edit profile",
      description: "Make changes to your profile here. Click save when you're done.",
    },
    controls: {
      side: { label: "Side", group: "layout", options: SIDES },
      title: { label: "Title", group: "content" },
      description: { label: "Description", group: "content" },
    },
    render: (p) => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent side={p.side}>
          <SheetHeader>
            <SheetTitle>{p.title}</SheetTitle>
            <SheetDescription>{p.description}</SheetDescription>
          </SheetHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Sheet body content goes here.
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="ghost">Close</Button>
            </SheetClose>
            <Button>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    ),
    code: (p) =>
      `<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open sheet</Button>
  </SheetTrigger>
  <SheetContent side="${p.side ?? "right"}">
    <SheetHeader>
      <SheetTitle>${p.title ?? "Edit profile"}</SheetTitle>
      <SheetDescription>${p.description ?? "Make changes here."}</SheetDescription>
    </SheetHeader>
    <div className="py-4 text-sm text-muted-foreground">Sheet body content goes here.</div>
    <SheetFooter>
      <SheetClose asChild><Button variant="ghost">Close</Button></SheetClose>
      <Button>Save changes</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>`,
    tags: ["overlay", "sheet"],
  },
];
