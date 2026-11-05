import { StatCard } from "./stat-card.js";

export const statCardExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "stat-card",
    render: () => <StatCard {...({} as any)} />,
  },
];
