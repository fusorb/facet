import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ─── helpers ───────────────────────────────────────────────────────────────

// Mark a value as a bare identifier (variable reference) in the generated TS.
function ref(name) {
  return { __ref: name };
}

// Serialize any JS value into valid TypeScript source.
function ts(value) {
  if (value && typeof value === "object" && value.__ref) {
    return value.__ref;
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "undefined";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return "[" + value.map(ts).join(", ") + "]";
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  return "{ " + entries.map(function (kv) { return kv[0] + ": " + ts(kv[1]); }).join(", ") + " }";
}

// Block factories
var h2 = function (t) { return { type: "h2", text: t }; };
var h3 = function (t) { return { type: "h3", text: t }; };
var p = function (t) { return { type: "p", text: t }; };
var pre = function (t) { return { type: "pre", text: t }; };
var code = function (t) { return { type: "code", text: t }; };
var install = function (pkg, extras) { return { type: "install", pkg: pkg, extras: extras }; };
var ul = function (items) { return { type: "ul", items: items }; };
var table = function (headers, rows) { return { type: "table", headers: headers, rows: rows }; };
var linkFn = function (label, href) { return { type: "link", label: label, href: href }; };
var changelog = function () { return { type: "changelog", releases: ref("facetChangelog"), showFilter: true, layout: "date" }; };

// ─── page content ──────────────────────────────────────────────────────────

var P = [
  // ── Guides ──
  {
    path: "/",
    title: "facet",
    section: "guides",
    description: "Domain-customizable auth-first component system for fintech, med, and edu.",
    blocks: [
      h2("Welcome to facet"),
      p("facet is a domain-customizable, auth-first component system for building modern web applications. It ships twelve focused packages that work together out of the box—yet each can be adopted independently."),

      h2("Quick start"),
      p("Install the core packages and import the stylesheet in three minutes:"),
      install("@fusorb/facet-components", ["@fusorb/facet-tokens", "@fusorb/facet-layout"]),
      p("Then add CSS to your entry point:"),
      code("import '@fusorb/facet-tokens/tokens.css';"),
      code("import { ThemeProvider } from '@fusorb/facet-layout';\n\nexport default function App() {\n  return (\n    <ThemeProvider>\n      <YourRoutes />\n    </ThemeProvider>\n  );\n}"),
      p("That's it—every component now has access to design tokens, theming, and layout primitives."),

      h2("Packages"),
      p("facet is composed of twelve packages that compose into a single cohesive system:"),
      ul([
        "tokens — Shared design tokens (colors, spacing, typography)",
        "sdk — SovGrant API client (auth, identity, billing, \u2026)",
        "components — 114+ UI components (Button, Navbar, AuthForm, \u2026)",
        "auth — Domain-customizable auth (fintech, med, edu presets)",
        "layout — ConsoleLayout, AuthLayout, LandingLayout",
        "store — Zustand-based state (auth, tenant, UI)",
        "emails — Resend-compatible email templates",
        "docs — Data-driven docs engine",
        "cli — Scaffold, generate, dev tooling",
        "motion — Composable, authored animations",
        "native — React Native bridges",
        "sandbox — Live code playground",
      ]),

      h2("Architecture"),
      p("facet follows a four-layer architecture. Each layer has a clear responsibility and dependency direction:"),
      table(
        ["Layer", "Packages", "Responsibility"],
        [
          ["Foundation", "tokens, icons, theming", "Visual primitives shared across all layers"],
          ["Auth", "sdk, auth", "Authentication, sessions, authorization, domain presets"],
          ["Layout", "layout, store, emails", "Shells, routing, state, transactional email"],
          ["Surface", "components, motion, native, docs, cli, sandbox", "UI, animation, platform bridges, DX tools"],
        ],
      ),

      h3("Dependency direction"),
      p("Foundation \u2192 Auth \u2192 Layout \u2192 Surface. Packages in the Surface layer never depend on each other directly\u2014only on lower layers."),
      code("graph TD\n  Foundation[tokens, icons, theming]\n  Auth[sdk, auth]\n  Layout[layout, store, emails]\n  Surface[components, motion, native, docs, cli, sandbox]\n  Foundation --> Auth --> Layout --> Surface"),
    ],
  },

  {
    path: "/getting-started",
    title: "Getting Started",
    section: "guides",
    description: "Install facet, configure your theme, and render your first component.",
    blocks: [
      h2("Installation"),
      install("@fusorb/facet-components", ["@fusorb/facet-tokens", "@fusorb/facet-layout"]),
      p("Import the CSS in your root file (index.tsx, App.tsx, or main.tsx):"),
      code("@import '@fusorb/facet-tokens/tokens.css';"),

      h2("Theme Provider"),
      p("Wrap your application with the ThemeProvider so every component receives tokens and color-mode context:"),
      code("import { ThemeProvider } from '@fusorb/facet-layout';\n\nfunction Root() {\n  return (\n    <ThemeProvider attribute=\"class\" defaultTheme=\"system\">\n      <App />\n    </ThemeProvider>\n  );\n}"),

      h2("Your first component"),
      p("Render a styled Button—with zero configuration:"),
      code("import { Button } from '@fusorb/facet-components';\n\nfunction Example() {\n  return <Button variant=\"solid\" colorScheme=\"accent\">Get started</Button>;\n}"),

      h2("Configure for your domain"),
      p("facet ships preset configurations for fintech, healthcare, and education. Each preset adjusts token palettes, auth flows, and legal copy."),
      code("import { createAuth } from '@fusorb/facet-auth';\n\nconst auth = createAuth({\n  baseUrl: 'https://api.sovgrant.com',\n  clientId: 'facet-demo',\n  domain: 'fintech', // 'med' | 'edu' | 'fintech'\n});"),

      h2("Next steps"),
      ul([
        "Read the Auth guide to set up authentication",
        "Explore the Components reference",
        "Browse the SDK API Reference",
        "Set up the CLI for scaffolding",
      ]),
    ],
  },

  {
    path: "/architecture",
    title: "Architecture",
    section: "guides",
    description: "Understand facet\u2019s four-layer architecture and design principles.",
    blocks: [
      h2("Layer model"),
      p("Every package in the facet workspace belongs to exactly one of four layers. Dependencies only flow downward."),

      table(
        ["Layer", "Packages", "Exports"],
        [
          ["Foundation", "tokens, icons, theming", "Design token CSS, ThemeProvider"],
          ["Auth", "sdk, auth", "createSdk(), createAuth(), withAuth()"],
          ["Layout", "layout, store, emails", "ConsoleLayout, AuthLayout, LandingLayout, stores"],
          ["Surface", "components, motion, native, docs, cli, sandbox", "UI components, animation registry, CLI, playground"],
        ],
      ),

      h3("Foundation"),
      p("The bottom layer provides visual primitives: design tokens (colors, spacing, typography), an icon system, and a ThemeProvider for dark/light mode."),
      code("import { theme } from '@fusorb/facet-tokens';\nconsole.log(theme.colors.accent.DEFAULT);"),

      h3("Auth"),
      p("The auth layer provides the SovGrant SDK client and domain-configurable auth helpers. Auth presets are customizable per vertical (fintech, med, edu)."),
      code("import { createAuth } from '@fusorb/facet-auth';\nconst auth = createAuth({ domain: 'fintech' });\nawait auth.signIn({ strategy: 'password', email, password });"),

      h3("Layout"),
      p("Layout shells handle the structural UI: ConsoleLayout for dashboards, AuthLayout for auth flows, and LandingLayout for marketing pages."),
      code("import { ConsoleLayout } from '@fusorb/facet-layout';\n<ConsoleLayout sidebar={...} topbar={...}>...</ConsoleLayout>"),

      h3("Surface"),
      p("The top layer is where most consumer-facing code lives: components, animations, platform bridges, docs engine, CLI, and sandbox."),
      code("import { Button, Navbar } from '@fusorb/facet-components';\nimport { motion } from '@fusorb/facet-motion';"),
      linkFn("Browse components", "/components"),

      h2("Design principles"),
      ul([
        "Domain-customizable: every layer is configurable for a specific vertical",
        "Auth-first: authentication is built in, not bolted on",
        "Stack-agnostic: works with bare React, Next.js, Vite, Astro, etc.",
        "ESM-only: native ESM, no CommonJS",
        "Strict TypeScript: full type safety across all packages",
      ]),

      h2("Package map"),
      table(
        ["Package", "Scope", "Layer"],
        [
          ["tokens", "@fusorb/facet-tokens", "Foundation"],
          ["sdk", "@fusorb/facet-sdk", "Auth"],
          ["components", "@fusorb/facet-components", "Surface"],
          ["auth", "@fusorb/facet-auth", "Auth"],
          ["layout", "@fusorb/facet-layout", "Layout"],
          ["store", "@fusorb/facet-store", "Layout"],
          ["emails", "@fusorb/facet-emails", "Layout"],
          ["docs", "@fusorb/facet-docs", "Surface"],
          ["cli", "@fusorb/facet-cli", "Surface"],
          ["motion", "@fusorb/facet-motion", "Surface"],
          ["native", "@fusorb/facet-native", "Surface"],
          ["sandbox", "@fusorb/facet-sandbox", "Surface"],
        ],
      ),
    ],
  },

  {
    path: "/stacks",
    title: "Stacks",
    section: "guides",
    description: "Framework and runtime compatibility for facet.",
    blocks: [
      h2("React"),
      p("facet is built for React 19+ with full SSR and streaming support."),
      code("import { Button } from '@fusorb/facet-components';\n\nexport default function Page() {\n  return <Button>SSR-ready</Button>;\n}"),

      h2("Next.js"),
      p("Use facet in a Next.js app with zero-config CSS handling and built-in route guards."),
      code("import { ThemeProvider } from '@fusorb/facet-layout';\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\">\n      <body>\n        <ThemeProvider>\n          {children}\n        </ThemeProvider>\n      </body>\n    </html>\n  );\n}"),

      h2("Vite"),
      p("facet works with Vite out of the box. The CLI scaffolds a Vite-based consumer app."),
      code("// vite.config.ts\nimport { facet } from '@fusorb/facet-vite';\nexport default {\n  plugins: [facet()],\n};"),

      h2("TypeScript"),
      p("All facet packages ship with type declarations and are strict-mode compatible."),
    ],
  },

  {
    path: "/contributing",
    title: "Contributing",
    section: "guides",
    description: "Set up the local development environment and contribute to facet.",
    blocks: [
      h2("Development setup"),
      pre("git clone https://github.com/fusorb/facet.git\ncd facet\npnpm install"),
      h2("Building"),
      p("Build all packages in the workspace:"),
      pre("pnpm build"),
      p("Build a single package in watch mode:"),
      pre("pnpm -F @fusorb/facet-components dev"),
      h2("Testing"),
      pre("pnpm test"),
      h2("Code generation"),
      ul(["pnpm gen:icons \u2014 regenerate the icon library", "pnpm gen:changelog \u2014 regenerate changelog data", "pnpm gen:site-data \u2014 regenerate site stats", "pnpm gen:docs \u2014 regenerate docs pages"]),
      h2("Versioning"),
      p("facet uses changesets for versioning and publishing. To add a change:"),
      pre("pnpm changeset"),
      p("Then run the version command, which opens a PR:"),
      pre("pnpm changeset version"),
      h2("Linting"),
      pre("pnpm lint"),
    ],
  },

  // ── Auth section ──
  {
    path: "/auth",
    title: "Auth",
    section: "auth",
    description: "Domain-customizable authentication for fintech, healthcare, and education.",
    blocks: [
      h2("Overview"),
      p("facet's auth layer is powered by the SovGrant SDK and ships with domain-specific presets for fintech, medical, and education use cases."),
      ul(["Fintech: transaction signing, session timeouts, audit trails", "Medical: HIPAA flows, MFA on every action, consent logging", "Education: SSO integration, role-based class enrollment"]),
      h2("Configuration"),
      code("import { createAuth } from '@fusorb/facet-auth';\n\nconst auth = createAuth({\n  baseUrl: 'https://api.sovgrant.com',\n  clientId: 'facet-demo',\n  domain: 'fintech',\n});"),
      h2("Domain presets"),
      p("Each preset configures:"),
      ul(["Legal copy (terms, privacy) appropriate to the domain", "MFA requirements (optional / required / step-up)", "Session policies (timeout, re-auth)", "Color scheme via token overrides"]),
      code("import { authPresets } from '@fusorb/facet-auth';\n\nconst preset = authPresets.fintech;\n// preset.mfa = 'required'\npreset.session.timeout = 900; // 15 minutes"),
    ],
  },
  { path: "/auth/sign-in", title: "Sign In", section: "auth", parent: "Auth", description: "Render an auth form with password, OAuth, or magic link.", blocks: [h2("Sign In form"), p("The AuthForm renders a sign-in flow with configurable strategies."), code("import { AuthForm } from '@fusorb/facet-auth';\n\n<AuthForm\n  mode=\"sign-in\"\n  providers={['google', 'github']}\n  onForgotPassword={() => router.push('/reset')}\n/>"), h2("OAuth providers"), ul(["Google", "GitHub", "Microsoft", "Apple"]), h2("Programmatic"), code("await auth.signIn({\n  strategy: 'password',\n  email,\n  password,\n});\n\n// or via OAuth\nconst url = auth.getAuthorizationUrl({ provider: 'google' });") ] },
  { path: "/auth/sign-up", title: "Sign Up", section: "auth", parent: "Auth", description: "Sign up with invite codes, terms acceptance, and domain presets.", blocks: [h2("Sign Up form"), code("import { AuthForm } from '@fusorb/facet-auth';\n\n<AuthForm\n  mode=\"sign-up\"\n  showRememberDevice\n  onSignIn={() => router.push('/auth/sign-in')}\n/>"), h2("Programmatic"), code("await auth.signUp({\n  email,\n  password,\n  inviteCode,\n  name,\n  domain: 'fintech',\n});") ] },
  { path: "/auth/mfa", title: "Multi-Factor Auth", section: "auth", parent: "Auth", description: "TOTP, OTP via SMS/email, and step-up authentication.", blocks: [h2("Enrollment"), p("Enroll a TOTP authenticator app:"), code("const { secret, uri } = await auth.enrollMfa({\n  strategy: 'totp',\n  account: 'user@example.com',\n});\n\n// Show QR code from the uri\nawait auth.verifyMfa({ strategy: 'totp', code });"), h2("OTP delivery"), ul(["TOTP via authenticator app (Google Authenticator, Authy, etc.)", "OTP via SMS", "OTP via email"]), h2("Step-up auth"), p("Sensitive operations require an additional MFA challenge."), code("await auth.challenge({ reason: 'high-value-transfer' });") ] },
  { path: "/auth/guards", title: "Route Guards", section: "auth", parent: "Auth", description: "Protect routes with withAuth, withRole, and withPermission.", blocks: [h2("withAuth"), p("Redirect unauthenticated users to the sign-in page."), code("import { withAuth } from '@fusorb/facet-auth';\n\nfunction DashboardPage() {\n  const { user } = useAuth();\n  return <Dashboard user={user} />;\n}\n\nexport default withAuth(DashboardPage);"), h2("withRole"), p("Require a specific role (admin, member, etc.)."), code("import { withRole } from '@fusorb/facet-auth';\nexport default withRole(DashboardPage, 'admin');"), h2("withPermission"), p("Require a specific permission."), code("import { withPermission } from '@fusorb/facet-auth';\nexport default withPermission(SettingsPage, 'settings.write');") ] },
  { path: "/auth/presets", title: "Domain Presets", section: "auth", parent: "Auth", description: "Customizable auth configurations for fintech, medical, and education.", blocks: [h2("Fintech"), p("Transaction signing, 15-minute session timeout, audit log on every auth action."), code("import { authPresets } from '@fusorb/facet-auth';\n\nconst config = {\n  ...authPresets.fintech,\n  session: { timeout: 900 },\n  mfa: { requiredFor: ['transfer', 'settings'] },\n};"), h2("Medical"), p("HIPAA-compliant flows, mandatory MFA, consent logging for every record access."), code("const config = authPresets.med;\n// config.mfa = 'required'\n// config.consent = { required: true, log: true }"), h2("Education"), p("SSO-first, role-based class enrollment, parental consent flows for minors."), code("const config = authPresets.edu;\n// config.sso = true\n// config.roles = ['student', 'teacher', 'parent']"), h2("Custom presets"), p("You can extend a preset and override specific fields."), code("import { authPresets } from '@fusorb/facet-auth';\n\nexport const myPreset = {\n  ...authPresets.fintech,\n  session: { timeout: 1800 },\n  legal: { tos: 'https://example.com/terms' },\n};") ] },

  // ── Foundations ──
  { path: "/tokens", title: "Tokens", section: "foundations", description: "Shared design tokens: colors, spacing, typography.", blocks: [h2("Alpha Palette"), p("facet's design token system is called the Alpha Palette. Colors, spacing, typography, and shadows are exposed as CSS variables and a TypeScript object."), code("import { theme } from '@fusorb/facet-tokens';\n\n<Button colorScheme=\"accent\">Primary</Button>\n\n<div className=\"text-accent-foreground\">Text</div>"), h2("CSS variables"), p("All tokens are available as CSS custom properties:"), ul(["--color-accent (primary brand)", "--color-accent-foreground", "--color-background", "--color-foreground", "--radius", "--font-family", "--gap"]), h2("Token reference"), table(["Token", "CSS variable", "Usage"], [["Accent", "--color-accent", "Primary brand actions"], ["Background", "--color-background", "Page/surface backgrounds"], ["Foreground", "--color-foreground", "Body text"], ["Muted", "--color-muted", "Secondary text/icons"], ["Border", "--color-border", "Dividers, input borders"]]) ] },
  { path: "/icons", title: "Icons", section: "foundations", description: "A comprehensive icon system with 1700+ icons.", blocks: [h2("Usage"), p("facet ships with over 1,700 icons as first-class React components."), code("import { Button } from '@fusorb/facet-components';\nimport { LightIcon } from '@fusorb/facet-components/light';\n\n<Button>\n  <LightIcon className=\"mr-2\" />\n  Settings\n</Button>;"), h2("Icon categories"), ul(["Action icons", "Brand icons", "Status icons", "Navigation icons", "File type icons"]), h2("Custom icons"), p("Add your own icons to the registry via the CLI."), pre("pnpm -F @fusorb/facet-components gen:icons") ] },
  { path: "/theming", title: "Theming", section: "foundations", description: "ThemeProvider with dark mode, system preference, and custom themes.", blocks: [h2("ThemeProvider"), p("The ThemeProvider manages color mode (light, dark, system) and exposes theme context to all components."), code("import { ThemeProvider } from '@fusorb/facet-layout';\n\nfunction Root() {\n  return (\n    <ThemeProvider attribute=\"class\" defaultTheme=\"system\" storageKey=\"facet-theme\">\n      <App />\n    </ThemeProvider>\n  );\n}"), h2("Color mode"), ul(["Light: explicit light mode", "Dark: explicit dark mode", "System: follows OS preference"]), h2("Custom themes"), p("Override tokens with CSS variables for brand customization."), code(":root {\n  --color-accent: #3b82f6;\n  --color-accent-foreground: #ffffff;\n}") ] },
  { path: "/motion", title: "Motion", section: "foundations", description: "Composable, authored-animation system built on Framer Motion.", blocks: [h2("Overview"), p("facet's motion system is built on Framer Motion and adds an authored-registry pattern."), code("import { motion } from '@fusorb/facet-motion';\n\n<motion.div\n  initial=\"hidden\"\n  animate=\"visible\"\n  variants=\"stagger\"\n>"), h2("Registry"), p("Animations live in a registry and are referenced by name:"), code("import { registry } from '@fusorb/facet-motion';\n\nregistry.register('fade-in', {\n  initial: { opacity: 0 },\n  animate: { opacity: 1 },\n  exit: { opacity: 0 },\n});\n\n// use anywhere\n<motion.div variants=\"fade-in\" />"), h2("Authored variants"), ul(["stagger \u2014 children animate one after another", "slide-in \u2014 slide from screen edge", "scale-in \u2014 grow from center", "fade-in \u2014 simple opacity fade"])] },

  // ── Components ──
  { path: "/components", title: "Components", section: "ready-to-use", description: "Reference for all 114+ facet UI components.", blocks: [h2("Component index"), p("facet ships 114+ components organized into categories."), table(["Category", "Components"], [["Action", "Button, IconButton, DropdownMenu"], ["Layout", "Card, Stack, Grid, Separator, Sheet"], ["Forms", "Input, Label, Select, Checkbox, RadioGroup, Switch, Textarea, Form"], ["Navigation", "Navbar, Footer, Breadcrumb, Pagination, Tabs, Sidebar, Topbar"], ["Data Display", "Table, Badge, Pill, Avatar, Progress, Tooltip, Stat"], ["Overlay", "Modal, Popover, Dialog, Drawer, Alert"], ["Utilities", "Spinner, Skeleton, ScrollArea, AspectRatio"]]), h2("Usage"), p("Import only the components you need—everything is tree-shakeable."), code("import { Button, Navbar, Card } from '@fusorb/facet-components';"), linkFn("Browse live components", "/docs#components") ] },

  // ── SDK ──
  { path: "/sdk", title: "SDK", section: "sdk", description: "SovGrant API client for auth, identity, billing, and more.", blocks: [h2("Overview"), p("The facet SDK (@fusorb/facet-sdk) wraps the SovGrant API. It exposes 10 modules with 62 total endpoints, all fully type-checked."), h2("Initialization"), code("import { createSdk } from '@fusorb/facet-sdk';\n\nconst sdk = createSdk({\n  baseUrl: 'https://api.sovgrant.com',\n  tenantId: 'acme',\n  token: 'Bearer <access-token>',\n});"), h2("Modules"), table(["Module", "Purpose", "Endpoints"], [["auth", "Session & authentication", "4"], ["identity", "User management", "4"], ["oauth", "OAuth 2.0 flows", "4"], ["passkey", "Passkey / WebAuthn", "3"], ["tenant", "Multi-tenant management", "5"], ["billing", "Plans & checkout", "4"], ["webhooks", "Webhook lifecycle", "5"], ["idp", "SSO / identity provider", "4"], ["vcs", "Version & changelog", "3"], ["audit", "Event logging", "3"]]), h3("Error handling"), code("try {\n  const { user } = await sdk.auth.getSession();\n} catch (err) {\n  if (err.code === 'SESSION_EXPIRED') {\n    // redirect to sign-in\n  }\n}"), h3("Type-safety"), p("Every method is fully typed\u2014the SDK includes request and response types for every endpoint.") ] },
  { path: "/sdk/auth", title: "Auth SDK", section: "sdk", parent: "SDK", description: "Session and authentication methods.", blocks: [h2("Auth methods"), table(["Method", "HTTP", "Description"], [["authenticate(opts)", "POST /auth/authenticate", "Sign in with password, OAuth, or passkey"], ["getSession()", "GET /auth/session", "Retrieve the current session and user"], ["signOut()", "POST /auth/signout", "Invalidate the current session"], ["revokeSession(id)", "POST /auth/revoke", "Revoke a specific session by ID"]]), code("const { session, user } = await sdk.auth.getSession();") ] },
  { path: "/sdk/identity", title: "Identity SDK", section: "sdk", parent: "SDK", description: "User profile and identity management.", blocks: [h2("Identity methods"), table(["Method", "HTTP", "Description"], [["getUser(id)", "GET /identity/users/:id", "Fetch a user by ID"], ["updateUser(id, data)", "PATCH /identity/users/:id", "Update user attributes"], ["deleteUser(id)", "DELETE /identity/users/:id", "Delete a user"], ["listUsers(query)", "GET /identity/users", "Paginated list of users"]]), code("const { user } = await sdk.identity.getUser('usr_123');") ] },
  { path: "/sdk/oauth", title: "OAuth SDK", section: "sdk", parent: "SDK", description: "OAuth 2.0 authorization code and refresh token flows.", blocks: [h2("OAuth methods"), table(["Method", "HTTP", "Description"], [["getAuthorizationUrl(cfg)", "GET /oauth/authorize", "Build OAuth redirect URL"], ["exchangeCodeForToken(code)", "POST /oauth/token", "Exchange code for access + refresh tokens"], ["refreshToken(token)", "POST /oauth/token/refresh", "Refresh an expired access token"], ["revokeToken(token)", "POST /oauth/revoke", "Revoke a refresh token"]]), code("const url = sdk.oauth.getAuthorizationUrl({ provider: 'google' });\nwindow.location = url;") ] },
  { path: "/sdk/passkey", title: "Passkey SDK", section: "sdk", parent: "SDK", description: "WebAuthn passkey registration and authentication.", blocks: [h2("Passkey methods"), table(["Method", "HTTP", "Description"], [["register(opts)", "POST /passkey/register", "Register a new passkey"], ["authenticate(opts)", "POST /passkey/authenticate", "Authenticate with a registered passkey"], ["unregister(keyId)", "DELETE /passkey/keys/:keyId", "Remove a passkey"]]), code("const { credential } = await sdk.passkey.register({ userId: 'usr_123' });") ] },
  { path: "/sdk/tenant", title: "Tenant SDK", section: "sdk", parent: "SDK", description: "Multi-tenant management APIs.", blocks: [h2("Tenant methods"), table(["Method", "HTTP", "Description"], [["getTenant(id)", "GET /tenants/:id", "Fetch tenant config"], ["createTenant(data)", "POST /tenants", "Create a new tenant"], ["updateTenant(id, data)", "PATCH /tenants/:id", "Update tenant settings"], ["deleteTenant(id)", "DELETE /tenants/:id", "Delete a tenant"], ["listTenants(query)", "GET /tenants", "Paginated tenant list"]]), code("const { tenant } = await sdk.tenant.getTenant('acme');") ] },
  { path: "/sdk/billing", title: "Billing SDK", section: "sdk", parent: "SDK", description: "Subscription plans and checkout sessions.", blocks: [h2("Billing methods"), table(["Method", "HTTP", "Description"], [["getPlan(id)", "GET /billing/plans/:id", "Fetch a subscription plan"], ["listPlans()", "GET /billing/plans", "List all plans"], ["createCheckoutSession(data)", "POST /billing/checkout", "Create a checkout session"], ["listInvoices(query)", "GET /billing/invoices", "Paginated invoice list"]]), code("const { session } = await sdk.billing.createCheckoutSession({\n  priceId: 'price_pro',\n  successUrl: 'https://app.so/complete',\n});") ] },
  { path: "/sdk/webhooks", title: "Webhooks SDK", section: "sdk", parent: "SDK", description: "Webhook endpoint lifecycle management.", blocks: [h2("Webhook methods"), table(["Method", "HTTP", "Description"], [["listWebhooks()", "GET /webhooks", "List registered webhooks"], ["createWebhook(data)", "POST /webhooks", "Register a new webhook"], ["updateWebhook(id, data)", "PATCH /webhooks/:id", "Update webhook settings"], ["deleteWebhook(id)", "DELETE /webhooks/:id", "Remove a webhook"], ["testWebhook(id, payload)", "POST /webhooks/:id/test", "Send a test event"]]), code("const { webhooks } = await sdk.webhooks.listWebhooks();") ] },
  { path: "/sdk/idp", title: "Identity Provider SDK", section: "sdk", parent: "SDK", description: "SSO provider configuration.", blocks: [h2("IdP methods"), table(["Method", "HTTP", "Description"], [["listProviders()", "GET /sso/providers", "List SSO providers"], ["getProvider(id)", "GET /sso/providers/:id", "Fetch a provider config"], ["configureProvider(data)", "POST /sso/providers", "Add an SSO provider"], ["updateProvider(id, data)", "PATCH /sso/providers/:id", "Update provider settings"]]), code("const { providers } = await sdk.idp.listProviders();") ] },

  // ── Ecosystem ──
  { path: "/store", title: "Store", section: "ecosystem", description: "Zustand-based state management for auth, tenant, and UI.", blocks: [h2("Overview"), p("The store layer (@fusorb/facet-store) provides Zustand-based stores for auth state, tenant config, and UI preferences."), code("import { useAuthStore, useTenantStore } from '@fusorb/facet-store';\n\nfunction Header() {\n  const { user, isAuthenticated } = useAuthStore();\n  const { tenant } = useTenantStore();\n  return isAuthenticated ? <span>{user.email}</span> : <button>Sign in</button>;\n}"), table(["Store", "Purpose", "Hook"], [["useAuthStore", "Session & user state", "useAuthStore()"], ["useTenantStore", "Active tenant config", "useTenantStore()"], ["useUIStore", "Dialog, sidebar, theme state", "useUIStore()"], ["useNotificationStore", "Toast & notification queue", "useNotificationStore()"]]) ] },
  { path: "/emails", title: "Emails", section: "ecosystem", description: "Resend-compatible transactional email templates.", blocks: [h2("Usage"), p("The emails package ships pre-designed templates that integrate with Resend or any SMTP provider."), code("import { render } from '@fusorb/facet-emails';\nimport { InviteEmail } from '@fusorb/facet-emails/templates';\n\nconst html = await render(InviteEmail, {\n  name: 'Alex',\n  inviteLink: 'https://app.so/invite/abc123',\n});\n\nawait resend.emails.send({ to, subject: 'You\\'re invited', html });"), h2("Templates"), ul(["InviteEmail \u2014 team invitation", "WelcomeEmail \u2014 post-registration welcome", "ResetPasswordEmail \u2014 password reset flow", "ReceiptEmail \u2014 payment receipt"])] },
  { path: "/cli", title: "CLI", section: "ecosystem", description: "Scaffolding, code generation, and development tooling.", blocks: [h2("Commands"), table(["Command", "Description"], [["pnpm gen component <name>", "Scaffold a new component with tests and types"], ["pnpm gen icons", "Regenerate the icon library from SVG sources"], ["pnpm gen changelog", "Regenerate changelog data from changesets"], ["pnpm gen docs", "Regenerate docs pages from the component registry"], ["pnpm dev", "Start the docs-site dev server"], ["pnpm build", "Build all packages"], ["pnpm test", "Run tests across the workspace"], ["pnpm changeset", "Record a change for the next release"]]), h2("Domain scaffolding"), p("The CLI scaffolds auth forms, layout shells, and component variants tailored to a specific domain:"), pre("pnpm gen auth --domain fintech") ] },
  { path: "/native", title: "Native", section: "ecosystem", description: "React Native bridges for facet components.", blocks: [h2("Usage"), p("Facet components can be rendered in React Native apps via the native bridge package."), code("import { Button } from '@fusorb/facet-native';\n\nfunction App() {\n  return <Button variant=\"solid\">Press me</Button>;\n}"), h2("Supported components"), p("Not all components are supported on Native. Check the compatibility matrix:"), table(["Component", "Native"], [["Button", "yes"], ["Navbar", "yes"], ["Modal", "yes"], ["AuthForm", "yes"], ["Table", "no\u2014use FlatList"]]) ] },
  { path: "/sandbox", title: "Sandbox", section: "ecosystem", description: "Live code playground for component development.", blocks: [h2("Usage"), p("The sandbox package provides a live playground where users can edit and preview components in real time."), code("import { Sandbox } from '@fusorb/facet-sandbox/react';\n\n<Sandbox\n  initialCode=\"const x = 1;\"\n  onChange={(code) => console.log(code)}\n/>"), h2("Features"), ul(["Syntax highlighting via Monaco", "Real-time preview", "Shareable sessions", "TypeScript support", "Dark / light mode"])] },

  // ── API Reference ──
  { path: "/api-reference", title: "API Reference", section: "reference", description: "Complete API reference for the facet SDK.", blocks: [h2("SDK client"), p("The createSdk function creates a typed client for all SovGrant API endpoints."), code("import { createSdk } from '@fusorb/facet-sdk';\n\nconst sdk = createSdk({\n  baseUrl: string,\n  tenantId: string,\n  token: string,\n});\n\n// Each module is namespaced\nawait sdk.auth.getSession();\nawait sdk.billing.getPlan('plan_pro');"), h2("Auth module"), table(["Method", "Endpoint", "Description"], [["authenticate()", "POST /auth/authenticate", "Sign in with password, OAuth, or passkey"], ["getSession()", "GET /auth/session", "Fetch the current session and user"], ["signOut()", "POST /auth/signout", "Invalidate the current session"], ["revokeSession(id)", "POST /auth/revoke", "Revoke a specific session by ID"]]), h2("Identity module"), table(["Method", "Endpoint", "Description"], [["getUser(id)", "GET /identity/users/:id", "Fetch a user by ID"], ["updateUser(id, data)", "PATCH /identity/users/:id", "Update user attributes"], ["deleteUser(id)", "DELETE /identity/users/:id", "Delete a user"], ["listUsers(query)", "GET /identity/users", "Paginated list of users"]]), h2("OAuth module"), table(["Method", "Endpoint", "Description"], [["getAuthorizationUrl(cfg)", "GET /oauth/authorize", "Build OAuth redirect URL"], ["exchangeCodeForToken(code)", "POST /oauth/token", "Exchange code for access + refresh tokens"], ["refreshToken(token)", "POST /oauth/token/refresh", "Refresh an expired access token"], ["revokeToken(token)", "POST /oauth/revoke", "Revoke a refresh token"]]), h2("Passkey module"), table(["Method", "Endpoint", "Description"], [["register(opts)", "POST /passkey/register", "Register a new passkey"], ["authenticate(opts)", "POST /passkey/authenticate", "Authenticate with a registered passkey"], ["unregister(keyId)", "DELETE /passkey/keys/:keyId", "Remove a passkey"]]), h2("Tenant module"), table(["Method", "Endpoint", "Description"], [["getTenant(id)", "GET /tenants/:id", "Fetch tenant configuration"], ["createTenant(data)", "POST /tenants", "Create a new tenant"], ["updateTenant(id, data)", "PATCH /tenants/:id", "Update tenant settings"], ["deleteTenant(id)", "DELETE /tenants/:id", "Delete a tenant"], ["listTenants(query)", "GET /tenants", "Paginated tenant list"]]), h2("Billing module"), table(["Method", "Endpoint", "Description"], [["getPlan(id)", "GET /billing/plans/:id", "Fetch a subscription plan"], ["listPlans()", "GET /billing/plans", "List all plans"], ["createCheckoutSession(data)", "POST /billing/checkout", "Create a checkout session"], ["listInvoices(query)", "GET /billing/invoices", "Paginated invoice list"]]), h2("Webhooks module"), table(["Method", "Endpoint", "Description"], [["listWebhooks()", "GET /webhooks", "List registered webhooks"], ["createWebhook(data)", "POST /webhooks", "Register a new webhook"], ["updateWebhook(id, data)", "PATCH /webhooks/:id", "Update webhook settings"], ["deleteWebhook(id)", "DELETE /webhooks/:id", "Remove a webhook"], ["testWebhook(id, payload)", "POST /webhooks/:id/test", "Send a test event"]]), h2("IdP module"), table(["Method", "Endpoint", "Description"], [["listProviders()", "GET /sso/providers", "List SSO providers"], ["getProvider(id)", "GET /sso/providers/:id", "Fetch a provider config"], ["configureProvider(data)", "POST /sso/providers", "Add an SSO provider"], ["updateProvider(id, data)", "PATCH /sso/providers/:id", "Update provider settings"]]), h2("VCS module"), table(["Method", "Endpoint", "Description"], [["listVersions()", "GET /vcs/versions", "List all available SDK versions"], ["getVersion(version)", "GET /vcs/versions/:version", "Fetch a specific version's metadata"], ["getChangelog(version)", "GET /vcs/changelog/:version", "Fetch the changelog for a version"]]), h2("Audit module"), table(["Method", "Endpoint", "Description"], [["logEvent(event)", "POST /audit/events", "Log a single audit event"], ["queryEvents(query)", "GET /audit/events", "Query audit events with filters"], ["getEvent(id)", "GET /audit/events/:id", "Fetch a single event by ID"])] },

  // ── Changelog ──
  { path: "/changelog", title: "Changelog", section: "changelog", description: "All notable changes to the facet ecosystem.", blocks: [h2("facet changelog"), p("All notable changes are grouped by release date. Pending changesets appear as Unreleased. Data is auto-generated from .changeset/ files and each package's CHANGELOG.md via scripts/gen-changelog.mjs."), changelog()] },
];

// ─── generation ────────────────────────────────────────────────────────────

var out = [
  "// AUTO-GENERATED by scripts/gen-pages.mjs — do not edit by hand.",
  'import { type DocsBlock, type DocsPage } from "@fusorb/facet-docs";',
  'import { facetChangelog } from "./data/changelog.js";',
  "",
  "export const docsPages: DocsPage[] = " + ts(P) + ";",
  "",
].join("\n");

var outPath = path.join(root, "apps/docs/src/pages.ts");
fs.writeFileSync(outPath, out);
console.log("Generated " + P.length + " pages -> apps/docs/src/pages.ts");
console.log("Total blocks: " + P.reduce(function (s, p) { return s + p.blocks.length; }, 0));
