import { InputOTP } from "./input-otp.js";

export const inputOtpExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "input-otp",
    render: () => <InputOTP {...({} as any)} />,
  },
];
