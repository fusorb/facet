import { Card } from "./card.js";

export const cardExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "card",
    render: () => <Card {...({} as any)} />,
  },
];
