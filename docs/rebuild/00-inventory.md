# Phase 0: Archaeology — Repository Inventory

**Repo:** `fusorb/facet` at `C:\Users\HP\Desktop\fusorb\facet`
**Spec:** Surface Rebuild v1.0
**Date:** 2026-10-08
**Archaeologist:** CommandCode session
**Baseline HEAD:** `a6596ee` (docs: resolve Tailwind config gap + mark as complete in CLAUDE.md)
**Spec written against:** commit `b1ca88d` (2026-10-07)

---

## 1. Executive Summary

The repository is a pnpm + Turborepo monorepo with **13 published packages** (`@fusorb/facet-*`) and **3 apps** (landing, playground, docs). The Surface Rebuild spec (v1.0) identifies 11 architectural findings (F1–F11) that make packages less composable than their READMEs claim, plus pervasive hand-typed facts that already disagree (F8) and hard-coded URLs/tokens that leak into apps (F10/F11).

This Phase 0 inventory verifies all 11 findings against the actual codebase at the working-tree state, classifies every package and app file group by disposition, records the dependency graph, catalogs all hand-typed facts, lists every hard-coded URL/token, and confirms the drift-gate baseline.

**Key surprise:** The working tree has uncommitted changes from a prior "component refactor sprint" (per `.agent/logs.txt`). Notably, `packages/components/src/ui/spinner.tsx` was **deleted** after the spec was written, reducing the component count from 113 to 112. CLAUDE.md was partially updated (line 29 says "112") but line 117 still says "113/113" and README.md still says "113". This is F8 drift in action — even within the working tree.

---

## 2. Repository Overview

### 2.1 Structure

```
root/
├── apps/
│   ├── landing/          # 43 files, 6,219 lines — config-driven marketing site
│   ├── playground/       # 6 files, 466 lines — one-page lab
│   └── docs/             # 9 files + data/ + components/ — thin consumer of @fusorb/facet-docs
├── packages/
│   ├── tokens/           # CSS custom properties + Tailwind theme
│   ├── utils/            # Utility functions (cn, isMac, etc.)
│   ├── motion/           # Declarative animation system
│   ├── native/           # Native driver (isolated package)
│   ├── components/       # 112 UI components + theme system
│   ├── auth/             # Auth domain components + ArcIdClient
│   ├── sdk/              # Pure-fetch SDK (62 routes, 10 classes)
│   ├── store/            # Zustand store
│   ├── emails/           # Email templates
│   ├── cli/              # CLI tool
│   ├── docs/             # Docs engine (facet-specific code baked in = F1-F4)
│   ├── layout/           # Layout shells (hard-depends on auth = F5)
│   └── sandbox/          # Live JSX editor (unused registry = F6)
├── scripts/              # 14 drift-gate + generator .mjs/.cjs scripts
├── docs/                 # NOT YET CREATED — spec says Phase 0 delivers here
├── .agent/               # LOCAL-ONLY (gitignored): output.txt, logs.txt, episodes.md, etc.
├── CLAUDE.md             # Build status + known gaps (MODIFIED in working tree)
├── AGENTS.md             # Session rules (loaded at start of every session)
├── package.json          # Root: build, lint, test, typecheck, check:all
├── turbo.json            # Turborepo pipeline
├── tsconfig.json         # Root TS config (references)
├── tsconfig.base.json    # Base config shared by all packages
├── pnpm-workspace.yaml   # pnpm workspace config
└── pnpm-lock.yaml
```

### 2.2 Tooling

| Concern | Tool |
|---|---|
| Package manager | pnpm (workspace) |
| Build orchestration | Turborepo (`turbo.json`) |
| Version management | Changesets |
| Test runner | Vitest 4.1.11 (workspace, 11 projects) |
| Linter | ESLint (flat config, `eslint.config.mjs`) |
| Type checking | TypeScript strict, project references |
| Icon registry | Custom `gen-icon-map.mjs` gate |
| CI/CD | GitHub Actions (`.github/workflows/ci-cd.yml`) |

### 2.3 Git State (Working Tree)

```
M  CLAUDE.md
M  packages/components/src/components.test.tsx
M  packages/components/src/index.ts
M  packages/components/src/ui/animated-button.tsx
M  packages/components/src/ui/invite-team-form.tsx
M  packages/components/src/ui/navbar.tsx
M  packages/components/src/ui/otp-verification-card.tsx
M  packages/components/src/ui/skeleton.tsx
M  packages/components/src/ui/two-factor-setup-panel.tsx
M  packages/docs/src/manifest.ts
D  packages/components/src/ui/spinner.tsx
```

These changes are from an in-progress "component refactor sprint" tracked in `.agent/logs.txt` (sessions 6–8). The spinner deletion reduces the component count by 1 (113 → 112). The docs manifest was regenerated to reflect this. Phase 0 proceeds from this state; the Surface Rebuild branch (`surface-rebuild`) should be cut from a clean commit on `main`.

---

## 3. Baseline Confirmation

### 3.1 Drift Gates (verified on this machine — Windows cmd.exe)

| Gate | Command | Result | Spec baseline | Match? |
|---|---|---|---|---|
| `check:boundaries` | `node scripts/check-boundaries.mjs` | 13 packages; acyclic; native is separate (deps: tokens + motion) | 13 packages, acyclic | YES |
| `check:docs` | `node scripts/check-docs-inventory.mjs` | 112 barrel-exported; 111 in docs manifest; typewriter-text documented elsewhere | (spec says 113) | NO* |
| `check:icons` | `node scripts/gen-icon-map.mjs --check` | 1,763 icons @ lucide v1.30.0 | 1,763 icons | YES |
| `check:components` | `node scripts/check-component-flexibility.mjs` | 112/112 (appearance + config); 22/22 composites expose slots | 113/113, 23/23 | NO* |
| `check:motion-drift` | `node packages/motion/scripts/check-motion-drift.mjs` | 80 symbols; 15 generative + 27 authored | 80 symbols, 15+27 | YES |
| `check:sdk-drift` | `node scripts/check-sdk-table-drift.mjs` | All 10 SDK classes documented | 10 SDK classes | YES |
| `check:sdk-coverage` | `node scripts/audit-sdk-coverage.cjs` | 62/62 SovGrant routes covered | 62/62 routes | YES |

\* The spec baseline (113 components) was written at commit `b1ca88d` before the spinner deletion in the working tree. The gates now report 112, which is the true current count. CLAUDE.md was partially updated (line 29 says "112") but other lines still say "113" (F8).

### 3.2 Triad (per CLAUDE.md + spec, NOT re-run on Windows)

| Check | Status | Source |
|---|---|---|
| `pnpm build` (all workspaces) | Passes | CLAUDE.md line 106; spec line 1.1 |
| `pnpm -r typecheck` | Passes (~30s, 14 projects) | CLAUDE.md line 107; spec line 1.1 |
| `pnpm lint` | Passes (0 errors, 118 warnings) | CLAUDE.md line 109; spec line 1.1 |
| `pnpm test` (vitest) | **982 tests passed, 78 files** | Spec line 1.1 |
| `pnpm check:all` | All gates green + lint + build + typecheck + test | CLAUDE.md line 106-109 |

> **Windows limitation:** `pnpm test` (vitest) cannot find test files on Windows (`No test files found, exiting with code 1`). The vitest-diag.log shows `RUN v4.1.11` but no test results. The root `test` script is `vitest run` with a workspace config using relative project paths. The test count (982/78) is taken from the spec author's Linux/macOS run. `pnpm build` uses `rm -rf dist` (Unix-only) and was not re-run.

### 3.3 `check:all` Script Definition

From root `package.json`:
```
pnpm check:components && pnpm check:docs && pnpm check:icons && pnpm check:sdk-coverage &&
pnpm check:sdk-drift && pnpm check:motion-drift && pnpm check:boundaries &&
pnpm audit:motion-parity && pnpm lint && pnpm build && pnpm typecheck && pnpm test
```
Note: `sandbox:e2e` is NOT in `check:all` but IS in the CI pipeline.

---

## 4. Dependency Graph

Verified from `packages/*/package.json` `dependencies` fields:

```
tokens       (deps: none)
utils        (deps: none)
motion       → tokens, utils
native       → tokens, motion
components   → tokens, utils, motion
sdk          (deps: none)
auth         → components, sdk
store        → sdk (peer)
emails       (deps: none)
sandbox      (deps: none — only peer: react)
layout       → components, auth          ← F5 violation (auth hard-dep)
docs         → auth, components, layout, sdk, tokens + lucide-react, prettier  ← F2 violation
cli          → components, emails, motion, native, sdk, store, utils
```

**Acyclic:** confirmed by `check:boundaries` ✓

**Boundary violations:**
- F5: `layout` depends on `@fusorb/facet-auth` (4 source files import `useOptionalAuth`)
- F2: `docs` depends on `@fusorb/facet-auth` and `@fusorb/facet-sdk` (SDK dep exists only for the gallery's `ArcIdClient` demo)

---

## 5. Package Catalog (13 Published + 1 New Private)

### 5.1 `tokens` — KEEP

- **Package:** `@fusorb/facet-tokens` v1.5.0
- **Deps:** none (@fusorb)
- **Structure:** `src/` (25 files: tokens.css, tailwind.config.ts, theme.css, palettes/alpha.css, palettes/ember.css, etc.)
- **Exports:** main barrel via `src/index.ts`; CSS files shipped to `dist/`
- **Disposition:** KEEP — expose machine-readable token manifest (CSS custom-property names + groups) for registry
- **Evidence:** No @fusorb dependencies. check:boundaries confirms isolated.

### 5.2 `utils` — KEEP

- **Package:** `@fusorb/facet-utils` v0.1.0
- **Deps:** none (@fusorb)
- **Structure:** `src/` (cn.ts, delay.ts, is-mac.ts, noop.ts, run-async.ts, use-id.ts, index.ts)
- **Exports:** `src/index.ts` barrel
- **Disposition:** KEEP — no changes needed

### 5.3 `motion` — EXTEND

- **Package:** `@fusorb/facet-motion` v1.2.1
- **Deps:** `@fusorb/facet-tokens`, `@fusorb/facet-utils`
- **Structure:** `src/` (core: drivers/, effects/, timeline/, scheduler/, enums/, types/; registry: index.ts; react: Motion.tsx, Presence.tsx, etc.; scripts/: check-motion-drift.mjs)
- **Exports:** `src/index.ts` barrel; has `tailwind.config.ts` integration
- **Disposition:** EXTEND — export registry introspection (`listEffects()`, families, domain profiles) as plain data so the lab can render effect pickers without reaching into internals
- **Evidence:** check:motion-drift confirms 80 symbols, 15 generative + 27 authored. Registry is in `src/registry.ts`.

### 5.4 `native` — KEEP

- **Package:** `@fusorb/facet-native` v1.2.1
- **Deps:** `@fusorb/facet-tokens`, `@fusorb/facet-motion` (added for auto-registration; per logs.txt EP 53, boundary conflict resolved)
- **Structure:** `src/` (driver/ — native driver registration via `registerDriver`)
- **Exports:** `src/index.ts` barrel
- **Disposition:** KEEP — stays isolated, exists as its own package
- **Evidence:** check:boundaries confirms isolation with relaxed `native→motion` rule.

### 5.5 `components` — EXTEND

- **Package:** `@fusorb/facet-components` v3.1.0
- **Deps:** `@fusorb/facet-tokens`, `@fusorb/facet-utils`, `@fusorb/facet-motion`, plus Radix + tailwind-merge + lucide-react
- **Structure:** `src/index.ts` (barrel, ~400 lines), `src/components.test.tsx`, `src/ui/` (112 `.tsx` components + 25 `.test.tsx` files + 2 `.ts` data files)
- **Exports:** `src/index.ts` barrel exports all 112 components + foundations
- **Disposition:** EXTEND — (a) Component metadata via JSDoc `@category`/`@summary` on source (replaces CATEGORY map in `gen-docs-manifest.mjs`); (b) Colocated `*.examples.tsx` files, exported via separate `./examples` subpath
- **Evidence:** Only 14 of 112 components have ANY JSDoc tags (grep for `@category|@summary|@example`), and none use `@category`/`@summary` — these 14 have `@example` tags only (Radix wrapper components). The primary category metadata lives in `scripts/gen-docs-manifest.mjs` CATEGORY map (F9). Component count: 112 barrel exports (down from 113 — spinner.tsx deleted in working tree).

### 5.6 `auth` — KEEP

- **Package:** `@fusorb/facet-auth` v1.3.7
- **Deps:** `@fusorb/facet-sdk`, `@fusorb/facet-components`, `@fusorb/facet-layout`, `zod`, `react-hook-form`, `qrcode`, `otplib`
- **Structure:** `src/` (8 files: auth-context.tsx, auth-flow.tsx, auth-provider.tsx, sign-in-card.tsx, sign-up-card.tsx, etc., `use-optional-auth.tsx`, `index.ts`)
- **Exports:** `src/index.ts`
- **Disposition:** KEEP — exports `useOptionalAuth` hook (used by layout, F5)
- **Evidence:** 7 standalone forms per README. `use-optional-auth.tsx` exports the hook with optional context.

### 5.7 `sdk` — KEEP

- **Package:** `@fusorb/facet-sdk` v1.2.1
- **Deps:** none (@fusorb)
- **Structure:** `src/` (10 files: 10 SDK class files + index.ts, generated routes index)
- **Exports:** `src/index.ts` barrel
- **Disposition:** KEEP
- **Evidence:** check:sdk-drift confirms 10 classes. check:sdk-coverage confirms 62/62 routes.

### 5.8 `store` — KEEP

- **Package:** `@fusorb/facet-store` v1.0.1
- **Deps:** `@fusorb/facet-sdk` (peer)
- **Structure:** `src/` (store files + index.ts)
- **Exports:** `src/index.ts`
- **Disposition:** KEEP

### 5.9 `emails` — KEEP

- **Package:** `@fusorb/facet-emails` v1.1.3
- **Deps:** `@fusorb/facet-components`
- **Structure:** `src/` (email template components + index.ts)
- **Exports:** `src/index.ts`
- **Disposition:** KEEP

### 5.10 `cli` — EXTEND

- **Package:** `@fusorb/facet-cli` v1.1.3
- **Deps:** `@fusorb/facet-components`, `@fusorb/facet-emails`, `@fusorb/facet-motion`, `@fusorb/facet-native`, `@fusorb/facet-sdk`, `@fusorb/facet-store`, `@fusorb/facet-utils`, plus `chalk`, `execa`, `fs-extra`, `p-retry`, `vite`
- **Structure:** `src/` (commands: docs.ts, icons.ts, pkg.ts, up.ts, copy.ts, doctor.ts, init.ts, etc.)
- **Exports:** CLI entry (no named exports — side-effect `program.parse(process.argv)`)
- **Disposition:** EXTEND — New commands: `facet docs build` (content compiler), `facet registry build` (scanner for consumer's packages). Updated `docs init` scaffold. Remove facet-specific assumptions from templates.

### 5.11 `docs` — SPLIT + REWORK

- **Package:** `@fusorb/facet-docs` v1.5.7
- **Deps:** `auth`, `components`, `layout`, `sdk`, `tokens` + `lucide-react`, `prettier` ← **F2 violation**
- **Structure (62 files total):**
  - Root (7 files): `context.tsx`, `docs-app.test.tsx`, `docs-app.tsx`, `index.ts`, `manifest.test.ts`, `manifest.ts`, `test-types.d.ts`
  - `components/` (21 files): [see §5.11 file classification below]
  - `lib/` (11 files): [see §5.11 file classification below]
  - `pages/` (5 files): [see §5.11 file classification below]
- **Exports:** `src/index.ts` barrel
- **Disposition:**
  - **SPLIT** — facet-specific gallery code (F1) leaves the package; becomes registry-driven app code
  - **REWORK** — router seam (F3), DocsDataSource seam (F1), sections config (F4), `DocsPage.load` field, DocsApp router-injectable
- **Evidence (F1-F4):**
  - `lib/manifest.ts` — 6 lines of `extendedEntries`: hand-written facet entries for auth (Sign In) + layout (Console Layout, Auth Layout, Landing Layout, Sidebar, Topbar). Comment on line 4: "covers the ~90 UI components" (F8 — says 90, actual is 112)
  - `lib/variants.tsx` — 4,285 lines: facet-specific variant usage snippets
  - `lib/usage.ts` — 3,162 lines: facet-specific usage code blocks
  - `components/previews.tsx` — 1,813 lines: facet-specific preview configurations
  - `components/playground-registry.tsx` — 312 lines: facet-specific, creates `DEMO_CLIENT = new ArcIdClient({ baseUrl: "https://demo.invalid" })` — this is why docs depends on sdk (F2)
  - `components/AuthDemo.tsx`, `components/AuthPreviews.tsx`, `components/LayoutPreviews.tsx`, `components/ReadyToUseDemos.tsx` — facet-specific demo content
  - `components/Playground.tsx`, `components/PlaygroundPage.tsx` — facet-specific playground pages
  - `components/InteractiveDemo.tsx` — facet-specific (uses playground-registry/usage/variants)
  - `components/LiveCodePlayground.tsx` — 811 lines: engine component but duplicates sandbox parser (F7)
  - `docs-app.tsx` — renders `<BrowserRouter>` directly (line 114: `import { BrowserRouter, Routes, Route } from "react-router-dom"`) (F3)
  - `docs-app.test.tsx` — integration test with SovGrant fixtures and facet-specific URLs (github.com/fusorb/facet) (F1)
  - `lib/nav.tsx` — ORDER array hard-codes section ids: "guides", "auth", "components", "ready-to-use", "pages", "animation", "foundations", "ecosystem" (F4)
  - `pages/ComponentPage.tsx`, `ComponentsPage.tsx`, `PagesPage.tsx`, `ReadyToUsePage.tsx` — facet-specific gallery pages
  - `pages/DocsContentPage.tsx` — sectionLabels hard-codes: "getting-started", "auth", "components", "ready-to-use" (F4)

**File group classification:**

| Group | Files | Disposition | Evidentia |
|---|---|---|---|
| Engine (stays, needs seams) | `context.tsx`, `lib/pages.ts`, `lib/docs-router.tsx`, `lib/ids.ts`, `lib/keyboard-nav.ts`, `docs-app.tsx`, `components/DocsLayout.tsx`, `components/DocsTable.tsx`, `components/Guide.tsx`, `components/InstallTabs.tsx`, `components/ThemePreviewFrame.tsx`, `components/PageActionBar.tsx`, `components/KeyboardShortcuts.tsx`, `components/CodeBlock.tsx`, `components/DocsTableOfContents.tsx`, `manifest.ts` (auto-generated docsManifest) | REWORK (add router/data-source/sections config seams) | F3, F4 |
| Engine (stay, needs seam + dep on sandbox/live) | `components/LiveCodePlayground.tsx` | REWORK (delegate to `@fusorb/facet-sandbox/live`) | F7 |
| Facet-specific (leaves package) | `lib/variants.tsx`, `lib/usage.ts`, `components/previews.tsx`, `components/playground-registry.tsx`, `components/AuthDemo.tsx`, `components/AuthPreviews.tsx`, `components/LayoutPreviews.tsx`, `components/ReadyToUseDemos.tsx`, `components/Playground.tsx`, `components/PlaygroundPage.tsx`, `components/InteractiveDemo.tsx`, `components/ComponentDemoCard.tsx`, `lib/manifest.ts` (extendedEntries/extendedManifest), `lib/nav.tsx` (ORDER, buildComponentsSection), `pages/ComponentPage.tsx`, `pages/ComponentsPage.tsx`, `pages/PagesPage.tsx`, `pages/ReadyToUsePage.tsx` | RETIRE from package (move to apps/docs as registry-driven code) | F1, F4 |
| Tests (facet-specific) | `docs-app.test.tsx`, `manifest.test.ts`, `lib/nav.test.ts`, `lib/pages.test.ts`, `components/LiveCodePlayground.test.tsx` | RETIRE (facet-specific tests leave package) | F1 |
| Barrel | `index.ts` | REWORK (remove facet-specific exports) | F1 |

**Allowed deps after split:** `components`, `layout`, `tokens`, `sandbox`; peers `react`, `react-dom`, optional `react-router-dom`. **No `auth`, no `sdk`, no `lucide-react`.**

### 5.12 `layout` — REWORK + EXTEND

- **Package:** `@fusorb/facet-layout` v1.5.7
- **Deps:** `@fusorb/facet-components`, `@fusorb/facet-auth` ← **F5 violation**
- **Structure:** `src/` (layout shells, context, presets, types, skeletons)
- **Exports:** `src/index.ts` barrel
- **Disposition:**
  - **REWORK** — Remove auth dependency: replace `useOptionalAuth` with injectable `session` seam on `LayoutProvider`. `@fusorb/facet-auth` becomes optional peer.
  - **EXTEND** — Add `LayoutSkeleton` as `./skeleton` subpath; add `data-region` attributes to real shells.
- **Evidence (F5):** Four source files import `useOptionalAuth` from `@fusorb/facet-auth`:
  - `console-layout.tsx`
  - `chat-layout.tsx`
  - `user-menu.tsx`
  - `sidebar-auth.tsx` (comment: "Uses useOptionalAuth() from @fusorb/facet-auth — when no auth context is present (static/docs-only sites) the component renders nothing")

### 5.13 `sandbox` — RETOOL → v3

- **Package:** `@fusorb/facet-sandbox` v2.0.0
- **Deps:** none (@fusorb runtime); peer: `react` (optional)
- **Structure:** `src/` (core: types, interpreter; react: index.tsx)
- **Exports:** `src/index.ts` (main barrel), `src/react/index.tsx` (React adapter re-export)
- **Disposition:** **RETOOL → v3** — Becomes the "lab kit":
  - `/core` (zero deps): Artifact, Example, ControlSchema, kind registry, code-gen utilities, URL-state encode/decode
  - `/react` (react peer only): Stage, ArtifactRenderer, Inspector, Catalog, CodeView
  - `/live` (JSX runtime + sanitizer): no-`eval` JSX interpreter, `isSafeUrl`/`sanitizeUrlProps`, error boundary
- **Evidence (F6):**
  - `registerSandboxBlock`, `getSandboxBlock`, `listSandboxBlocks` — zero external callers (grep confirmed only used within sandbox package itself)
  - `registerAdapter`, `getAdapter`, `listAdapters` — zero external callers
  - `reactAdapter`, `Sandbox`, `SandboxProvider`, `useSandbox` — exported as part of the main barrel
- **Evidence (F7):** The parser in `react/index.tsx` (811+ lines of `skipBrace`/`skipString`/`splitTopLevel`/`isSafeUrl`/`sanitizeUrlProps` + `parseElement`/`parseChildren`/`parseLiteral`/`toReactNode`/`renderFromCode`) is a "faithful port of the docs live playground" per the file's own comment (line 3-7). `packages/docs` does NOT depend on `@fusorb/facet-sandbox`, and its `LiveCodePlayground.tsx` (811 lines) re-implements the same parser independently. Two copies of a security-sensitive sanitizer.

### 5.14 `registry` (NEW, private)

- **Package:** `registry` (workspace-only, `private: true`, not published)
- **Deps:** none (uses TS compiler API at build time)
- **Purpose:** Scanner + generated JSON + typed accessors for the facet ecosystem
- **Outputs:** `registry.json` + typed accessor modules
- **Consumers:** `apps/*`, tooling, content compiler
- **Constraint:** Published packages MUST NOT import it

---

## 6. App Catalog (3 — All REBUILD)

### 6.1 `apps/landing` — REBUILD

- **Package name:** `@fusorb/facet-landing` (vitest workspace project)
- **Size:** 43 files, 6,219 lines (spec)
- **Structure:**
  - Root (8): `app.css`, `app.tsx`, `domain-config.ts`, `domain-context.tsx`, `main.tsx`, `pages.tsx`, `site.config.ts`, `vite-env.d.ts`
  - `components/` (8 files): Brand, CommandPalette, Footer, MotionFamilyCard, MotionPreview, Nav, PageShell, command-palette-context.tsx
  - `components/sections/` (11 files): ArchitectureSection, AuthShowcaseSection, CTASection, DemoShowcaseSection, FaqSection, FeaturesSection, HeroSection, InstallSection, MotionPreviewSection, PricingTeaserSection, TokensExplorerSection
  - `data/` (6 files): dashboard-demo.ts, ecosystem.ts (406 lines), faq.ts, features.ts, scratchpad.ts (630 lines), site-data.generated.ts
  - `lib/` (3 files): domain-config.ts, domain-context.tsx, landing-search-config.ts
  - `pages/` (8 files): AboutPage, DashboardDemoPage, EcosystemDetailPage, EcosystemPage, FeedbackPage, HomePage, PricingPage, SecurityPage
  - `styles/` (1 file): motion-previews.css
- **Disposition:** REBUILD — replace contents, keep package name
- **Hand-typed facts (F8):**
  - `scratchpad.ts:47` — "113 primitives" (stale; actual is 112)
  - `site-data.generated.ts` — `componentCount: 113` (stale; generated from gen-site-data.mjs which counts barrel exports)
  - README line 305 (per logs.txt) — "pricing prose says '12 packages'" (stale; actual is 13)
  - `scratchpad.ts:301` (per logs.txt) — "114+ → 116" count change history
- **Hard-coded URLs/tokens (F10, L6):**
  - `site.config.ts` — `http://localhost:5173`, `https://facet.so/docs`, `http://localhost:5175`, `https://facet.so/playground`, `https://github.com/fusorb/facet`
  - `landing-search-config.ts` — `https://www.npmjs.com/package/${p.name}`
  - `public/favicon.svg` — hard-coded colors `#4ad3f5`, `#2db8e0`, `#0a1a2f`
  - `index.html` — Google Fonts `<link>` URL
  - `app.css` — potentially raw color literals (needs check)
  - `data/dashboard-demo.ts` — `https://api.example.com/hooks/arcid` (example URL)
  - `data/ecosystem.ts` — `https://auth.example.com/api/v1`, `https://acme.dev/dashboard` (example URLs)

### 6.2 `apps/playground` — REBUILD

- **Size:** 466 lines (spec)
- **Structure:**
  - `App.tsx`, `app.css`, `main.tsx`
  - `blocks/` (3 files): AuthFlow.tsx, MotionDemo.tsx, StackAgnosticism.tsx
- **Disposition:** REBUILD
- **Hand-typed facts:** "3 tabs" (hard-coded in JSX)
- **Hard-coded URLs/tokens (F10, F11, L6):**
  - `App.tsx:?` — `http://localhost:5173/changelog` (F10)
  - `App.tsx:?` — `https://facet.so/docs/changelog` (F10)
  - `app.css:2` — `@import url("https://fonts.googleapis.com/...")` (F10, L6)
  - `favicon.svg` — hard-coded colors `#4ad3f5`, `#2db8e0`, `#0a1a2f`
  - Device select (F11) — toggles a CSS class only (`preview-device-${device}`); no stage, artifact model, or control schema

### 6.3 `apps/docs` — REBUILD

- **Package name:** `@fusorb/facet-docs-site` (private, per CLAUDE.md)
- **Size:** `pages.ts` 1,845 lines + `changelog.ts` 2,376 lines + 48 lines of shell
- **Structure:**
  - Root (6): `app.css`, `app.tsx`, `demo-config.tsx`, `main.tsx`, `pages.ts`, `vite-env.d.ts`
  - `components/` (2 files): `app.tsx`, `demo-config.tsx`
  - `data/` (1 file): `changelog.ts` (2,376 lines)
- **Disposition:** REBUILD — thin consumer of the cleaned-up `@fusorb/facet-docs` engine
- **Hand-typed facts (F8):**
  - `pages.ts:29` — "113 styled UI components" (stale; actual is 112)
  - `pages.ts:48` — "961 tests across 75 files" (stale; CLAUDE.md says 980/78, spec says 982/78)
  - `pages.ts:1588` — "62 routes across auth, identity, oauth, tenants, credentials, billing, audit, webhooks, idp"
  - `pages.ts:1741` — "62/62 covered"
  - `changelog.ts` — multiple historical counts that disagree: "90 components", "114 components", "117→118 count", "926/926", "745/745", "749/749 across 56 files", "72 barrel symbols, 15 generative + 18 authored", "106 facet-motion tests", "130 motion tests, 24 domain preset tests", "926/926 across 10 projects", "110 components", "78KB episodes.md + 44KB episodes-plain.md"
- **Hard-coded URLs/tokens (F10, L6):**
  - `app.tsx` — `https://github.com/fusorb/facet/discussions`, `https://github.com/fusorb/facet`
  - `pages.ts` — `https://github.com/fusorb/facet` (docs link), `https://acme.dev/dashboard`, `http://127.0.0.1:3888` (emails preview), `https://auth.example.com/api/v1`, `https://app.example.com/callback` (example URLs in code samples)
  - `app.css:2` — `@import url("https://fonts.googleapis.com/...")` (F10, L6)
  - `app.css:8` — `@import "../../../packages/tokens/src/tokens.css"` (relative source path, not package import)
  - `pages.ts:1536-1540` — hard-coded color values `#6366f1`, `#f6f6f6`, `#ffffff`, `#1f2937`, `#6b7280` (theme config object, L6 violation)

---

## 7. Findings Verification (F1–F11) — All Confirmed

| # | Finding | Status | Evidence |
|---|---|---|---|
| F1 | Docs engine contains facet-specific gallery | **CONFIRMED** | `lib/variants.tsx` (4,285 lines), `lib/usage.ts` (3,162), `components/previews.tsx` (1,813), `components/playground-registry.tsx` (312), `lib/manifest.ts` (`extendedEntries`: 6 hand-written auth/layout entries), `components/AuthDemo.tsx`, `components/AuthPreviews.tsx`, `components/LayoutPreviews.tsx`, `components/ReadyToUseDemos.tsx`, `components/Playground.tsx`, `components/PlaygroundPage.tsx`, `components/InteractiveDemo.tsx`, `pages/ComponentPage.tsx`, `pages/ComponentsPage.tsx`, `pages/PagesPage.tsx`, `pages/ReadyToUsePage.tsx`, `docs-app.test.tsx` (SovGrant fixtures + facet URLs). Docs barrel (`index.ts`) exports `extendedManifest`, `extendedEntries`, `LiveCodePlayground`, `PlaygroundPage`. |
| F2 | Engine hard-depends on ecosystem | **CONFIRMED** | `packages/docs/package.json` deps: `@fusorb/facet-auth`, `@fusorb/facet-components`, `@fusorb/facet-layout`, `@fusorb/facet-sdk`, `@fusorb/facet-tokens`, `lucide-react`, `prettier`. SDK dep exists because `playground-registry.tsx` builds `DEMO_CLIENT = new ArcIdClient({ baseUrl: "https://demo.invalid" })`. |
| F3 | Router hard-wired | **CONFIRMED** | `docs-app.tsx:114`: `import { BrowserRouter, Routes, Route } from "react-router-dom"` — `DocsApp` renders `BrowserRouter` directly. `tsup.config.ts` has `"use client"` banner workaround. |
| F4 | Facet vocabulary hard-coded | **CONFIRMED** | `lib/nav.tsx` — `ORDER = ["guides", "auth", "components", "ready-to-use", "pages", "animation", "foundations", "ecosystem"]`; `SECTION_TITLES` map. `DocsContentPage.tsx` — `sectionLabels = ["getting-started", "auth", "components", "ready-to-use"]`. `scripts/gen-docs-manifest.mjs` — `CATEGORY` map. Comment in `manifest.ts` line 4: "covers the ~90 UI components" (F8). |
| F5 | Layout hard-depends on auth | **CONFIRMED** | `packages/layout/package.json` deps include `@fusorb/facet-auth`. Four files import `useOptionalAuth`: `console-layout.tsx`, `chat-layout.tsx`, `user-menu.tsx`, `sidebar-auth.tsx`. |
| F6 | Sandbox has unused registry | **CONFIRMED** | `src/index.ts` exports `registerSandboxBlock`/`getSandboxBlock`/`listSandboxBlocks`/`registerAdapter`/`getAdapter`/`listAdapters`. grep across all apps/packages: zero callers outside `packages/sandbox/src/` (`index.ts` and `react/index.tsx`). Only consumer is one tab in `apps/playground`. |
| F7 | Same parser exists twice | **CONFIRMED** | `packages/docs/src/components/LiveCodePlayground.tsx` (811 lines): re-implements `skipBrace`/`skipString`/`splitTopLevel`/`isSafeUrl`/`sanitizeUrlProps`. `packages/sandbox/src/react/index.tsx`: same parsers (`parseElement`/`parseChildren`/`parseLiteral`/`toReactNode`/`renderFromCode`). File comment says "faithful port of the docs live playground." `packages/docs` does NOT depend on `@fusorb/facet-sandbox`. |
| F8 | Facts hand-typed and disagree | **CONFIRMED** | See §8. |
| F9 | Editorial metadata in generator scripts | **CONFIRMED** | `scripts/gen-site-data.mjs` holds `PACKAGE_ORDER` and `PACKAGE_ICONS`. `scripts/gen-docs-manifest.mjs` holds `CATEGORY` map and `EXCLUDED` array. |
| F10 | URLs and tokens leak into apps | **CONFIRMED** | See §9. |
| F11 | Playground Device control is cosmetic | **CONFIRMED** | `apps/playground/src/App.tsx` — the "Device" select only swaps a CSS class (`preview-device-${device}`); no stage, artifact model, or control schema. |

---

## 8. Hand-typed Facts Catalog (F8)

| Fact | Source | Value | Actual / Gate | Discrepancy |
|---|---|---|---|---|
| UI components | README.md:17, 41 | "113 styled UI components" | 112 | **-1** (spinner.tsx deleted in working tree; README not updated) |
| UI components | CLAUDE.md:29 | "112 styled Radix components" | 112 | ✓ (updated) |
| UI components | CLAUDE.md:117 | "113/113 + 113/113" | 112 | **-1** (internal contradiction within same file) |
| UI components | apps/docs/pages.ts:29 | "113 styled UI components" | 112 | **-1** |
| UI components | docs/lib/manifest.ts:4 comment | "~90 UI components" | 112 | off by ~22 |
| Tests | CLAUDE.md:108, 129, 165 | "980 tests" | 982 (spec) | **-2** |
| Tests | apps/docs/pages.ts:48 | "961 tests across 75 files" | 982/78 | **-21 tests, -3 files** |
| Tests | .agent/logs.txt:133, 309, 335 | "961 tests / 75 files" | 982/78 | **-21 tests, -3 files** |
| Tests | .agent/logs.txt:239 | "960 across 10 projects" | 982/11 | **-22 tests, -1 project** |
| Test files | CLAUDE.md:108 | "78 files" | 78 | ✓ (but test count off) |
| Test files | apps/docs/pages.ts:48 | "75 files" | 78 | **-3** |
| Icons | CLAUDE.md:136 | "1,763 icons" | 1,763 (check:icons ✓) | ✓ |
| SDK routes | CLAUDE.md:137 | "62/62 routes" | 62/62 (check:sdk-coverage ✓) | ✓ |
| SDK routes | apps/docs/pages.ts:1588 | "62 routes" | 62 | ✓ |
| SDK classes | README.md:14 | "10 domain SDKs" | 10 (check:sdk-drift ✓) | ✓ (but "domain SDKs" ≠ "classes") |
| SDK classes | CLAUDE.md | (not listed) | 10 | ✓ (gate only) |
| Motion effects | README.md:15 | "15 generative families + 27 authored effects" | 15+27 (check:motion-drift ✓) | ✓ |
| Motion effects | apps/docs/changelog.ts | "15 generative + 18 authored" | 15+27 | **-9 authored** (historical) |
| Packages | README.md:27 | "13 packages" | 13 (check:boundaries ✓) | ✓ |
| Projects with tests | README.md:69 | "11 projects" | 11 | ✓ |
| Composites (slot-exposing) | CLAUDE.md:117 | "22 components" | 22 (check:components ✓) | ✓ |
| Composites | CLAUDE.md:117 | "113/113 + 113/113" (check:components gate claim) | 112 | **-1** |
| Packages (pricing) | apps/landing (per logs.txt:305) | "12 packages" | 13 | **-1** |
| Barrel symbols | apps/docs/changelog.ts | "72 barrel symbols" | (unverified) | historical |

**Key insight:** The test count has evolved over time: 960 → 961 → 968 → 980 → 981 → 982 (per logs.txt history). Different sources capture different snapshots. No single source is reliably current.

**Note on README vs CLAUDE.md:** The spec (v1.0) states "README.md says: '980 tests across 78 files'" and "'1,763 icons'" and "'62/62 routes'". However, the actual README.md at this commit does NOT mention test counts, icon counts, or SDK route coverage. Those facts appear only in CLAUDE.md. The README mentions: "113 styled UI components" (L17, L41), "15 generative families + 27 authored effects" (L15), "10 domain SDKs" (L14), "13 packages" (L27, L70), "11 projects" (L69). This is another layer of F8 — even the spec's citation of where facts live is slightly inaccurate.

---

## 9. Hard-coded URLs & Tokens (F10, F11, L6)

### 9.1 Origins / Routes (should come from `surfaces.config`)

| File | Hard-coded URL |
|---|---|
| `apps/landing/src/site.config.ts` | `http://localhost:5173` (dev origin) |
| `apps/landing/src/site.config.ts` | `https://facet.so/docs` (prod docs origin) |
| `apps/landing/src/site.config.ts` | `http://localhost:5175` (dev playground origin) |
| `apps/landing/src/site.config.ts` | `https://facet.so/playground` (prod playground origin) |
| `apps/landing/src/site.config.ts` | `https://github.com/fusorb/facet` (GitHub origin) |
| `apps/landing/src/lib/landing-search-config.ts` | `https://www.npmjs.com/package/${p.name}` |
| `apps/landing/src/pages/EcosystemDetailPage.tsx` | `https://www.npmjs.com/package/${entry.name}` |
| `apps/playground/src/App.tsx` | `http://localhost:5173/changelog` |
| `apps/playground/src/App.tsx` | `https://facet.so/docs/changelog` |
| `apps/docs/src/app.tsx` | `https://github.com/fusorb/facet/discussions` |
| `apps/docs/src/app.tsx` | `https://github.com/fusorb/facet` |
| `apps/docs/src/pages.ts` | `https://github.com/fusorb/facet` (in page content) |
| `packages/docs/src/components/playground-registry.tsx` | `https://demo.invalid` (ArcIdClient base URL — causes F2) |
| `apps/landing/src/data/dashboard-demo.ts` | `https://api.example.com/hooks/arcid` (example) |
| `apps/landing/src/data/ecosystem.ts` | `https://auth.example.com/api/v1` (example) |
| `apps/landing/src/data/ecosystem.ts` | `https://acme.dev/dashboard` (example) |
| `apps/docs/src/pages.ts` | `https://acme.dev/dashboard` (example) |
| `apps/docs/src/pages.ts` | `http://127.0.0.1:3888` (emails preview) |
| `apps/docs/src/pages.ts` | `https://auth.example.com/api/v1` (example) |
| `apps/docs/src/pages.ts` | `https://app.example.com/callback` (example) |

### 9.2 Google Fonts (L6 — visual literal should come from tokens)

| App | File | Violation |
|---|---|---|
| docs | `src/app.css:2` | `@import url("https://fonts.googleapis.com/css2?...")"` |
| playground | `src/app.css:2` | `@import url("https://fonts.googleapis.com/css2?...?")` |
| landing | `index.html:8` | `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">` |
| landing | `index.html:6` | `<link rel="preconnect" href="https://fonts.googleapis.com">` |

### 9.3 Favicon / SVG hard-coded colors (L6)

| App | File | Colors |
|---|---|---|
| landing | `public/favicon.svg` | `#4ad3f5`, `#2db8e0`, `#0a1a2f` |
| playground | `favicon.svg` | `#4ad3f5`, `#2db8e0`, `#0a1a2f` |

### 9.4 Hard-coded color values in content/config (L6)

| File | Line | Values |
|---|---|---|
| `apps/docs/src/pages.ts` | 1536-1540 | `primary: "#6366f1"`, `background: "#f6f6f6"`, `surface: "#ffffff"`, `text: "#1f2937"`, `muted: "#6b7280"` |
| `apps/landing/src/data/ecosystem.ts` | 381 (example string) | `'--primary': '#ff6b6b'` (in prose example) |

### 9.5 Docs package source-path import (L2-ish violation)

| File | Line | Issue |
|---|---|---|
| `apps/docs/src/app.css:8` | 8 | `@import "../../../packages/tokens/src/tokens.css"` — relative source path instead of `@fusorb/facet-tokens` package import |

### 9.6 F11 — Playground Device control

The "Device" select in `apps/playground/src/App.tsx` only toggles a CSS class (`preview-device-${device}`). No stage, no artifact model, no control schema. There is no viewport model or responsive preview system.

---

## 10. Scripts & Gates

### 10.1 Root package.json scripts (key)

| Script | Command |
|---|---|
| `build` | `pnpm -r build` |
| `lint` | `eslint . --ext .ts,.tsx --ignore-pattern dist --ignore-pattern .next` |
| `test` | `vitest run` |
| `typecheck` | `pnpm -r typecheck` |
| `check:components` | `node scripts/check-component-flexibility.mjs` |
| `check:docs` | `node scripts/check-docs-inventory.mjs` |
| `check:icons` | `node scripts/gen-icon-map.mjs --check` |
| `check:sdk-coverage` | `node scripts/audit-sdk-coverage.cjs` |
| `check:sdk-drift` | `node scripts/check-sdk-table-drift.mjs` |
| `check:motion-drift` | `node packages/motion/scripts/check-motion-drift.mjs` |
| `check:boundaries` | `node scripts/check-boundaries.mjs` |
| `audit:motion-parity` | `node scripts/audit-motion-parity.mjs` |
| `check:all` | chains all gates + lint + build + typecheck + test |
| `sandbox:e2e` | (custom e2e for sandbox) |

### 10.2 Scripts directory (`scripts/`, 14 files)

| Script | Purpose |
|---|---|
| `audit-motion-parity.mjs` | Motion token parity check |
| `audit-sdk-coverage.cjs` | SovGrant route coverage audit |
| `check-boundaries.mjs` | Acyclic @fusorb dependency graph |
| `check-component-flexibility.mjs` | Appearance + config + slots axes |
| `check-docs-inventory.mjs` | Component manifest inventory |
| `check-sdk-table-drift.mjs` | SDK docs table drift |
| `gen-changelog.mjs` | Generate changelog from git log |
| `gen-changeset.mjs` | Generate changesets |
| `gen-docs-manifest.mjs` | Generate docs manifest (CATEGORY map — F9) |
| `gen-icon-map.mjs` | Generate icon registry |
| `gen-site-data.mjs` | Generate landing site data (PACKAGE_ORDER, PACKAGE_ICONS — F9) |
| `react-test-utils-shim.ts` | Test shim |
| `sandbox-e2e.mjs` | Sandbox end-to-end tests |
| `test-setup.ts` | Vitest setup |

### 10.3 New gates needed (from spec §9)

The spec defines additional gates that MUST be added as `.mjs` scripts following the existing pattern:
- `check:registry` — registry.json staleness, package metadata fields, ID collisions
- `check:examples` — example/registry referential integrity
- `check:engine-purity` — docs/sandbox facet-specific literals
- `check:boundaries` (extended) — layout→auth, docs→auth/sdk, sandbox @fusorb deps, published→registry imports, app src/ imports, cycles
- `check:content` — docs build errors (unknown refs, unresolved facts, broken links)
- `check:claims` — hand-typed numbers in prose
- `check:surfaces` — hard-coded URLs/routes
- `check:app-tokens` — raw colors/fonts/z-index in apps
- `check:landing-sections` — purpose/proof metadata
- `check:layout-skeleton-parity` — skeleton vs real layout regions
- `check:readme` (Phase 10) — README/CLAUDE.md fact regions

---

## 11. Historical Context (from `.agent/logs.txt`)

The local session log (`logs.txt`, 512 lines) records ~10 sessions of prior work. Key episodes relevant to Phase 0:

- **EP 48 / EP 49 / EP 50** (2026-09-25): Changelog migration — component count 117→118; CLAUDE.md/README updated; `check:all` added.
- **EP 52** (2026-10-05): Overlay exit animations — Radix Presence unmounts before exit animation plays. Fixed with CSS-only exit classes. Count: 116/116 components.
- **EP 53 / EP 54** (2026-10-05): Token palettes — alpha + ember palettes added. Landing audit found: scratchpad.ts hardcodes Tailwind classes + raw oklch literals (stale TOKEN_CATEGORIES); `PACKAGE_LAYER` omits `utils`; pricing says "12 packages". Counts: 114→116.
- **EP 55 / EP 57** (2026-10-06): Landing token pass — raw colors/fonts → tokens.
- **EP 56** (2026-10-06): Layout package hardening — 42→54 tests (layout+docs=98, full suite 980). Changeset written.
- **EP 58 / EP 61** (2026-10-06–07): Component removals — glow-border-card, hover-card, drawer deleted. Counts 116→113. OTP spacing fix. Session 8 in-flight.
- **Count evolution:** 116 (CLAUDE.md line 108) → 113 (README, pages.ts) → 112 (working tree, spinner deleted, check:components). Test count: 960 → 961 → 968 → 980 → 982.
- **§21 boundary conflict:** native→motion dependency added for auto-registration; `check-boundaries.mjs` relaxed accordingly.
- **Component count drift history (EP 58):** README/table count updated to 116; then 116→113 after component removals; now 113→112 after spinner deletion in working tree.

---

## 12. UNKNOWN Items

The following could not be verified on this Windows environment:

1. **Test suite** — vitest cannot find test files on Windows (glob resolution issue). The `vitest-diag.log` shows `RUN v4.1.11` but no results. Test count (982/78) is taken from the spec author's run.
2. **Build** — `pnpm -r build` uses `rm -rf dist` (Unix-only) in tsup configs. Not run on Windows.
3. **Typecheck** — not re-run (spec says ~30s across 14 projects, passes).
4. **Lint** — `pnpm lint` was green (0 errors) per CLAUDE.md; not re-run due to pnpm install churn noted in logs.txt.
5. **Full README fact audit** — The spec claims README says "1,763 icons" and "62/62 routes", but the actual README does not contain these. They only appear in CLAUDE.md. Need a full README read to confirm all facts.
6. **apps/landing pricing "12 packages" fact** — Grep for "12 packages" in landing app found no matches. Either already fixed, or in a different form/language.
7. **apps/landing/src/app.css** — Not checked for raw color literals (needs content audit).
8. **docs/src/lib/variants.tsx** (4,285 lines) and **lib/usage.ts** (3,162 lines) — Only headers verified; full content not read. Line counts per spec.
9. **docs/src/components/previews.tsx** (1,813 lines) — Not read; line count per spec.
10. **components with @category/@summary JSDoc** — 14 components have SOME JSDoc (`@example`), but none were confirmed to have `@category` or `@summary` tags. All 112 components lack the metadata the registry needs.
11. **`.examples.tsx` files** — None found (glob timed out, but targeted check found none). Phase 5 deliverable.

---

## 13. Phase 0 Recommendations

### 13.1 Immediate (before Phase 1)

1. **Commit or stash the component refactor sprint changes.** The working tree has uncommitted changes (spinner deleted, components modified, CLAUDE.md partially updated). The Surface Rebuild should branch from a clean state on `main`. Per the Git Workflow taste, commit only the agent's own changed files — but the refactor changes were from a prior session. Decision: either (a) commit them on `main` first, then branch `surface-rebuild`, or (b) stash them and branch from clean `main`.

2. **Resolve F8 drift in docs/landing data.** Before building the new apps, fix the stale counts (113→112 in README, pages.ts, site-data.generated.ts; 961→982 in pages.ts, changelog.ts, CLAUDE.md). This is trivial and should be done with the current baseline.

3. **Read the full `.agent/episodes.md`** (100+ lines) for complete episode context, especially EP 53–61 relevant to this inventory.

### 13.2 Phase 1–2 carry-forward

- The package dispositions in the spec §3 are **confirmed** by this inventory. No changes needed to the preservation map.
- The dependency graph is **confirmed** as acyclic. The two boundary violations (F2, F5) must be addressed in Phase 3 (docs split, layout/auth decoupling).
- The hand-typed facts and hard-coded URLs catalogued in §8–9 will be the input for the new `check:claims`, `check:surfaces`, `check:app-tokens` gates in Phase 3.
- The new `registry` private package should scan from `package.json` `facet` fields (D-6), components JSDoc tags, `layout` shells/presets, `motion` registry, `tokens` manifest, and `*.examples.tsx` files (none exist yet — Phase 5).

### 13.3 Tooling for Phase 3 gates

All new gates (`check:registry`, `check:examples`, `check:engine-purity`, extended `check:boundaries`, `check:content`, `check:claims`, `check:surfaces`, `check:app-tokens`, `check:landing-sections`, `check:layout-skeleton-parity`, `check:readme`) MUST be dependency-free `.mjs` scripts in `scripts/`, exit 1 with actionable messages, and be added to `check:all` + CI. The existing gate pattern (e.g., `check-docs-inventory.mjs`) is the template.

---

## 14. File Count Summary

| Area | File count | Line count (spec) |
|---|---|---|
| `packages/tokens/src/` | 25 files | (not specified) |
| `packages/utils/src/` | 7 files | (not specified) |
| `packages/motion/src/` | (many) | (not specified) |
| `packages/native/src/` | (few) | (not specified) |
| `packages/components/src/` | ~141 items (112 components + 25 tests + 2 data + barrel) | (not specified) |
| `packages/auth/src/` | ~8 files | (not specified) |
| `packages/sdk/src/` | 10 files | (not specified) |
| `packages/store/src/` | (few) | (not specified) |
| `packages/emails/src/` | (few) | (not specified) |
| `packages/cli/src/` | (many) | (not specified) |
| `packages/docs/src/` | 45 files | (not specified for docs, but large files): `lib/variants.tsx` 4,285; `lib/usage.ts` 3,162; `components/previews.tsx` 1,813; `lib/manifest.ts` 70; `manifest.ts` ~115+ |
| `packages/layout/src/` | (many) | (not specified) |
| `packages/sandbox/src/` | 5 files (index.ts, react/index.tsx, core/*, live/*) | (not specified) |
| `apps/landing/src/` | ~43 files | 6,219 lines |
| `apps/playground/src/` | 6 files | 466 lines |
| `apps/docs/src/` | 9 files + data/changelog.ts (2,376) + pages.ts (1,845) | ~4,661 lines |
