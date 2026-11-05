import { AnnouncementBar } from "./announcement-bar.js";

export const announcementBarExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "announcement-bar",
    render: () => <AnnouncementBar {...({} as any)} />,
  },
];
