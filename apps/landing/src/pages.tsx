import type { ReactNode } from "react";

import { FeedbackPage } from "./pages/FeedbackPage.js";
import { HomePage } from "./pages/HomePage.js";
import { SITE_PACKAGES_COUNT } from "./data/site-data.generated.js";

export type NavGroup = "product" | "resources";

export interface LandingPage {
  path: string;
  title: string;
  description: string;
  navGroup: NavGroup | null;
  element: ReactNode;
}

export const pages: LandingPage[] = [
  {
    path: "/",
    title: "Home",
    description:
      "Accessible, customizable React components for every product surface.",
    navGroup: null,
    element: <HomePage />,
  },
  {
    path: "/feedback",
    title: "Feedback",
    description: "What needs to change, what is missing, what is wrong.",
    navGroup: "resources",
    element: <FeedbackPage />,
  },
];
