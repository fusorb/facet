import { DateInput } from "./date-input.js";

export const dateInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "date-input",
    render: () => <DateInput {...({} as any)} />,
  },
];
