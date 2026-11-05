import { Carousel } from "./carousel.js";

export const carouselExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "carousel",
    render: () => <Carousel {...({} as any)} />,
  },
];
