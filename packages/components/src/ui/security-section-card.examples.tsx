import { SecuritySectionCard } from "./security-section-card.js";

export const securitySectionCardExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "security-section-card",
    render: () => <SecuritySectionCard {...({} as any)} />,
  },
];
