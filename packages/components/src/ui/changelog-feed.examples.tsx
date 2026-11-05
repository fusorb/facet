import { ChangelogFeed } from "./changelog-feed.js";

export const changelogFeedExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "changelog-feed",
    render: () => <ChangelogFeed {...({} as any)} />,
  },
];
