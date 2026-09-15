import type { ReactNode } from "react";

import { AboutPage } from "./pages/AboutPage.js";
import { DashboardDemoPage } from "./pages/DashboardDemoPage.js";
import { EcosystemDetailPage } from "./pages/EcosystemDetailPage.js";
import { EcosystemPage } from "./pages/EcosystemPage.js";
import { FeedbackPage } from "./pages/FeedbackPage.js";
import { HomePage } from "./pages/HomePage.js";
import { PricingPage } from "./pages/PricingPage.js";
import { SecurityPage } from "./pages/SecurityPage.js";

export type NavGroup = "product" | "resources";

export interface LandingPage {
  path: string;
  title: string;
  description: string;
  navGroup: NavGroup | null;
  element: ReactNode;
}

/**
 * The single route registry: routes and nav derive from this list,
 * so adding a page never requires touching Nav or the router.
 */
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
    path: "/about",
    title: "About",
    description:
      "Why facet exists, what it is built on, and where it is going.",
    navGroup: "resources",
    element: <AboutPage />,
  },
  {
    path: "/ecosystem",
    title: "Ecosystem",
    description: "Nine focused packages, one coherent system.",
    navGroup: "product",
    element: <EcosystemPage />,
  },
  {
    path: "/ecosystem/:slug",
    title: "Package detail",
    description: "A deep dive into one facet package.",
    navGroup: null,
    element: <EcosystemDetailPage />,
  },
  {
    path: "/pricing",
    title: "Pricing",
    description: "MIT-licensed and free. Support the project on GitHub.",
    navGroup: "product",
    element: <PricingPage />,
  },
  {
    path: "/security",
    title: "Security",
    description: "Security is a feature, not an afterthought.",
    navGroup: "product",
    element: <SecurityPage />,
  },
  {
    path: "/dashboard-demo",
    title: "Console demo",
    description:
      "A working dashboard assembled entirely from facet components.",
    navGroup: "product",
    element: <DashboardDemoPage />,
  },
  {
    path: "/feedback",
    title: "Feedback",
    description: "What needs to change, what is missing, what is wrong.",
    navGroup: "resources",
    element: <FeedbackPage />,
  },
];
