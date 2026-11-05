import { StepperProvider } from "./stepper.js";

export const stepperExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "stepper",
    render: () => <StepperProvider {...({} as any)} />,
  },
];
