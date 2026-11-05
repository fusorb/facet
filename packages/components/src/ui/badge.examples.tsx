import { Badge } from "./badge.js";

export const badgeExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "badge",
    render: () => <Badge {...({} as any)} />,
  },
];
