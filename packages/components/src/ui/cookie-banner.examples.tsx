import { CookieBanner } from "./cookie-banner.js";

export const cookieBannerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "cookie-banner",
    render: () => <CookieBanner {...({} as any)} />,
  },
];
