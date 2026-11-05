import { RatingInput } from "./rating-input.js";

export const ratingInputExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "rating-input",
    render: () => <RatingInput {...({} as any)} />,
  },
];
