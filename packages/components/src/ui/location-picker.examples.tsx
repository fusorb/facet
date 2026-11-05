import { CountryInput } from "./location-picker.js";

export const locationPickerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "location-picker",
    render: () => <CountryInput {...({} as any)} />,
  },
];
