import { ScrollArea } from "./scroll-area.js";

export const scrollAreaExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "scroll-area",
    render: () => <ScrollArea {...({} as any)} />,
  },
];
