import { NavigationMenu } from "./navigation-menu.js";

export const navigationMenuExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "navigation-menu",
    render: () => <NavigationMenu {...({} as any)} />,
  },
];
