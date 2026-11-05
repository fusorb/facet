import { Progress } from "./progress.js";

export const progressExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "progress",
    render: () => <Progress {...({} as any)} />,
  },
];
