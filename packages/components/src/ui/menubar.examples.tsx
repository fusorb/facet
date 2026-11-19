import type { Example } from "@fusorb/facet-sandbox/core";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar.js";

export interface MenubarExampleProps {
  showShortcuts?: boolean;
}

export const menubarExamples: Example<MenubarExampleProps>[] = [
  {
    id: "default",
    artifact: "menubar",
    title: "Default",
    description: "Application-style menubar with menus, submenus, checkbox items, and shortcuts.",
    defaults: {
      showShortcuts: true,
    },
    controls: {
      showShortcuts: { label: "Show shortcuts", group: "content" },
    },
    render: (p) => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab {p.showShortcuts && <MenubarShortcut>⌘T</MenubarShortcut>}
            </MenubarItem>
            <MenubarItem>
              New Window {p.showShortcuts && <MenubarShortcut>⌘N</MenubarShortcut>}
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email link</MenubarItem>
                <MenubarItem>Messages</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>Print {p.showShortcuts && <MenubarShortcut>⌘P</MenubarShortcut>}</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo {p.showShortcuts && <MenubarShortcut>⌘Z</MenubarShortcut>}</MenubarItem>
            <MenubarItem>Redo {p.showShortcuts && <MenubarShortcut>⇧⌘Z</MenubarShortcut>}</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Cut</MenubarItem>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>Always show bookmarks bar</MenubarCheckboxItem>
            <MenubarCheckboxItem>Always show full URLs</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
    code: (p) =>
      `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Tab${p.showShortcuts ? " <MenubarShortcut>⌘T</MenubarShortcut>" : ""}</MenubarItem>
      <MenubarSub>
        <MenubarSubTrigger>Share</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Email link</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
    tags: ["overlay", "navigation"],
  },
];
