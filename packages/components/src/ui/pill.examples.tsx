import { Pill } from "./pill.js";

export const pillExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "pill",
    render: () => <Pill {...({} as any)} />,
  },
];
