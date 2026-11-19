import type { Example } from "@fusorb/facet-sandbox/core";
import { Button } from "./button.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu.js";

export interface DropdownMenuExampleProps {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const SIDES: NonNullable<DropdownMenuExampleProps["side"]>[] = ["top", "right", "bottom", "left"];
const ALIGNS: NonNullable<DropdownMenuExampleProps["align"]>[] = ["start", "center", "end"];

export const dropdownMenuExamples: Example<DropdownMenuExampleProps>[] = [
  {
    id: "default",
    artifact: "dropdown-menu",
    title: "Default",
    description: "Action menu with groups, separators, shortcuts, and a submenu. Position is configurable.",
    defaults: {
      side: "bottom",
      align: "start",
      sideOffset: 4,
    },
    controls: {
      side: { label: "Side", group: "layout", options: SIDES },
      align: { label: "Align", group: "layout", options: ALIGNS },
      sideOffset: { label: "Side offset", group: "layout", min: 0, max: 24, step: 1 },
    },
    render: (p) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={p.side} align={p.align} sideOffset={p.sideOffset} className="w-56">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>More...</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    code: (p) =>
      `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent side="${p.side ?? "bottom"}" align="${p.align ?? "start"}" sideOffset={${p.sideOffset ?? 4}} className="w-56">
    <DropdownMenuLabel>My account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Email</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
    tags: ["overlay", "menu"],
  },
];
