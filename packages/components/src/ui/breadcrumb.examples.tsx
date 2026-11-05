import { Breadcrumb } from "./breadcrumb.js";

export const breadcrumbExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "breadcrumb",
    render: () => <Breadcrumb {...({} as any)} />,
  },
];
