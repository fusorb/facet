import { Table } from "./table.js";

export const tableExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "table",
    render: () => <Table {...({} as any)} />,
  },
];
