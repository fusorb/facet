import { FeedbackPage } from "./feedback-page.js";

export const feedbackPageExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "feedback-page",
    render: () => <FeedbackPage {...({} as any)} />,
  },
];
