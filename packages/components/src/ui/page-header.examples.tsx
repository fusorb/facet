import { PageHeader } from "./page-header.js";

export const pageHeaderExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "page-header",
    render: () => <PageHeader {...({} as any)} />,
  },
];
