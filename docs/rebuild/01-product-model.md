# Phase 1: Product Model

**Status:** Draft (owner review pending)
**Companion:** [00-inventory.md](./00-inventory.md)

> Law: *Facet's packages are the product; the three apps (landing, playground, docs) are consumers that prove the packages are composable.*

This document defines the purpose, audience, and surface responsibilities of every package. It answers: **what is this package for, why is it a package (not a module), who is it for, and what does it own?**

Principles that apply across all packages:
- **L1 (Composability first):** Packages work standalone with minimal deps. Cross-package behaviour is injected through typed seams.
- **L2 (Apps own no capability):** If a second project would want it, it's a package export with a public, documented, configurable API.
- **L3 (Engines are facet-agnostic):** `@fusorb/facet-docs` and `@fusorb/facet-sandbox` contain zero facet-specific names/copy/URLs.
- **L6 (No hard-coding):** All repo facts, URLs, categories, and visual literals come from the registry, `surfaces.config`, or `@fusorb/facet-tokens`.

---

## Package Model

Why is this a package and not a module? A package is justified when:
1. It has an independent dependency tree (other packages shouldn't pull its deps).
2. It crosses a domain boundary (auth, data, layout, docs, etc.).
3. It must be independently versionable, testable, or publishable.
4. It serves as a public API surface with its own barrel and types.

### `@fusorb/facet-tokens` — Design Foundation

| Field | Value |
|---|---|
| **Purpose** | The single source of truth for all visual design values: colors, spacing, typography, motion, shadows, borders, radii, z-index, and breakpoints — exposed as CSS custom properties + a Tailwind theme. |
| **Audience** | Every package and app in the repo; external consumers building on Facet. |
| **Positioning** | "The CSS variable + Tailwind foundation. Import one file, get all tokens." |
| **Surface** | `tokens.css` (CSS variable definitions), `tailwind.config.ts` (theme extension mapping), theme variant CSS files (alpha, ember), `src/index.ts` (typed token accessors). |
| **Why a package** | Every other package depends on it transitively. Bundling tokens inside `components` would force Radix consumers to import Tailwind. Isolation enables the `check:boundaries` gate. |
| **Disposition** | KEEP (Phase 0 inventory confirms: zero @fusorb deps; acyclic) |

### `@fusorb/facet-utils` — Primitives

| Field | Value |
|---|---|
| **Purpose** | Zero-dependency utility primitives: `cn` (class-name composition with tailwind-merge), `isMac`, `getModSymbol`, `delay`, `noop`, `useId`, `runAsync`. |
| **Audience** | Components, motion, cli, apps — anything needing shared helpers. |
| **Positioning** | "Tiny utilities, zero dependencies, usable everywhere." |
| **Surface** | `src/index.ts` barrel (cn.ts, delay.ts, is-mac.ts, noop.ts, run-async.ts, use-id.ts). |
| **Why a package** | Used by tokens, motion, components, cli — but depends on nothing. Putting it inside another package would create a circular boundary violation. |
| **Disposition** | KEEP |

### `@fusorb/facet-motion` — Semantic Motion

| Field | Value |
|---|---|
| **Purpose** | Declarative animation system: semantic families (animate/sequence/stagger), CSS + React Native drivers, domain profiles, `<Motion>`/`<Presence>`/`<Reveal>`/`<Stagger>` components. |
| **Audience** | Components (motion grammar), apps (motion tabs), consumers building animated UIs. |
| **Positioning** | "Motion that communicates state, not decoration. Framework-agnostic core + React bindings." |
| **Surface** | `src/index.ts` (barrel), `src/core/` (drivers, effects, timeline, enums, types), `src/registry.ts` (effect registry), `src/react/` (Motion.tsx, Presence.tsx, etc.), `tailwind.config.ts` extension. |
| **Why a package** | Substantial system with its own driver architecture, registry, and cross-framework (CSS + React Native) concern. Components depend on it but shouldn't carry motion logic. |
| **Disposition** | EXTEND — export registry introspection (`listEffects()`, families, domain profiles) as plain data so the lab can render effect pickers without reaching into internals. |
| **Evidence** | check:motion-drift: 80 symbols, 15 generative + 27 authored effects. Acyclic: depends only on tokens + utils. |

### `@fusorb/facet-native` — Native Driver

| Field | Value |
|---|---|
| **Purpose** | React Native driver for `@fusorb/facet-motion`: bridges semantic motion to React Native Animated + native view animations. |
| **Audience** | React Native consumers using Facet motion. |
| **Positioning** | "Motion on native platforms, same API surface as web." |
| **Surface** | `src/index.ts`, `src/driver/` (native driver registration). |
| **Why a package** | **Boundary rule:** native is isolated so web consumers never import React Native primitives. The `check:boundaries` gate enforces this. Depends on tokens + motion (for auto-registration). |
| **Disposition** | KEEP (existing isolation preserved) |

### `@fusorb/facet-components` — UI Components

| Field | Value |
|---|---|
| **Purpose** | 112 styled UI components built on Radix primitives, with Facet design tokens + motion grammar (animate-facet-* classes). Includes theme system, IconRegistry, Skeleton. |
| **Audience** | All apps (landing, playground, docs), auth, layout, emails, and external consumers building product UI. |
| **Positioning** | "Radix primitives + Facet design system: 112 components, slot-based, theme-driven, motion-grammar." |
| **Surface** | `src/index.ts` (barrel, 112 component exports + foundations), `src/components.test.tsx`, `src/ui/*.tsx` (112 components + test files). |
| **Why a package** | Largest deliverable, own dependency tree (Radix + tailwind-merge + lucide-react). Version-independent from layout/auth. Consumers import components without auth/sdk. |
| **Disposition** | EXTEND — (a) JSDoc `@category`/`@summary` metadata on source (replaces CATEGORY map in gen-docs-manifest.mjs, F9); (b) colocated `*.examples.tsx` under separate `./examples` subpath. |
| **Evidence** | check:components: 112/112 (appearance + config axes), 22/22 composites expose slots. Only 14/112 components have ANY JSDoc tags (all `@example`, none `@category`). Zero `.examples.tsx` files exist. |

### `@fusorb/facet-sdk` — Data Layer

| Field | Value |
|---|---|
| **Purpose** | Pure-fetch, type-safe client for the Facet API surface. 62 routes across 10 domain SDKs (auth, identity, oauth, tenants, credentials, billing, audit, webhooks, idp). |
| **Audience** | auth (SgClient), store (session state), apps, consumers backend. |
| **Positioning** | "Type-safe SDK client for every backend route. No UI, no facet deps." |
| **Surface** | `src/index.ts` (barrel, 10 SDK class exports), generated route index. |
| **Why a package** | Pure data layer — no UI, no @fusorb dependencies. Can be used without auth/components/layout. Separating it enables the docs package to not depend on it (F2) and enables SDK drift gates. |
| **Disposition** | KEEP |
| **Evidence** | check:sdk-drift: 10 SDK classes documented. check:sdk-coverage: 62/62 routes. |

### `@fusorb/facet-auth` — Auth Domain

| Field | Value |
|---|---|
| **Purpose** | Authentication domain: context provider, auth flow orchestrator, Sign In / Sign Up cards, OTP verification, two-factor setup, optional auth hook (`useOptionalAuth`). |
| **Audience** | Apps and layouts that need authentication UI; docs engine (currently, F2). |
| **Positioning** | "Auth UI + context wired to SgClient SDK. Drop-in or inject your own client." |
| **Surface** | `src/index.ts`, `src/auth-context.tsx`, `src/auth-flow.tsx`, `src/sign-in-card.tsx`, `src/sign-up-card.tsx`, `src/otp-verification-card.tsx`, `src/two-factor-setup-panel.tsx`, `src/use-optional-auth.tsx`. |
| **Why a package** | Auth is a cross-cutting concern with form-validation deps (zod, react-hook-form, otplib, qrcode). Components shouldn't carry auth dependencies. But layout hard-depends on it (F5) — to be fixed by injecting a session seam. |
| **Disposition** | KEEP — exports `useOptionalAuth` (used by layout, F5) and will export `useAuthSession()` helper (per spec §3). |
| **Evidence** | 7 standalone forms per README. `use-optional-auth.tsx` exports the hook. |

### `@fusorb/facet-store` — State Management

| Field | Value |
|---|---|
| **Purpose** | Zustand-backed store layer keyed on SDK session state. Centralizes auth state, UI preferences, navigation state. |
| **Audience** | Apps, layout, components that need shared state without prop drilling. |
| **Positioning** | "Zustand store, SDK-aware. Import the slice you need." |
| **Surface** | `src/index.ts`, store slices + types. |
| **Why a package** | State management is a distinct concern that should be optional (apps can use their own state manager). Peer-depends on sdk. |
| **Disposition** | KEEP |

### `@fusorb/facet-emails` — Email Templates

| Field | Value |
|---|---|
| **Purpose** | Type-safe email template components that render to HTML strings. Includes verification emails, invitations, receipts. |
| **Audience** | Backend functions, apps rendering email previews, consumers sending transactional email. |
| **Positioning** | "Email templates as React components. Render to HTML string or preview in browser." |
| **Surface** | `src/index.ts`, template components. |
| **Why a package** | Email rendering is SSR/HTML-only — no client-side JS. Separating it avoids pulling email CSS into client bundles. |
| **Disposition** | KEEP |

### `@fusorb/facet-layout` — Layout Shells

| Field | Value |
|---|---|
| **Purpose** | Data-driven application shells: console, chat, auth, landing, docs layouts. 5 presets. RouterAdapter for host-router integration. LayoutSkeleton (loading fallbacks). |
| **Audience** | Apps (all three), docs engine, consumers building multi-page apps. |
| **Positioning** | "Layout shells from config. Inject session + routes, get a working app frame." |
| **Surface** | `src/index.ts` (barrel), shells (console-layout.tsx, chat-layout.tsx, auth-layout.tsx, landing-layout.tsx, docs-layout.tsx), context, presets, types, `./skeleton` subpath. |
| **Why a package** | Layout is a cross-cutting concern that apps compose. But it currently hard-depends on auth (F5) — to be fixed with an injectable `session` seam. |
| **Disposition** | REWORK + EXTEND — (a) Remove auth dependency: replace `useOptionalAuth` with injectable `session` seam on LayoutProvider; (b) Add `LayoutSkeleton` as `./skeleton` subpath; (c) Add `data-region` attributes to real shells for skeleton parity testing. |
| **Evidence** | 4 source files import `useOptionalAuth` from `@fusorb/facet-auth`: `console-layout.tsx`, `chat-layout.tsx`, `user-menu.tsx`, `sidebar-auth.tsx`. CLAUDE.md confirms `mode="rail"` with 5 presets. RouterAdapter concept exists (spec §3: "facet-layout already solved this with RouterAdapter; docs did not reuse it"). |

### `@fusorb/facet-docs` — Documentation Engine

| Field | Value |
|---|---|
| **Purpose** | Router-agnostic, data-driven documentation engine: shell (layout, nav, search, breadcrumbs, TOC, keyboard nav, theme, page actions), page model (DocsPage/DocsBlock), content data source seam, live code playground. |
| **Audience** | Apps (docs site), consumers building documentation sites. The engine must work for ANY project, not just Facet. |
| **Positioning** | "Docs engine that renders your content, not ours. Inject your registry + routes." |
| **Surface** | `src/index.ts` (barrel), `docs-app.tsx` (DocsApp with router injection), `lib/pages.ts` (DocsBlock model), `lib/docs-router.tsx` (engine router), `lib/ids.ts`, `lib/keyboard-nav.ts`, `components/DocsLayout.tsx`, `components/DocsTable.tsx`, `components/Guide.tsx`, `components/InstallTabs.tsx`, etc. |
| **Why a package** | Docs infrastructure is a reusable capability. But the package currently ships facet-specific gallery code (F1), hard-depends on auth/sdk (F2), hard-wires the router (F3), and hard-codes facet vocabulary (F4) — all to be fixed. |
| **Disposition** | SPLIT + REWORK — Facet-specific gallery code leaves the package (becomes registry-driven app code); engine gets router seam, DocsDataSource seam, sections config, `DocsPage.load` field, and delegates live code to `@fusorb/facet-sandbox/live`. |
| **Evidence** | 45 files in the package. Facet-specific files: lib/variants.tsx (4,285), lib/usage.ts (3,162), components/pregrounds.tsx (1,813), components/playground-registry.tsx (312), lib/manifest.ts (extendedEntries), components/AuthDemo/AuthPreviews/LayoutPreviews/ReadyToUseDemos/Playground/PlaygroundPage/InteractiveDemo/ComponentDemoCard, pages/{ComponentPage, ComponentsPage, PagesPage, ReadyToUsePage}.tsx, docs-app.test.tsx. Docs barrel exports `extendedManifest`, `LiveCodePlayground`, `PlaygroundPage`. |

### `@fusorb/facet-sandbox` — Interactive Lab Kit

| Field | Value |
|---|---|
| **Purpose** | Framework-agnostic interactive lab kit: artifact model, example model, control schema + code generation, kind registry, URL-state encode/decode, live JSX runtime (no-eval interpreter + URL sanitizer + error boundary), React stage/inspector kit. |
| **Audience** | Playground apps, docs embeds, consumers wanting interactive examples for their own components. |
| **Positioning** | "Show, don't tell. The lab kit that lets any package render interactive examples with generated control panels." |
| **Surface** | Three subpaths: `/core` (zero deps), `/react` (React peer only), `/live` (JSX runtime + sanitizer). |
| **Why a package** | The playground, docs engine, and consumers all need interactive presentation. But the current v2 has an unused block registry (F6) and a parser that duplicates the docs engine (F7). |
| **Disposition** | RETOOL → v3 — Becomes the lab kit with clean subpaths; removes unused `registerSandboxBlock`/`registerAdapter` seams; single-sourcing of the JSX parser. |
| **Evidence** | `registerSandboxBlock`/`getSandboxBlock`/`listSandboxBlocks`/`registerAdapter`/`getAdapter`/`listAdapters` have zero external callers (grep confirmed). The parser in `react/index.tsx` is a "faithful port of the docs live playground" (file comment). |

### `registry` (NEW, private) — Ecosystem Index

| Field | Value |
|---|---|
| **Purpose** | Workspace-only scanner that indexes all packages, components, layouts, motion effects, tokens, examples, and facts into `registry.json` + typed accessor modules. Never replaces a source of truth; only indexes existing metadata. |
| **Audience** | Apps (landing, playground, docs), tooling (CLI), CI gates. |
| **Positioning** | "One scan. Everything indexed. JSON + typed accessors." |
| **Surface** | `registry.json` (stable, language-agnostic), typed accessor modules for apps. Scanner reads: package.json `facet` fields, barrel exports, component JSDoc tags, layout shells, motion registry, tokens manifest, `*.examples.tsx`, changesets/git log. |
| **Why a package** | A build-time tool that must not be a published dependency (L1). Private workspace package ensures it's never accidentally imported by a published package. |
| **Disposition** | NEW — not published, not depended on by any published package. |
| **Constraint** | Published packages MUST NOT import it; only `apps/*` and tooling may. |

---

## Surface Responsibilities

The three surfaces are consumers, not capability owners. Each composes packages to answer one question:

| Surface | Question | Packages consumed | What it owns |
|---|---|---|---|
| **Landing** (`/`) | "What is Facet and why use it?" | tokens, components, motion, sdk, docs engine (DocsApp shell) | Content (`.md`), section registry, `surfaces.config` |
| **Playground** (`/`) | "What does Facet actually do?" | sandbox, components, layout, motion, auth, sdk, registry readers | Artifact kinds, control renderers (facet-styled), `surfaces.config` |
| **Docs** (`/`) | "How do I understand and use Facet?" | docs engine, components, layout, tokens, sandbox/live | Content (`content/**/*.md`), `DocsDataSource` impl, `surfaces.config` |

No surface owns capability. Every surface imports only from package public entry points (L2).

---

## Architecture Rules (from AGENTS.md + spec)

1. **Auth components must be domain-customizable** (different configs for fintech vs med vs edu): not one-size-fits-all.
2. **Include a welcoming landing page and deployed documentation site** alongside the component library.
3. **Build a differentiated component library** wired to SovGrant SDK, not a generic clone of existing UI libraries.
4. **Every package has:** `src/`, `package.json`, `tsconfig.json`; exports from `src/index.ts` as barrel; re-exports types alongside implementations.
5. **Focus rings are keyboard-only** (`focus-visible:ring-2 focus-visible:ring-[var(--ring)]`).
6. **Overlay exit lifecycle is CSS-driven** (`data-[state=closed]:animate-facet-*`).
7. **Z-index scale:** z-50 (chrome), z-[60] (backdrops), z-[70] (floating content).

---

## Domain Customization (per AGENTS.md)

Auth components must be domain-customizable. The `LayoutSkeletonSpec` and `ViewportSpec` models (spec §5.2) already support this via config. The `surfaces.config` will carry domain presets (fintech, med, edu, enterprise, default) that customize:
- Token palette overrides (via `--primary`, `--accent`, etc.)
- Component default variants
- Auth flow steps (MFA required, email vs phone, SSO providers)
- Layout density (compact vs roomy)

This is an ADR topic (Phase 2) for the exact API surface.
