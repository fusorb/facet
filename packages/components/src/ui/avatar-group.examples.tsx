import { AvatarGroup } from "./avatar-group.js";

export const avatarGroupExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "avatar-group",
    render: () => <AvatarGroup {...({} as any)} />,
  },
];
