import { AccountSettingsPanel } from "./account-settings-panel.js";

export const accountSettingsPanelExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "account-settings-panel",
    render: () => <AccountSettingsPanel {...({} as any)} />,
  },
];
