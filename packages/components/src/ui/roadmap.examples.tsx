import { Roadmap } from "./roadmap.js";

export const roadmapExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "roadmap",
    render: () => <Roadmap {...({} as any)} />,
  },
];
