import type { Example } from "@fusorb/facet-sandbox/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";

export interface TabsExampleProps {
  defaultTab?: "account" | "password" | "settings";
  showThirdTab?: boolean;
}

const TABS: NonNullable<TabsExampleProps["defaultTab"]>[] = ["account", "password", "settings"];

export const tabsExamples: Example<TabsExampleProps>[] = [
  {
    id: "default",
    artifact: "tabs",
    title: "Default",
    description: "Tabbed panels with triggers and content. Default tab and optional third tab are configurable.",
    defaults: {
      defaultTab: "account",
      showThirdTab: true,
    },
    controls: {
      defaultTab: { label: "Default tab", group: "state", options: TABS },
      showThirdTab: { label: "Show settings tab", group: "content" },
    },
    render: (p) => (
      <Tabs defaultValue={p.defaultTab} className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          {p.showThirdTab && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        <TabsContent value="account" className="rounded-md border p-4 text-sm">
          Manage your account details and profile information.
        </TabsContent>
        <TabsContent value="password" className="rounded-md border p-4 text-sm">
          Update your password and security preferences.
        </TabsContent>
        {p.showThirdTab && (
          <TabsContent value="settings" className="rounded-md border p-4 text-sm">
            Configure notification and display settings.
          </TabsContent>
        )}
      </Tabs>
    ),
    code: (p) =>
      `<Tabs defaultValue="${p.defaultTab ?? "account"}" className="w-full max-w-md">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>${p.showThirdTab ? `
    <TabsTrigger value="settings">Settings</TabsTrigger>` : ""}
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
  <TabsContent value="password">Password content</TabsContent>${p.showThirdTab ? `
  <TabsContent value="settings">Settings content</TabsContent>` : ""}
</Tabs>`,
    tags: ["layout", "navigation"],
  },
];
