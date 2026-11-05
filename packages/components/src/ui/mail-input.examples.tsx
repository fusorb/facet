import { MailInput } from "./mail-input.js";

export const mailInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "mail-input",
    render: () => <MailInput {...({} as any)} />,
  },
];
