import { NumberInput } from "./number-input.js";

export const numberInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "number-input",
    render: () => <NumberInput {...({} as any)} />,
  },
];
