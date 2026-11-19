import type { Example } from "@fusorb/facet-sandbox/core";
import { Button } from "./button.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog.js";

export interface AlertDialogExampleProps {
  variant?: "default" | "destructive";
  title?: string;
  description?: string;
  actionLabel?: string;
  cancelLabel?: string;
}

const VARIANTS: NonNullable<AlertDialogExampleProps["variant"]>[] = ["default", "destructive"];

export const alertDialogExamples: Example<AlertDialogExampleProps>[] = [
  {
    id: "default",
    artifact: "alert-dialog",
    title: "Default",
    description: "Confirmation dialog for critical actions. Variant and copy are configurable.",
    defaults: {
      variant: "default",
      title: "Are you absolutely sure?",
      description: "This action cannot be undone and will permanently apply your changes.",
      actionLabel: "Continue",
      cancelLabel: "Cancel",
    },
    controls: {
      variant: { label: "Variant", group: "appearance", options: VARIANTS },
      title: { label: "Title", group: "content" },
      description: { label: "Description", group: "content" },
      actionLabel: { label: "Action label", group: "content" },
      cancelLabel: { label: "Cancel label", group: "content" },
    },
    render: (p) => (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={p.variant === "destructive" ? "destructive" : "outline"}>
            Open alert dialog
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent variant={p.variant}>
          <AlertDialogHeader>
            <AlertDialogTitle>{p.title}</AlertDialogTitle>
            <AlertDialogDescription>{p.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{p.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction variant={p.variant === "destructive" ? "destructive" : "default"}>
              {p.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    code: (p) =>
      `<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="${p.variant === "destructive" ? "destructive" : "outline"}">Open alert dialog</Button>
  </AlertDialogTrigger>
  <AlertDialogContent variant="${p.variant ?? "default"}">
    <AlertDialogHeader>
      <AlertDialogTitle>${p.title ?? "Are you absolutely sure?"}</AlertDialogTitle>
      <AlertDialogDescription>${p.description ?? "This action cannot be undone."}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>${p.cancelLabel ?? "Cancel"}</AlertDialogCancel>
      <AlertDialogAction${p.variant === "destructive" ? ' variant="destructive"' : ""}>${p.actionLabel ?? "Continue"}</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
    tags: ["overlay", "dialog"],
  },
];
