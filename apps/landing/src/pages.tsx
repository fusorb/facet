import type { ComponentType } from "react";
import { HomePage } from "./pages/HomePage.js";
import { FeedbackPage } from "./pages/FeedbackPage.js";

export interface LandingRoute {
  path: string;
  element: ComponentType;
}

export const landingRoutes: LandingRoute[] = [
  { path: "/", element: HomePage },
  { path: "/feedback", element: FeedbackPage },
];
