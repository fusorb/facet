import type { IconName } from "@fusorb/facet-components";

export interface Feature {
  title: string;
  desc: string;
  /** Semantic icon name resolved through the Icon registry. */
  icon: IconName;
}

export const FEATURES: Feature[] = [
  {
    title: "Radix quality",
    desc: "Accessible primitives with keyboard support and focus management, so you don't have to build them.",
    icon: "puzzle",
  },
  {
    title: "Themeable tokens",
    desc: "CSS variables for colors and spacing. Dark mode included. Swap into any project without changing markup.",
    icon: "palette",
  },
  {
    title: "Auth orchestration",
    desc: "A sign-in flow with MFA, passkeys and magic links that works with your backend.",
    icon: "lock",
  },
  {
    title: "Typed SDK",
    desc: "A TypeScript client for your identity API. Call it from the browser, not just the server.",
    icon: "zap",
  },
  {
    title: "Layout shells",
    desc: "Console, app and landing shells with sidebar, topbar and mobile support. Bring your own router.",
    icon: "ruler",
  },
  {
    title: "Your domain",
    desc: "Presets for fintech, healthcare and education. Extend them or build your own.",
    icon: "building",
  },
  {
    title: "Passkeys & MFA",
    desc: "WebAuthn passkeys, TOTP and recovery codes wired straight into the auth flow.",
    icon: "fingerprint-pattern",
  },
];

export interface InstallStep {
  num: string;
  label: string;
  code: string;
}

export const INSTALL_STEPS: InstallStep[] = [
  {
    num: "01",
    label: "Install",
    code: "pnpm add @fusorb/facet-components @fusorb/facet-auth @fusorb/facet-layout @fusorb/facet-sdk @fusorb/facet-docs",
  },
  {
    num: "02",
    label: "Import tokens",
    code: '@import "@fusorb/facet-tokens/tokens.css"',
  },
  {
    num: "03",
    label: "Use components",
    code: `import { Button, Card } from "@fusorb/facet-components"`,
  },
  {
    num: "04",
    label: "Wire auth",
    code: "<ArcProvider client={client}>...</ArcProvider>",
  },
  {
    num: "05",
    label: "Deploy your app",
    code: "pnpm build && pnpm preview",
  },
];

export const BUTTON_VARIANTS: Array<
  "default" | "outline" | "secondary" | "ghost" | "glass" | "glow"
> = ["default", "outline", "secondary", "ghost", "glass", "glow"];

export const BADGE_VARIANTS: Array<
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = ["default", "secondary", "outline", "success", "warning", "destructive"];

export interface RoadmapItem {
  phase: string;
  title: string;
  desc: string;
  status: "done" | "in-progress" | "planned";
}

/** Public roadmap, kept in sync with the .agent tracker and npm releases. */
export const ROADMAP: RoadmapItem[] = [
  {
    phase: "Phase 1",
    title: "Foundations",
    desc: "Tokens, icon registry, theme system and the first 30+ Radix components.",
    status: "done",
  },
  {
    phase: "Phase 2",
    title: "Auth + SDK",
    desc: "SignIn/SignUp/Guard/MFA with domain presets, and the typed SovGrant SDK.",
    status: "done",
  },
  {
    phase: "Phase 3",
    title: "Layouts + Docs",
    desc: "Console/auth/landing shells and the config-driven docs engine.",
    status: "done",
  },
  {
    phase: "Phase 4",
    title: "CLI + DX",
    desc: "facet pkg/doctor/update commands, -y shorthand, and a slim /light entry.",
    status: "done",
  },
  {
    phase: "Phase 5",
    title: "Component depth",
    desc: "CountryCodeInput ISO expansion, LocationPicker depth, DataTable xlsx/pdf export, NumberInput currency.",
    status: "done",
  },
  {
    phase: "Phase 6",
    title: "Ecosystem tools",
    desc: "SovGrant CLI basis, tree-shakeable icon imports, stack-agnosticism assessment for non-React consumers.",
    status: "done",
  },
  {
    phase: "Phase 7",
    title: "Audit & composability",
    desc: "Repo-wide composability audit, flat Animation docs, accordion sidebar, responsive surfaces, and live-preview reliability across all packages.",
    status: "done",
  },
  {
    phase: "Phase 8",
    title: "Polish & consistency",
    desc: "Default button animation switched to sparkle, global scrollbar hiding across all apps, em-dash purge, FAQ/version sync, facet-store package, and the NotFound component.",
    status: "done",
  },
];

/** FAQ moved to data/faq.ts. Re-exported here for backward compatibility. */
export type { FaqItem } from "./faq.js";
export { FAQ } from "./faq.js";
