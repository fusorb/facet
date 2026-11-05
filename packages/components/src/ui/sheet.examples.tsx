import { Sheet } from "./sheet.js";

export const sheetExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "sheet",
    render: () => <Sheet {...({} as any)} />,
  },
];
