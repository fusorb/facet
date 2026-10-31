/**
 * @category feedback
 * @summary Dialog
 */
import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import { Button } from "./button.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog.js";

export interface DialogExampleProps {
  variant?: "default" | "compact" | "blurred";
  title?: string;
  description?: string;
}

function DemoDialog({ variant, title, description }: DialogExampleProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Open dialog</Button>
      </DialogTrigger>
      <DialogContent variant={variant}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const dialogExamples: Example<DialogExampleProps>[] = [
  {
    id: "default",
    artifact: "dialog",
    title: "Default",
    description:
      "Frosted content card on a dim overlay. Title, description and variant are controls.",
    defaults: {
      variant: "default",
      title: "Delete this item?",
      description:
        "This action cannot be undone. The item will be permanently removed.",
    },
    controls: {
      variant: {
        label: "Variant",
        group: "appearance",
        options: ["default", "compact", "blurred"],
      },
      title: { label: "Title", group: "content" },
      description: { label: "Description", group: "content" },
    },
    render: (p) => (
      <DemoDialog
        variant={p.variant}
        title={p.title}
        description={p.description}
      />
    ),
    code: (p) =>
      `<Dialog>\n  <DialogTrigger asChild>\n    <Button variant="secondary">Open dialog</Button>\n  </DialogTrigger>\n  <DialogContent variant="${p.variant ?? "default"}">\n    <DialogHeader>\n      <DialogTitle>${p.title ?? "Title"}</DialogTitle>\n      <DialogDescription>${p.description ?? "Description"}</DialogDescription>\n    </DialogHeader>\n  </DialogContent>\n</Dialog>`,
    tags: ["overlay", "modal"],
  },
  {
    id: "compact",
    artifact: "dialog",
    title: "Compact",
    description: "Narrower max-w-md card for short confirmations.",
    defaults: {
      variant: "compact",
      title: "Discard changes?",
      description: "Your edits will be lost.",
    },
    render: (p) => <DemoDialog {...p} />,
    code: () =>
      `<DialogContent variant="compact">\n  <DialogHeader>\n    <DialogTitle>Discard changes?</DialogTitle>\n  </DialogHeader>\n</DialogContent>`,
    tags: ["overlay", "variant"],
  },
];
