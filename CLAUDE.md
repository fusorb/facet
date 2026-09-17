# facet: Engineering Handbook

## Overview

facet is the shared UI layer for the identity ecosystem (SovGrant, Relnex, SovPort).
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
packages/tokens/       ← Design tokens + motion tokens (finished)
packages/sdk/          ← SovGrant SDK (finished)
packages/motion/       ← Declarative animation system (core + CSS driver + registry + React bindings)
packages/native/       ← React Native bridge for facet-motion (0.1.0, scaffold)
packages/components/   ← 114 styled Radix components (shadcn-style, Radix + tailwind-merge)
packages/auth/         ← Auth components + domain presets (fintech, med, edu)
packages/layout/       ← Domain-configurable app shell (ConsoleLayout, AuthLayout, LandingLayout)
packages/store/        ← Framework-agnostic Zustand stores (auth + tenant) + token-refresh bridge
packages/emails/       ← Framework-agnostic email builder + React bridge (renderEmail, EmailLayout)
packages/docs/         ← Installable docs engine: @fusorb/facet-docs (<DocsApp config pages />)
packages/cli/          ← Scaffold docs, audit/update, add components, generate icon registry
apps/docs/             ← Docs demo site: thin consumer of @fusorb/facet-docs (private, @fusorb/facet-docs-site)
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

`@fusorb/facet-sdk` is a pure fetch client. No React, no axios. Each API domain
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

## Build Status (2026-09-13)

1. ✅ `packages/tokens/`: Complete
2. ✅ `packages/sdk/`: Complete, strict domain types (`sdk/src/types.ts`)
3. ✅ `packages/components/`: 114 styled Radix components + theme system + IconRegistry (Stepper, KanbanBoard, ChangelogList added in 1.11.0; WizardFormPage, DateRangePicker, Chart, EmptyStatePage, QrScanner, ConsentCapture, PricingComparison, Tree, MultiCombobox, TagInput, RangeSlider, RatingInput, CookieBanner, OtpInput, RichTextEditor, PhoneInput, MentionInput, ShineBorderCard, GlowBorderCard, Pill added in 1.12.0)
4. ✅ `packages/auth/`: ArcProvider, SignIn (controlled `step`/`onStepChange` API), SignUp, UserButton, Guard, MfaDialog, 7 standalone forms
5. ✅ `packages/layout/`: ConsoleLayout (full + rail modes), AuthLayout (renamed from AppLayout, alias kept), LandingLayout, 5 presets
6. ✅ `packages/docs/`: installable config-driven docs engine (`@fusorb/facet-docs`) + thin demo consumer at `apps/docs/` (`@fusorb/facet-docs-site`)
7. ✅ Changesets + npm publish pipeline
8. ✅ `apps/landing/`: rebuilt public-facing site (vite + tailwind v4) + feedback page (`/feedback`) with mail + GitHub links
9. ✅ Tests: vitest workspace, 902 tests across 70 files (10 projects: sdk, store, components, auth, layout, cli, motion, native, docs, emails); 1 pre-existing flake: theme.test.tsx Radix/jsdom
10. ✅ SignIn mfa_challenge wired to MfaVerifyForm
11. ✅ SignIn controlled `step`/`onStepChange` + `<SignInFlowDemo>` live-linked state machine + `<AuthDemo>` config block
12. ✅ Docs restructure landed (568497d): old `apps/docs-site` removed, `packages/docs` engine + `apps/docs` thin consumer. Docs site includes an interactive SignIn demo with a method switcher (config toggles + preview + synced copyable code), a reusable `demo` content block for any manifest slug (auth/layout/forms guide pages), and a keyboard-shortcuts table on Overview + Getting Started.
13. ✅ P0 fixes landed (2026-08-03): `check-docs-inventory.mjs` rewritten as a barrel+manifest drift gate (no story dependency); Storybook fully purged (48 story fixtures deleted, `@storybook/react-vite` removed from root devDeps); `packages/docs` added to root tsconfig references. Docs site has Auth as a nested sidebar group and Components grouped by category, with the interactive SignIn demo as the single home on /auth/sign-in.
14. ✅ Docs-site gallery split (committed in b1da261): base UI components, the auth/layout surfaces, and the "Ready to Use" extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap, Form) are now separated. The base `/components` gallery shows UI primitives only, auth/layout have their own guide pages with interactive demos, and ready-to-use extras get a dedicated `/ready-to-use` section with live previews + copyable snippets. Component pages use the reusable `<InteractiveDemo>` (variant tabs with live preview + matching code side-by-side).
15. ⚠️ `pnpm lint` hangs on this machine (environment issue). CLI `tsc` is pathologically slow; use editor LSP diagnostics on changed files as the typecheck signal.
16. ✅ Architectural debt sprint - 10 items resolved and committed: `@fusorb/facet-store` stabilized at 1.0.0 (was 0.1.0-alpha), `@fusorb/facet-cli` stabilized at 1.0.0 (was 0.8.0); CLI deps resolved dynamically from the installed components package.json (no hardcoded BUNDLED_DEPS); CLI self-update is CI-aware (skips update check in CI, suggests npx fallback); docs engine has 6 test files (manifest, nav, pages, docs-app integration); scan.ts detects Fastify/OpenAPI backend routes + generates API reference pages; `facet clean` is opt-in destructive (`--delete-local` flag; `--yes` preset never deletes files); icon catalog is lazy-loaded (1,500-icon map deferred, ~30 semantic icons resolved synchronously); SDK table↔barrel + icon-map drift gates wired into CI; `facet install` (`.alias("add")`) + `facet copy` (component source) split clarifies the commands; template-merge.ts marker bug fixed. See `.changeset/stabilize-cli-store.md`.
17. ✅ CI gates: `build → check:docs → check:icons → check:components → check:sdk-drift → check:motion-drift → typecheck → test (workspace) → sandbox:e2e`. `audit:motion-parity` (token parity) remains local-only by design. Version job has `permissions: contents: write` (fixes 403 on changesets version PR push).
18. ✅ Production-grade pass (2026-09-13, working tree): full audit written to `.agent/production-audit.txt` (sections A-G); packages de-branded (no "Arcevo"/"SovGrant" strings in src, neutral emails default, semantic tokens over hardcoded palette); tokens build now minifies dist CSS via esbuild; all 22 components missing typed props now export `XxxProps` types (check:components gate 114/114 + 114/114); CI actions pinned to commit SHAs; changesets/action v2.1.2 + @changesets/cli 3.0.2 (renamed inputs, explicit github-token, releases/tags disabled); publish job grants `id-token: write` for the future npm Trusted Publishing swap; `.agent/` untracked + gitignored; landing rebuilt config-driven (`site.config.ts` + `scripts/gen-site-data.mjs` codegen + pages registry + sections) with the "f" monogram placeholder (no logo assets); landing/docs-site build, typecheck, tests (902 across 10 projects), and all drift gates green. Remaining: browser visual QA and the E-cluster cosmetic docs/CLI gaps (tracked in `.agent/todo.txt`).

19. ✅ Motion system (2026-09-15..17, committed + consumed): `@fusorb/facet-motion@0.1.0` scaffolded (3fefa64) — pure-JS engine (animate/sequence/stagger, motionValue, cssDriver, 15 generative + 18 authored registries, <Motion>/<Presence>/<Reveal>/<Stagger>), motion tokens wired into facet-tokens (2c37fad), drift gate (`packages/motion/scripts/check-motion-drift.mjs`) + token parity audit (`scripts/audit-motion-parity.mjs`) in CI. Phase 2B consumption: 14 component files migrated to animate-facet-* grammar; zero inline duration literals remain. Phase 2C: `@fusorb/facet-native@0.1.0` scaffolded (motionValues + native-driver binding API). Version reconciliation: CLI + Store 2.0.0 → 1.0.0. Tests: 902 across 10 projects (incl. 106 motion + 21 native + 26 emails). Next: Phase 3 domain presets + Phase 4 nativeDriver real Animated binding. See `.agent/episodes.md` EP 32.

## Known Gaps for SovGrant Consumption

When SovGrant adopts facet as its frontend, these need resolution:

**Resolved blockers (were blockers, now fixed):**

1. ✅ **SDK 401 auto-refresh**: Added `onTokenRefresh` callback to `ArcIdClient` (`client.ts:113-124`). Automatic retry on 401.
2. ✅ **Placeholder handlers**: `handlePasskeyAuth` now calls `passkeySdk.authenticationOptions()` → `navigator.credentials.get()` → `passkeySdk.authenticate()`. `handleForgotPasswordSubmit` calls `authSdk.forgotPassword()`. No longer stubs.
3. ✅ **Test infrastructure**: Vitest workspace, 749 tests across 56 files (7 projects: sdk, store, components, auth, layout, cli, docs).
4. ✅ **SignIn MFA challenge**: Wired to `MfaVerifyForm` (2026-07-31).
5. ✅ **Duplicate dropdowns**: `layout/UserMenu` now uses `@fusorb/facet-components` `DropdownMenu`.
6. ✅ **Type strictness**: SDK now has strict domain interfaces in `sdk/src/types.ts`; `Record<string, unknown>` eliminated.
7. ✅ **Sidebar router coupling**: `RouterAdapter` pattern (`router.tsx`) supports Next.js App Router, Remix, and React Router.
8. ✅ **Theme switching**: `ThemeProvider`/`useTheme`/`ThemeToggle` with localStorage persistence + system preference detection.
9. ✅ **OAuth provider buttons**: SignIn renders provider buttons from `config.oauthProviders` and calls `onOAuth`.
10. ✅ **Form validation**: Auth forms integrate react-hook-form + zod with inline errors.
11. ✅ **Domain preset registry**: `registerPreset`/`getPreset`/`resolvePreset` in auth and layout.
12. ✅ **Docs inventory gate**: `node scripts/check-docs-inventory.mjs` verifies every `ui/` component is barrel-exported and present in the docs manifest (Storybook fixtures removed).
13. ✅ **Icon library registry**: `IconRegistry` shipped in 1.0.2 (`icon/registry.tsx`): `IconProvider`/`Icon`/`registerIcon`/`getIcon` with lucide-react as the default set and domain overrides supported.

**Still open (not blockers):** 1. **No Tailwind config**: No `tailwind.config.*`. Relies on CSS variables. Consumers need `tailwindcss-animate` plugin. 2. **Bundle optimization**: tsup uses CLI flags, not config files; no code-splitting or tree-shake analysis. 3. ~~**CSS build pipeline**~~: fixed 2026-09-13, tokens dist CSS is minified at build time (esbuild). 4. **Turbo validation**: `turbo.json` exists but hasn't been validated with a real run. 5. **Component a11y audit**: Radix primitives provide baseline accessibility, but compounded components (SignIn state machine, MfaDialog phases) need keyboard navigation and screen reader testing before third-party use. 6. **Storybook fully removed**: the repo no longer runs Storybook and has zero `@storybook/*` deps; the docs inventory drift gate (`node scripts/check-docs-inventory.mjs`) verifies barrel exports + manifest coverage instead. 7. **check-docs-inventory.mjs rewritten**: the three P0 breakages from `.agent/analysis-current-state.md` are fixed (see item 13 above). 8. **Slot gaps**: 4 data-driven composites (api-key-manager, invite-team-form, testimonial-showcase, two-factor-setup-panel) have no render/children slots yet (check:components warns, doesn't fail). 9. **npm Trusted Publishing**: publish job is OIDC-ready (`id-token: write`) but still falls back to NPM_TOKEN until npm provenance is configured on the package.

## Consumption Target

SovGrant will consume facet as npm-published packages:

- `src/components/ui/*` → replace with `@fusorb/facet-components`
- `src/components/auth/*` → replace with `@fusorb/facet-auth`
- `src/sdk/*` → replace with `@fusorb/facet-sdk`
- `globals.css :root` → replace with `@fusorb/facet-tokens/tokens.css`

SovGrant keeps: Zustand stores, hooks, providers (tenant hydration), pages, layout components (until replacing with `@fusorb/facet-layout`).

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
