import { Textarea } from "./textarea.js";

export const textareaExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "textarea",
    render: () => <Textarea {...({} as any)} />,
  },
];
