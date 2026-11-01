# Facet Surface Specification (v1.0)

Status: contract for the "Surface Rebuild". Written against `fusorb/facet` at commit `b1ca88d` (2026-10-07).
Audience: the owner (Arcevocirqle) and every coding agent that touches the repo.
Rule of reading: **MUST / MUST NOT** are gates. **SHOULD** is a strong default an ADR may override. Anything marked *(illustrative)* is a shape, not a final signature; the agent finalizes it in an ADR (Phase 2) before coding against it.

---

## 0. The one-paragraph version

Facet's packages are the product; the three apps (landing, playground, docs) are **consumers that prove the packages are composable**. We rebuild the three apps from zero, but first we fix the places where the packages are *not* actually composable (the docs "engine" carries facet's own gallery and hard-depends on auth/sdk; layout hard-depends on auth; sandbox is a thin editor with an unused registry; facts are hand-typed in many places and already disagree). The rebuild is organised around **one generated registry** (what exists), **one example model** (how it is shown), and **one content system** (what we say), feeding three thin surfaces. Anything an app needs that another project would also need goes into a package as a public, configurable API; apps are not allowed to own capability.

---

## 1. Evidence: what the repo actually is

Everything here was read from the clone at the commit above. Baseline verified on a clean `pnpm install --frozen-lockfile`: `pnpm build` succeeds for all workspaces; `pnpm test` = **982 tests passed, 78 files**; `check:components` (113/113, 23/23 composites expose slots), `check:docs` (113), `check:boundaries` (13 packages, acyclic), `check:motion-drift` (80 symbols; 15 generative + 27 authored), `check:sdk-drift` (10 SDK classes). Lint, typecheck, `check:icons`, `check:sdk-coverage` and `sandbox:e2e` were not run in this audit; the agent must re-verify the full `check:all` baseline in Phase 0.

### 1.1 Shape

13 packages + 3 apps, pnpm + Turborepo + Changesets. Package versions per README: tokens 1.5.0, sdk 1.2.1, motion 1.2.1, native 1.2.1, components 3.1.0, auth 1.3.7, layout 1.5.7, store 1.0.1, docs 1.5.7, cli 1.1.3, emails 1.1.3, sandbox 2.0.0, utils 0.1.0.

| Surface | Size today | What it is |
|---|---|---|
| `apps/landing` | 43 files, 6,219 lines | Config-driven (`domain-config.ts`, `site.config.ts`, generated `site-data.generated.ts`), 8 pages, 11 sections. Hand-authored data files of 630 (`scratchpad.ts`) and 406 (`ecosystem.ts`) lines. |
| `apps/playground` | 466 lines | One page, 3 tabs (motion, simulated auth, "stack agnosticism"); a "Device" select that only swaps a CSS class; uses `facet-sandbox` for a single tab. |
| `apps/docs` | `pages.ts` 1,845 lines + `changelog.ts` 2,376 lines + 48 lines of shell | Thin consumer of `@fusorb/facet-docs`. Content is `DocsPage[]` of typed blocks (non-heading counts by grep: 122 `p`, 48 `code`, 14 `table`, 11 `ul`, 7 `install`, 2 `demo`, 1 `playground`, 1 `changelog`). |

### 1.2 Findings that change the plan

These are the things that make packages less composable than their READMEs claim. Each one has a fix in §3/§4.

| # | Finding | Evidence | Why it matters |
|---|---|---|---|
| F1 | **The docs "engine" contains facet's own gallery.** `packages/docs/src/lib/variants.tsx` (4,285 lines), `lib/usage.ts` (3,162), `components/previews.tsx` (1,813), `components/playground-registry.tsx` (312), `lib/manifest.ts` (hand-written `extendedEntries` for auth/layout) are facet-specific, and live in the installable package. | `wc -l`; `lib/manifest.ts` header says "covers the 90 UI components". | A consumer who installs `@fusorb/facet-docs` for their own docs gets facet's catalog baked in. `apps/docs/src/pages.ts` even states the engine "ships no facet content"; the package does not honour that. |
| F2 | **Engine hard-depends on the whole ecosystem.** `@fusorb/facet-docs` `dependencies`: auth, components, layout, sdk, tokens, plus `prettier` and `lucide-react`. | `packages/docs/package.json` | Installing a docs shell pulls the SDK and auth. The sdk dependency exists only because the gallery's preview registry builds a demo `ArcIdClient`. |
| F3 | **Router is hard-wired.** `DocsApp` renders `BrowserRouter` itself; the package is built with a `"use client"` banner as a workaround for Next. | `docs-app.tsx`, `tsup.config.ts` | Cannot be embedded in a host that owns routing. `facet-layout` already solved this with `RouterAdapter`; docs did not reuse it. |
| F4 | **Facet vocabulary is hard-coded in the engine.** Section ids/labels (`getting-started`, `ready-to-use`, `animation`, `pages`) and component categories live in `DocsContentPage.tsx` and `lib/nav.tsx`; categories also live in a `CATEGORY` map inside `scripts/gen-docs-manifest.mjs`. | grep | A consumer's sections are second-class; adding a facet category needs edits in three places. |
| F5 | **Layout hard-depends on auth.** `@fusorb/facet-layout` `dependencies` include `@fusorb/facet-auth`; four files import `useOptionalAuth` from it (`console-layout.tsx`, `chat-layout.tsx`, `user-menu.tsx`, `sidebar-auth.tsx`). | `layout/package.json`, grep | A consumer wanting only an app shell receives auth + sdk + zod + react-hook-form. The hook is *optional* by name, so the coupling should be an injected seam, not a dependency. |
| F6 | **`facet-sandbox` is a ~1,200-line live-JSX editor plus an unused registry.** `registerSandboxBlock`, `getSandboxBlock`, `listSandboxBlocks` have **zero** callers anywhere; the adapter registry (`registerAdapter`/`getAdapter`) has no callers outside the package. Its only consumer is one tab in `apps/playground`. | `grep` across apps/packages | The real, reusable asset is the no-`eval` JSX interpreter + URL sanitizer + error boundary. |
| F7 | **The same parser exists twice.** `packages/docs/.../LiveCodePlayground.tsx` (811 lines) re-implements `skipBrace`/`skipString`/`splitTopLevel`/`isSafeUrl`/`sanitizeUrlProps`; the sandbox README says its parser is "the same hand-written JSX parser as the docs engine". `facet-docs` does not depend on `facet-sandbox`. | both files | Two copies of a security-sensitive sanitizer will drift. |
| F8 | **Facts are hand-typed and already disagree.** Test count: `apps/docs/src/pages.ts` says 961 tests/75 files; CLAUDE.md says 980/78; the actual run on this commit reports **982 tests / 78 files**. Component count: 113 `ui/*.tsx` modules, 114 manifest entries, "90" in a manifest comment. | grep + test run | Exactly the drift the owner wants to eliminate. The existing `check:docs` only guards CLAUDE.md's component count. |
| F9 | **Editorial metadata is buried in generator scripts.** `scripts/gen-site-data.mjs` holds `PACKAGE_ORDER` and `PACKAGE_ICONS`; `gen-docs-manifest.mjs` holds `CATEGORY`. New package/component = edit a script. | scripts | Metadata should live with the thing it describes. |
| F10 | **URLs and tokens leak into apps.** `apps/playground/src/App.tsx` hard-codes `http://localhost:5173/changelog` and `https://facet.so/docs/changelog`; `app.css` imports Google Fonts by URL; docs/landing hard-code GitHub URLs. | grep | Cross-app links and fonts must come from one surface config and tokens. |
| F11 | **Playground "Device" control is cosmetic.** It toggles a class name; there is no stage, no artifact model, no control schema. Layouts are not previewable except via docs `LayoutPreviews`. | `App.tsx` | Confirms the owner's instinct: build a real stage. |

### 1.3 Corrections to the earlier chat

The pasted conversation was directionally right but wrong on three points that the code settles:

1. "Sandbox could be the execution substrate" has no basis in the current code (F6). It *can* become the shared lab kit, but that is a redesign, not an adoption.
2. "`@fusorb/facet-docs` is already a clean docs framework" is not true yet (F1-F4). Making it true is a prerequisite for the docs app.
3. The recommended landing/docs/playground structures are fine as *aspirations*; they were never checked against what the engines can already express. This spec does that.

### 1.4 What is genuinely strong and MUST be preserved

- Component discipline: appearance/config/slots axes enforced by `check-component-flexibility.mjs` (113/113; 23/23 composites expose slots).
- Dependency hygiene: `check-boundaries.mjs` enforces an acyclic `@fusorb/*` graph and an isolated `facet-native`.
- Motion: registry + drift gate + token parity.
- `RouterAdapter` in layout; `LayoutConfig` data-driven shells with 5 presets; `ChatLayout` exists and is exported.
- The generator culture (`gen-site-data`, `gen-docs-manifest`, `gen-icon-map`, `gen-changelog`, `gen-changeset`) and the drift-gate pattern: small dependency-free `.mjs`, exit 1 on drift. **New gates MUST copy this pattern.**
- 980 tests across 11 projects. Tests may be moved with their code but not deleted without a replacement.

---

## 2. Laws

These are the acceptance criteria for every phase. A change that violates a law is rejected even if it works.

**L1. Composability first.** Every published package works on its own with the smallest sensible dependency set. Cross-package behaviour is injected through typed seams (adapters, slots, providers, config), not imported. A package MUST NOT gain a `dependencies` entry on another facet package unless its README can justify why a peer/optional seam is insufficient.

**L2. Apps own no capability.** If a second project could reasonably want it (a stage, a control panel, a skeleton, a docs shell, a registry reader), it is a package export with a public, documented, configurable API. Apps compose; they do not implement. Apps MUST import only from package public entry points (no deep paths into `src/`, no copies).

**L3. Engines are facet-agnostic.** `@fusorb/facet-docs` and `@fusorb/facet-sandbox` contain **zero** facet-specific names, copy, slugs, section ids, categories, URLs or package lists. Anything facet-specific is data passed in.

**L4. One canonical owner per fact.** Every fact has exactly one source; everything else derives. (Table in §5.1.)

**L5. Generated / Authored / Validated.** Facts → generated. Meaning → authored. Every cross-reference between the two → validated by a gate. Authored prose MUST NOT contain a hand-typed number that the registry knows.

**L6. No hard-coding.** Behaviour defaults live in typed config with documented defaults. Literals that describe the repo (counts, versions, names, URLs, icons, categories, order) MUST come from the registry or `surfaces.config`. Visual literals (colours, fonts, spacing, radii, z-index) MUST come from `@fusorb/facet-tokens`/Tailwind theme.

**L7. Motion is semantic.** Motion communicates state, hierarchy or transition. Surfaces respect `prefers-reduced-motion`. No decorative loops.

**L8. Accessible by construction.** Keyboard-complete, labelled regions, visible focus (existing `--ring` rule), WCAG 2.2 AA contrast, reduced motion honoured. Verified in Phase 10, designed in from Phase 4.

**L9. Reversible migration.** All work lands on one long-lived branch. `main` is untouched until each new app passes its contract (§7). Published-package changes ship through Changesets with correct semver (breaking = major).

---

## 3. Preservation map (package by package)

Legend: **KEEP** untouched; **EXTEND** additive; **REWORK** public API changes (major bump); **SPLIT**; **RETIRE**.

| Package | Disposition | Required change | New boundary rule |
|---|---|---|---|
| `tokens` | KEEP | Expose a machine-readable token manifest (CSS custom-property names + groups) for the registry and the Tokens artifact. | No facet deps (already). |
| `utils` | KEEP | none | none |
| `motion` | EXTEND | Export registry introspection (`listEffects()`, families, domain profiles) as plain data so the lab can render effect pickers without reaching into internals. | Stays below components. |
| `native` | KEEP | none | Existing isolation gate stays. |
| `components` | EXTEND | (a) Component metadata moves into the module: JSDoc tags `@category`, `@summary` on the exported component (replaces the `CATEGORY` map in `gen-docs-manifest.mjs`). (b) Colocated **example files** `ui/<name>.examples.tsx` (see §5.3), excluded from the main barrel, published under a separate subpath `./examples` so normal consumers pay nothing. | `examples` entry may import types from `@fusorb/facet-sandbox/core` as `import type` only; MUST NOT create a runtime edge to sandbox. |
| `auth` | KEEP | Export a tiny `AuthAdapter`-style hook seam only if F5 requires it (see layout). | none |
| `layout` | REWORK (minor→major only if props change) + EXTEND | (a) **Remove the hard dependency on auth** (F5): replace `useOptionalAuth` with an injectable `session` seam on `LayoutProvider` (`session?: { user, signOut }`), with `@fusorb/facet-auth` offered as an optional peer and a documented `useAuthSession()` helper exported from **auth** (not layout). (b) Add `LayoutSkeleton` (§8) as a subpath `./skeleton` — pure presentational, no providers, usable as Suspense fallback by consumers. (c) Add stable `data-region` attributes to the real shells so skeleton parity can be tested. | `layout` MUST NOT depend on `auth` or `sdk`. `check:boundaries` extended. |
| `sdk` | KEEP | none | none |
| `store` | KEEP | none | none |
| `emails` | KEEP | none | none |
| `cli` | EXTEND | New commands that expose the new capabilities to consumers: `facet docs build` (content compiler), `facet registry build` (scanner for a consumer's own packages — shares the scanner core with the repo generator), updated `docs init` scaffold (content folder + example of `.md` pages). Remove facet-specific assumptions from templates. | CLI may depend on engines; engines never on CLI. |
| `docs` | **SPLIT** (+ REWORK) | See §4.3. Engine stays `@fusorb/facet-docs` and becomes data-driven and router-agnostic; facet-specific gallery code (F1) leaves the package and is regenerated from the registry inside `apps/docs` or deleted. Live code reuses sandbox (F7). | `docs` MUST NOT depend on `auth` or `sdk` (F2). Allowed facet deps: `components`, `layout`, `tokens`, `sandbox` (runtime + subpaths). |
| `sandbox` | **REWORK → v3** | Becomes the **lab kit**: framework-agnostic core (artifact/example/control model, kind registry, control-schema + code-generation utilities), a React stage/inspector kit, and the live-JSX runtime (the one asset worth keeping). Drops the unused block registry and `registerAdapter` seam (breaking, major). See §4.2. | Subpaths: `/core` (zero deps), `/react` (react peer only), `/live` (JSX runtime + sanitizer). No `@fusorb/*` runtime deps at all. |
| *new, private* `registry` (workspace-only, `private: true`) | NEW | Scanner + generated JSON + typed accessors (§4.1). Not published, not depended on by any published package. | Published packages MUST NOT import it; only `apps/*` and tooling may. |

Apps: `apps/landing`, `apps/playground`, `apps/docs` are **REBUILD** (replace contents; keep package names so CI, turbo and deploy config keep working). Old code is read for knowledge, never copied wholesale (the owner's "don't think about reusing" instruction); individual pieces may survive only if the ADR for that surface justifies them.

---

## 4. Target architecture

```
                         PACKAGES (published, composable)
 tokens ─ utils ─ motion ─ native ─ components ─ auth ─ sdk ─ store ─ emails
                              │         │
                              │      layout (+ /skeleton)         sandbox v3 (/core /react /live)
                              │         │                             │
                              └─────────┴──────────┬──────────────────┘
                                                   │
                                       docs engine (facet-agnostic)         cli (scaffolds + builds)
 ─────────────────────────────────────────────────────────────────────────────────────────────────
                         TOOLING (private, workspace-only)
   registry scanner ──► registry.json + typed accessors ──► content compiler (docs build)
 ─────────────────────────────────────────────────────────────────────────────────────────────────
                         SURFACES (consumers; no capability of their own)
              landing (/)           playground (lab)             docs (knowledge)
```

### 4.1 The registry

A private workspace package (`registry/`) whose only job is to **index** what the repo already knows. It never replaces a source of truth.

Inputs (all existing): every `packages/*/package.json`; each package's public barrel(s); `components/src/ui/*.tsx` (JSDoc tags); `layout` shells and presets; `motion` registry; `tokens` manifest; `*.examples.tsx` files; changesets / git log; the docs content folder.

Output: `registry.json` (stable, versioned `schemaVersion`, language-agnostic so Intel and other tools can read it) plus typed accessor modules for the apps.

*(illustrative)* top-level shape:

```ts
interface FacetRegistry {
  schemaVersion: 1;
  generatedFrom: { commit: string; at: string };
  packages: PackageEntry[];        // name, version, summary, category, icon, order, deps, peers, exports, install
  components: ComponentEntry[];    // slug, name, package, category, summary, props[], examples[]
  layouts: LayoutEntry[];          // kind, props, modes, regions[], presets[]
  motion: { families: ...; authored: ...; domains: ... };
  tokens: { groups: ...; vars: ... };
  presets: PresetEntry[];          // domain presets (fintech, med, edu, enterprise, default)
  examples: ExampleEntry[];        // see §5.3
  facts: Record<string, string | number>;  // e.g. components.count, tests.count (see below)
  surfaces: SurfaceMap;            // canonical URLs/routes between apps (from surfaces.config)
}
```

**Package metadata lives in the package** (fixes F9): each `package.json` gets a `facet` field *(illustrative)*: `{ "category": "foundation", "icon": "palette", "order": 3, "summary": "..." }`. Adding a package makes it appear everywhere with no script edits. The existing generators are migrated to read it.

**Facts** are the interpolation source for prose (`{{facts.components.count}}`). Each fact is defined once with its derivation (e.g. `components.count` = number of non-test `ui/*.tsx` modules exported from the barrel). **Test counts** are not committed facts (they churn); docs MAY show them only as a CI-injected value, otherwise they MUST NOT appear in prose (F8).

### 4.2 `@fusorb/facet-sandbox` v3: the lab kit

Why keep the package: the Playground, the Docs engine and *consumers who want a playground for their own components* all need the same three things, and none of them belongs in `components`. Why this shape: it keeps the package framework-agnostic and free of facet dependencies (L1), and removes duplication (F7).

| Subpath | Contents | Deps |
|---|---|---|
| `/core` | Types and pure functions: `Artifact`, `Example`, `ControlSchema`, `Viewport`, kind registry (`registerArtifactKind`), control inference helpers, **code generation from control values** (`toCode`), URL-state encode/decode for shareable permalinks. | none |
| `/react` | `Stage` (bounded viewport host with fit/aspect/resize/theme/reduced-motion), `ArtifactRenderer`, `Inspector` (schema-driven control panel with **injectable control renderers**; accessible defaults built from native elements + CSS variables, so no component-library dependency), `Catalog` (tree/search/keyboard nav driven by data), `CodeView`. | react (peer) |
| `/live` | The no-`eval` JSX interpreter, `isSafeUrl`/`sanitizeUrlProps`, `PlaygroundErrorBoundary`, `PreviewFrame`, optional prettier formatting. Single copy; docs consumes it. | react (peer, optional prettier) |

The apps pass facet-styled control renderers into `Inspector` (a thin file in `apps/playground`); consumers can do the same with their own design system. This is the composability test for the kit: **the kit must be usable with zero facet components.**

Breaking changes to flag in the changeset: removal of `registerSandboxBlock`/`getSandboxBlock`/`listSandboxBlocks`/`registerAdapter`/`SandboxAdapter`/`SandboxConfig.sections`; `Sandbox`/`reactAdapter` re-exports move to `/live`. Provide a codemod note, not a shim (no known external consumers; verify via npm before publishing).

### 4.3 `@fusorb/facet-docs` split

Engine (stays in the package):
- Shell (layout via `facet-layout`, nav, search, breadcrumbs, TOC, keyboard nav, theme, page actions).
- Page model: existing `DocsPage`/`DocsBlock` **plus** `DocsPage.load?: () => Promise<DocsBlock[]>` so content is code-split per page (this is the scale answer, §6.2).
- A **`DocsDataSource`** seam *(illustrative)*: `{ entries(): ReferenceEntry[]; examples(slug): Example[]; api(slug): ApiDoc | undefined }`. The built-in "component gallery" pages render *from this* instead of from baked-in facet data. A consumer without a gallery passes none; facet passes registry-backed data.
- Router seam: `DocsApp` (batteries: owns a router, `routerKind: "browser" | "hash"`) and `DocsRoutes` (router-less; mount inside any host router). Navigation goes through a `RouterAdapter`-style interface (reuse layout's concept). The `"use client"` workaround is revisited once routing is injected.
- Sections and categories are **config** (`config.sections: { id, label, order, icon }[]`), not constants. Unknown sections still render (existing behaviour) with a derived label.
- Live code: `LiveCodePlayground` delegates to `@fusorb/facet-sandbox/live`.

Leaves the package (becomes registry-driven app code or is deleted): `lib/variants.tsx`, `lib/usage.ts`, `components/previews.tsx`, `components/playground-registry.tsx`, `lib/manifest.ts` `extendedEntries`, `manifest.ts` (generated list of facet components), `AuthDemo`, `AuthPreviews`, `LayoutPreviews`, `ReadyToUseDemos`, `ComponentDemoCard` (if facet-specific). The agent classifies each file in the Phase 0 inventory; "deleted" is a valid outcome when the example registry supersedes it.

Allowed deps after split: `components`, `layout`, `tokens`, `sandbox`; peers `react`, `react-dom`, optional `react-router-dom`. **No `auth`, no `sdk`, no `lucide-react` unless justified (icons come through the components IconRegistry).**

---

## 5. Data model

### 5.1 Source-of-truth table (Law L4)

| Fact | Canonical owner | Derived into |
|---|---|---|
| Package name, version, deps, exports | `packages/*/package.json` | registry → landing, docs, README table, install tabs |
| Package summary, category, icon, order | `package.json` `facet` field | registry → landing, docs, catalog |
| Component list, category, summary | `components/src/ui/*.tsx` (+JSDoc tags) and the barrel | registry → catalog, docs reference, landing counts |
| Component props / API | TypeScript types in source | registry (TS compiler API) → inspector controls, docs API tables |
| Examples (the runnable thing) | `ui/*.examples.tsx` colocated with component | registry → playground, docs embeds, landing showcase |
| Motion effects/families/domains | `motion` registry | registry → playground Motion artifact, docs |
| Tokens | `tokens` package | registry → Tokens artifact, docs |
| Layout kinds/props/presets | `layout` source | registry → LayoutSkeleton controls, docs, playground |
| Authored explanations | `apps/docs/content/**/*.md` | docs build |
| Landing narrative | `apps/landing/content/*` (typed) | landing |
| Cross-app URLs / routes | `surfaces.config` (single file) | every app's links |
| Changelog | git history + changesets | generated; never hand-edited |
| Counts, versions in prose | registry `facts` | `{{facts.*}}` interpolation only |

### 5.2 Artifact model

An **artifact** is anything the lab can present. The stage does not know what a component is; each *kind* declares how it is experienced. Kinds are registered, so consumers can add their own.

*(illustrative)*

```ts
type ViewportSpec = {
  fit: "content" | "frame";             // content: size to artifact; frame: fixed frame
  aspect?: "16:9" | "4:3" | "1:1" | "9:16" | number;  // only when fit="frame"
  minHeight?: number;
  resizable?: boolean;
  scroll: "none" | "inside";             // the stage itself never page-scrolls
};

interface ArtifactKind<TValues = Record<string, unknown>> {
  id: string;                            // "component" | "layout" | "motion" | "flow" | "token" | "pattern" | custom
  label: string;
  defaultViewport: ViewportSpec;
  render(artifact: Artifact, values: TValues, ctx: RenderContext): unknown; // framework-agnostic return; /react adapts
  inferControls?(artifact: Artifact): ControlSchema;
}

interface Artifact {
  id: string;                            // stable, URL-safe: "components/button"
  kind: string;
  title: string;
  package: string;                       // owning package name (from registry)
  summary?: string;
  viewport?: Partial<ViewportSpec>;      // per-artifact override
  examples: ExampleRef[];
}
```

Initial kinds (Phase 6 scope): `component`, `layout` (skeleton), `motion`, `flow` (auth lifecycle as a miniature app), `token` (inspector, not preview). `pattern` and `icon` are Phase 6+ stretch. **Viewport presets (desktop/tablet/mobile/16:9 …) are passed in as config to `Stage`**, not hard-coded in the kit.

### 5.3 Example model (the key anti-duplication object)

One example = one runnable scenario, owned next to the code it demonstrates, consumed by playground **and** docs **and** landing.

*(illustrative)*

```ts
interface Example<P = Record<string, unknown>> {
  id: string;                            // "button.variants.outline"
  artifact: string;                      // "components/button"
  title: string;
  description?: string;
  render: (props: P) => React.ReactNode; // the real component, not a string
  defaults?: Partial<P>;
  controls?: ControlOverrides<P>;        // overrides on top of inferred controls (labels, groups, enum meanings, hidden props, slot presets)
  code?: (props: P) => string;           // optional; otherwise generated by toCode()
  tags?: string[];                       // "ready-to-use", "auth", ...
}
```

**Control inference tiers** (to avoid hand-authoring 113 control panels):
1. *Inferred* from the component's TypeScript props at registry build (TS compiler API; union literals → select, boolean → switch, string → text, number → number, `ReactNode` → slot preset list). Unsupported types are omitted, not guessed.
2. *Overridden* in the example (`controls`): labels, groups, hidden, ranges, enum descriptions.
3. *Slot presets*: named alternatives (e.g. icon none/arrow/plus) defined in the example, never free-form JSX in v1 (free-form editing is the separate `/live` code view).

Grouping heuristics (appearance / content / state / behavior / layout) live in `sandbox/core` as a **replaceable function** (`inferGroup`), not a hard-coded table in the UI.

**Code view**: generated from current control values by `toCode` (prop-diff against defaults → JSX). The `/live` editor can start from that code ("Edit as code"), which is the only place free-form JSX appears.

### 5.4 Validation of the model

Gates in §9 fail when: a public component has no example; an example references a missing export or a prop that does not exist; a control override names a prop that does not exist; an artifact id collides; docs reference an unknown example id.

---

## 6. Docs content system (answers "one big file?")

### 6.1 Decision

Docs prose is authored in **Markdown files with frontmatter and a small directive syntax**, compiled at build time into the existing `DocsPage`/`DocsBlock` model. MDX is *not* adopted: it needs a bundler plugin in every consumer, cannot be serialised, and cannot be indexed by search or by Intel without executing code. The compiled blocks remain plain data.

```md
---
title: Theming
section: foundations
order: 20
summary: How tokens, presets and themes compose.
---

Facet ships {{facts.components.count}} components across {{facts.packages.count}} packages.

::example{id="theme-provider.basic"}

:::callout{tone="note"}
Presets change behaviour, not just colour.
:::

::reference{kind="package" id="@fusorb/facet-motion"}
```

Directives map to existing/new block types (`demo`/`example`, `install`, `table` from a registry query, `callout`, `reference` which renders generated API/props tables). The compiler **fails the build** on: unknown example id, unknown registry reference, unresolved `{{facts.*}}`, broken internal link, hand-typed number adjacent to a nouns list the registry owns (gate `check:claims`, §9), duplicate page paths.

### 6.2 Is one giant file OK? (direct answer)

A 50k-100k-line single TSX/TS file *would* load and run (it is "just text"), so memory is not the limit. It fails for **workflow and scale** reasons: unreviewable diffs, merge conflicts between agents, no per-page code-splitting (the whole doc corpus ships in the entry chunk), slow editor/TS server on a megabyte file, no ownership, and nothing for search/indexing to chunk on. Facet already shows the early symptoms: `variants.tsx` (4,285), `usage.ts` (3,162), `pages.ts` (1,845), `changelog.ts` (2,376).

The opposite extreme (one tiny file per component per topic) fragments for no gain. The rule:

- **Authored narrative**: one `.md` file per *topic/page*, grouped in folders by section. Expected on the order of tens of files, 50-400 lines each.
- **Reference** (per-component API, props, examples, install): **generated**, never authored, therefore zero files.
- **Compiled output**: one lazy chunk per page (`DocsPage.load`) plus a small search index (titles, headings, summaries). The shell loads nav only.

This supports both Arcevocirqle's docs and consumers' docs: a consumer's repo gets `docs/content/*.md` and `facet docs build`.

### 6.3 Consumer story

`facet docs init` scaffolds: `content/` (two starter pages), `docs.config.ts` (brand, sections, links), an entry mounting `DocsApp`, and an npm script `docs:build`. Without a registry the gallery is simply absent. With `facet registry build` (scanner over the consumer's own components) they get the same catalog + playground + docs-reference. This is the long-term payoff of L1-L3 and is why the scanner core is shared (Phase 3).

---

## 7. Surface contracts

Each surface has: purpose, the visitor question it answers, routes, regions, inputs, forbidden things, acceptance.

### 7.1 Playground ("What does Facet actually do?")

Purpose: let a developer **touch** the system. It proves; it does not explain.

Layout (desktop): three regions in a fixed-height app frame; only the catalog and inspector scroll internally; the stage never page-scrolls.

```
┌ toolbar: breadcrumb · viewport · theme/domain · reduced-motion · permalink · view docs ┐
├──────────────┬──────────────────────────────────────┬──────────────────────┤
│ CATALOG      │ STAGE                                │ INSPECTOR            │
│ search       │  bounded viewport; artifact kind     │ tabs: Controls │ Code │ Info │
│ package →    │  decides content, fit and aspect     │ grouped controls     │
│ category →   │  (default frame 16:9 only for kinds  │ examples switcher    │
│ artifact     │  that declare it)                    │ reset / copy         │
└──────────────┴──────────────────────────────────────┴──────────────────────┘
```

Mobile: catalog and inspector become sheets; stage fills; same data.

Behaviours:
- Catalog is **generated** from the registry; no manual list.
- URL is the state: `/<artifact-id>?example=…&props=…&viewport=…&theme=…`. Docs "Open in playground" and playground "View docs" are generated links from `surfaces.config`.
- Viewport presets and domain presets are config, sourced from `surfaces.config`/registry.
- `component` kind: renders the real component inside its example; `fit: content` by default; user may switch to a frame.
- `layout` kind: renders `LayoutSkeleton` (§8) with controls derived from the real layout props; a **Skeleton | Live** switch shows the real layout with minimal placeholder content to verify fidelity.
- `motion` kind: effect/family/domain pickers from `motion` registry data; honours reduced-motion and shows the resolved token values.
- `flow` kind: a staged auth lifecycle using the real `auth` components over an injected mock `ArcIdClient`; states visible in the inspector. (The mock lives in the **playground app or an `auth` test-support subpath**, not in docs.)
- `token` kind: an inspector (swatches, scale, type specimens), not a preview.
- "Edit as code" opens `/live`, sandboxed by the existing sanitizer.

Forbidden: hand-maintained component lists; per-component bespoke inspector UIs; raw colours/fonts; a second copy of anything in `sandbox`.

Acceptance: every public component has ≥1 example and is reachable; changing a control updates the stage and the code view; permalink round-trips; keyboard-only operation of all three regions; stage never page-scrolls; with reduced-motion enabled no artifact animates decoratively.

### 7.2 Docs ("How do I understand and use Facet?")

IA is **Learn / Build / Reference / Explore**:
- *Learn* (authored): Introduction, Mental model, Architecture, Design principles, Installation, Theming, Motion, Accessibility.
- *Build* (authored, task-first): first interface, auth flow, dashboard shell, settings surface, **your own docs site**.
- *Reference* (generated + short authored intro per package): packages, components, auth, layout, motion, tokens, sdk, store, cli, emails.
- *Explore*: Playground link, Examples index, Ecosystem, Changelog (generated), Roadmap.

Three-pane shell (sidebar · content · "on this page"), search, page actions, prev/next, keyboard nav (these exist in the engine; the rebuild must not regress them). API/reference pages are generated from the registry; examples are the same `Example` objects as the playground (interactive, with "Open in playground").

Forbidden: facet-specific code in the engine package; hand-typed counts/versions; examples not defined in the example registry; per-component authored pages.

Acceptance: the docs app is the **reference consumer**: its entire facet-specific surface is `docs.config.ts`, `content/**`, and the registry-backed `DocsDataSource`. A fresh project scaffolded by `facet docs init` builds and runs without installing `auth` or `sdk`. Build fails on any broken reference (§9).

### 7.3 Landing ("Why should I care?")

One page at `/` that progressively reveals Facet, plus only the routes the owner confirms (§11 O-2). Sections are entries in a **section registry** where each declares a required `purpose` (the visitor question it answers) and `proof` (what on the page substantiates it). A gate fails if a section lacks either, so every section earns its place.

Proposed order: What is Facet (one sentence + one live artifact) → The model (tokens → components → shells → auth/ecosystem; generated from registry) → What you can build (3-5 live examples from the example registry) → How it is put together (package graph generated from the dependency graph, showing optionality) → Try it (embeds playground permalinks) → Get started (generated install command, link to docs) → Where next (surfaces.config links). No sections that exist because SaaS pages have them (pricing, team, contact) unless O-2 says so.

Forbidden: duplicated copy from docs; hand-typed stats; bespoke demos that are not registry examples; hard-coded URLs.

Acceptance: first viewport states what Facet is without scrolling; every number on the page resolves from the registry; every live demo is an example; Lighthouse performance/accessibility budgets set in the design lock (Phase 4).

### 7.4 Cross-surface

`surfaces.config` is the single owner of origins and routes (`landing`, `playground`, `docs`, `github`, `npm`). It supplies dev and prod values by environment. Apps expose permalink helpers; no app writes another app's URL by hand (F10).

---

## 8. Layout skeletons

`@fusorb/facet-layout/skeleton` exports `LayoutSkeleton`: a purely presentational, token-styled wireframe of a layout's regions. It is **not a mock app**; geometry matters, content does not.

*(illustrative)*

```ts
type LayoutSkeletonSpec = {
  kind: "console" | "auth" | "landing" | "docs" | "chat";   // derived from layout exports, validated by gate
  nav?: "full" | "rail" | "collapsed" | "hidden";
  header?: boolean;
  aside?: "none" | "left" | "right";
  density?: "compact" | "default" | "spacious";
};
```

Rules:
- The set of kinds and each kind's legal options are **derived from the real layouts' prop types** (`ConsoleLayoutMode = "full" | "rail"`, docs `collapsedAll`, chat sidebar, auth split panel, landing hero) by the registry, so the skeleton cannot offer a state the real layout cannot render. `collapsed` for docs maps to the real "collapse-all" variant.
- Real shells gain stable `data-region="sidebar|header|aside|content|…"` attributes; a test renders each skeleton and real layout per option set and asserts the same region set and ordering (gate `check:layout-skeleton-parity`).
- Public, documented, and usable as a **loading fallback** in consumer apps (this is the composability payoff, not only a playground trick).

---

## 9. Drift gates

All new gates are dependency-free `.mjs` scripts in `scripts/`, copy the style of `check-docs-inventory.mjs`, exit 1 with an actionable message, and are added to `check:all` and CI. Existing gates stay.

| Gate | Fails when |
|---|---|
| `check:registry` | `registry.json` is stale vs a fresh scan; a package lacks a `facet` metadata field; an id/slug collides. |
| `check:examples` | A public component lacks an example; an example references a missing export or prop; a control override targets a non-existent prop; a `.examples.tsx` file is reachable from a main barrel. |
| `check:engine-purity` | `docs`/`sandbox` source imports `@fusorb/facet-auth|sdk`, imports from `apps/*`, or contains facet-specific literals (package names, slugs, section ids, URLs) outside tests/JSDoc. Allow-list is explicit and reviewed. |
| `check:boundaries` (extended) | `layout` depends on `auth`/`sdk`; `docs` depends on `auth`/`sdk`; `sandbox` has any `@fusorb/*` dependency; a published package depends on `registry`; apps deep-import `src/`; cycle. |
| `check:content` | Docs build errors: unknown example/reference, unresolved `{{facts.*}}`, broken internal link, duplicate path, missing frontmatter. |
| `check:claims` | Authored content (docs, landing, README generated regions excluded) contains a number adjacent to a registry-owned noun (components, packages, tests, effects, presets, icons) that is not an interpolation. |
| `check:surfaces` | A hard-coded origin/localhost/`facet.so`/GitHub URL appears in an app instead of `surfaces.config`; a cross-app link does not resolve in the registry. |
| `check:app-tokens` | App source contains raw colour literals, `font-family`/`@import url(` outside tokens, or arbitrary z-index outside the documented scale. |
| `check:landing-sections` | A landing section lacks `purpose` or `proof`. |
| `check:layout-skeleton-parity` | A layout kind has no skeleton, or skeleton regions differ from the real layout's `data-region`s per option set. |
| `check:readme` (optional, Phase 10) | README/CLAUDE.md fact regions (marked) differ from registry-generated text. |

Existing gate fixes in scope: `check-docs-inventory.mjs` is rewired to read the registry instead of `manifest.ts`.

---

## 10. Phases

All on branch `surface-rebuild`; each phase ends with `pnpm check:all` green (plus new gates introduced so far) and a short `.agent/output.txt` update per AGENTS.md. Phases 1-3 produce documents and infrastructure, **no visual UI**.

| Phase | Name | Deliverables | Exit criteria |
|---|---|---|---|
| **0** | Archaeology | `docs/rebuild/00-inventory.md`: every package + app file group classified KEEP/EXTEND/REWORK/SPLIT/RETIRE/GENERATE/UNKNOWN with evidence; dependency graph; list of hand-typed facts; list of hard-coded URLs/tokens; confirmation of baseline (build, typecheck, lint, test, all gates). | Every file group classified; UNKNOWN list explicit; baseline numbers recorded. |
| **1** | Product model | `01-product-model.md`: what each package is *for* (and why a package vs a module), audience, positioning sentence, surface responsibilities, principles. Owner-reviewed. | Each package has a justified one-sentence purpose; owner sign-off. |
| **2** | ADRs | `adr/ADR-001…`: artifact/example/control model; sandbox v3 API; docs split + DocsDataSource + router seam; layout/auth decoupling; content format and directive set; registry schema; package `facet` metadata; surface config. Alternatives and rejection reasons recorded. | No open "TBD" in any ADR; type sketches compile in a scratch file. |
| **3** | Foundation packages | Registry (scanner + generated JSON + accessors); package `facet` metadata migrated; sandbox v3 (`/core`, `/live`, then `/react`); layout/auth decoupling; `LayoutSkeleton` + `data-region`; docs engine seams (router, data source, sections config, `load`); content compiler; new gates up through `check:boundaries` extensions, `check:registry`, `check:engine-purity`. Changesets with correct bumps. | All old apps still build against the new package versions (compat shims allowed **only inside apps**, to be deleted at cutover). Gates green. |
| **4** | Design lock | `04-design-lock.md` and token additions in `tokens` only: type scale, spacing, containers, breakpoints, surfaces/borders/radii/shadows, z-scale, motion usage rules, focus/contrast rules, density; wireframes for the three surfaces at desktop + mobile; Lighthouse/a11y budgets. | Owner sign-off; no app work starts before this. |
| **5** | Examples | `*.examples.tsx` for all public components (inferred controls + overrides), layouts, motion, flow, token inspectors; `check:examples` green. | 100% example coverage; inspector controls render for every artifact. |
| **6** | Playground | New `apps/playground` per §7.1. | Contract acceptance (§7.1) incl. keyboard + mobile; Playwright smoke for permalinks. |
| **7** | Docs content + app | Content under `apps/docs/content/**` (Learn/Build authored; Reference generated), `DocsDataSource` for facet, new `apps/docs`. Retire facet-specific files from `packages/docs` (F1). | Contract acceptance (§7.2); fresh `facet docs init` project builds without auth/sdk. |
| **8** | Landing | New `apps/landing` per §7.3. | Contract acceptance; `check:landing-sections`, `check:claims` green. |
| **9** | Cutover + enforcement | Delete legacy code paths and app-side compat shims; wire all new gates into CI; generated README regions; `CLAUDE.md`/`AGENTS.md` rewritten to describe the new architecture (generated where factual). | `check:all` green on the branch; PR to `main`. |
| **10** | Hardening + release | Accessibility audit (keyboard, screen reader, contrast, reduced motion), responsive, performance budgets, consumer install test (`npm create`-style fresh project using only published-style tarballs: components-only, layout-only, docs-only, sandbox-only), release via Changesets. | Consumer matrix passes; owner acceptance. |

Parallelism: after Phase 3, Phases 5 (examples) can be split by package across agents; 6, 7, 8 are independent surfaces once 4 and 5 land, but 7 depends on the content compiler and 8 benefits from 6's embeds, so the suggested order is 6 → 7 → 8.

Versioning: `sandbox` major; `docs` major (API change: sections config, DocsDataSource, removal of gallery); `layout` minor (additive skeleton + seam) or major if the auth dependency removal changes a public export, decided in ADR; `components` minor (examples subpath, JSDoc tags); `cli` minor; `motion`, `tokens` minor (additive exports). Every published change has a changeset.

---

## 11. Decisions made and questions for the owner

### Decisions (made by the architect; reverse via ADR only)

| ID | Decision | Rejected alternative and why |
|---|---|---|
| D-1 | Keep `facet-sandbox`, rework to lab kit v3 with `/core` `/react` `/live`. | *Delete it*: the parser/sanitizer and the stage/inspector must live somewhere shared; *new `facet-lab` package*: adds a package for no gain, and the name/home already exist. |
| D-2 | New **private** `registry` workspace package, not published. | *Published registry*: premature API surface; *generate into each app*: re-creates drift. |
| D-3 | Registry is JSON + typed accessors. | *TS-only*: unreadable by Intel/other tooling. |
| D-4 | Docs authored in Markdown + directives, compiled to `DocsBlock[]`. | *MDX*: bundler coupling and not serialisable; *keep TS literals*: hostile to authors and to scale. |
| D-5 | Examples colocated with components in `*.examples.tsx`, published under a separate subpath. | *Examples in apps*: reintroduces duplication and drift; *in the registry package*: severs them from the code they describe. |
| D-6 | Package metadata in a `facet` field in each `package.json`. | *Scripts hold the metadata* (today): F9. |
| D-7 | `layout` drops its `auth` dependency in favour of an injected `session` seam. | *Keep the dependency*: fails L1. |
| D-8 | Docs engine drops `auth`/`sdk`; router injected; facet gallery data leaves the package. | *Leave as is*: fails L3. |
| D-9 | `LayoutSkeleton` lives in `layout` (`/skeleton`), kinds/options derived from real props, parity-tested. | *Skeleton in the playground app*: violates L2 and drifts. |
| D-10 | Work on branch `surface-rebuild`; apps keep their package names; cutover in Phase 9. | *Delete apps first*: leaves CI/deploys red for the whole rebuild. |

### Questions that need the owner (the plan proceeds with the stated default)

| ID | Question | Default if unanswered |
|---|---|---|
| O-1 | Do you want the **"edit as code" live editor** as a user-facing playground feature, or controls only? | Keep as a secondary tab (the interpreter already exists and must be single-sourced anyway). |
| O-2 | Which landing routes besides `/` are truly needed? Today there are Pricing, Security, About, Ecosystem, Feedback, Dashboard demo. Is there a real pricing/commercial story? | `/` plus `/feedback`; Ecosystem/Security/About content becomes docs pages; Pricing removed. |
| O-3 | Is a `facet` namespace/brand fine for the `package.json` metadata field? | Yes. |
| O-4 | Should consumers (outside Arcevocirqle) be able to build their own playground with `facet registry build`? | Yes, designed for it, shipped after Phase 10 unless prioritised. |
| O-5 | The `.agent/` convention (local-only dashboards) from AGENTS.md: keep? | Keep; plan documents live in `docs/rebuild/` (tracked), dashboards in `.agent/`. |

## 12. Risks

| Risk | Mitigation |
|---|---|
| TS-compiler-based control inference is slow or brittle on 113 components with Radix generics. | Inference is a build step, cached; unsupported types are omitted; overrides exist; measure in Phase 3 spike and set a budget (< 60 s cold). |
| Splitting `docs` breaks external users of the published package. | Major bump; changelog with migration notes; confirm real external usage on npm in Phase 0. |
| Example files bloat component bundles. | Separate subpath, never re-exported from the main barrel; `check:examples` enforces; size check in Phase 10. |
| Agents re-introduce hard-coding under time pressure. | Gates (§9) run in CI and in the agent prompt's definition of done; reviews check Laws, not just tests. |
| Skeleton drifts from real layouts. | `data-region` parity gate. |
| Scope creep into visual polish before the design lock. | Phase 4 sign-off is a hard precondition for app UI work. |
