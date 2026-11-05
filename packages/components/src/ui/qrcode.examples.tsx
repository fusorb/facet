import { QRCode } from "./qrcode.js";

export const qrcodeExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "qrcode",
    render: () => <QRCode {...({} as any)} />,
  },
];
