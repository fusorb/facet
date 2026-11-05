import { Chart } from "./chart.js";

export const chartExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "chart",
    render: () => <Chart {...({} as any)} />,
  },
];
