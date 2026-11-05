import { PhoneInput } from "./phone-input.js";

export const phoneInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "phone-input",
    render: () => <PhoneInput {...({} as any)} />,
  },
];
