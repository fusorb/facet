import { ChangelogCard } from "./changelog-card.js";

export const changelogCardExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "changelog-card",
    render: () => <ChangelogCard {...({} as any)} />,
  },
];
