import { Tooltip } from "./tooltip.js";

export const tooltipExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "tooltip",
    render: () => <Tooltip {...({} as any)} />,
  },
];
