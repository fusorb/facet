import type { Example } from "@fusorb/facet-sandbox/core";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu.js";
import { cn } from "../utils.js";

export interface NavigationMenuExampleProps {
  showNote?: boolean;
}

export const navigationMenuExamples: Example<NavigationMenuExampleProps>[] = [
  {
    id: "default",
    artifact: "navigation-menu",
    title: "Default",
    description: "Top-level navigation with dropdown panels and links.",
    defaults: {
      showNote: false,
    },
    controls: {
      showNote: { label: "Show note", group: "content" },
    },
    render: (p) => (
      <div className="flex min-h-[220px] items-start justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 p-3 md:w-[360px]">
                    <li>
                      <NavigationMenuLink href="#" description="Learn the basics and core concepts.">
                        Introduction
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink href="#" description="Install packages and set up your project.">
                        Installation
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[320px] gap-2 p-3">
                    <li>
                      <NavigationMenuLink href="#" description="Overlays, menus, and dialogs.">
                        Feedback
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink href="#" description="Forms and input primitives.">
                        Inputs
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="#" className={cn(navigationMenuTriggerStyle())}>
                  Docs
                </a>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {p.showNote && (
            <p className="text-xs text-muted-foreground">Dropdown panels animate on open/close.</p>
          )}
        </div>
      </div>
    ),
    code: () =>
      `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-2 p-3 md:w-[360px]">
          <li><NavigationMenuLink href="#" description="Learn the basics.">Introduction</NavigationMenuLink></li>
          <li><NavigationMenuLink href="#" description="Set up your project.">Installation</NavigationMenuLink></li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <a href="#" className={navigationMenuTriggerStyle()}>Docs</a>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
    tags: ["navigation", "menu"],
  },
];
