import { CountryCodeInput } from "./country-code-input.js";

export const countryCodeInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "country-code-input",
    render: () => <CountryCodeInput {...({} as any)} />,
  },
];
