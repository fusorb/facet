import type { ReactNode } from "react";

import { AboutPage } from "./pages/AboutPage.js";
import { AuthLabPage } from "./pages/AuthLabPage.js";
import { ComponentsPage } from "./pages/ComponentsPage.js";
import { DashboardDemoPage } from "./pages/DashboardDemoPage.js";
import { EcosystemDetailPage } from "./pages/EcosystemDetailPage.js";
import { EcosystemPage } from "./pages/EcosystemPage.js";
import { FeedbackPage } from "./pages/FeedbackPage.js";
import { HomePage } from "./pages/HomePage.js";
import { MotionLabPage } from "./pages/MotionLabPage.js";
import { PricingPage } from "./pages/PricingPage.js";
import { SecurityPage } from "./pages/SecurityPage.js";
import { TokensPage } from "./pages/TokensPage.js";
import {
  SITE_PACKAGES_COUNT,
  COMPONENT_COUNT,
} from "./data/site-data.generated.js";

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
    description: `${SITE_PACKAGES_COUNT} focused packages, one coherent system.`,
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
    path: "/components",
    title: "Component catalog",
    description: `${COMPONENT_COUNT}+ components across 7 categories.`,
    navGroup: "product",
    element: <ComponentsPage />,
  },
  {
    path: "/lab/auth",
    title: "Auth Lab",
    description: "Interactive auth state machine with domain presets.",
    navGroup: "product",
    element: <AuthLabPage />,
  },
  {
    path: "/lab/motion",
    title: "Motion Lab",
    description: "Interactive motion effect gallery with configuration.",
    navGroup: "product",
    element: <MotionLabPage />,
  },
  {
    path: "/lab/tokens",
    title: "Token Explorer",
    description: "Explore all CSS custom properties with live theme values.",
    navGroup: "product",
    element: <TokensPage />,
  },
  {
    path: "/feedback",
    title: "Feedback",
    description: "What needs to change, what is missing, what is wrong.",
    navGroup: "resources",
    element: <FeedbackPage />,
  },
];
