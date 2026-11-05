import { ResizablePanelGroup } from "./resizable.js";

export const resizableExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "resizable",
    render: () => <ResizablePanelGroup {...({} as any)} />,
  },
];
