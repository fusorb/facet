/**
 * Facet landing page: content data.
 *
 * Single source for install steps and demo variant lists used by live sections.
 */

export interface InstallStep {
  id: string;
  label: string;
  code: string;
}

export const INSTALL_STEPS: InstallStep[] = [
  {
    id: "deps",
    label: "Install packages",
    code: `pnpm add @fusorb/facet-tokens @fusorb/facet-components @fusorb/facet-layout @fusorb/facet-motion`,
  },
  {
    id: "tailwind",
    label: "Wire Tailwind v4",
    code: `/* app.css */
@import "tailwindcss";
@import "@fusorb/facet-tokens/index.css";
@source "../node_modules/@fusorb/facet-components/dist";
@source "../node_modules/@fusorb/facet-layout/dist";
@source "../node_modules/@fusorb/facet-motion/dist";`,
  },
  {
    id: "provider",
    label: "Add ThemeProvider",
    code: `import { ThemeProvider } from "@fusorb/facet-components";

export function App({ children }) {
  return <ThemeProvider defaultTheme="system">{children}</ThemeProvider>;
}`,
  },
];

export const BUTTON_VARIANTS: Array<
  "default" | "secondary" | "outline" | "ghost" | "destructive"
> = ["default", "secondary", "outline", "ghost", "destructive"];

export const BADGE_VARIANTS: Array<"default" | "secondary" | "outline"> = [
  "default",
  "secondary",
  "outline",
];
