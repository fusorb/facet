import { DropdownMenu } from "./dropdown-menu.js";

export const dropdownMenuExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "dropdown-menu",
    render: () => <DropdownMenu {...({} as any)} />,
  },
];
