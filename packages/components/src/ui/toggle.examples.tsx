import { Toggle } from "./toggle.js";

export const toggleExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "toggle",
    render: () => <Toggle {...({} as any)} />,
  },
];
