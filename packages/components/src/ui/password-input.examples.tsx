import { PasswordInput } from "./password-input.js";

export const passwordInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "password-input",
    render: () => <PasswordInput {...({} as any)} />,
  },
];
