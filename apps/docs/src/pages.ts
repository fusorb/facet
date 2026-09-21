import type { DocsPage } from "@fusorb/facet-docs";
import { facetChangelog } from "./data/changelog.js";

/**
 * facet's own authored guide pages.
 *
 * These are facet's documentation content: NOT part of the @fusorb/facet-docs
 * engine. Consumers mount <DocsApp> with their own pages; this registry is
 * just the demo consumer's content, kept out of the package so installing
 * the docs package doesn't ship facet's docs.
 */
export const docsPages: DocsPage[] = [
  {
    path: "/",
    title: "Overview",
    section: "guides",
    description: "Domain-customizable, auth-first component system.",
    blocks: [
      {
        type: "p",
        text: "facet is what you get when you own the identity backend (SovGrant), have a formal design manual (Alpha Palette), and your auth requirements differ per sector (fintech vs med vs edu vs enterprise).",
      },
      { type: "h2", text: "Packages" },
      {
        type: "ul",
        items: [
          "`@fusorb/facet-tokens`: Alpha Palette design tokens, typography, spacing, CSS variables.",
          "`@fusorb/facet-sdk`: SovGrant API client (pure fetch, typed, 10 domain SDKs).",
          "`@fusorb/facet-components`: 113 styled UI components (Radix + tailwind-merge + variants), including ready-to-use extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap, Form, Stepper, KanbanBoard, ChangelogList, Pill).",
          "`@fusorb/facet-auth`: auth components + domain presets: SignIn, SignUp, Guard, MfaDialog, forms.",
          "`@fusorb/facet-layout`: domain-configurable app shell: ConsoleLayout, AuthLayout, LandingLayout, Sidebar, Topbar, 5 presets.",
          "`@fusorb/facet-store`: framework-agnostic Zustand state stores - auth session + tenant state, plus `createZustandTokenStorage` bridge for 401 auto-refresh, web + React Native.",
          "`@fusorb/facet-docs`: this config-driven docs engine, installable by any project.",
          "`@fusorb/facet-emails`: framework-agnostic email templates: render HTML/text from React or plain trees, with a dev preview server.",
          "`@fusorb/facet-cli`: scaffold docs + emails sites, audit and update your facet setup from the terminal.",
        ],
      },
      { type: "h2", text: "Architecture" },
      {
        type: "p",
        text: "Every component follows 4 layers: **Primitive → Styled Base → Composed → Domain Preset**. Customization runs along 3 axes: `appearance` (style), `config` (behavior), and `slots` (render props).",
      },
      { type: "h2", text: "Quick start" },
      {
        type: "code",
        text: `pnpm install
pnpm build
pnpm test      # 715 test cases across 56 test files (vitest workspace)
pnpm typecheck # all projects`,
      },
      { type: "p", text: "Consume in your app:" },
      {
        type: "code",
        text: `import { ConsoleLayout, enterpriseLayoutPreset } from "@fusorb/facet-layout";
import { Guard, fintechPreset } from "@fusorb/facet-auth";

function App() {
  return (
    <ConsoleLayout config={enterpriseLayoutPreset} tenants={tenants}>
      <Guard fallback={<SignIn config={fintechPreset} />}>
        <YourRoutes />
      </Guard>
    </ConsoleLayout>
  );
}`,
      },
      { type: "h2", text: "Publishing" },
      {
        type: "p",
        text: 'Packages publish to npm under the `@fusorb/facet-*` scope via Changesets. The GitHub Actions workflow runs a validation gate (build, typecheck, docs inventory) and an auto-version job that opens the "Version Packages" PR on main. Publishing itself is done locally by the maintainer (`pnpm changeset publish`) from a clean tree, after `pnpm -r build` passes.',
      },
    ],
  },
  {
    path: "/getting-started",
    title: "Getting Started",
    section: "guides",
    description: "Install the packages and boot a facet app in minutes.",
    blocks: [
      { type: "h2", text: "1. Install" },
      {
        type: "install",
        pkg: "@fusorb/facet-components",
        extras: [
          "@fusorb/facet-sdk",
          "@fusorb/facet-auth",
          "@fusorb/facet-layout",
        ],
      },
      { type: "p", text: "Tokens are optional but recommended:" },
      {
        type: "install",
        pkg: "@fusorb/facet-tokens",
      },
      { type: "h2", text: "2. Import tokens" },
      {
        type: "p",
        text: "The Alpha Palette tokens ship as CSS variables. Import them once at your app root:",
      },
      { type: "code", text: `@import "@fusorb/facet-tokens/tokens.css";` },
      {
        type: "p",
        text: "If you use Tailwind v4, import the theme extension to map the variables onto utility classes (`bg-primary`, `text-foreground`, ...):",
      },
      { type: "code", text: `@import "@fusorb/facet-tokens/tailwind.css";` },
      { type: "h2", text: "3. Theme provider" },
      {
        type: "p",
        text: "Wrap your app in `ThemeProvider` for light/dark/system theming:",
      },
      {
        type: "code",
        text: `import { ThemeProvider, ThemeToggle } from "@fusorb/facet-components";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ThemeToggle />
      <YourApp />
    </ThemeProvider>
  );
}`,
      },
      { type: "h2", text: "4. Render a component" },
      {
        type: "code",
        text: `import { Button, Badge } from "@fusorb/facet-components";

<Button variant="default" size="lg">Get started</Button>
<Badge variant="success">Live</Badge>`,
      },
      { type: "h2", text: "5. Auth in 30 seconds" },
      {
        type: "p",
        text: "The auth components compose with domain presets so copy, steps, and behavior adapt per sector:",
      },
      {
        type: "code",
        text: `import { ArcProvider, SignIn, fintechPreset } from "@fusorb/facet-auth";

<ArcProvider client={client}>
  <SignIn config={fintechPreset} />
</ArcProvider>`,
      },
      {
        type: "p",
        text: "See the `Auth` guide for the full state machine and preset table.",
      },
      { type: "h3", text: "Domain presets" },
      {
        type: "ul",
        items: [
          "`fintechPreset`: KYC/AML-aware copy, regulatory footer, masked PAN display.",
          "`medPreset`: HIPAA consent language, patient identifier styling, audit trail.",
          "`eduPreset`: institutional SSO defaults, student email validation.",
          "`enterprisePreset`: SAML/OIDC, SCIM provisioning, B2B org picker.",
        ],
      },
      { type: "h2", text: "6. App shells" },
      {
        type: "p",
        text: "The layout package provides framework-agnostic, slot-based shells with no routing dependency. Pair `ConsoleLayout` with a router adapter for Next, Remix, or react-router. See the `Layout` guide.",
      },
      {
        type: "p",
        text: "Want this exact docs site in your own project? See the `Docs Package` guide for mounting `@fusorb/facet-docs` with your brand and pages.",
      },
      { type: "h2", text: "7. Keyboard shortcuts" },
      {
        type: "p",
        text: "The docs shell and component gallery ship with keyboard shortcuts. `mod` is `⌘` on macOS and `Ctrl` on Windows/Linux. They're ignored while you're typing in an input.",
      },
      { type: "keyboardShortcuts" },
      { type: "h2", text: "8. Use the docs package" },
      {
        type: "p",
        text: "Want a docs site like this one in your own project? `@fusorb/facet-docs` is an installable docs engine. Mount `<DocsApp>` with your brand, pages, and content blocks:",
      },
      {
        type: "code",
        lang: "tsx",
        text: `import { DocsApp } from "@fusorb/facet-docs";
import type { DocsPage, DocsSiteConfig } from "@fusorb/facet-docs";

const config: DocsSiteConfig = {
  brand: { name: "my-app", tagline: "My product docs" },
  navigation: [],
};

const pages: DocsPage[] = [
  {
    path: "/",
    title: "Overview",
    section: "guides",
    blocks: [{ type: "p", text: "Welcome." }],
  },
];

export function App() {
  return <DocsApp config={config} pages={pages} />;
}`,
      },
      {
        type: "p",
        text: "Pages are plain data (route + title + section + blocks). The sidebar nav, search palette, and routes all derive from the same registry. See the `Docs Package` guide for every block type and the full config surface.",
      },
      { type: "h2", text: "9. Where to go next" },
      {
        type: "ul",
        items: [
          "`Auth`: the SignIn state machine, standalone forms, MFA, guards, and domain presets.",
          "`Layout`: ConsoleLayout, AuthLayout, LandingLayout, sidebar/topbar, and router adapters.",
          "`Theming`: light/dark/system theming and per-brand token overrides.",
          "`Docs Package`: mount @fusorb/facet-docs with your own brand and pages.",
          "`Components`: browse the component gallery with live demos and usage tabs.",
          "`Ready to Use`: drop-in extras like Dropzone, ColorPicker, QRCode, Marquee, Roadmap, and Form.",
        ],
      },
      {
        type: "p",
        text: "**Your first facet app:** install the packages → import tokens → wrap in `ThemeProvider` → render a component → drop in `ArcProvider` + `SignIn` → wrap in a `ConsoleLayout` shell. Each step is a section above.",
      },
    ],
  },
  {
    path: "/theming",
    title: "Theming",
    section: "guides",
    description: "Light, dark, and system theming via design tokens.",
    blocks: [
      {
        type: "p",
        text: "facet drives theming with a `data-theme` attribute on `<html>`. Design tokens are CSS custom properties; each theme swaps the values. The `ThemeProvider` sets the attribute, persists the choice to `localStorage`, and follows the OS preference when set to `system`.",
      },
      { type: "h2", text: "ThemeProvider" },
      {
        type: "code",
        text: `<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>`,
      },
      {
        type: "p",
        text: "Props: `defaultTheme` (`light | dark | system`), `storageKey`, `enableSystem`, `attribute`, `themes`, and `overrideVars`.",
      },
      { type: "h2", text: "useTheme" },
      {
        type: "p",
        text: "Access the current theme, toggle it, or read the resolved (non-system) value:",
      },
      {
        type: "code",
        text: `import { useTheme } from "@fusorb/facet-components";

function MyHeader() {
  const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme();
  return <button onClick={toggleTheme}>{resolvedTheme === "dark" ? "Light" : "Dark"}</button>;
}`,
      },
      { type: "h2", text: "Override variables per brand" },
      {
        type: "p",
        text: "Consumers can override any token (e.g. `--primary`, `--sub-brand-accent`) without forking components:",
      },
      {
        type: "code",
        text: `<ThemeProvider
  defaultTheme="dark"
  overrideVars={{ "--primary": "oklch(0.5 0.2 30)" }}
>
  <App />
</ThemeProvider>`,
      },
      { type: "h2", text: "Dark mode utilities" },
      {
        type: "p",
        text: 'The Tailwind v4 theme extension registers a `dark:` variant scoped to `[data-theme="dark"]`, so you can write theme-aware utilities:',
      },
      {
        type: "code",
        text: `<div className="bg-background text-foreground dark:bg-navy-900 dark:text-muted-foreground">
  ...
</div>`,
      },
      { type: "h2", text: "Best practices" },
      {
        type: "ul",
        items: [
          "Prefer token utilities (`bg-primary`) over hardcoded colors.",
          "Use `ThemeToggle` for a ready-made light/dark switch.",
          "Set `overrideVars` once per brand at the app root.",
        ],
      },
      {
        type: "p",
        text: "The auth presets (fintech, med, edu, enterprise) each configure MFA, passkeys, and session TTL per sector - see the [Auth presets](/auth/presets) page for the full comparison table.",
      },
    ],
  },
  {
    path: "/tokens",
    title: "Design Tokens",
    section: "guides",
    description:
      "Alpha Palette tokens: color, typography, spacing, and surfaces.",
    blocks: [
      {
        type: "p",
        text: "The @fusorb/facet-tokens package exports tokens.css (CSS variables) and tailwind.css (maps them to Tailwind v4 utilities like bg-background and text-foreground).",
      },
      { type: "h2", text: "Color" },
      {
        type: "ul",
        items: [
          "background / foreground",
          "primary / primary-foreground",
          "secondary / secondary-foreground",
          "destructive / destructive-foreground",
          "success / warning",
          "muted / muted-foreground",
          "accent / accent-foreground",
          "card / card-foreground",
          "border, ring, input",
        ],
      },
      { type: "h2", text: "Typography" },
      {
        type: "p",
        text: "font-heading, font-sans (Inter), and font-mono (JetBrains Mono) map to Tailwind's font-heading / font-sans / font-mono utilities.",
      },
      { type: "h2", text: "Surfaces" },
      {
        type: "p",
        text: "frost and glass surface treatments are exposed as CSS variables so consumers can tune opacity, blur, and borders per theme.",
      },
    ],
  },
  {
    path: "/auth",
    title: "Auth",
    section: "auth",
    description: "Domain-customizable auth components wired to SovGrant.",
    blocks: [
      {
        type: "p",
        text: "The `@fusorb/facet-auth` package provides SignIn, SignUp, Guard, MfaDialog, forms, and domain presets. Everything is customizable per sector (fintech, med, edu, enterprise) via appearance / config / slots.",
      },
      {
        type: "p",
        text: "The sign-in flow is a configurable state machine. The email/password form is the embedded default entry point; the other methods branch off it based on `config`. Head to the [Sign In](/auth/sign-in) page: it is the single home for the interactive demo: pick a method, watch the live preview, and copy the matching code.",
      },
      {
        type: "demo",
        slug: "sign-in",
        title: "Sign In",
        description: "Live preview with a method switcher and copyable code.",
      },
      { type: "h2", text: "In this section" },
      {
        type: "ul",
        items: [
          "[Sign In](/auth/sign-in): the sign-in state machine, methods, and controlled `step`.",
          "[Sign Up](/auth/sign-up): account creation and customization.",
          "[MFA](/auth/mfa): MfaDialog and the verify/setup/recovery forms.",
          "[Guards](/auth/guard): protect routes with `Guard`.",
          "[Domain Presets](/auth/presets): fintech, med, edu, enterprise.",
        ],
      },
    ],
  },
  {
    path: "/auth/sign-in",
    title: "Sign In",
    section: "auth",
    description: "The configurable SignIn state machine and its method forms.",
    blocks: [
      {
        type: "p",
        text: "`SignIn` is a configurable state machine. The email/password form is the embedded default entry point; the other methods branch off it based on `config`.",
      },
      { type: "authDemo" },
      { type: "h2", text: "State machine" },
      {
        type: "p",
        text: "Steps: `idle` → `check_session` → `login_form` / `magic_link_form` / `passkey_auth` → `check_mfa` → `mfa_challenge` → `complete`. `select_method` remains reachable as a fallback step.",
      },
      { type: "h2", text: "Controlled mode" },
      {
        type: "p",
        text: "Pass `step` + `onStepChange` to render exactly a given step and drive SignIn from outside. When omitted, SignIn manages its own transitions.",
      },
      {
        type: "code",
        text: `<SignIn
  step={step}
  onStepChange={setStep}
  config={{ requireMfa: true, allowMagicLink: false }}
/>`,
      },
      { type: "h2", text: "Methods" },
      {
        type: "p",
        text: "The email/password form is the embedded default entry point; the other methods branch off it based on `config`.",
      },
      { type: "h3", text: "Email + password" },
      {
        type: "p",
        text: "The default form. Submit calls `auth.login(email, password)` and returns `{ sessionId, requiresMfa }`.",
      },
      { type: "h3", text: "Magic link" },
      {
        type: "p",
        text: "Passwordless email link, enabled via `config.allowMagicLink`. Calls `auth.magicLink(email, redirectUri)`.",
      },
      { type: "h3", text: "Passkey" },
      {
        type: "p",
        text: "WebAuthn passkeys via the real SDK, enabled via `config.allowPasskey`. Calls `auth.passkey()` for registration + authentication.",
      },
      { type: "h3", text: "OAuth" },
      {
        type: "p",
        text: "Provider buttons rendered from `config.oauthProviders`. Each button calls `onOAuth(provider)`, which starts the OAuth authorize-exchange flow.",
      },
      { type: "h2", text: "Customizing components" },
      {
        type: "p",
        text: "Every auth component is dynamically configurable through three prop families: `appearance` (styling), `slots` (content replacement), and `config` (behavior).",
      },
      {
        type: "code",
        text: `<SignIn
  appearance={{ className: "max-w-md rounded-3xl border-primary/20" }}
  slots={{ title: <h1>Welcome back</h1> }}
  config={{ requireMfa: true, allowMagicLink: false, oauthProviders: ["google"] }}
/>`,
      },
    ],
  },
  {
    path: "/auth/sign-up",
    title: "Sign Up",
    section: "auth",
    description: "Account creation with the SignUp component.",
    blocks: [
      {
        type: "p",
        text: "`SignUp` mirrors the `SignIn` configuration surface: `appearance`, `slots`, and `config` all apply the same way.",
      },
      {
        type: "code",
        text: `import { SignUp } from "@fusorb/facet-auth";

<SignUp
  config={eduPreset}
  onSuccess={(result) => router.push("/dashboard")}
/>`,
      },
      { type: "h2", text: "Slots" },
      {
        type: "ul",
        items: [
          "title / description: card header copy.",
          "footer: extra content below the form.",
          "complete: replaces the success state.",
        ],
      },
      { type: "h2", text: "Copy" },
      {
        type: "p",
        text: "Every label, placeholder, button text, and error message is editable via the `copy` prop (falls back to defaults when omitted):",
      },
      {
        type: "code",
        text: `<SignUp
  copy={{
    title: "Join the platform",
    nameLabel: "Your name",
    emailLabel: "Work email",
    passwordLabel: "Secret",
    confirmLabel: "Repeat secret",
    submitLabel: "Sign up now",
    alreadyHaveAccount: "Have an account?",
    signInLink: "Log in",
  }}
  onSuccess={() => router.push("/dashboard")}
/>`,
      },
    ],
  },
  {
    path: "/auth/mfa",
    title: "MFA",
    section: "auth",
    description:
      "Multi-factor authentication: MfaDialog and the verify/setup/recovery forms.",
    blocks: [
      {
        type: "p",
        text: "MFA is config-driven: `config.requireMfa` controls whether the `check_mfa` gate forces a second factor. The MFA forms are independently importable.",
      },
      {
        type: "code",
        text: `import { MfaDialog } from "@fusorb/facet-auth";

<MfaDialog
  open
  sessionId={pendingSessionId}
  onVerified={() => router.push("/dashboard")}
  onCancel={() => setOpen(false)}
/>`,
      },
      { type: "h2", text: "MfaDialog" },
      {
        type: "p",
        text: "`MfaDialog` presents the MFA challenge in a dialog, with the same `appearance` / `slots` / `config` surface.",
      },
      { type: "h2", text: "Forms" },
      {
        type: "ul",
        items: [
          "`MfaVerifyForm`: enter the one-time code.",
          "`MfaSetupForm`: enroll a second factor.",
          "`MfaRecoveryForm`: restore access via recovery codes.",
        ],
      },
      { type: "h2", text: "Flow" },
      {
        type: "p",
        text: "On login, when the session requires MFA, `SignIn` stores the pending `sessionId` and advances to `mfa_challenge`. `MfaVerifyForm` calls `verifyMfa(code, sessionId)`; success moves to `complete`.",
      },
    ],
  },
  {
    path: "/auth/guard",
    title: "Guards",
    section: "auth",
    description: "Protect routes with the Guard component.",
    blocks: [
      {
        type: "p",
        text: "`Guard` renders its children only when a session is present, falling back to `fallback` otherwise.",
      },
      {
        type: "code",
        text: `<Guard fallback={<SignIn />}>
  <ProtectedPage />
</Guard>`,
      },
      { type: "h2", text: "Customization" },
      {
        type: "p",
        text: "`Guard` accepts the same `appearance` / `slots` / `config` families for its fallback rendering.",
      },
    ],
  },
  {
    path: "/auth/presets",
    title: "Domain Presets",
    section: "auth",
    description: "Fintech, med, edu, and enterprise auth presets.",
    blocks: [
      {
        type: "p",
        text: "Presets are plain `AuthConfig` objects. Spread one (or more) into the `config` prop to customize every step per sector.",
      },
      {
        type: "code",
        text: `import { SignIn, fintechPreset } from "@fusorb/facet-auth";

<SignIn config={fintechPreset} />`,
      },
      {
        type: "p",
        text: "Available: `fintechPreset`, `medPreset`, `eduPreset`, `enterprisePreset`, `defaultPreset`.",
      },
      { type: "h2", text: "Preset differences" },
      {
        type: "table",
        headers: [
          "Preset",
          "MFA",
          "Passkey",
          "Magic link",
          "Session TTL",
          "Use Case",
        ],
        rows: [
          [
            "`fintechPreset`",
            "Required",
            "Off",
            "On",
            "15 min",
            "Trading, banking",
          ],
          [
            "`medPreset`",
            "Required",
            "Off",
            "Off",
            "30 min",
            "HIPAA-compliant",
          ],
          ["`eduPreset`", "Optional", "On", "On", "24 hr", "Student portals"],
          ["`enterprisePreset`", "Required", "On", "Off", "8 hr", "SSO + MFA"],
          ["`defaultPreset`", "Optional", "On", "On", "8 hr", "General"],
        ],
      },
      { type: "h3", text: "fintechPreset" },
      {
        type: "p",
        text: "Trading & banking: MFA required, shorter 15-min session TTL, magic link on for step-up recovery.",
      },
      { type: "h3", text: "medPreset" },
      {
        type: "p",
        text: "HIPAA-compliant: MFA required, 30-min TTL, no passkeys to avoid device-bound credentials.",
      },
      { type: "h3", text: "eduPreset" },
      {
        type: "p",
        text: "Student portals: optional MFA, passkeys + magic link enabled, 24-hour TTL for shared devices.",
      },
      { type: "h3", text: "enterprisePreset" },
      {
        type: "p",
        text: "SSO + MFA: enterprise-grade session (8 hr TTL), passkey for workforce, no magic link.",
      },
      { type: "h2", text: "Custom presets" },
      {
        type: "code",
        text: `const myPreset = { ...defaultPreset, sessionTtl: 60, oauthProviders: ["google"] };

<SignIn config={myPreset} />`,
      },
      {
        type: "demo",
        slug: "sign-in",
        title: "SignIn with a preset",
        description: "Live preview of SignIn driven by a domain preset config.",
      },
      {
        type: "p",
        text: "Because `config` is `Partial<AuthConfig>`, any consumer can build their own presets from an existing one.",
      },
    ],
  },
  {
    path: "/playground",
    title: "Playground",
    section: "ecosystem",
    description:
      "Edit any component's full usage code and watch it render live. Pick a component to pre-load, then tweak the JSX and see the preview update instantly.",
    blocks: [{ type: "playground", defaultSlug: "button" }],
  },
  {
    path: "/docs-package",
    title: "Docs Package",
    section: "ecosystem",
    description:
      "Install @fusorb/facet-docs in your own project: mount, config, pages, and blocks.",
    blocks: [
      {
        type: "p",
        text: "`@fusorb/facet-docs` is an installable docs engine. You mount `<DocsApp>` with your own brand, nav, pages, and ecosystem links, with no forking or copied source. This very site is a consumer of it.",
      },
      { type: "h2", text: "Install" },
      {
        type: "install",
        pkg: "@fusorb/facet-docs",
        extras: ["react", "react-dom", "react-router-dom"],
      },
      {
        type: "p",
        text: "Peer dependencies: `react`, `react-dom`, and `react-router-dom` are required.",
      },
      { type: "h2", text: "Mount DocsApp" },
      {
        type: "code",
        lang: "tsx",
        text: `import { DocsApp } from "@fusorb/facet-docs";
import type { DocsPage, DocsSiteConfig } from "@fusorb/facet-docs";

const config: DocsSiteConfig = {
  brand: { name: "my-app", tagline: "My product docs" },
  navigation: [], // optional extra sidebar sections
  ecosystem: [{ label: "SovGrant", href: "/SovGrant" }], // optional
};

const pages: DocsPage[] = [
  {
    path: "/",
    title: "Overview",
    section: "guides",
    description: "Welcome.",
    blocks: [
      { type: "p", text: "Hello." },
      { type: "h2", text: "Quick start" },
      { type: "code", lang: "tsx", text: "import { Button } from \\"@fusorb/facet-components\\";" },
    ],
  },
];

export function App() {
  return <DocsApp config={config} pages={pages} />;
}`,
      },
      { type: "h2", text: "Pages are data" },
      {
        type: "p",
        text: "A page is a route, a title, a sidebar section, and content blocks. The sidebar nav and search palette derive from the same registry, so adding a page automatically adds its route, nav entry, and search hit, with zero component edits.",
      },
      { type: "h2", text: "Content blocks" },
      {
        type: "table",
        headers: ["Block", "Shape", "Renders"],
        rows: [
          ["`p`", "`{ text }`", "Paragraph with inline code/bold/links"],
          ["`h2`", "`{ text }`", "Section heading"],
          ["`code`", "`{ text, lang? }`", "Code block with copy button"],
          [
            "`install`",
            "`{ pkg, extras? }`",
            "pnpm / npm / yarn / bun install tabs",
          ],
          ["`ul`", "`{ items }`", "Bullet list"],
          ["`table`", "`{ headers, rows }`", "Responsive table"],
          ["`link`", "`{ label, href }`", "Internal link"],
          [
            "`demo`",
            "`{ slug, title?, labels? }`",
            "Reusable interactive demo: variant switcher + live preview + copyable code for any manifest slug",
          ],
          [
            "`authDemo`",
            "`{}`",
            "Live SignIn demo: config checkboxes drive a method switcher, a live preview, and the copyable config code in lockstep",
          ],
          [
            "`authPreviews`",
            "`{}`",
            "Live auth previews (SignUp, MfaDialog, Guard, forms) with copyable code",
          ],
          [
            "`layoutPreviews`",
            "`{}`",
            "Live layout previews (ConsoleLayout, AuthLayout, Sidebar/Topbar, LandingLayout) with copyable code",
          ],
          ["`keyboardShortcuts`", "`{}`", "Docs keyboard shortcuts table"],
        ],
      },
      { type: "h2", text: "Component gallery" },
      {
        type: "p",
        text: "Pass `showComponents` (default `true`) to mount the `/components` gallery. Each component page shows a live demo, a full variant gallery, and per-variant usage tabs with copy buttons, driven by the bundled manifest.",
      },
      { type: "h2", text: "Branding & customization" },
      {
        type: "ul",
        items: [
          "`config.brand`: name, tagline, used in the sidebar and settings menu.",
          "`config.navigation`: extra sidebar sections beyond the page-driven ones.",
          "`config.ecosystem`: links to your other products' docs.",
          "Icons flow through `@fusorb/facet-components`' semantic registry; override per domain via `IconProvider`, no forking.",
          "The theme follows the host app's `ThemeProvider` (light/dark/system).",
        ],
      },
      {
        type: "p",
        text: "Try it: the docs demo app (`apps/docs`) consumes `@fusorb/facet-docs` via `workspace:*` exactly like an external consumer, so it doubles as a reference implementation.",
      },
    ],
  },
  {
    path: "/layout",
    title: "Layout",
    section: "ecosystem",
    description: "Domain-configurable app shells and sidebar.",
    blocks: [
      {
        type: "p",
        text: "`@fusorb/facet-layout` ships ConsoleLayout, AuthLayout, LandingLayout, and a collapsible, resizable sidebar. Config-driven via `LayoutConfig` with domain presets.",
      },
      { type: "h2", text: "ConsoleLayout" },
      {
        type: "p",
        text: 'Dashboard shell: sidebar + topbar + content area. Two sidebar versions: `mode="full"` (always-labeled) and `mode="rail"` (collapsible to an icon-only rail, persisted in localStorage). Mobile collapses to a Sheet.',
      },
      {
        type: "code",
        text: `<ConsoleLayout config={defaultLayoutPreset} mode="full">
  <YourContent />
</ConsoleLayout>`,
      },
      { type: "h2", text: "AuthLayout" },
      {
        type: "p",
        text: "Branded split-panel auth page frame (login/register/MFA) with brand logo, tagline, and benefits on the left, centered card on the right.",
      },
      { type: "h2", text: "LandingLayout" },
      {
        type: "p",
        text: "Full-bleed marketing page with a glassmorphic hero and hover-lift CTAs. Pair with the `Navbar` `pill` variant for a flush, scroll-aware glass header.",
      },
      { type: "h2", text: "Sidebar & Topbar" },
      {
        type: "p",
        text: "Use `Sidebar` (driven by a `LayoutConfig` `navigation`) and `Topbar` standalone with `LayoutProvider`. This docs site is itself built from these components.",
      },
      { type: "h2", text: "Domain presets" },
      {
        type: "p",
        text: "Five `LayoutConfig` presets ship ready-made and match the auth presets: `fintechLayoutPreset`, `medLayoutPreset`, `eduLayoutPreset`, `enterpriseLayoutPreset`, `defaultLayoutPreset`.",
      },
      {
        type: "p",
        text: "Register and resolve custom presets via `registerLayoutPreset` / `getLayoutPreset` / `resolveLayoutPreset`.",
      },
      { type: "h2", text: "Router adapter" },
      {
        type: "p",
        text: "facet never imports a router. Pass a `RouterAdapter` (or `createDefaultAdapter()`) so Sidebar, Navbar, and UserMenu render framework-native links and detect the active route. Adapters exist for Next.js App Router, Remix, and React Router.",
      },
      {
        type: "code",
        text: `<ConsoleLayout config={config} router={myRouterAdapter}>
  ...
</ConsoleLayout>`,
      },
    ],
  },
  {
    path: "/foundations/icon",
    title: "Icon",
    section: "foundations",
    description:
      "Semantic icon registry: built-in lucide map, global overrides, and per-domain context overrides.",
    blocks: [
      { type: "h2", text: "Why a registry" },
      {
        type: "p",
        text: 'Rather than importing lucide-react icons directly everywhere, facet exposes a semantic registry. Components reference icon names ("settings", "logout", ...), and consumers can swap the actual icon per domain without forking components.',
      },
      { type: "h2", text: "Built-in set" },
      {
        type: "p",
        text: "The registry ships with a lucide-based default map using lucide-style kebab-case names: settings, logout, chevron-down, search, check, copy, moon, sun, bell, menu, close, chevron-left, chevron-right, chevron-up-down, arrow-right, sparkles, book-open, building, compass, layers, palette, key-round, users, shield, credit-card, dashboard, document, help, grid, list, triangle-alert, user, upload, qrcode, trash. It also ships brand icons (github, linkedin, instagram, facebook, tiktok, whatsapp, x, twitter, youtube, slack, discord, telegram, figma, spotify) as inline SVGs independent of lucide.",
      },
      { type: "h2", text: "Dynamic lucide names" },
      {
        type: "p",
        text: 'Any lucide icon resolves by its lowercase kebab name: <Icon name="heart" />, <Icon name="alarm-clock" />, <Icon name="arrow-up-right" />. camelCase aliases (chevronDown, triangleAlert) still resolve for back-compat.',
      },
      { type: "h2", text: "Render an icon" },
      {
        type: "code",
        lang: "tsx",
        text: `import { Icon } from "@fusorb/facet-components";

<Icon name="settings" className="size-4" />`,
      },
      { type: "h2", text: "Global override" },
      {
        type: "p",
        text: "registerIcon replaces a semantic name everywhere (until the process reloads):",
      },
      {
        type: "code",
        lang: "tsx",
        text: `import { registerIcon, Icon } from "@fusorb/facet-components";

registerIcon("shield", (props) => <Icon name="shield-alert" {...props} />);`,
      },
      { type: "h2", text: "Per-domain override" },
      {
        type: "p",
        text: "IconProvider scopes overrides to a subtree, so each domain can customize icons:",
      },
      {
        type: "code",
        lang: "tsx",
        text: `<IconProvider overrides={{ logout: (props) => <Icon name="shield-alert" {...props} /> }}>
  <Icon name="logout" className="size-4" />
</IconProvider>`,
      },
      {
        type: "p",
        text: "Provider overrides merge with parent providers, so nested domains can layer overrides.",
      },
      { type: "h2", text: "Types" },
      {
        type: "ul",
        items: [
          "IconName: the union of semantic names.",
          "IconOverrides: partial map for overrides.",
          "getIcon(name): resolve the current global icon component.",
        ],
      },
    ],
  },
  {
    path: "/foundations/theme",
    title: "Theme",
    section: "foundations",
    description:
      "ThemeProvider, useTheme, and ThemeToggle for light/dark/system theming.",
    blocks: [
      { type: "h2", text: "ThemeProvider" },
      {
        type: "code",
        lang: "tsx",
        text: `<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>`,
      },
      {
        type: "p",
        text: 'Sets a data-theme attribute on <html>, persists to localStorage ("facet-theme"), and follows the OS preference in system mode.',
      },
      { type: "h2", text: "useTheme" },
      {
        type: "code",
        lang: "tsx",
        text: `const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme();`,
      },
      {
        type: "p",
        text: 'resolvedTheme is the concrete "light" | "dark" value after system resolution, handy for conditional rendering.',
      },
      { type: "h2", text: "ThemeToggle" },
      {
        type: "p",
        text: "A ready-made light/dark switch that reads the current theme and toggles it. Drop it in any toolbar or navbar.",
      },
      { type: "h2", text: "Brand overrides" },
      {
        type: "code",
        lang: "tsx",
        text: `<ThemeProvider overrideVars={{ "--primary": "oklch(0.5 0.2 30)" }}>
  <App />
</ThemeProvider>`,
      },
      {
        type: "p",
        text: "Per-brand token overrides apply on <html> so every component inherits them. See the Theming guide for details.",
      },
    ],
  },
  {
    path: "/stack-agnosticism",
    title: "Stack Agnosticism",
    section: "ecosystem",
    description:
      "Which facet layers work outside React, and which are React-only by design.",
    blocks: [
      {
        type: "p",
        text: "facet is **not** one-size-fits-all: some layers are framework-agnostic, some are React-only by design, and the boundary is intentional. This page is the honest map so you know what works in your stack before you adopt.",
      },
      { type: "h2", text: "Layer matrix" },
      {
        type: "table",
        headers: ["Layer", "Stack", "Works outside React?"],
        rows: [
          [
            "`@fusorb/facet-tokens`",
            "CSS variables + Tailwind v4 theme",
            "Yes, plain CSS, any framework, no JS",
          ],
          [
            "`@fusorb/facet-sdk`",
            "TypeScript, pure fetch",
            "Yes, any runtime (browser, Node, edge)",
          ],
          [
            "`@fusorb/facet-store`",
            "Zustand stores + token-refresh bridge",
            "Yes - stores are pure Zustand (usable without React via getState/setState); `createZustandTokenStorage` is fully framework-agnostic; React is a peer only for hook consumption",
          ],
          [
            "`@fusorb/facet-emails`",
            "Template-tree renderer (zero runtime deps)",
            "Yes, any host (plain JS, Node, JSON trees)",
          ],
          [
            "`@fusorb/facet-cli`",
            "Node CLI",
            "Yes, scaffolds docs + emails for React, Next, Remix, plain JS, Python",
          ],
          [
            "`@fusorb/facet-components`",
            "React + Radix + tailwind-merge",
            "No, React 18/19 only",
          ],
          ["`@fusorb/facet-layout`", "React", "No, React 18/19 only"],
          ["`@fusorb/facet-auth`", "React", "No, React 18/19 only"],
          [
            "`@fusorb/facet-docs`",
            "React + react-router",
            "No, React 18/19 only",
          ],
        ],
      },
      { type: "h2", text: "Why React-only for UI" },
      {
        type: "p",
        text: "The UI packages are built on React + Radix primitives for a reason: accessible behavior (focus management, keyboard nav, portals, ARIA) is hard to get right, and Radix is the battle-tested implementation. Rebuilding that in Vue, Svelte, or Web Components would multiply the surface area we must maintain for consumers who, so far, all use React.",
      },
      { type: "h2", text: "What you can use outside React" },
      {
        type: "ul",
        items: [
          "**Tokens only:** import `@fusorb/facet-tokens/tokens.css` in any framework for the Alpha Palette design language.",
          "**Tailwind v4 theme:** `@fusorb/facet-tokens/tailwind.css` registers `@theme` utilities (bg-primary, text-foreground, ...) for any Tailwind v4 project.",
          "**SDK:** `@fusorb/facet-sdk` is a dependency-free fetch client, drop it into any TypeScript backend or frontend.",
          "**CLI scaffolding:** `facet docs init` generates plain-JS and Python docs pipelines, and `facet emails init` scaffolds framework-agnostic email templates, so a non-React team can still ship facet-style docs and emails.",
        ],
      },
      { type: "h2", text: "When React is the target" },
      {
        type: "p",
        text: "If your app is React (18 or 19), everything works: components, layout shells, auth, and the docs engine. The docs engine requires `react-router-dom` as a peer; layout components are router-agnostic (bring your own adapter for Next/Remix/React Router).",
      },
      { type: "h2", text: "Decision" },
      {
        type: "p",
        text: "**We are not building Vue/Svelte/Web Component adapters today.** The demand signal is weak, every current consumer is React, and a token-only + SDK + CLI surface already covers the non-React story. If a concrete non-React consumer arrives, the lowest-cost entry point is a Web Components wrapper over the tokens + a small set of headless behaviors, not a port of the full library.",
      },
    ],
  },
  {
    path: "/cli",
    title: "CLI",
    section: "ecosystem",
    description:
      "Scaffold docs sites, draft docs from your repo, copy components, and generate a tree-shaken icon registry with @fusorb/facet-cli.",
    blocks: [
      {
        type: "p",
        text: "`@fusorb/facet-cli` is the facet ecosystem's tooling: it scaffolds a docs site in any repo (React+Vite, Next.js, Remix, plain JS, or Python), scaffolds or migrates email templates, copies components into your source (shadcn-style), drafts docs by scanning your repo, and generates a tree-shaken icon registry.",
      },
      { type: "h2", text: "Install" },
      {
        type: "install",
        pkg: "@fusorb/facet-cli",
      },
      { type: "h2", text: "Scaffold a docs site" },
      {
        type: "code",
        lang: "bash",
        text: `facet docs init
# or non-interactive, using detected defaults:
facet docs init --yes
# shorthand:
facet docs init -y`,
      },
      {
        type: "p",
        text: 'The wizard opens with a "Decide for me" option: detect your stack and use the best defaults, or walk through each choice: name (blank falls back to `docs`), location (`.` recommended, `docs/`, or `src/docs/`), language, framework, styling, template kind, and whether to create a barrel export. Choosing "Decide for me" skips the rest of the questions and uses the detected defaults.',
      },
      {
        type: "p",
        text: "After scaffolding, the CLI installs the facet packages automatically at their current published versions (resolved from the npm registry at init time, no pinned guesses). If the install can't run, it prints the exact command instead.",
      },
      { type: "h2", text: "Framework support" },
      {
        type: "table",
        headers: ["Framework", "What you get"],
        rows: [
          [
            "`react-vite`",
            "Full thin-consumer app (config + pages registry + app shell)",
          ],
          [
            "`next`",
            '`src/app/docs` route ("use client" → DocsApp) + config/pages',
          ],
          [
            "`remix`",
            '`app/routes/docs` route ("use client" → DocsApp) + config/pages',
          ],
          [
            "`plain-js`",
            "Framework-agnostic pages registry + markdown content pipeline",
          ],
          ["`python`", "`docs_pipeline.py` → pages.json + starter registry"],
        ],
      },
      {
        type: "p",
        text: "Every framework gets the same `@fusorb/facet-docs` engine: the content is plain data, so any host can render it.",
      },
      { type: "h2", text: "Install a package" },
      {
        type: "code",
        lang: "bash",
        text: `facet install layout
# or the full name:
facet install @fusorb/facet-layout
# the scoped-dropped alias also works:
facet install facet-cli
# install globally (e.g. keep facet-cli current) with the short name:
facet install -g facet-cli`,
      },
      {
        type: "p",
        text: "`facet install` adds any facet package to your project by its shorthand (e.g. `layout`, `store`, `auth`), its scoped-dropped alias (e.g. `facet-cli` -> `@fusorb/facet-cli`), or its full name (e.g. `@fusorb/facet-layout`). It resolves the latest published version from npm and runs the install with your project's package manager. Pass `-g`/`--global` to install globally - `facet install -g facet-cli` (re)installs the CLI under the short name. `facet add` is an alias. To copy a component instead, use `facet copy <ComponentName>`.",
      },
      { type: "h2", text: "Copy a component" },
      {
        type: "code",
        lang: "bash",
        text: `facet copy Button
# placement: decide (default) / subdir / flat
facet copy Button --flat
facet copy Button --ui-dir ui`,
      },
      {
        type: "p",
        text: "`facet copy` copies a component into your source. By default it decides based on what you already have: flat into your components root when a barrel exists, else a clean `facet/` subdirectory. `--dir`, `--ui-dir`, `--flat`, `--no-barrel`, and `--barrel` give you explicit control. An existing barrel is merged, never overwritten.",
      },
      {
        type: "p",
        text: "**Recommended:** import from `@fusorb/facet-components` instead of copying source: you get updates, tree-shaking, and the token system. Copying source means you own every future fix.",
      },
      { type: "h2", text: "Generate a tree-shaken icon registry" },
      {
        type: "code",
        lang: "bash",
        text: `facet icons generate
# force-overwrite an existing generated registry:
facet icons generate -y
# write to a specific location:
facet icons generate --path src/lib`,
      },
      {
        type: "p",
        text: "`facet icons generate` scans your source for icon call sites and emits a slim `icons.generated.tsx`: direct lucide imports for exactly the icons you use. Legacy names are mapped to current lucide icons (`grid` → `layout-grid`, `logout` → `log-out`), and names that don't resolve (typically form-field props) are reported. Import `GeneratedIcon` from that file anywhere you use icons and re-run after adding or removing icons to keep the set exact.",
      },
      { type: "h2", text: "Merge your own templates" },
      {
        type: "code",
        lang: "bash",
        text: `# list template dirs found in the repo:
facet templates list
# inspect one template:
facet templates describe saas-product
# scaffold docs and merge a template over the result:
facet docs init --use-template saas-product -y`,
      },
      {
        type: "p",
        text: "`facet templates list` discovers template directories under `./templates/` (or `./docs/templates/`, `./emails/templates/`), optionally described by a `template.json` manifest. `facet docs init --use-template <name>` and `facet emails init --use-template <name>` then merge the named template over the generated scaffold. The merge is never destructive by default: new files are copied in, identical files are skipped, `package.json` is merged with your fields winning, code files containing a `// @facet-merge` marker get the marker's contents appended before the final `}`, and any other existing file is left untouched (reported as a conflict; `--force` overwrites).",
      },
      { type: "h2", text: "Draft docs from your repo" },
      {
        type: "code",
        lang: "bash",
        text: `facet docs scan
facet docs scan --out docs && facet docs scan -y`,
      },
      {
        type: "p",
        text: "`facet docs scan` reads the repo and drafts a documentation layer (pages + sidebar + API reference) for review. It detects your stack (package manager, monorepo layout, framework, styling) and your API surface (Fastify + @fastify/swagger, or a committed openapi.json/swagger.json), then writes a starter pages registry plus a scanned API reference under `--out` (default `docs`). It refuses to overwrite existing draft files unless you pass `-y`.",
      },
      { type: "h2", text: "How it stays current" },
      {
        type: "p",
        text: "`facet docs scan` and `facet docs init` keep the scaffold in sync with your repo, not a snapshot.",
      },
      { type: "h3", text: "Stack detection" },
      {
        type: "p",
        text: "Detects your frontend stack (Next.js, Remix, Vite, plain JS, Python); backend frameworks are ignored: docs are a frontend concern.",
      },
      { type: "h3", text: "Package manager detection" },
      {
        type: "p",
        text: "Detects your package manager from the lockfile and recommends the matching install command.",
      },
      { type: "h3", text: "Version resolution" },
      {
        type: "p",
        text: "Resolves current published facet versions from the npm registry, so the scaffold never pins a stale version.",
      },
      { type: "h3", text: "Safe package.json patching" },
      {
        type: "p",
        text: "Patches an existing package.json, preserving your scripts, deps, name, and metadata.",
      },
      { type: "h2", text: "Commands" },
      {
        type: "table",
        headers: ["Command", "Description"],
        rows: [
          [
            "`facet pkg`",
            "Show latest published facet versions vs what this repo declares and installs",
          ],
          [
            "`facet doctor`",
            "Audit the repo: layout, facet deps, unnecessary bundled deps, best-practice suggestions",
          ],
          [
            "`facet up`",
            "Apply facet package updates at the latest published versions",
          ],
          [
            "`facet clean`",
            "Remove deps bundled by facet-components + rewrite shadcn/ui-style imports (dry-run/confirm)",
          ],
          [
            "`facet scripts`",
            "Add useful npm scripts (docs, quality, facet:action, prep) without overwriting yours",
          ],
          [
            "`facet prep`",
            "Pre-go-live sync: check deps, doctor, and run your typecheck/build/test",
          ],
          [
            "`facet update`",
            "Apply updates for installed facet packages (confirm prompt, `-y` to skip; `--dry-run` to only print)",
          ],
          [
            "`facet docs init`",
            "Scaffold a docs site (interactive wizard or `-y`)",
          ],
          [
            "`facet docs scan`",
            "Read this repo and draft a documentation layer (pages + sidebar + API reference) for review",
          ],
          [
            "`facet copy <component>`",
            "Copy a component into your source (shadcn-style)",
          ],
          [
            "`facet add <name> [-g]` / `facet install <name> [-g]`",
            "Install a facet package by shorthand (e.g. 'layout'), scoped-dropped alias (e.g. 'facet-cli'), or full name (e.g. '@fusorb/facet-layout'). Pass -g/--global to install globally",
          ],
          [
            "`facet icons generate`",
            "Scan your source and emit a tree-shaken lucide icon registry",
          ],
          [
            "`facet emails init`",
            "Scaffold or migrate email templates wired to facet-emails (detects react-email/mjml/nodemailer/resend)",
          ],
          [
            "`facet templates list`",
            "Discover template dirs in the repo (under `./templates/`)",
          ],
          [
            "`facet templates describe <name>`",
            "Show a template's manifest and files",
          ],
          [
            "`facet latest`",
            "Show the latest published versions of all @fusorb/facet-* packages",
          ],
          [
            "`facet self-update`",
            "Update the globally-installed facet-cli to the latest published version",
          ],
        ],
      },
      { type: "h2", text: "Flags" },
      {
        type: "p",
        text: "Run `facet --help` (or `facet -h`) in any terminal to see this reference live, with the exact syntax for your installed version.",
      },
      { type: "h2", text: "Global flags" },
      {
        type: "table",
        headers: ["Flag", "Description"],
        rows: [
          ["`-V, --version`", "Print the installed CLI version"],
          ["`-h, --help`", "Show the command reference and exit"],
          [
            "`--no-update-check`",
            "Skip the startup check for facet-cli updates",
          ],
          ["`--log`", "Verbose output: show internal steps and debug info"],
        ],
      },
      { type: "h2", text: "facet docs init flags" },
      {
        type: "table",
        headers: ["Flag", "Description"],
        rows: [
          [
            "`-y, --yes`",
            "Non-interactive: detect your stack and use the best defaults",
          ],
          ["`--name <name>`", "Docs site name (default: `docs`)"],
          [
            "`--location <location>`",
            "`.` (root, recommended), `docs`, or `src/docs` (default: `.`)",
          ],
          [
            "`--language <language>`",
            "`typescript` or `javascript` (default: TypeScript)",
          ],
          [
            "`--framework <framework>`",
            "`react-vite`, `next`, `remix`, `plain-js`, or `python` (default: detected)",
          ],
          [
            "`--styling <styling>`",
            "`facet-tokens`, `tailwind`, `plain-css`, or `none` (default: detected)",
          ],
          ["`--no-tokens`", "Do not wire `@fusorb/facet-tokens` theming"],
          [
            "`--template <template>`",
            "`component-library`, `api-reference`, or `product-docs` (default: `component-library`)",
          ],
          [
            "`--use-template <name>`",
            "Merge an existing template dir from `./templates` into the scaffold (never clobbers existing files)",
          ],
          [
            "`--barrel <mode>`",
            "`auto` (create when it fits, default), `always`, or `never`",
          ],
        ],
      },
      { type: "h2", text: "facet docs scan flags" },
      {
        type: "table",
        headers: ["Flag", "Description"],
        rows: [
          ["`--out <dir>`", "Where the draft lands (default: `docs`)"],
          [
            "`-y, --yes`",
            "Write the draft without confirmation (overwrites existing files)",
          ],
        ],
      },
      { type: "h2", text: "facet icons generate flags" },
      {
        type: "table",
        headers: ["Flag", "Description"],
        rows: [
          [
            "`--path <path>`",
            "Where to write `icons.generated.tsx` (default: detected from repo layout)",
          ],
          [
            "`-y, --yes`",
            "Overwrite an existing generated registry without confirmation",
          ],
        ],
      },
      { type: "h2", text: "facet emails init" },
      {
        type: "code",
        lang: "bash",
        text: `facet emails init
# non-interactive, using detected defaults:
facet emails init -y
# force a fresh scaffold or a migration:
facet emails init --fresh
facet emails init --migrate
# pick the provider:
facet emails init --provider resend`,
      },
      {
        type: "p",
        text: "`facet emails init` detects the consumer's mail setup (react-email, mjml, nodemailer, resend, sendgrid, SES, postmark) from the manifests and either offers a migration or a fresh scaffold: an `emails/` dir with brand tokens, a layout wrapper, a template registry, a dev preview server, and a provider `send.ts` (resend/nodemailer, or a stub to wire up). It auto-installs `@fusorb/facet-emails` plus the provider SDK via the detected package manager, then prints repo-aware next steps from a general suggestion engine: migration guidance when an existing renderer is found, framework-specific integration points (Next API route, Remix action, Vite build, plain Node), monorepo hints, dependency hygiene, provider key setup, and the preview URL. The same engine powers suggestions across other facet commands.",
      },
      { type: "h2", text: "facet emails init flags" },
      {
        type: "table",
        headers: ["Flag", "Description"],
        rows: [
          ["`-y, --yes`", "Use detected defaults without prompting"],
          ["`--framework <fw>`", "Override the detected frontend framework"],
          [
            "`--migrate`",
            "Force migration mode (build on an existing mail package)",
          ],
          [
            "`--fresh`",
            "Force a fresh scaffold (ignore any existing mail package)",
          ],
          [
            "`--provider <p>`",
            "`resend`, `nodemailer`, or `none` (override detection)",
          ],
          [
            "`--location <dir>`",
            "Where the emails dir lands (default: `emails`)",
          ],
          ["`--name <name>`", "Brand name used in the email layout header"],
        ],
      },
      { type: "h2", text: "facet copy flags" },
      {
        type: "table",
        headers: ["Flag", "Description"],
        rows: [
          ["`--js`", "Generate JavaScript instead of TypeScript"],
          ["`--dir <dir>`", "Components directory (default: `src/components`)"],
          [
            "`--ui-dir <name>`",
            "Subdirectory holding the copies (default: `facet`; ignored with `--flat`)",
          ],
          [
            "`--flat`",
            "Place components directly in `--dir` instead of a subdirectory",
          ],
          ["`--no-barrel`", "Do not create or update any barrel export"],
          ["`--barrel`", "Always create a barrel export"],
        ],
      },
      {
        type: "p",
        text: "Every prompt and flag is described inline, so you always know what a choice will do before committing.",
      },
    ],
  },
  {
    path: "/emails",
    title: "Emails",
    section: "ecosystem",
    description:
      "Framework-agnostic email templates with @fusorb/facet-emails: render HTML/text from React or plain trees, brand tokens, and a dev preview server.",
    blocks: [
      {
        type: "p",
        text: "`@fusorb/facet-emails` is a framework-agnostic email template renderer. The core accepts a plain, serializable template tree (`{ tag, props, children }`) and renders it to email-safe HTML and plain text - zero runtime dependencies, so any host (React, plain JS, a Node backend, even a JSON tree from another language) can use it. An optional React bridge gives JSX ergonomics.",
      },
      { type: "h2", text: "Install" },
      {
        type: "install",
        pkg: "@fusorb/facet-emails",
      },
      {
        type: "p",
        text: "`react` is an optional peer, only needed for the JSX convenience layer. The core renderer has no React dependency.",
      },
      { type: "h2", text: "Framework-agnostic usage" },
      {
        type: "code",
        lang: "ts",
        text: `import { renderEmail, renderEmailText, emailLayout, emailButton, emailText } from "@fusorb/facet-emails";

const tree = emailLayout(
  { previewText: "Welcome", heading: "Hi!", brandName: "Acme" },
  emailText({ children: "Your account is ready." }),
  emailButton({ href: "https://acme.dev/dashboard", children: "Go to Dashboard" }),
);

const html = renderEmail(tree);       // email-safe HTML string
const text = renderEmailText(tree);   // plain-text version`,
      },
      { type: "h2", text: "React usage" },
      {
        type: "code",
        lang: "tsx",
        text: `import { renderEmailFromReact, EmailLayout, EmailButton, EmailText } from "@fusorb/facet-emails";

const html = renderEmailFromReact(
  <EmailLayout previewText="Welcome" heading="Hi!" brandName="Acme">
    <EmailText>Your account is ready.</EmailText>
    <EmailButton href="https://acme.dev/dashboard">Go to Dashboard</EmailButton>
  </EmailLayout>,
);`,
      },
      { type: "h2", text: "Primitives" },
      {
        type: "table",
        headers: ["Primitive", "Purpose"],
        rows: [
          ["`EmailLayout`", "Outer shell: preview text, brand header, footer."],
          ["`EmailButton`", "CTA link-button (primary / danger / outline)."],
          [
            "`EmailText`",
            "Paragraph variants (default / small / muted / code).",
          ],
          ["`EmailCodeBlock`", "Single code (MFA) or a recovery-codes grid."],
          [
            "`EmailSection` / `EmailRow` / `EmailColumn`",
            "Table-based layout containers for detail/grid sections.",
          ],
          [
            "`EmailSecurityNotice`",
            "Warning / danger / info callout, or an IP/device table.",
          ],
          ["`EmailLink`", "Styled inline link."],
          ["`EmailDivider`", "Horizontal rule."],
          ["`EmailList`", "Feature bullet list."],
        ],
      },
      { type: "h2", text: "Branding" },
      {
        type: "p",
        text: "Every primitive inherits brand tokens passed to `renderEmail` via the `brand` option: `primary`, `background`, `surface`, `text`, `muted`, `fontFamily`, `radius`, and `brandName`. Change the brand and every template re-themes - no forking.",
      },
      {
        type: "code",
        lang: "ts",
        text: `renderEmail(tree, {
  brand: {
    primary: "#6366f1",
    background: "#f6f6f6",
    surface: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
    brandName: "Acme",
  },
});`,
      },
      { type: "h2", text: "Dev preview server" },
      {
        type: "p",
        text: "A dependency-light preview server (plain node:http) renders registered templates with an HTML/text toggle. Start it with a templates registry:",
      },
      {
        type: "code",
        lang: "ts",
        text: `import { startEmailPreviewServer } from "@fusorb/facet-emails/server";
import { emailLayout, emailButton } from "@fusorb/facet-emails";

startEmailPreviewServer({
  templates: {
    welcome: {
      title: "Welcome",
      tree: emailLayout(
        { previewText: "Welcome", heading: "Hi!" },
        emailButton({ href: "#", children: "Go" }),
      ),
    },
  },
  port: 3888,
});`,
      },
      {
        type: "p",
        text: "Open http://127.0.0.1:3888 for the template index; /preview/:name renders a template with a toolbar toggle. The `facet emails init` CLI command scaffolds this setup (brand tokens, layout wrapper, template registry, preview server, provider `send.ts`) and auto-installs the package.",
      },
      {
        type: "p",
        text: "Migrating from react-email? `facet emails init` detects `@react-email/components`, `mjml`, `nodemailer`, `resend`, and other mail packages, and prints repo-aware migration guidance.",
      },
    ],
  },
  {
    path: "/sdk",
    title: "SDK",
    section: "ecosystem",
    description:
      "The typed SovGrant API client (@fusorb/facet-sdk): first-party sessions + OAuth2/OIDC for external integrations.",
    blocks: [
      {
        type: "p",
        text: "`@fusorb/facet-sdk` is a pure-fetch, framework-agnostic TypeScript client for SovGrant. It mirrors SovGrant's full REST surface (62 routes across auth, identity, oauth, tenants, credentials, billing, audit, webhooks, idp) and normalizes the `{ success, data }` envelope so SDK methods return the inner payload directly.",
      },
      { type: "h2", text: "Install" },
      {
        type: "install",
        pkg: "@fusorb/facet-sdk",
      },
      { type: "h2", text: "First-party app (own SovGrant backend)" },
      {
        type: "code",
        text: `import { ArcIdClient, AuthSdk } from "@fusorb/facet-sdk";

const client = new ArcIdClient({ baseUrl: "https://auth.example.com/api/v1" });
const auth = new AuthSdk(client);

const { data, error } = await auth.login("user@example.com", "pw");
// data = { identity, sessionId, requiresMfa, accessToken?, refreshToken? }`,
      },
      {
        type: "p",
        text: "Session-based flows (`login`/`register`/`logout`/`me`/MFA/magic-link/passkeys) need no client credentials - the direct client is implied.",
      },
      { type: "h2", text: "External integration (OAuth2/OIDC)" },
      {
        type: "p",
        text: "For third-party apps talking to a shared SovGrant instance, configure the registered OAuth client and use the OIDC flow:",
      },
      {
        type: "code",
        text: `const client = new ArcIdClient({
  baseUrl: "https://auth.example.com/api/v1",
  clientId: "my-app-id",
  clientSecret: "…", // confidential clients only
});

// 1. Authorize: SovGrant's /oauth/authorize is a JSON API (bearer auth)
//    returning an authorization code, not a browser redirect.
const { data } = await auth.authorize({
  redirectUri: "https://app.example.com/callback",
  scope: "openid profile email",
  codeChallenge: "s256-hash-of-verifier",
});
// data = { code, state?, consentRequired }

// 2. Exchange the code for tokens (PKCE verifier).
const tokens = await auth.exchangeCode({
  code: data.code,
  redirectUri: "https://app.example.com/callback",
  codeVerifier: "the-verifier",
});

// 3. Refresh later - client_id is sent automatically.
const next = await auth.refresh(tokens.data.refreshToken!);`,
      },
      { type: "h2", text: "Service-to-service" },
      {
        type: "p",
        text: "`clientCredentials()` issues tokens for machine clients (grant_type=client_credentials), for background jobs and server integrations.",
      },
      { type: "h2", text: "Auto-refresh on 401" },
      {
        type: "p",
        text: "Wire `onTokenRefresh` to retry any request once after refreshing the token, and `onAuthCleared` to handle unrecoverable sessions:",
      },
      {
        type: "code",
        text: `const client = new ArcIdClient({
  baseUrl,
  onTokenRefresh: async () => (await auth.refresh(refreshToken)).data?.accessToken ?? null,
  onAuthCleared: () => redirectToLogin(),
});`,
      },
      {
        type: "p",
        text: "If you use `@fusorb/facet-store` for state, use `createZustandTokenStorage` to bridge the store and the client - it handles the refresh re-entrancy guard, token read/write via the store, and auth clearing on failure:",
      },
      {
        type: "code",
        text: `import { createZustandTokenStorage } from "@fusorb/facet-store";

const storage = createZustandTokenStorage({ authStore: useAuthStore, sdk: auth });

const client = new ArcIdClient({
  baseUrl,
  onTokenRefresh: storage.onTokenRefresh,
  onAuthCleared: () => {
    useAuthStore.getState().clearAuth();
    useTenantStore.getState().reset();
  },
});`,
      },
      { type: "h2", text: "Modules" },
      {
        type: "table",
        headers: ["Module", "Covers"],
        rows: [
          [
            "`AuthSdk`",
            "login, register, MFA, sessions, magic-link, password, step-up, switch-context, OAuth authorize/exchange/refresh/client-credentials",
          ],
          [
            "`IdentitySdk`",
            "profile, admin (list/suspend/reinstate), devices, linked accounts, delegations, onboarding, wallet DID",
          ],
          [
            "`OAuthSdk`",
            "clients, consent, tokens, introspection, revocation, userinfo, jwks",
          ],
          [
            "`PasskeySdk`",
            "WebAuthn registration + authentication options/verify",
          ],
          [
            "`TenantSdk`",
            "tenants, members, policies, signing keys, DID, invites",
          ],
          [
            "`VcSdk`",
            "issue, verify, revoke, status lists, offers, verifiable credential workflows",
          ],
          ["`WebhooksSdk`", "endpoint management + events + retry"],
          ["`BillingSdk`", "subscription"],
          ["`AuditSdk`", "audit logs"],
          ["`IdpSdk`", "SSO connections (OIDC/SAML)"],
        ],
      },
      { type: "h3", text: "AuthSdk" },
      {
        type: "p",
        text: "Identity lifecycle: login, register, MFA, sessions, magic-link, password reset, step-up, context switching, and the full OAuth2/OIDC authorize-exchange-refresh flow for both first-party and third-party apps.",
      },
      { type: "h3", text: "IdentitySdk" },
      {
        type: "p",
        text: "User profile management, admin operations (suspend/reinstate), linked accounts, device management, delegation chains, onboarding flows, and wallet-based DID operations.",
      },
      { type: "h3", text: "OAuthSdk" },
      {
        type: "p",
        text: "OAuth2/OIDC server surface: client registration, consent management, token issuance, introspection, revocation, userinfo, and JWKS key set discovery.",
      },
      { type: "h3", text: "TenantSdk" },
      {
        type: "p",
        text: "Multi-tenant operations: tenant lifecycle, member management, policy engine, signing key rotation, tenant DID, and invite workflows.",
      },
      { type: "h3", text: "VcSdk" },
      {
        type: "p",
        text: "Verifiable credentials end-to-end: issue, verify, revoke, status-list management, credential offers, and full VC workflow orchestration.",
      },
      {
        type: "p",
        text: "Every endpoint string in the SDK is audited against SovGrant's `ROUTES` index (`scripts/audit-sdk-coverage.cjs` reports 62/62 covered).",
      },
    ],
  },
  {
    path: "/store",
    title: "Store",
    section: "ecosystem",
    description:
      "Framework-agnostic Zustand state stores for SovGrant sessions + tenant state, with a token-refresh bridge for 401 auto-recovery.",
    blocks: [
      {
        type: "p",
        text: "`@fusorb/facet-store` provides framework-agnostic state stores built on Zustand. It ships two stores (`useAuthStore` for session/auth state, `useTenantStore` for tenant selection) and a `createZustandTokenStorage` bridge that connects them to the SDK's `ArcIdClient` 401 auto-refresh hooks. The stores are pure Zustand - no React in the store logic itself - and the bridge is fully framework-agnostic, so it works identically in React, React Native, or any environment that can call `getState()`.",
      },
      { type: "h2", text: "Install" },
      {
        type: "install",
        pkg: "@fusorb/facet-store",
        extras: ["@fusorb/facet-sdk"],
      },
      {
        type: "p",
        text: "`react` and `react-dom` are peer dependencies (Zustand generates React hooks), but you can use the stores imperatively via `getState()` in any framework.",
      },
      { type: "h2", text: "Stores" },
      {
        type: "table",
        headers: ["Store", "State", "Purpose"],
        rows: [
          [
            "`useAuthStore`",
            "user, accessToken, refreshToken, isAuthenticated, isLoading",
            "Session + token state; methods: setAuth, setUser, setTokens, clearAuth, setLoading",
          ],
          [
            "`useTenantStore`",
            "activeTenant, tenants, isLoading",
            "Tenant selection + membership cache; methods: setActiveTenant, setTenants, setLoading, reset",
          ],
        ],
      },
      {
        type: "p",
        text: "State is framework-agnostic; methods are plain setters called via `store.getState()`. React consumers call the hook (`useAuthStore()`) for reactive reads; non-React code calls `getState()` imperatively.",
      },
      {
        type: "code",
        text: `import { useAuthStore, useTenantStore } from "@fusorb/facet-store";

// React: reactive reads
function SessionBadge() {
  const { user, isAuthenticated } = useAuthStore();
  return isAuthenticated ? <span>{user?.email}</span> : <span>Guest</span>;
}`,
      },
      { type: "h2", text: "Token-refresh bridge" },
      {
        type: "p",
        text: "`createZustandTokenStorage` wires the auth store and an `AuthSdk` into the `ArcIdClient` callbacks. It reads the current refresh token from the store, calls `sdk.refresh()` on 401, updates the store with the new token bundle, and clears auth on permanent failure - including a re-entrancy guard so a refresh request that itself 401s doesn't recurse infinitely:",
      },
      {
        type: "code",
        text: `import { createZustandTokenStorage } from "@fusorb/facet-store";
import { ArcIdClient, AuthSdk } from "@fusorb/facet-sdk";

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
      {
        type: "h2",
        text: "Agnosticism",
      },
      {
        type: "p",
        text: "See [Stack Agnosticism](/stack-agnosticism) for the full layer matrix. The store has zero SovGrant-specific logic - it depends only on `@fusorb/facet-sdk` types and `zustand`. A `TokenStoreLike` and a `TokenRefresher` are the only contracts `createZustandTokenStorage` needs, so you can wire it to any store or refresh implementation.",
      },
    ],
  },
  {
    path: "/changelog",
    title: "Changelog",
    section: "ecosystem",
    description: "Release log for @fusorb/facet-components.",
    blocks: [
      {
        type: "p",
        text: "Versioned release notes for every @fusorb/facet-* package. Entries are curated from the shipped changesets and updated when `pnpm changeset version` runs and CHANGELOG.md is touched.",
      },
      {
        type: "changelog",
        releases: facetChangelog,
        layout: "date",
        showFilter: true,
      },
    ],
  },
];
