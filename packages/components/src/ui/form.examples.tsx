import { Form } from "./form.js";

export const formExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "form",
    render: () => <Form {...({} as any)} />,
  },
];
