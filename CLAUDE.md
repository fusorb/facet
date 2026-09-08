# facet: Engineering Handbook

## Overview

facet is the shared UI layer for the Arcevo ecosystem (arc-id, arcbase, arc-wallet).
It replaces ~100 duplicated shadcn components between projects with a single,
domain-customizable auth-first component system.

**Key constraint:** Auth components must be domain-customizable (fintech vs med vs edu): not one-size-fits-all.

## Architecture

Every component follows a 4-layer architecture:

1. **Primitive**: Radix/headless (unstyled, accessible)
2. **Styled Base**: Primitive + Alpha Palette tokens + animation
3. **Composed**: Multiple Layer-2 components wired into a flow
4. **Domain Preset**: Layer-3 with domain-specific defaults

Three customization axes: `appearance` (style), `config` (behavior flags), `slots` (render props).

## Package Layout

```
packages/tokens/       ← Design tokens (finished)
packages/sdk/          ← arc-id SDK (finished)
packages/components/   ← 113 styled Radix components (shadcn-style, Radix + tailwind-merge)
packages/auth/         ← Auth components + domain presets (fintech, med, edu)
packages/layout/       ← Domain-configurable app shell (ConsoleLayout, AuthLayout, LandingLayout)
packages/store/        ← Framework-agnostic Zustand stores (auth + tenant) + token-refresh bridge
packages/emails/       ← Framework-agnostic email builder + React bridge (renderEmail, EmailLayout)
packages/docs/         ← Installable docs engine: @arcevo/facet-docs (<DocsApp config pages />)
packages/cli/          ← Scaffold docs, audit/update, add components, generate icon registry
apps/docs/             ← Docs demo site: thin consumer of @arcevo/facet-docs (private, @arcevo/facet-docs-site)
apps/landing/          ← Landing page
```

## Code Standards

- TypeScript strict mode, ESM-only
- React 19, functional components with hooks
- Tailwind CSS v4 for styling (unless overridden by `appearance` API)
- `clsx` + `tailwind-merge` for className merging (use `cn()`)
- Every component accepts `className` for override
- Exports: named exports only (no default exports)
- File naming: kebab-case (e.g., `sign-in.tsx`, `use-session.ts`)
- Barrel exports from package `index.ts`

## SDK Architecture

`@arcevo/facet-sdk` is a pure fetch client. No React, no axios. Each API domain
gets its own class that takes `ArcIdClient` in its constructor. Consumers
instantiate the modules they need:

```ts
const client = new ArcIdClient({ baseUrl });
const auth = new AuthSdk(client);
const { data, error } = await auth.signIn({ email, password });
```

## Auth State Machine

The `SignIn` component is a configurable state machine:

```
IDLE → CHECK_SESSION → (authenticated → REDIRECT)
                      → (unauthenticated → SELECT_METHOD)

SELECT_METHOD → (email_password → LOGIN_FORM)
              → (magic_link → MAGIC_LINK_FORM)
              → (social → SOCIAL_LOGIN)
              → (passkey → PASSKEY_AUTH)

LOGIN_FORM → (success → CHECK_MFA)
           → (error → LOGIN_FORM)

CHECK_MFA → (mfa_not_required → COMPLETE)
          → (mfa_required → MFA_CHALLENGE)

MFA_CHALLENGE → (verified → COMPLETE)
              → (error → MFA_CHALLENGE)

COMPLETE → (onSuccess callback) → redirect
         → (step_up_required → STEP_UP)
```

## Domain Presets

| Feature      | Fintech | Med    | Edu   | Enterprise |
| ------------ | ------- | ------ | ----- | ---------- |
| MFA required | ✅      | ✅     | ❌    | ✅         |
| Passkeys     | ❌      | ❌     | ✅    | optional   |
| Session TTL  | 15 min  | 30 min | 24 hr | 8 hr       |
| Magic link   | ✅      | ❌     | ✅    | ❌         |

## Build Status (2026-08-18)

1. ✅ `packages/tokens/`: Complete
2. ✅ `packages/sdk/`: Complete, strict domain types (`sdk/src/types.ts`)
3. ✅ `packages/components/`: 113 styled Radix components + theme system + IconRegistry (Stepper, KanbanBoard, ChangelogList added in 1.11.0; WizardFormPage, DateRangePicker, Chart, EmptyStatePage, QrScanner, ConsentCapture, PricingComparison, Tree, MultiCombobox, TagInput, RangeSlider, RatingInput, CookieBanner, OtpInput, RichTextEditor, PhoneInput, MentionInput, ShineBorderCard, GlowBorderCard, Pill added in 1.12.0)
4. ✅ `packages/auth/`: ArcProvider, SignIn (controlled `step`/`onStepChange` API), SignUp, UserButton, Guard, MfaDialog, 7 standalone forms
5. ✅ `packages/layout/`: ConsoleLayout (full + rail modes), AuthLayout (renamed from AppLayout, alias kept), LandingLayout, 5 presets
6. ✅ `packages/docs/`: installable config-driven docs engine (`@arcevo/facet-docs`) + thin demo consumer at `apps/docs/` (`@arcevo/facet-docs-site`)
7. ✅ Changesets + npm publish pipeline
8. ✅ `apps/landing/`: rebuilt public-facing site (vite + tailwind v4) + feedback page (`/feedback`) with mail/WhatsApp/socials
9. ✅ Tests: vitest workspace, 362 test definitions across 31 files (sdk 2, components 21, auth 6, layout 2); 276 of those are component tests (21 files, 1 pre-existing flake: theme.test.tsx Radix/jsdom)
10. ✅ SignIn mfa_challenge wired to MfaVerifyForm
11. ✅ SignIn controlled `step`/`onStepChange` + `<SignInFlowDemo>` live-linked state machine + `<AuthDemo>` config block
12. ✅ Docs restructure landed (568497d): old `apps/docs-site` removed, `packages/docs` engine + `apps/docs` thin consumer. Docs site includes an interactive SignIn demo with a method switcher (config toggles + preview + synced copyable code), a reusable `demo` content block for any manifest slug (auth/layout/forms guide pages), and a keyboard-shortcuts table on Overview + Getting Started.
13. ✅ P0 fixes landed (2026-08-03): `check-docs-inventory.mjs` rewritten as a barrel+manifest drift gate (no story dependency); Storybook fully purged (48 story fixtures deleted, `@storybook/react-vite` removed from root devDeps); `packages/docs` added to root tsconfig references. Docs site has Auth as a nested sidebar group and Components grouped by category, with the interactive SignIn demo as the single home on /auth/sign-in.
14. ✅ Docs-site gallery split (committed in b1da261): base UI components, the auth/layout surfaces, and the "Ready to Use" extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap, Form) are now separated. The base `/components` gallery shows UI primitives only, auth/layout have their own guide pages with interactive demos, and ready-to-use extras get a dedicated `/ready-to-use` section with live previews + copyable snippets. Component pages use the reusable `<InteractiveDemo>` (variant tabs with live preview + matching code side-by-side).
15. ⚠️ `pnpm lint` hangs on this machine (environment issue). CLI `tsc` is pathologically slow; use editor LSP diagnostics on changed files as the typecheck signal.
16. ✅ Architectural debt sprint - 10 items resolved and committed: `@arcevo/facet-store` stabilized at 1.0.0 (was 0.1.0-alpha), `@arcevo/facet-cli` stabilized at 1.0.0 (was 0.8.0); CLI deps resolved dynamically from the installed components package.json (no hardcoded BUNDLED_DEPS); CLI self-update is CI-aware (skips update check in CI, suggests npx fallback); docs engine has 6 test files (manifest, nav, pages, docs-app integration); scan.ts detects Fastify/OpenAPI backend routes + generates API reference pages; `facet clean` is opt-in destructive (`--delete-local` flag; `--yes` preset never deletes files); icon catalog is lazy-loaded (1,500-icon map deferred, ~30 semantic icons resolved synchronously); SDK table↔barrel + icon-map drift gates wired into CI; `facet install` (`.alias("add")`) + `facet copy` (component source) split clarifies the commands; template-merge.ts marker bug fixed. See `.changeset/stabilize-cli-store.md`.
17. ✅ CI gates: `build → check:docs → check:icons → check:sdk-drift → typecheck → test (workspace) → sandbox:e2e`. Version job has `permissions: contents: write` (fixes 403 on changesets version PR push).

## Known Gaps for arc-id Consumption

When arc-id adopts facet as its frontend, these need resolution:

**Resolved blockers (were blockers, now fixed):**

1. ✅ **SDK 401 auto-refresh**: Added `onTokenRefresh` callback to `ArcIdClient` (`client.ts:113-124`). Automatic retry on 401.
2. ✅ **Placeholder handlers**: `handlePasskeyAuth` now calls `passkeySdk.authenticationOptions()` → `navigator.credentials.get()` → `passkeySdk.authenticate()`. `handleForgotPasswordSubmit` calls `authSdk.forgotPassword()`. No longer stubs.
3. ✅ **Test infrastructure**: Vitest workspace, 362 test definitions across 31 files (sdk 2, components 21, auth 6, layout 2).
4. ✅ **SignIn MFA challenge**: Wired to `MfaVerifyForm` (2026-07-31).
5. ✅ **Duplicate dropdowns**: `layout/UserMenu` now uses `@arcevo/facet-components` `DropdownMenu`.
6. ✅ **Type strictness**: SDK now has strict domain interfaces in `sdk/src/types.ts`; `Record<string, unknown>` eliminated.
7. ✅ **Sidebar router coupling**: `RouterAdapter` pattern (`router.tsx`) supports Next.js App Router, Remix, and React Router.
8. ✅ **Theme switching**: `ThemeProvider`/`useTheme`/`ThemeToggle` with localStorage persistence + system preference detection.
9. ✅ **OAuth provider buttons**: SignIn renders provider buttons from `config.oauthProviders` and calls `onOAuth`.
10. ✅ **Form validation**: Auth forms integrate react-hook-form + zod with inline errors.
11. ✅ **Domain preset registry**: `registerPreset`/`getPreset`/`resolvePreset` in auth and layout.
12. ✅ **Docs inventory gate**: `node scripts/check-docs-inventory.mjs` verifies every `ui/` component is barrel-exported and present in the docs manifest (Storybook fixtures removed).
13. ✅ **Icon library registry**: `IconRegistry` shipped in 1.0.2 (`icon/registry.tsx`): `IconProvider`/`Icon`/`registerIcon`/`getIcon` with lucide-react as the default set and domain overrides supported.

**Still open (not blockers):** 1. **No Tailwind config**: No `tailwind.config.*`. Relies on CSS variables. Consumers need `tailwindcss-animate` plugin. 2. **Bundle optimization**: tsup uses CLI flags, not config files; no code-splitting or tree-shake analysis. 3. **CSS build pipeline**: Tokens CSS is copied via inline `fs.cpSync` instead of a proper build step (PostCSS + autoprefixer + minification). 4. **Turbo validation**: `turbo.json` exists but hasn't been validated with a real run. 5. **Component a11y audit**: Radix primitives provide baseline accessibility, but compounded components (SignIn state machine, MfaDialog phases) need keyboard navigation and screen reader testing before third-party use. 6. **Storybook fully removed**: the repo no longer runs Storybook and has zero `@storybook/*` deps; the docs inventory drift gate (`node scripts/check-docs-inventory.mjs`) verifies barrel exports + manifest coverage instead. 7. **check-docs-inventory.mjs rewritten**: the three P0 breakages from `.agent/analysis-current-state.md` are fixed (see item 13 above).

## Consumption Target

arc-id will consume facet as npm-published packages:

- `src/components/ui/*` → replace with `@arcevo/facet-components`
- `src/components/auth/*` → replace with `@arcevo/facet-auth`
- `src/sdk/*` → replace with `@arcevo/facet-sdk`
- `globals.css :root` → replace with `@arcevo/facet-tokens/tokens.css`

arc-id keeps: Zustand stores, hooks, providers (tenant hydration), pages, layout components (until replacing with `@arcevo/facet-layout`).

## Commands

```sh
pnpm install              # Install all workspace dependencies
pnpm build                # Build all packages
pnpm build:tokens         # Build tokens only
pnpm build:sdk            # Build SDK only
pnpm dev:docs-site      # Start docs demo site (Vite, port 5173)
pnpm dev:landing        # Start landing page (Vite, port 5174)
pnpm typecheck            # TypeScript check all packages
pnpm lint                 # ESLint all packages
pnpm format               # Prettier format all files
node gen-snapshot.js              # Regenerate ui_codebase_snapshot.txt (local/agent use)
node scripts/gen-docs-manifest.mjs # Regenerate packages/docs/src/manifest.ts
node scripts/check-docs-inventory.mjs # Drift gate (pnpm check:docs)
pnpm check:icons            # Icon-map drift gate
pnpm check:sdk-drift        # Docs SDK table ↔ barrel drift gate
```

## AGENTS.md

Always read `AGENTS.md` at the start of every session. It contains the
compressed AI-agent rules that override or supplement this handbook.
