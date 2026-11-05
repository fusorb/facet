import { ConsentCapture } from "./consent-capture.js";

export const consentCaptureExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "consent-capture",
    render: () => <ConsentCapture {...({} as any)} />,
  },
];
