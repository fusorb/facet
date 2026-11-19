import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import { NotificationDrawer, type Notification } from "./notification-drawer.js";

export interface NotificationDrawerExampleProps {
  side?: "right" | "left";
  showFooter?: boolean;
  filter?: "all" | "unread";
}

const SIDES: NonNullable<NotificationDrawerExampleProps["side"]>[] = ["right", "left"];
const FILTERS: NonNullable<NotificationDrawerExampleProps["filter"]>[] = ["all", "unread"];

const SAMPLE: Notification[] = [
  { id: "1", title: "New comment on your post", description: "Alex replied to your thread.", time: "2m ago", type: "info" },
  { id: "2", title: "Deployment finished successfully", description: "Production build is live.", time: "10m ago", read: true, type: "success" },
  { id: "3", title: "You were invited to a workspace", description: "Join the Fusorb team.", time: "1h ago", type: "default" },
];

function DemoNotificationDrawer({ side, showFooter, filter }: NotificationDrawerExampleProps) {
  const [items, setItems] = React.useState<Notification[]>(SAMPLE);

  return (
    <NotificationDrawer
      notifications={items}
      side={side}
      showFooter={showFooter}
      filter={filter}
      onMarkAllRead={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
      onDismiss={(n) => setItems((prev) => prev.filter((x) => x.id !== n.id))}
      onViewAll={() => {}}
    />
  );
}

export const notificationDrawerExamples: Example<NotificationDrawerExampleProps>[] = [
  {
    id: "default",
    artifact: "notification-drawer",
    title: "Default",
    description:
      "Notification drawer with sample items, filtering, mark-all-read, and dismiss actions.",
    defaults: {
      side: "right",
      showFooter: true,
      filter: "all",
    },
    controls: {
      side: { label: "Side", group: "layout", options: SIDES },
      showFooter: { label: "Show footer", group: "layout" },
      filter: { label: "Filter", group: "state", options: FILTERS },
    },
    render: (p) => (
      <DemoNotificationDrawer side={p.side} showFooter={p.showFooter} filter={p.filter} />
    ),
    code: (p) =>
      `const notifications = [
  { id: "1", title: "New comment on your post", description: "Alex replied to your thread.", time: "2m ago", type: "info" },
  { id: "2", title: "Deployment finished successfully", time: "10m ago", read: true, type: "success" },
];

<NotificationDrawer
  notifications={notifications}
  side="${p.side ?? "right"}"
  showFooter={${p.showFooter}}
  filter="${p.filter ?? "all"}"
  onMarkAllRead={() => {}}
  onDismiss={(n) => {}}
  onViewAll={() => {}}
/>`,
    tags: ["overlay", "notifications"],
  },
];
