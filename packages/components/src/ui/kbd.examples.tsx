import { Kbd } from "./kbd.js";

export const kbdExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "kbd",
    render: () => <Kbd {...({} as any)} />,
  },
];
