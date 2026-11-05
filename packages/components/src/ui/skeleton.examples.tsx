import { Skeleton } from "./skeleton.js";

export const skeletonExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "skeleton",
    render: () => <Skeleton {...({} as any)} />,
  },
];
