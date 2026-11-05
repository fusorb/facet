import { Alert } from "./alert.js";

export const alertExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "alert",
    render: () => <Alert {...({} as any)} />,
  },
];
