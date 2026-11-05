import { NotificationDrawer } from "./notification-drawer.js";

export const notificationDrawerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "notification-drawer",
    render: () => <NotificationDrawer {...({} as any)} />,
  },
];
