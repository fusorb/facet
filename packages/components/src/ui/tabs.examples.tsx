import { Tabs } from "./tabs.js";

export const tabsExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "tabs",
    render: () => <Tabs {...({} as any)} />,
  },
];
