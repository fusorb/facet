import { Toaster } from "./sonner.js";

export const sonnerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "sonner",
    render: () => <Toaster {...({} as any)} />,
  },
];
