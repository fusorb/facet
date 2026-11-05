import { RichTextEditor } from "./rich-text-editor.js";

export const richTextEditorExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "rich-text-editor",
    render: () => <RichTextEditor {...({} as any)} />,
  },
];
