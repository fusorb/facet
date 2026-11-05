import { InviteTeamForm } from "./invite-team-form.js";

export const inviteTeamFormExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "invite-team-form",
    render: () => <InviteTeamForm {...({} as any)} />,
  },
];
