import { ContextMenu } from "./context-menu.js";

export const contextMenuExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "context-menu",
    render: () => <ContextMenu {...({} as any)} />,
  },
];
