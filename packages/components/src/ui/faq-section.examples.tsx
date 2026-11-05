import { FaqSection } from "./faq-section.js";

export const faqSectionExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "faq-section",
    render: () => <FaqSection {...({} as any)} />,
  },
];
