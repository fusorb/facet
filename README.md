# facet

Domain-customizable auth-first component system.

facet is what you get when you own the identity backend (SovGrant), have a formal
design manual (Alpha Palette), and your auth requirements differ per sector
(fintech vs med vs edu vs enterprise).

## Packages

| Package                    | Description                                                                                                                                                                                | Status    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `@fusorb/facet-tokens`     | Design tokens: Alpha Palette, typography, spacing, CSS vars + motion tokens                                                                                                                | ✅ 1.5.0  |
| `@fusorb/facet-sdk`        | SovGrant API client (pure fetch, typed, 10 domain SDKs)                                                                                                                                    | ✅ 1.2.1  |
| `@fusorb/facet-motion`     | Declarative animation system: core (animate/sequence/stagger), CSS + React Native drivers, 15 generative families + 27 authored effects, <Motion>/<Presence>/<Reveal>/<Stagger>            | ✅ 1.2.1  |
| `@fusorb/facet-native`     | React Native motion driver for @fusorb/facet-motion (motion values + native driver bindings)                                                                                               | ✅ 1.2.1  |
| `@fusorb/facet-components` | 113 styled UI components (Radix + tailwind-merge + variants) + motion grammar (animate-facet-*)                                                                                            | ✅ 3.0.0  |
| `@fusorb/facet-auth`       | Auth components + domain presets: SignIn, SignUp, Guard, MfaDialog, forms                                                                                                                  | ✅ 1.3.5  |
| `@fusorb/facet-layout`     | Domain-configurable app shell: ConsoleLayout, AuthLayout, LandingLayout, Sidebar, Topbar, 5 presets                                                                                        | ✅ 1.5.5  |
| `@fusorb/facet-store`      | Framework-agnostic Zustand stores (auth + tenant) & token-refresh bridge (`createZustandTokenStorage`), web + React Native                                                                 | ✅ 1.0.1  |
| `@fusorb/facet-docs`       | Installable docs engine: mount `<DocsApp>` with your own brand, nav, pages                                                                                                                 | ✅ 1.5.5  |
| `@fusorb/facet-cli`        | Scaffold docs (`facet docs init` + `facet docs scan`), audit/update (`facet pkg/up/doctor`), copy components (`facet copy`), generate a tree-shaken icon registry (`facet icons generate`) | ✅ 1.1.2  |
| `@fusorb/facet-emails`     | Framework-agnostic email builder + React bridge (`renderEmail`, `emailLayout`, `EmailLayout`)                                                                                              | ✅ 1.1.3  |
| `@fusorb/facet-sandbox`    | Framework-agnostic live-preview host: block registry, adapter seam + React JSX adapter (no eval)                                                                                           | ✅ 2.0.0  |
| `@fusorb/facet-utils`      | Shared styling utilities (`cn`) consumed by components + motion                                                                                                                            | ✅ 0.1.0  |

Current versions: tokens 1.5.0, sdk 1.2.1, motion 1.2.1, native 1.2.1, components 3.0.0, auth 1.3.5, layout 1.5.5, store 1.0.1, docs 1.5.5, cli 1.1.2, emails 1.1.3, sandbox 2.0.0, utils 0.1.0.

## Sites

Run locally:

- Landing: `pnpm dev:landing` → http://localhost:5174
- Demo-Docs (component gallery + docs): `pnpm dev:docs-site` → http://localhost:5173

## Documentation

The docs site (`apps/docs`) is a thin consumer of the installable
`@fusorb/facet-docs` engine, the same package any project can mount with its
own brand, nav, and pages. Guides cover getting started, auth, layout, themes,
tokens, and the docs package itself; the component gallery shows all 113 components with live demos and usage tabs.

```sh
pnpm dev:docs-site  # run the docs site locally (Vite, port 5173)
```

### Docs CLI

Scaffold a docs site in any repo (framework-agnostic) with the interactive
wizard, or copy a component into your source:

```sh
npx @fusorb/facet-cli docs init   # pick name, location, stack, styling
npx @fusorb/facet-cli copy button  # shadcn-style copy (package import recommended)
npx @fusorb/facet-cli icons generate  # scan repo, emit a tree-shaken icons.generated.tsx
```

The wizard detects your frontend framework (ignoring backend stacks), your
package manager, and your styling (facet tokens / Tailwind / plain CSS),
then resolves the current facet package versions from npm and patches your
existing `package.json` rather than overwriting it. See
`packages/cli/README.md` for the full flow.

## Quick Start

```sh
pnpm install
pnpm build
pnpm test      # vitest workspace (11 projects: sdk, store, components, auth, layout, cli, motion, native, sandbox, docs, emails)
pnpm typecheck # all 13 packages + 3 apps (16 workspaces)
```

Consume in your app:

```tsx
import { ConsoleLayout, enterpriseLayoutPreset } from "@fusorb/facet-layout";
import { Guard } from "@fusorb/facet-auth";

function App() {
  return (
    <ConsoleLayout config={enterpriseLayoutPreset} tenants={tenants}>
      <Guard>
        <YourRoutes />
      </Guard>
    </ConsoleLayout>
  );
}
```

## Architecture

Every component follows 4 layers: **Primitive → Styled Base → Composed → Domain Preset**.
Customization via 3 axes: `appearance` (style), `config` (behavior), `slots` (render props).

### Layout Shell

Framework-agnostic slot-based shells: no routing dependency:

- **ConsoleLayout**: sidebar + topbar + content area, mobile sheet, auth-aware.
  Two sidebar versions: `mode="full"` (always-labeled sidebar) and
  `mode="rail"` (collapsible to an icon-only rail, choice persisted in
  localStorage). Both are screen responsive (mobile collapses to a Sheet).
- **AuthLayout**: branded split-panel auth page frame (login/register/MFA,
  forgot-password) with brand logo, tagline, and benefits on the left panel
  and a centered card on the right. Mobile shows a compact centered layout.
  Formerly named AppLayout; the old name remains as a deprecated alias.
- **LandingLayout**: full-bleed marketing page, glassmorphic hero, glow CTAs.
  Pair it with the `Navbar` `pill` variant for a floating frosted-glass bar.
- **5 domain presets**: fintech, med, edu, enterprise, default

### Auth System

```tsx
import { SignIn, fintechPreset } from "@fusorb/facet-auth";

// Domain presets customise every copy, step, and behaviour
<SignIn
  config={fintechPreset}
  onSuccess={(result) => router.push("/dashboard")}
/>;
```

Forms are independently importable: `LoginForm`, `MagicLinkForm`, `ForgotPasswordForm`,
`ResetPasswordForm`, `MfaVerifyForm`, `MfaSetupForm`, `MfaRecoveryCodesForm`, `MfaRecoveryForm`.

## Publishing

Packages publish to npm under the `@fusorb/facet-*` scope via Changesets,
driven by GitHub Actions (`.github/workflows/ci-cd.yml`). The workflow runs
three jobs:

1. **ci** -- validation gate: `pnpm install --frozen-lockfile`, `pnpm build`,
   `pnpm check:docs`, `pnpm check:icons`, `pnpm check:components`,
   `pnpm check:boundaries`, `pnpm check:sdk-drift`, `pnpm check:sdk-coverage`,
   `pnpm check:motion-drift`, `pnpm audit:motion-parity`, `pnpm lint`,
   `pnpm -r typecheck`, `pnpm test`, `pnpm sandbox:e2e`.
2. **changeset** -- auto-opens/updates a "Version Packages" PR on `main`
   whenever changesets land. It only versions (bumps `package.json` +
   `CHANGELOG`, opens a PR) -- never publishes. Requires
   `permissions: contents: write` so the release bot can push the
   changeset-release branch.
3. **publish** -- after the version PR merges to `main`, builds `dist` from a
   clean checkout and publishes any unpublished packages to npm. It
   `needs: [ci]` (the gate must pass) and runs `pnpm -r build` before
   `pnpm changeset publish`, so a stale or dirty tree is never shipped.
   Requires the `NPM_TOKEN` repo secret (publish-only, 2FA-exempt) exported
   as `NPM_TOKEN` / `NODE_AUTH_TOKEN` in the job env (see the `publish` job).

**Release rule:** only publish from a clean working tree, and only after the
build passes. The `publish` job enforces this automatically -- it rebuilds
`dist` from merged HEAD before publishing.

```sh
pnpm changeset            # stage a changeset for the change you want released
# push to main → CI opens the Version Packages PR → merge it → CI publishes
```

## Dev Preview

```sh
pnpm dev:docs-site  # Docs demo site → http://localhost:5173 (local)
pnpm dev:landing    # Landing → http://localhost:5174 (local)
```

## License

MIT: facet contributors
