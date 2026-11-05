import { NotFound } from "./not-found.js";

export const notFoundExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "not-found",
    render: () => <NotFound {...({} as any)} />,
  },
];
