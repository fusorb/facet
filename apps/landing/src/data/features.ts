import type { IconName } from "@arcevo/facet-components";

/** Live library stats, verified against the packages on every release. */
export const STATS = [
  { value: "113", label: "components" },
  { value: "10", label: "API SDKs" },
  { value: "3", label: "layout shells" },
  { value: "5", label: "auth presets" },
] as const;

export interface Package {
  name: string;
  desc: string;
  version: string;
  /** Semantic icon name resolved through @arcevo/facet-components' Icon registry. */
  icon: IconName;
}

/** The nine published packages (versions verified 2026-09-07 against npm). */
export const PACKAGES: Package[] = [
  {
    name: "@arcevo/facet-components",
    desc: "113 styled, accessible React components built on Radix primitives.",
    version: "1.11.0",
    icon: "boxes",
  },
  {
    name: "@arcevo/facet-docs",
    desc: "Installable docs engine: mount <DocsApp> with your own brand, nav, and pages.",
    version: "1.4.7",
    icon: "book-open",
  },
  {
    name: "@arcevo/facet-auth",
    desc: "SignIn, SignUp, Guard, MFA and forms with per-domain presets.",
    version: "1.2.3",
    icon: "shield-check",
  },
  {
    name: "@arcevo/facet-layout",
    desc: "Console, auth and landing shells with a collapsible icon rail.",
    version: "1.4.2",
    icon: "building",
  },
  {
    name: "@arcevo/facet-sdk",
    desc: "Typed fetch client for arc-id: 10 domain SDKs, zero React.",
    version: "1.2.0",
    icon: "zap",
  },
  {
    name: "@arcevo/facet-tokens",
    desc: "Alpha Palette design tokens: color, type, spacing, surfaces.",
    version: "1.1.4",
    icon: "palette",
  },
  {
    name: "@arcevo/facet-emails",
    desc: "Framework-agnostic email templates: render HTML/text from React or plain trees, with a dev preview server.",
    version: "1.1.1",
    icon: "mail",
  },
  {
    name: "@arcevo/facet-cli",
    desc: "Scaffold docs + emails, audit/update your facet setup, and generate a tree-shaken icon registry from the terminal.",
     version: "2.0.0",
    icon: "terminal",
  },
  {
    name: "@arcevo/facet-store",
    desc: "Framework-agnostic Zustand state stores for arc-id (session, tenant, token-refresh wiring) with pluggable client + storage.",
     version: "2.0.0",
    icon: "store",
  },
];

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
    code: "pnpm add @arcevo/facet-components @arcevo/facet-auth @arcevo/facet-layout @arcevo/facet-sdk @arcevo/facet-docs",
  },
  {
    num: "02",
    label: "Import tokens",
    code: '@import "@arcevo/facet-tokens/tokens.css"',
  },
  {
    num: "03",
    label: "Use components",
    code: `import { Button, Card } from "@arcevo/facet-components"`,
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
    desc: "SignIn/SignUp/Guard/MFA with domain presets, and the typed arc-id SDK.",
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
    desc: "arc-id CLI basis, tree-shakeable icon imports, stack-agnosticism assessment for non-React consumers.",
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
    desc: "SpotlightCard spotlight visibility, BorderBeamCard beam refinement, default button animation switched to sparkle, global scrollbar hiding across all apps, em-dash purge, FAQ/version sync, facet-store package, and the NotFound component, bringing the total to 113 components.",
    status: "done",
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

/** Public FAQ for the landing page. Versions are kept in sync with the published package surface (components 1.11.0, auth 1.2.3, layout 1.4.2, docs 1.4.7, tokens 1.1.4, sdk 1.2.0, emails 1.1.1, cli 2.0.0, store 2.0.0). */
export const FAQ: FaqItem[] = [
  {
    q: "Is facet free and open source?",
    a: "Yes. Every package is MIT-licensed and published to npm under @arcevo: components, auth, layout, docs, tokens, sdk, emails, cli, and store.",
  },
  {
    q: "Which React version does facet require?",
    a: "React 18 or 19. All packages list `react` and `react-dom` as peer dependencies.",
  },
  {
    q: "Does facet work with Tailwind v4?",
    a: "Yes. @arcevo/facet-tokens ships a CSS-native Tailwind v4 theme extension plus tw-animate-css, so the animation keyframes (facet-shimmer, facet-flip, etc.) build out of the box.",
  },
  {
    q: "Can I use the packages with a non-React stack?",
    a: "Components, auth, layout and docs are React-only. The arc-id SDK is framework-agnostic pure fetch (usable from any TS/JS host), and the tokens are plain CSS variables any stack can consume.",
  },
  {
    q: "Can I use facet without the arc-id backend?",
    a: "Yes. Components, layout and tokens are backend-agnostic. The auth flow and SDK are optional and plug into any API via an injectable client adapter.",
  },
  {
    q: "Do the packages support server-side rendering (Next.js, Remix)?",
    a: "Yes. The docs engine and layout shells are SSR-safe, and the animation family renders its initial state on the server (one-shot animations like CountUp start from their `from` value).",
  },
  {
    q: "How do I theme facet for my brand?",
    a: "All colors and spacing are CSS variables from @arcevo/facet-tokens. Override them at runtime via ThemeProvider `overrideVars`, or swap `tokens.css` with your own values. Dark mode is built in.",
  },
  {
    q: "Does facet work in a monorepo?",
    a: "Yes. The CLI detects pnpm/yarn/npm workspaces, scans workspace members for facet deps, and prints workspace-aware update commands.",
  },
  {
    q: "How do I update my facet packages?",
    a: "Run `facet pkg` to see installed vs latest versions, then `facet update` applies the exact command for your package manager (`-y` skips the confirmation, `--dry-run` only prints it).",
  },
  {
    q: "Can I copy components into my source instead of installing the package?",
    a: "Yes - `facet copy <ComponentName>` (e.g. `facet copy Button`) copies the component source plus its imports into your tree. Installing from the package is recommended so you keep getting updates and tree-shaking.",
  },
  {
    q: "How do I use the icon registry, and can I override it?",
    a: "The <Icon> component resolves any lucide-style kebab name out of the box. To use your own icons (react-icons, heroicons, or your own SVG components), pass overrides via <IconProvider overrides={{ settings: MyIcon }}> per app/domain, or `registerIcon(\"name\", MyIcon)` globally.",
  },
  {
    q: "Where can I see a live example of each component?",
    a: "The docs site has a live preview and variant tabs for every component, with copyable code that matches the selected variant. One-shot animations (CountUp, Flip, etc.) have a Replay button so you can watch them run.",
  },
  {
    q: "What animations does facet ship?",
    a: "Ten text animations (Blur, Wave, Flip, Split, FadeUp, Shimmer, Gradient, LetterSpacing, CountUp, Dissolve), TypewriterText, seven micro-interactions, AnimatedButton (sparkle/shine/ripple/magnetic/dissolve), and the card animation family (DissolveCard, FlipCard, SpotlightCard, etc.). The keyframe tokens live in @arcevo/facet-tokens so the CSS classes always emit.",
  },
  {
    q: "How do I scaffold docs and emails?",
    a: "Run `facet docs init` or `facet emails init` to drop a starter into any project. Use `--use-template <name>` to merge a specific starter without overwriting your customizations, or `facet templates list` / `facet templates describe` to browse available starters.",
  },
  {
    q: "How do I reach the facet team?",
    a: "Use the Feedback page (linked in the nav) to drop a line, or join the Discord linked from the docs - the maintainers read everything.",
  },
];
