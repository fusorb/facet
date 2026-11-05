import { Select } from "./select.js";

export const selectExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "select",
    render: () => <Select {...({} as any)} />,
  },
];
