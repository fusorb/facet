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
packages/native/       ← React Native bridge (@1.2.1; §7 disposition: isolated package, depends on @fusorb/facet-motion for auto-registration + @fusorb/facet-tokens; exports bindAnimated/nativeDriver so SovGrant/SovPort can bind a consumer-provided Animated API; native→motion is NOT bundled into web builds — §21 enforces the acyclic boundary)
packages/components/   ← 113 styled Radix components (shadcn-style, Radix + tailwind-merge)
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
3. ✅ `packages/components/`: 113 styled Radix components + theme system + IconRegistry (Stepper, KanbanBoard, ChangelogCard + ChangelogFeed are the canonical changelog surface (ChangelogList, ChangelogWithDate removed); WizardFormPage, DateRangePicker, Chart, EmptyStatePage, QrScanner, ConsentCapture, PricingComparison, Tree, MultiCombobox, TagInput, RangeSlider, RatingInput, CookieBanner, OtpInput, RichTextEditor, PhoneInput, MentionInput, ShineBorderCard, Pill added in 1.12.0)
4. ✅ `packages/auth/`: ArcProvider, SignIn (controlled `step`/`onStepChange` API), SignUp, UserButton, Guard, MfaDialog, 7 standalone forms
5. ✅ `packages/layout/`: ConsoleLayout (full + rail modes), AuthLayout (renamed from AppLayout, alias kept), LandingLayout, DocsLayout (collapsed sidebar variant: one-button collapse-all for sidebar rail + all nav sections + aside), 5 presets
6. ✅ `packages/docs/`: installable config-driven docs engine (`@fusorb/facet-docs`) + thin demo consumer at `apps/docs/` (`@fusorb/facet-docs-site`)
7. ✅ Changesets + npm publish pipeline
8. ✅ `apps/landing/`: rebuilt public-facing site (vite + tailwind v4) + feedback page (`/feedback`) with mail + GitHub links
9. ✅ Tests: vitest workspace, 980 tests across 78 files (11 projects: sdk, store, components, auth, layout, cli, motion, native, sandbox, docs, emails); 1 pre-existing flake: theme.test.tsx Radix/jsdom
10. ✅ SignIn mfa_challenge wired to MfaVerifyForm
11. ✅ SignIn controlled `step`/`onStepChange` + `<SignInFlowDemo>` live-linked state machine + `<AuthDemo>` config block
12. ✅ Docs restructure landed (568497d): old `apps/docs-site` removed, `packages/docs` engine + `apps/docs` thin consumer. Docs site includes an interactive SignIn demo with a method switcher (config toggles + preview + synced copyable code), a reusable `demo` content block for any manifest slug (auth/layout/forms guide pages), and a keyboard-shortcuts table on Overview + Getting Started.
13. ✅ P0 fixes landed (2026-08-03): `check-docs-inventory.mjs` rewritten as a barrel+manifest drift gate (no story dependency); Storybook fully purged (48 story fixtures deleted, `@storybook/react-vite` removed from root devDeps); `packages/docs` added to root tsconfig references. Docs site has Auth as a nested sidebar group and Components grouped by category, with the interactive SignIn demo as the single home on /auth/sign-in.
14. ✅ Docs-site gallery split (committed in b1da261): base UI components, the auth/layout surfaces, and the "Ready to Use" extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap, Form) are now separated. The base `/components` gallery shows UI primitives only, auth/layout have their own guide pages with interactive demos, and ready-to-use extras get a dedicated `/ready-to-use` section with live previews + copyable snippets. Component pages use the reusable `<InteractiveDemo>` (variant tabs with live preview + matching code side-by-side).
15. ✅ `pnpm lint` passes (0 errors; 118 pre-existing warnings — `any` types + unused vars in docs/sandbox). `pnpm -r typecheck` completes in ~30s across all 13 packages.
16. ✅ Architectural debt sprint - 10 items resolved and committed: `@fusorb/facet-store` stabilized at 1.0.0 (was 0.1.0-alpha), `@fusorb/facet-cli` stabilized at 1.0.0 (was 0.8.0); CLI deps resolved dynamically from the installed components package.json (no hardcoded BUNDLED_DEPS); CLI self-update is CI-aware (skips update check in CI, suggests npx fallback); docs engine has 6 test files (manifest, nav, pages, docs-app integration); scan.ts detects Fastify/OpenAPI backend routes + generates API reference pages; `facet clean` is opt-in destructive (`--delete-local` flag; `--yes` preset never deletes files); icon catalog is lazy-loaded (1,500-icon map deferred, ~30 semantic icons resolved synchronously); SDK table↔barrel + icon-map drift gates wired into CI; `facet install` (`.alias("add")`) + `facet copy` (component source) split clarifies the commands; template-merge.ts marker bug fixed. See `.changeset/stabilize-cli-store.md`.
17. ✅ CI gates: `build → check:docs → check:icons → check:components → check:boundaries → check:sdk-drift → check:sdk-coverage → check:motion-drift → audit:motion-parity → lint → typecheck → test (workspace) → sandbox:e2e`. `check:boundaries` (§21) enforces an acyclic `@fusorb/*` DAG and keeps `@fusorb/facet-native` as a separate package (deps: facet-motion for auto-registration + facet-tokens; not bundled into web motion builds). `audit:motion-parity` (token parity) remains local-only by design. Version job has `permissions: contents: write` (fixes 403 on changesets version PR push).
18. ✅ Production-grade pass (2026-09-13, working tree): full audit resolved (sections A-G documented in `.agent/episodes.md` EP 36); packages de-branded (no "Arcevo"/"SovGrant" strings in src, neutral emails default, semantic tokens over hardcoded palette); tokens build now minifies dist CSS via esbuild; all 22 components missing typed props now export `XxxProps` types (check:components gate 113/113 + 113/113); CI actions pinned to commit SHAs; changesets/action v2.1.2 + @changesets/cli 3.0.2 (renamed inputs, explicit github-token, releases/tags disabled); publish job grants `id-token: write` for the future npm Trusted Publishing swap; `.agent/` untracked + gitignored; landing rebuilt config-driven (`site.config.ts` + `scripts/gen-site-data.mjs` codegen + pages registry + sections) with the "f" monogram placeholder (no logo assets); landing/docs-site build, typecheck, tests (980 across 11 projects), and all drift gates green. Remaining: browser visual QA and the E-cluster cosmetic docs/CLI gaps (tracked in `.agent/output.txt` active session priorities).

19. ✅ Motion system (2026-09-15..17, committed + consumed): `@fusorb/facet-motion@0.1.0` scaffolded (3fefa64) - pure-JS engine (animate/sequence/stagger, motionValue, cssDriver, 15 generative + 27 authored effects, <Motion>/<Presence>/<Reveal>/<Stagger>), motion tokens wired into facet-tokens (2c37fad), drift gate (`packages/motion/scripts/check-motion-drift.mjs`) + token parity audit (`scripts/audit-motion-parity.mjs`) in CI. Phase 2B consumption: 14 component files migrated to animate-facet-* grammar; zero inline duration literals remain. Phase 2C: `@fusorb/facet-native@0.1.0` scaffolded (motionValues + native-driver binding API). Version reconciliation: CLI + Store 2.0.0 → 1.0.0. Tests: 980 across 11 projects (incl. 138 motion + 21 native + 26 emails). §7 disposition: @fusorb/facet-native is an isolated package (depends on @fusorb/facet-motion for auto-registration + @fusorb/facet-tokens; NOT bundled into web motion builds; exports bindAnimated/nativeDriver so SovGrant/SovPort bind a consumer-provided Animated API; §21 check:boundaries enforces the acyclic boundary). Phase 3 (fintech presets implemented; med/edu next). Phase 4 (nativeDriver real Animated binding) is the deferred motion→native wiring — not this disposition. See `.agent/episodes.md` EP 32.

## Known Gaps for SovGrant Consumption

When SovGrant adopts facet as its frontend, these need resolution:

**Resolved blockers (were blockers, now fixed):**

1. ✅ **SDK 401 auto-refresh**: Added `onTokenRefresh` callback to `ArcIdClient` (`client.ts:113-124`). Automatic retry on 401.
2. ✅ **Placeholder handlers**: `handlePasskeyAuth` now calls `passkeySdk.authenticationOptions()` → `navigator.credentials.get()` → `passkeySdk.authenticate()`. `handleForgotPasswordSubmit` calls `authSdk.forgotPassword()`. No longer stubs.
3. ✅ **Test infrastructure**: Vitest workspace, 980 tests across 78 files (11 projects: sdk, store, components, auth, layout, cli, motion, native, sandbox, docs, emails).
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

**Still open (not blockers):** 1. ✅ **Tailwind config** (resolved): No `tailwind.config.*` needed — Tailwind v4 setup lives in `@fusorb/facet-tokens/tailwind.css` (`@theme` + `tw-animate-css`). Consumers import `@fusorb/facet-tokens/index.css` and add `@source` hints for facet packages. Documented in tokens README. 2. **Bundle optimization**: tsup uses CLI flags, not config files; no code-splitting or tree-shake analysis. 3. ~~**CSS build pipeline**~~: fixed 2026-09-13, tokens dist CSS is minified at build time (esbuild). 4. ✅ **Turbo validation** (2026-10-07): `turbo run build --dry=json` validated the task graph across all 16 workspaces. Topological build order verified (tokens → utils/sdk → motion → native → components → auth → layout → docs/playground). Framework inference (tsup/vite), package detection, and acyclic dependency graph all correct. 5. ✅ **Component a11y audit** (2026-10-07): Added `role="alert"` to all auth error messages, `aria-describedby` linking form inputs to errors, `aria-invalid` on OTP fields, fixed `Label htmlFor` mismatch in MfaSetupForm, added `aria-label` to recovery input, and `aria-busy` on MfaDialog during submission. Radix primitives provide baseline keyboard navigation. 6. ✅ **Storybook fully removed**: the repo no longer runs Storybook and has zero `@storybook/*` deps; the docs inventory drift gate (`node scripts/check-docs-inventory.mjs`) verifies barrel exports + manifest coverage instead. 7. ✅ **check-docs-inventory.mjs rewritten**: the three P0 breakages from `.agent/analysis-current-state.md` are fixed (see item 13 above). 8. ✅ **Slot gaps** (resolved): all 4 data-driven composites now expose render-prop slots — api-key-manager (`renderKey`), invite-team-form (`renderInvitee`), testimonial-showcase (`renderTestimonial`), two-factor-setup-panel (`renderQRCode`). check:components §P14 enforces slots on all composites as a hard gate; currently 23/23 pass. 9. **npm Trusted Publishing**: publish job is OIDC-ready (`id-token: write`) but still falls back to NPM_TOKEN until npm provenance is configured on the package.

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
pnpm test                 # Run all vitest tests (11 projects, 980 tests)
pnpm check:all            # Full CI gate pipeline (all gates + build + typecheck + test)
pnpm format               # Prettier format all files

# Drift gates (also run individually for faster iteration)
pnpm check:components     # Component flexibility/composability audit (P13/P14 gates)
pnpm check:docs           # Docs inventory: barrel exports + manifest coverage
pnpm check:icons          # Icon-map drift gate (1,763 icons)
pnpm check:sdk-coverage   # SovGrant route coverage audit (62/62 routes)
pnpm check:sdk-drift      # SDK table ↔ barrel drift gate (10 classes)
pnpm check:motion-drift   # Motion barrel/registry drift gate (15+27 effects)
pnpm check:boundaries     # Package boundary (§21) acyclicity check
pnpm audit:motion-parity  # Motion token parity check (local-only)
pnpm sandbox:e2e          # End-to-end sandbox validation

# Turbo variants (parallel)
pnpm build:turbo          # turbo run build
pnpm test:turbo           # turbo run test
pnpm typecheck:turbo      # turbo run typecheck
pnpm lint:turbo           # turbo run lint

# Code generation (run after changing source files)
node scripts/gen-site-data.mjs   # Regenerate site data (versions, presets, features)
node scripts/gen-changelog.mjs   # Regenerate changelog.ts from git log
node scripts/gen-changeset.mjs   # Regenerate .changeset/ entries from git log
node scripts/gen-docs-manifest.mjs # Regenerate packages/docs/src/manifest.ts
node scripts/gen-icon-map.mjs    # (Re)generate icon-map.ts from lucide
node gen-snapshot.js              # Regenerate ui_codebase_snapshot.txt (local/agent use)
```

## AGENTS.md

Always read `AGENTS.md` at the start of every session. It contains the
compressed AI-agent rules that override or supplement this handbook.
