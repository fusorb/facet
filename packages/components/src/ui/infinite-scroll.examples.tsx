import { InfiniteScroll } from "./infinite-scroll.js";

export const infiniteScrollExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "infinite-scroll",
    render: () => <InfiniteScroll {...({} as any)} />,
  },
];
