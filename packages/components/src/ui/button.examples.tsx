/**
 * @category data-display
 * @summary Button
 */
import type { Example } from "@fusorb/facet-sandbox/core";
import { Button, type ButtonProps } from "./button.js";
import { Icon } from "../icon/index.js";

export interface ButtonExampleProps {
  variant?: NonNullable<ButtonProps["variant"]>;
  size?: NonNullable<ButtonProps["size"]>;
  children?: string;
  magnetic?: boolean;
  disabled?: boolean;
}

const VARIANTS: NonNullable<ButtonProps["variant"]>[] = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
  "glass",
  "shine",
  "ripple",
];

const SIZES: NonNullable<ButtonProps["size"]>[] = ["default", "sm", "lg", "icon"];

export const buttonExamples: Example<ButtonExampleProps>[] = [
  {
    id: "default",
    artifact: "button",
    title: "Default",
    description: "Base button with every axis exposed as a control.",
    defaults: {
      variant: "default",
      size: "default",
      children: "Get started",
      magnetic: false,
      disabled: false,
    },
    controls: {
      variant: { label: "Variant", group: "appearance", options: VARIANTS },
      size: { label: "Size", group: "appearance", options: SIZES },
      children: { label: "Label", group: "content" },
      magnetic: { label: "Magnetic", group: "behavior" },
      disabled: { label: "Disabled", group: "state" },
    },
    render: (p) => (
      <Button
        variant={p.variant}
        size={p.size}
        magnetic={p.magnetic}
        disabled={p.disabled}
      >
        {p.children}
      </Button>
    ),
    code: (p) =>
      `<Button variant="${p.variant ?? "default"}" size="${p.size ?? "default"}">${p.children ?? "Get started"}</Button>`,
    tags: ["primitive", "action"],
  },
  {
    id: "with-icon",
    artifact: "button",
    title: "With leading icon",
    description: "Compose an Icon inside the label slot.",
    defaults: { variant: "default", size: "default", children: "Create" },
    controls: {
      variant: { label: "Variant", group: "appearance", options: VARIANTS },
      children: { label: "Label", group: "content" },
    },
    render: (p) => (
      <Button variant={p.variant} size={p.size}>
        <Icon name="plus" className="size-4" aria-hidden="true" />
        {p.children}
      </Button>
    ),
    code: () =>
      `<Button variant="default">\n  <Icon name="plus" className="size-4" />\n  Create\n</Button>`,
    tags: ["composition", "icon"],
  },
  {
    id: "icon-button",
    artifact: "button",
    title: "Icon button",
    description: 'size="icon" renders a square button; always pair with aria-label.',
    defaults: { variant: "ghost" },
    controls: {
      variant: { label: "Variant", group: "appearance", options: VARIANTS },
    },
    render: (p) => (
      <Button variant={p.variant} size="icon" aria-label="Add item">
        <Icon name="plus" className="size-4" aria-hidden="true" />
      </Button>
    ),
    code: () =>
      `<Button variant="ghost" size="icon" aria-label="Add item">\n  <Icon name="plus" className="size-4" />\n</Button>`,
    tags: ["composition", "icon", "a11y"],
  },
];
