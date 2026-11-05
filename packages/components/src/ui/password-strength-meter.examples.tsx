import { PasswordStrengthMeter } from "./password-strength-meter.js";

export const passwordStrengthMeterExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "password-strength-meter",
    render: () => <PasswordStrengthMeter {...({} as any)} />,
  },
];
