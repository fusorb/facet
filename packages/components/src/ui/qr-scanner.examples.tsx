import { QrScanner } from "./qr-scanner.js";

export const qrScannerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "qr-scanner",
    render: () => <QrScanner {...({} as any)} />,
  },
];
