import { PricingComparison } from "./pricing-comparison.js";

export const pricingComparisonExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "pricing-comparison",
    render: () => <PricingComparison {...({} as any)} />,
  },
];
