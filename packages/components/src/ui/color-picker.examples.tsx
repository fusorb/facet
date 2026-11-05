import { ColorPicker } from "./color-picker.js";

export const colorPickerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "color-picker",
    render: () => <ColorPicker {...({} as any)} />,
  },
];
