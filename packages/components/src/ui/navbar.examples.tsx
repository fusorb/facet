import { Navbar } from "./navbar.js";

export const navbarExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "navbar",
    render: () => <Navbar {...({} as any)} />,
  },
];
