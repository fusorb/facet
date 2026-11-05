import { Pagination } from "./pagination.js";

export const paginationExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "pagination",
    render: () => <Pagination {...({} as any)} />,
  },
];
