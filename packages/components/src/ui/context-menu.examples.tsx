import type { Example } from "@fusorb/facet-sandbox/core";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu.js";

export interface ContextMenuExampleProps {
  showSubmenu?: boolean;
}

export const contextMenuExamples: Example<ContextMenuExampleProps>[] = [
  {
    id: "default",
    artifact: "context-menu",
    title: "Default",
    description: "Right-click menu with items, shortcuts, checkbox state, and an optional submenu.",
    defaults: {
      showSubmenu: true,
    },
    controls: {
      showSubmenu: { label: "Show submenu", group: "content" },
    },
    render: (p) => (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Forward
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          {p.showSubmenu && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem>Save page as...</ContextMenuItem>
                <ContextMenuItem>Create shortcut...</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>Show bookmarks bar</ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
    code: (p) =>
      `<ContextMenu>
  <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
    Right-click here
  </ContextMenuTrigger>
  <ContextMenuContent className="w-56">
    <ContextMenuItem>Back</ContextMenuItem>
    <ContextMenuItem>Reload</ContextMenuItem>${p.showSubmenu ? `
    <ContextMenuSub>
      <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Save page as...</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>` : ""}
  </ContextMenuContent>
</ContextMenu>`,
    tags: ["overlay", "menu"],
  },
];
