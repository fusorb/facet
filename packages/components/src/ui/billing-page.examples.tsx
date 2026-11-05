import { BillingPage } from "./billing-page.js";

export const billingPageExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "billing-page",
    render: () => <BillingPage {...({} as any)} />,
  },
];
