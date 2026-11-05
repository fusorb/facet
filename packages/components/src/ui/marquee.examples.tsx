import { Marquee } from "./marquee.js";

export const marqueeExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "marquee",
    render: () => <Marquee {...({} as any)} />,
  },
];
