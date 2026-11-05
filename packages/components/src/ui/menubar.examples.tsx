import { Menubar } from "./menubar.js";

export const menubarExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "menubar",
    render: () => <Menubar {...({} as any)} />,
  },
];
