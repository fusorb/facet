import { OtpVerificationCard } from "./otp-verification-card.js";

export const otpVerificationCardExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "otp-verification-card",
    render: () => <OtpVerificationCard {...({} as any)} />,
  },
];
