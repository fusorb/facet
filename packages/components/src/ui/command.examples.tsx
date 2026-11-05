import { Command } from "./command.js";

export const commandExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "command",
    render: () => <Command {...({} as any)} />,
  },
];
