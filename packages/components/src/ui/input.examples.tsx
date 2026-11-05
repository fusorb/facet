import { Input } from "./input.js";

export const inputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "input",
    render: () => <Input {...({} as any)} />,
  },
];
