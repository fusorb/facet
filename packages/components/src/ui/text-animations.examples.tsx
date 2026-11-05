import { BlurText } from "./text-animations.js";

export const textAnimationsExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "text-animations",
    render: () => <BlurText {...({} as any)} />,
  },
];
