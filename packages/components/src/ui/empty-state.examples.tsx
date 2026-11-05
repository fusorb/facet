import { EmptyState } from "./empty-state.js";

export const emptyStateExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "empty-state",
    render: () => <EmptyState {...({} as any)} />,
  },
];
