import { CookieConsent } from "./cookie-consent.js";

export const cookieConsentExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "cookie-consent",
    render: () => <CookieConsent {...({} as any)} />,
  },
];
