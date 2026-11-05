import { EmptyStatePage } from "./empty-state-page.js";

export const emptyStatePageExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "empty-state-page",
    render: () => <EmptyStatePage {...({} as any)} />,
  },
];
