import { TestimonialShowcase } from "./testimonial-showcase.js";

export const testimonialShowcaseExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "testimonial-showcase",
    render: () => <TestimonialShowcase {...({} as any)} />,
  },
];
