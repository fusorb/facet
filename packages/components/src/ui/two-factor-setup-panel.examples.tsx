import { TwoFactorSetupPanel } from "./two-factor-setup-panel.js";

export const twoFactorSetupPanelExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "two-factor-setup-panel",
    render: () => <TwoFactorSetupPanel {...({} as any)} />,
  },
];
