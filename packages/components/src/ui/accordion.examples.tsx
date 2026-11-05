import { Accordion } from "./accordion.js";

export const accordionExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "accordion",
    render: () => <Accordion {...({} as any)} />,
  },
];
