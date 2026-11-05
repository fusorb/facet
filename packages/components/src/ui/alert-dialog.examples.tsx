import { AlertDialog } from "./alert-dialog.js";

export const alertDialogExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "alert-dialog",
    render: () => <AlertDialog {...({} as any)} />,
  },
];
