import { FlipCard } from "./card-animations.js";

export const cardAnimationsExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "card-animations",
    render: () => <FlipCard {...({} as any)} />,
  },
];
