import type { IconName } from "@arcevo/facet-components";
import { getDocsUrl } from "../lib/docs-url.js";

export interface EcosystemEntry {
  slug: string;
  name: string;
  title: string;
  version: string;
  icon: IconName;
  short: string;
  description: string;
  analysis: string[];
  features: string[];
  example: { code: string; lang: "ts" | "tsx" | "bash" }[];
  docsPath: string;
}

export function getEcosystemDocsUrl(entry: EcosystemEntry): string {
  return `${getDocsUrl()}${entry.docsPath}`;
}

/**
 * Detailed analysis of each facet ecosystem package.
 * Versions are verified against npm at the same cadence as PACKAGES.
 */
export const ECOSYSTEM: EcosystemEntry[] = [
  {
    slug: "docs-package",
  name: "@arcevo/facet-docs",
  title: "Docs Engine",
  version: "1.4.7",
    icon: "book-open",
    short: "Config-driven docs engine",
    description:
      "Installable docs engine: mount <DocsApp> with your own brand, nav, and pages.",
    analysis: [
      "The docs package is a zero-config, type-safe documentation engine built on Vite + React. It takes two props - a DocsSiteConfig (brand, navigation, ecosystem links) and a DocsPage[] registry - and renders a full docs site with live code previews, variant tabs, and copyable snippets.",
      "Pages are declared as data, not components: each DocPage is a list of typed blocks (paragraph, heading, code, install, table, ul) that the renderer turns into styled content. This keeps the docs surface in sync with the package surface - a CI gate verifies that every exported component from @arcevo/facet-components has a matching docs entry.",
      "The engine is designed to be consumed as a library, not a framework. An external project drops <DocsApp config={theirConfig} pages={theirPages} /> into a Vite shell and gets a fully branded docs site. facet dogfoods it here: this very site is a consumer of itself.",
    ],
    features: [
      "Config-driven: pass brand, navigation, and pages as props",
      "Live code previews with copy-to-clipboard snippets",
      "Typed page blocks: p, h2, ul, code, install, table",
      "Zero-config - install and render, no convention files",
      "SSR-safe with no-flash theme init",
      "CI gate: check:docs verifies barrel ↔ manifest (114 components)",
    ],
    example: [
      {
        lang: "tsx",
        code: `import { DocsApp } from "@arcevo/facet-docs";

<DocsApp config={demoConfig} pages={demoPages} />`,
      },
    ],
    docsPath: "/docs-package",
  },
  {
    slug: "layout",
    name: "@arcevo/facet-layout",
    title: "Layout",
    version: "1.4.2",
    icon: "building",
    short: "Domain-configurable app shells",
    description:
      "Console, auth and landing shells with sidebar, topbar, and mobile support.",
    analysis: [
      "The layout package provides three ready-to-use shells: ConsoleLayout (desktop sidebar + topbar), AuthLayout (centered auth flow), and LandingLayout (marketing full-bleed). Each is a thin shell that accepts nav, hero, and footer as ReactNode props, so you bring your own router and content.",
      "The Sidebar component uses a nested, type-safe nav config (NavSection[] → NavItem[] with NavChildren) and supports both expanded and collapsed (icon-rail) modes. Sections can be accordion-style (singleOpen) so only one section's children are visible at a time - useful for deep nav surfaces.",
      "Five domain presets (fintech, healthcare, education, enterprise, startup) configure the shell for sector-specific needs: sidebar grouping, topbar actions, and nav structure. Each preset is just a LayoutConfig object, so you can start from one and override individual fields.",
    ],
    features: [
      "Three shells: ConsoleLayout, AuthLayout, LandingLayout",
      "Collapsible Sidebar with icon-rail mode and tooltips",
      "Accordion sidebar sections (singleOpen)",
      "Five domain presets: fintech, healthcare, education, enterprise, startup",
      "Mobile-aware: Topbar collapses to a hamburger drawer on tablet/small screens",
      "Bring-your-own-router: no router dependency baked in",
    ],
    example: [
      {
        lang: "tsx",
        code: `import { ConsoleLayout, enterpriseLayoutPreset } from "@arcevo/facet-layout";

<ConsoleLayout config={enterpriseLayoutPreset} tenants={tenants}>
  <YourRoutes />
</ConsoleLayout>`,
      },
    ],
    docsPath: "/layout",
  },
  {
    slug: "stack-agnosticism",
    name: "Stack Agnosticism",
    title: "Stack Agnosticism",
    version: "concept",
    icon: "globe",
    short: "Beyond-React adoption assessment",
    description:
      "Which facet packages work outside React and how to bridge them.",
    analysis: [
      "facet is a React-first ecosystem, but not every package requires React. This assessment maps each package to a layer so teams using non-React stacks (Vue, Svelte, plain HTML, mobile, backend) can still consume the parts that matter.",
      "Pure CSS layer (@arcevo/facet-tokens): CSS variables for colors, typography, spacing, and animation keyframes. Any stack that includes a CSS file gets the design system. This is the most broadly consumable layer.",
      "Pure TS layer (@arcevo/facet-sdk, @arcevo/facet-store): the SDK is a pure-fetch client with zero React; the store is Zustand without React in the store logic (React hooks are an optional consumer layer). Both work in Node, Deno, React Native, or any environment with fetch + a state primitive.",
      "React layer (@arcevo/facet-components, @arcevo/facet-auth, @arcevo/facet-layout, @arcevo/facet-docs): these require React at runtime. For non-React consumers, the component registry can be copied via the CLI (facet copy) into the consumer's framework, or the components can be used via SSR/SSG with framework adapters.",
    ],
    features: [
      "Layer matrix: CSS, pure-TS, and React layers clearly separated",
      "SDK works in any TS/JS environment (browser, Node, React Native)",
      "Store works imperatively via getState() without React hooks",
      "Tokens are plain CSS variables - framework-agnostic",
      "Component copy path via facet CLI for non-React adoption",
    ],
    example: [
      {
        lang: "ts",
        code: `// Pure TS / non-React usage
import { ArcIdClient, AuthSdk } from "@arcevo/facet-sdk";

const client = new ArcIdClient({ baseUrl: "https://auth.example.com/api/v1" });
const auth = new AuthSdk(client);
const { data } = await auth.me();`,
      },
    ],
    docsPath: "/stack-agnosticism",
  },
  {
    slug: "cli",
    name: "@arcevo/facet-cli",
    title: "CLI",
    version: "2.0.0",
    icon: "terminal",
    short: "Scaffold, audit, and maintain facet projects",
    description:
      "Scaffold docs + emails, audit/update your facet setup, and generate a tree-shaken icon registry.",
    analysis: [
      "The facet CLI is a developer-experience tool that operates on your repo, not a global config. It detects your package manager (pnpm/yarn/npm), monorepo layout, framework (Next, Remix, Vite, plain JS), and styling (Tailwind, facet-tokens, plain CSS), then tailors its output.",
      "The CLI has four concerns: scaffolding (docs init, emails init), maintenance (pkg, doctor, update, up, clean), component management (copy), and DX utilities (icons generate, templates list/describe, scripts, prep). Each command prints repo-aware next steps - not generic instructions, but instructions specific to your stack.",
      "The icon registry generator is notable: it scans your source for <Icon> call sites and emits a generated registry with direct lucide imports. Legacy names are mapped (grid → layout-grid, logout → log-out), so renames don't break your code. This keeps your bundle free of unused icon imports.",
    ],
    features: [
      "facet pkg - show installed vs latest published versions",
      "facet doctor - audit repo: layout, deps, best-practice suggestions",
      "facet up - apply facet package updates at latest versions",
      "facet docs init - scaffold a docs site (interactive wizard or -y)",
      "facet docs scan - read repo and draft documentation layer",
      "facet emails init - scaffold or migrate email templates",
      "facet copy <component> - copy a component into your source (shadcn-style)",
      "facet icons generate - tree-shaken lucide icon registry",
      "facet templates list/describe - discover and inspect template dirs",
    ],
    example: [
      {
        lang: "bash",
        code: `facet pkg        # versions
facet doctor      # audit
facet up          # update facet packages
facet docs init   # scaffold docs site`,
      },
    ],
    docsPath: "/cli",
  },
  {
    slug: "emails",
    name: "@arcevo/facet-emails",
    title: "Emails",
    version: "1.1.1",
    icon: "mail",
    short: "Framework-agnostic email templates",
    description:
      "Framework-agnostic email templates: render HTML/text from React or plain trees, with a dev preview server.",
    analysis: [
      "The emails package has a two-layer design. The core accepts a plain, serializable tree ({ tag, props, children }) and renders it to email-safe HTML and plain text - zero runtime dependencies, so any host (React, plain JS, a Node backend, or even a JSON tree from another language) can use it. An optional React bridge (EmailLayout, EmailButton, etc.) gives JSX ergonomics on top.",
      "Branding is data-driven: you pass a brand object (primary, background, surface, text, muted, fontFamily, radius, brandName) to renderEmail, and every template re-themes. This means a single template set works for every customer without forking.",
      "The dev preview server (startEmailPreviewServer) is a dependency-light node:http server that renders registered templates with an HTML/text toggle. It's designed to be started locally during development - not in production - so designers and copywriters can preview emails without deploying.",
    ],
    features: [
      "Framework-agnostic core (zero runtime deps) + optional React bridge",
      "Email-safe HTML + plain text from the same tree",
      "Brand tokens drive all templates (primary, background, surface, text, font, radius)",
      "Dev preview server with template index + HTML/text toggle",
      "Primitives: EmailLayout, EmailButton, EmailText, EmailCodeBlock, EmailSection, EmailRow, EmailColumn, EmailSecurityNotice, EmailLink, EmailDivider, EmailList",
      "Migration path from react-email, mjml, nodemailer, resend",
    ],
    example: [
      {
        lang: "ts",
        code: `import { renderEmail, emailLayout, emailButton, emailText } from "@arcevo/facet-emails";

const html = renderEmail(
  emailLayout(
    { previewText: "Welcome", heading: "Hi!", brandName: "Acme" },
    emailText({ children: "Your account is ready." }),
    emailButton({ href: "https://acme.dev/dashboard", children: "Go to Dashboard" }),
  ),
);`,
      },
    ],
    docsPath: "/emails",
  },
  {
    slug: "sdk",
  name: "@arcevo/facet-sdk",
  title: "arc-id SDK",
  version: "1.2.0",
    icon: "zap",
    short: "Typed arc-id API client",
    description:
      "Typed fetch client for arc-id: 10 domain SDKs, zero React.",
    analysis: [
      "The SDK is a pure-fetch, framework-agnostic TypeScript client for the arc-id identity API. It mirrors all 62 routes across 10 domain-specific modules (Auth, Identity, OAuth, Passkey, Tenant, VC, Webhooks, Billing, Audit, Idp) and normalizes the { success, data } envelope so methods return the inner payload directly.",
      "Two integration modes: first-party (own arc-id backend) uses session-based flows with no client credentials; external integration (OAuth2/OIDC) uses the authorize → exchange → refresh pattern with PKCE support. The SDK handles both flows natively.",
      "Auto-refresh is wired through callbacks (onTokenRefresh, onAuthCleared), not built-in. This makes the SDK agnostic to your state management - pair it with @arcevo/facet-store via createZustandTokenStorage, or wire it to your own store. Every endpoint is audited against arc-id's ROUTES index via scripts/audit-sdk-coverage.cjs (62/62 covered).",
    ],
    features: [
      "Pure fetch, zero React, framework-agnostic",
      "10 domain SDKs: Auth, Identity, OAuth, Passkey, Tenant, VC, Webhooks, Billing, Audit, Idp",
      "Session-based + OAuth2/OIDC flows with PKCE",
      "Auto-refresh on 401 via onTokenRefresh callback (re-entrancy guarded)",
      "Service-to-service: client_credentials grant for background jobs",
      "All 62 endpoints audited against arc-id's ROUTES index",
    ],
    example: [
      {
        lang: "ts",
        code: `import { ArcIdClient, AuthSdk } from "@arcevo/facet-sdk";

const client = new ArcIdClient({ baseUrl: "https://auth.example.com/api/v1" });
const auth = new AuthSdk(client);

const { data, error } = await auth.login("user@example.com", "pw");
// data = { identity, sessionId, requiresMfa, accessToken?, refreshToken? }`,
      },
    ],
    docsPath: "/sdk",
  },
  {
    slug: "store",
  name: "@arcevo/facet-store",
  title: "State Stores",
  version: "2.0.0",
    icon: "store",
    short: "Zustand state stores for arc-id sessions",
    description:
      "Framework-agnostic Zustand state stores for arc-id sessions + tenant state, with a token-refresh bridge for 401 auto-recovery.",
    analysis: [
      "The store package provides two Zustand stores on top of the SDK: useAuthStore (user, accessToken, refreshToken, isAuthenticated, isAuthenticated, isLoading) and useTenantStore (activeTenant, tenants, isLoading). The store logic itself has zero React - React hooks are a consumer layer. Non-React code calls store.getState() imperatively.",
      "The createZustandTokenStorage bridge is the key integration point. It wires the auth store and an AuthSdk into the ArcIdClient callbacks: on 401, it reads the current refresh token from the store, calls sdk.refresh(), updates the store with the new token bundle, and clears auth on permanent failure. A re-entrancy guard prevents infinite refresh loops.",
      "Because the bridge only depends on a TokenStoreLike and TokenRefresher contract (not on facet's own store), you can swap in any state management (Redux, Valtio, Jotai) by providing compatible interfaces. This is the stack-agnosticism principle in practice: store + SDK bridge is pure TS, the React hooks are an optional layer on top.",
    ],
    features: [
      "Two Zustand stores: useAuthStore (session) + useTenantStore (tenants)",
      "createZustandTokenStorage bridge: 401 auto-refresh with re-entrancy guard",
      "Framework-agnostic store logic - React hooks are optional",
      "Non-React consumers call getState() imperatively",
      "Swap-in compatible: any state manager with TokenStoreLike/TokenRefresher",
      "Clear separation: pure-TS stores, optional React hooks layer",
    ],
    example: [
      {
        lang: "ts",
        code: `import { createZustandTokenStorage } from "@arcevo/facet-store";
import { ArcIdClient, AuthSdk } from "@arcevo/facet-sdk";

const client = new ArcIdClient({
  baseUrl,
  onTokenRefresh: createZustandTokenStorage({
    authStore: useAuthStore,
    sdk: authSdk,
  }).onTokenRefresh,
  onAuthCleared: () => {
    useAuthStore.getState().clearAuth();
    useTenantStore.getState().reset();
  },
});`,
      },
    ],
    docsPath: "/store",
  },
  {
    slug: "components",
    name: "@arcevo/facet-components",
    title: "Components",
    version: "1.12.0",
    icon: "boxes",
    short: "114 styled, accessible React components",
    description:
      "Radix-quality primitives, themed with the Alpha Palette, ready to copy or import.",
    analysis: [
      "The components package is the visual layer: 114 polished, accessible React components built on Radix primitives and themed with the Alpha Palette tokens. Every component ships typed, focus-managed, dark-mode-aware, and SSR-safe - so consumers get shadcn quality without inheriting shadcn's drift problem.",
      "Three layers of composition: Layer 1 are headless primitives (Button, Input, Card); Layer 2 are styled surfaces built on those primitives (Marquee, Tabs, DataTable, NumberInput); Layer 3 are ready-to-use pages wired from the layers below (BillingPage, FeedbackPage, AccountSettingsPanel, StatCard, ActivityFeed, PageHeader, ApiKeyManager, TestimonialShowcase, OtpVerificationCard, TwoFactorSetupPanel, InviteTeamForm, PasswordStrengthMeter, SecuritySectionCard, CookieConsent, AnnouncementBar, NotFound, FaqSection).",
      "The card-animation family (FlipCard, SpotlightCard, BorderBeamCard, ShineCard, GradientBorderCard, RevealCard, HoverScaleCard, MagneticCard, DissolveCard, GlowCard, TiltCard) covers the 'shadcn-ish aesthetic' without forcing consumers to wire it up - drop one in and you get a motion story that respects the design system.",
      "Iconography is pluggable: <Icon> resolves any lucide-style kebab name out of the box via the IconRegistry (registered in @arcevo/facet-components (1.12.0)). To use react-icons, heroicons, or your own SVG components, pass overrides via <IconProvider overrides={{ settings: MyIcon }}> per app/domain, or `registerIcon(\"name\", MyIcon)` globally.",
      "Theming happens through CSS variables emitted by @arcevo/facet-tokens. Override any token at runtime via <ThemeProvider overrideVars={{ '--primary': '...' }}> without recompiling. Dark mode is built in and respects the system preference until the user overrides it.",
    ],
    features: [
      "114 typed Radix-powered components, named-export only",
      "Layered architecture: primitives → styled surfaces → ready-to-use pages",
      "Alpha Palette tokens via @arcevo/facet-tokens (CSS variables, no recompile)",
      "Icon registry: lucide out of the box, swap in any icon set per app/domain",
      "Card-animation family (11 motion cards) and micro-interactions (10+ buttons)",
      "SSR-safe: one-shot animations render initial state on the server",
      "All exports are typed; barrel index; CI gate (check:docs) verifies coverage",
    ],
    example: [
      {
        lang: "tsx",
        code: `import { Button, Card, CardHeader, CardTitle, CardContent, Marquee, TypewriterText } from "@arcevo/facet-components";

<Card>
  <CardHeader>
    <CardTitle>Hello, facet</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">A primary action</Button>
  </CardContent>
</Card>`,
      },
    ],
    docsPath: "/components",
  },
  {
    slug: "auth",
    name: "@arcevo/facet-auth",
    title: "Auth",
    version: "1.2.3",
    icon: "shield-check",
    short: "Sign-in state machine with domain presets",
    description:
      "ArcProvider, SignIn, SignUp, Guard, MfaDialog, UserButton, and seven standalone forms.",
    analysis: [
      "The auth package is a configurable, controlled state machine for sign-in and sign-up flows. The SignIn component is a fully typed IDLE → CHECK_SESSION → SELECT_METHOD → LOGIN_FORM / MAGIC_LINK_FORM / SOCIAL_LOGIN / PASSKEY_AUTH → CHECK_MFA → MFA_CHALLENGE → COMPLETE → STEP_UP machine. The host application can subscribe to step changes via the controlled `step` / `onStepChange` props and render whatever custom UI it needs at any stage.",
      "Three customization axes make it domain-customizable: `appearance` (style overrides), `config` (behavior flags like which methods are enabled, MFA requirement, session TTL), and `slots` (render props for form fields, action buttons, redirect target). This is why a fintech deployment can wire step-up MFA on every session, a healthcare deployment can plug HIPAA-aware session TTL into the same SignIn, and an education deployment can default to passkeys and social login.",
      "Domain presets ship out of the box: fintech (MFA required, 15-minute TTL, magic link enabled), med (MFA required, 30-minute TTL, magic link disabled), edu (passkeys enabled, 24-hour TTL, magic link enabled), enterprise (MFA required, optional passkeys, 8-hour TTL). Each preset is a plain AuthConfig object you can start from and override.",
      "Eight standalone forms (LoginForm, MagicLinkForm, ForgotPasswordForm, ResetPasswordForm, MfaVerifyForm, MfaSetupForm, MfaRecoveryCodesForm, MfaRecoveryForm) let consumers compose their own flow without inheriting the full SignIn machine. All forms wire react-hook-form + Zod for inline validation; no plumbing code required on the consumer side.",
      "Token storage is pluggable: pass any TokenStorage implementation to <ArcProvider storage={...}>. The default uses localStorage in development with a clear, once-fired console.warn (added in the Phase 0 security fix); production deployments are expected to wire an httpOnly cookie adapter or an in-memory store.",
    ],
    features: [
      "SignIn: configurable state machine, controlled step/onStepChange API",
      "Eight standalone forms (LoginForm, MagicLinkForm, ForgotPasswordForm, ResetPasswordForm, MfaVerifyForm, MfaSetupForm, MfaRecoveryCodesForm, MfaRecoveryForm)",
      "Four domain presets: fintech, med, edu, enterprise (with override surface)",
      "react-hook-form + Zod validation wired in for every form",
      "Pluggable token storage: dev default warns, production wires cookie or in-memory",
      "Guard component for protected-route gating; UserButton for account menu",
    ],
    example: [
      {
        lang: "tsx",
        code: `import { ArcProvider, SignIn, fintechPreset } from "@arcevo/facet-auth";

<ArcProvider config={fintechPreset} client={arcIdClient}>
  <SignIn
    onSuccess={() => navigate("/dashboard")}
    appearance={{ accent: "primary" }}
  />
</ArcProvider>`,
      },
    ],
    docsPath: "/auth",
  },
  {
    slug: "tokens",
    name: "@arcevo/facet-tokens",
    title: "Tokens",
    version: "1.1.4",
    icon: "palette",
    short: "Alpha Palette design tokens as CSS variables",
    description:
      "Color, typography, spacing, surfaces, and animation keyframes as plain CSS variables.",
    analysis: [
      "The tokens package is the design system source of truth. Every color, spacing unit, typography scale, surface radius, shadow depth, and animation keyframe lives in tokens.css as a custom property. Consumers import the CSS, and the components package picks them up via Tailwind v4's @theme directive. No JS dependency, no build step - just one CSS file.",
      "The Alpha Palette is a curated, accessible-by-default palette: foreground/background pairs pass WCAG AA contrast in both light and dark mode; the primary accent is Electric Cyan (#06b6d4 family) in web/dark contexts, which gives the components their characteristic crisp tone. Sub-brand palettes (consumer/enterprise/fintech/med/edu) are defined in tokens/src/sub-brands.ts as plain TS objects, ready to be re-exported as React Native theme objects for the mobile kit planned in Phase 3 of the roadmap.",
      "Animation tokens ship as named keyframes: facet-shimmer, facet-flip, facet-bounce, facet-pulse-soft, facet-tilt, facet-spotlight, facet-beam, facet-dissolve, facet-magnetic. They are referenced by the components package's card-animation family and micro-interactions - so any CSS utility class that needs them just emits the right keyframe reference. tw-animate-css is included as a dependency so Tailwind consumers get them in the build for free.",
      "Override at runtime via <ThemeProvider overrideVars={{ '--primary': '#ff6b6b' }}> to retheme without a rebuild. Override at build time by replacing tokens.css. Override per-component via Tailwind className. The same surface, three escape hatches, all type-safe.",
    ],
    features: [
      "Single tokens.css file: colors, typography, spacing, surfaces, animations",
      "Alpha Palette: WCAG-AA contrast in light + dark mode",
      "Electric Cyan primary in web/dark contexts (consistent with components)",
      "tw-animate-css included - animation keyframes emit in Tailwind builds",
      "Sub-brand palettes exported as plain TS objects (RN-ready)",
      "Three escape hatches: runtime overrideVars, build-time CSS swap, per-component Tailwind",
    ],
    example: [
      {
        lang: "tsx",
        code: `/* tokens.css */
@import "@arcevo/facet-tokens/tokens.css";

:root {
  /* override per-brand */
  --primary: oklch(0.6 0.18 250);
  --radius: 0.75rem;
}`,
      },
    ],
    docsPath: "/tokens",
  },
];
