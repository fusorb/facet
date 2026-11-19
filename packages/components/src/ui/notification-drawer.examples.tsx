import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import { Button } from "./button.js";
import { NotificationDrawer } from "./notification-drawer.js";

export interface NotificationDrawerExampleProps {
  side?: "right" | "left";
  title?: string;
  description?: string;
  defaultOpen?: boolean;
}

const SIDES: NonNullable<NotificationDrawerExampleProps["side"]>[] = ["right", "left"];

function DemoNotificationDrawer({ side, title, description, defaultOpen }: NotificationDrawerExampleProps) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));
  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open notification drawer
      </Button>
      <NotificationDrawer
        open={open}
        onOpenChange={setOpen}
        side={side}
        title={title}
        description={description}
        count={3}
      >
        <div className="space-y-3 p-4 text-sm">
          <div className="rounded-md border p-3">New comment on your post.</div>
          <div className="rounded-md border p-3">Deployment finished successfully.</div>
          <div className="rounded-md border p-3">You were invited to a workspace.</div>
        </div>
      </NotificationDrawer>
    </div>
  );
}

export const notificationDrawerExamples: Example<NotificationDrawerExampleProps>[] = [
  {
    id: "default",
    artifact: "notification-drawer",
    title: "Default",
    description: "Notification panel built on Sheet. Side, labels, and initial state are configurable.",
    defaults: {
      side: "right",
      title: "Notifications",
      description: "Recent activity and updates.",
      defaultOpen: false,
    },
    controls: {
      side: { label: "Side", group: "layout", options: SIDES },
      title: { label: "Title", group: "content" },
      description: { label: "Description", group: "content" },
      defaultOpen: { label: "Default open", group: "state" },
    },
    render: (p) => (
      <DemoNotificationDrawer
        side={p.side}
        title={p.title}
        description={p.description}
        defaultOpen={p.defaultOpen}
      />
    ),
    code: (p) =>
      `<NotificationDrawer
  open={open}
  onOpenChange={setOpen}
  side="${p.side ?? "right"}"
  title="${p.title ?? "Notifications"}"
  description="${p.description ?? "Recent activity and updates."}"
  count={3}
>
  <div className="space-y-3 p-4 text-sm">
    <div className="rounded-md border p-3">New comment on your post.</div>
  </div>
</NotificationDrawer>`,
    tags: ["overlay", "notifications"],
  },
];
