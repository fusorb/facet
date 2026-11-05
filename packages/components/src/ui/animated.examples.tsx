import { Spotlight } from "./animated.js";

export const animatedExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "animated",
    render: () => <Spotlight {...({} as any)} />,
  },
];
