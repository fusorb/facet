import { WizardFormPage } from "./wizard-form-page.js";

export const wizardFormPageExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "wizard-form-page",
    render: () => <WizardFormPage {...({} as any)} />,
  },
];
