import { MentionInput } from "./mention-input.js";

export const mentionInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "mention-input",
    render: () => <MentionInput {...({} as any)} />,
  },
];
