import { DatePicker } from "./date-picker.js";

export const datePickerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "date-picker",
    render: () => <DatePicker {...({} as any)} />,
  },
];
