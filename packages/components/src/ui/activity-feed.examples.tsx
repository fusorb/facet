import { ActivityFeed } from "./activity-feed.js";

export const activityFeedExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "activity-feed",
    render: () => <ActivityFeed {...({} as any)} />,
  },
];
