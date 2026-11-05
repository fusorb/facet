import { OtpInput } from "./otp-input.js";

export const otpInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "otp-input",
    render: () => <OtpInput {...({} as any)} />,
  },
];
