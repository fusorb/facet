# @fusorb/facet-cli

## 1.1.0

### Minor Changes

- 5dcbb02: # Ready-to-use pages: Stepper, KanbanBoard, ChangelogList

  Three new ready-to-use surfaces in `@fusorb/facet-components`:

  - **`Stepper`** — headless-first wizard primitive (`useStepper` hook +
    `Stepper` / `StepperNav` / `StepperPanel` / `StepperFooter` renderers).
    Per-step `validate` gating, controlled + uncontrolled modes, loop
    support, onStepChange callback. The headless split is intentional: the
    hook owns the state so the rendering layer can be re-implemented for
    React Native later without redesigning the logic. Closes the Phase 1
    roadmap item: "Generic <Stepper> with per-step validation gating".

  - **`KanbanBoard`** — drop-in kanban with native HTML5 drag-and-drop,
    `useKanban` hook (controlled + uncontrolled), per-column WIP limits,
    add/remove cards, add/remove columns. Every project tracker is a
    kanban; consumers shouldn't wire 200 lines of DnD + state.

  - **`ChangelogList`** — vertical release-log timeline with version, date,
    kind-grouped bullets (added / changed / fixed / deprecated / removed /
    security), optional filter row, optional pre-release tag. Every docs
    site needs one; nobody should hand-style it again.

  ## Wired into the auth package
  - `<SignUp>` now renders the live `PasswordStrengthMeter` under the
    password field by default. Opt out with `showPasswordStrength={false}`.
  - `<ResetPasswordForm>` got the same treatment (`showPasswordStrength`).
  - Existing tests + types stay backward-compatible.

  ## Wired into the docs engine
  - New `changelog` block type for `<DocsApp>` content pages. Pass
    `{ type: "changelog", releases: [...] }` and the engine renders the
    same `ChangelogList` from facet-components.
  - `facet docs init` (product-docs template) now scaffolds a populated
    `/changelog` page so consumers ship with a working release log on day
    one.

  ## Landing site
  - New home section: `ChangelogSection` shows the live facet release log
    via the same `ChangelogList` component, with the filter row.
  - Ecosystem page now lists every published package (Components, Auth,
    Layout, Tokens added alongside Docs, CLI, Emails, SDK, Store, and the
    Stack-Agnosticism concept entry).
  - Three new dedicated pages that demo ready-to-use surfaces end-to-end:
    `/pricing` (BillingPage + BillingPageTable + BillingPageFreemium),
    `/security` (AccountSettingsPanel + SecuritySectionCard + ApiKeyManager
    - TwoFactorSetupPanel + PasswordStrengthMeter), `/dashboard-demo`
      (PageHeader + StatCard + ActivityFeed + BorderBeamCard + SpotlightCard).

### Patch Changes

- db287b3: De-brand and production hardening:

  - tokens: brand color changed from indigo to Electric Cyan; new facet animation
    keyframes (overlay-in/out, fade-up, chart-fadeIn/draw); new CSS variables
    (elevation, hero-glow); dist CSS minified via esbuild (zero API change,
    smaller consumer payloads)
  - components: changelog-list pre-release badge uses the semantic `warning` token instead of hardcoded amber classes
  - sdk: docs and test fixtures neutralized (`auth.arcevo.dev` → `auth.example.dev`)
  - emails: default brand color is now a neutral slate instead of indigo
  - cli: emails generator default matches the new neutral emails default
  - auth: package metadata neutralized (description, keywords, homepage removed "ArcevoCirqle")
  - layout: package metadata neutralized (description, keywords, homepage)
  - store: package keywords updated (`arc-id` → `SovGrant`); homepage neutralized

## 1.0.0

### Major Changes

- 43ccd14: Bump CLI and store to stable 1.0.0. The store handles auth-critical token-refresh
  state consumed by SovGrant in production, so 0.1.0 (alpha) stability is no longer
  acceptable. The CLI is the primary developer tool and all other packages are
  already 1.x - aligning both to 1.0.0 signals release-readiness and removes
  pre-release confusion. Per the handbook rule: "anything release-ready should be
  at 1.0.0".

### Minor Changes

- b1da261: Add 5 new composable UI components: AspectRatio, Carousel, Drawer,
  InputGroup, Resizable. Also fix Navbar hamburger (X-icon toggle +
  outside-click close) and register new bundled deps in facet-cli.

  Carousel: add <CarouselDots> pagination component (uses context API, no extra deps);
  update docs preview with dots + loop. Add carousel-vertical variant to docs.
  Marquee: add composable `variant` prop ("loop" | "strip"); strip variant
  defaults to no pause-on-hover + dedicated className. Add marquee-strip variant to docs.
  Resizable: docs preview now shows both horizontal and vertical orientations.

  CLI enhancements:
  - `facet clean -y` now auto-runs the remove command instead of just printing it
  - Auto-update check on CLI startup (pnpm-style notification box, 24h cache, CI skip, --no-update-check)
  - `facet self-update`: updates the globally-installed facet-cli
  - `facet install <name>`: installs a facet package by shorthand or full name
    (full: `facet install @fusorb/facet-layout`, shorthand: `facet install layout`)
    Supports the scoped-dropped alias `facet-cli` -> `@fusorb/facet-cli` (so any
    `facet-X` alias resolves), and `-g`/`--global` to install globally, e.g.
    `facet install -g facet-cli` runs `npm i -g @fusorb/facet-cli@latest`.
  - `facet copy <ComponentName>`: copies a component into your source (shadcn-style) only
    (passing a package name prints a redirect hint to `facet install`)
  - `facet latest`: shows latest published versions of all facet packages
  - `facet --log`: global verbose flag for detailed command output

  SDK: add `OAuthSdk.updateClient(clientId, data)` for full OAuth-client
  CRUD (PATCH `/oauth/clients/:clientId`); add `IssueCredentialParams` interface.

### Patch Changes

- 205d83b: Add a 3s fetch timeout to `resolveFacetVersions` and `discoverFacetPackages` so the CLI never hangs on an unreachable or slow npm registry. Add a global `testTimeout: 15000` in the CLI vitest config to absorb slow CI and DTS parsing overhead.

  - cli: `resolveFacetVersions()` now uses an `AbortController` with a 3s timeout (was unbounded); `discoverFacetPackages()` timeout reduced from 5s to 3s.
  - cli: Add `LUCIDE_ALIASES` entry `alert-circle → circle-alert` so the deprecated lucide name still resolves in generated icon registries.
  - components: Add `alert-circle`, `external-link`, `globe`, and `store` to the `@fusorb/facet-components/light` `LightIcon` set (used by the landing and docs sites).

## 0.8.0

### Minor Changes

- 53ca15c: feat(cli): consumer templates + `--use-template` merge

  New `facet templates` command group discovers and inspects template
  directories in a consumer repo (under `./templates/`, `./docs/templates/`,
  or `./emails/templates/`, optionally described by a `template.json`
  manifest):

  - `facet templates list` - list template dirs found in the repo.
  - `facet templates describe <name>` - show a template's manifest and files.

  `facet docs init --use-template <name>` and
  `facet emails init --use-template <name>` merge the named template over the
  generated scaffold. The merge is never destructive by default:

  - new paths are copied in,
  - identical existing files are skipped,
  - `package.json` is merged with the consumer's fields winning,
  - code files containing a `// @facet-merge` marker get the marker's
    contents appended before the file's final `}` (an opt-in way to merge the
    implementation in),
  - any other existing file is left untouched (reported as a conflict).

  Also: the docs starters are now template-aware. `--template api-reference`
  and `--template product-docs` emit starter pages that match the chosen kind
  (endpoints/types pages, or getting-started/guides/faq) instead of the same
  generic Overview page for every kind.

## 0.7.0

### Minor Changes

- e25905c: feat(cli): dynamically discover facet packages + auto-apply updates

  - `facet pkg` / `facet doctor` / `facet update` now discover `@fusorb/facet-*` packages dynamically from the npm registry scope (`/-/v1/search?text=scope:arcevo`, 5s timeout, falls back to the static baseline) merged with whatever the consumer declares. A newly published facet package (e.g. `@fusorb/facet-emails`) shows up without a CLI release.
  - `facet update` now applies updates by default (confirmation prompt unless `-y`), with `--dry-run` to only print the command. `facet up` remains the always-apply variant.

## 0.6.0

### Minor Changes

- 76b902c: feat: email template primitives (Section/Row/Column, variants, code grid) + `facet emails init`

  **@fusorb/facet-emails**

  - New `EmailSection` / `EmailRow` / `EmailColumn` primitives (table-based containers matching react-email Section/Row/Column), so consumers can build grid/detail layouts.
  - `EmailSecurityNotice` gains a `variant` prop (`warning` | `danger` | `info`) and a children/callout form in addition to the IP/device table form.
  - `EmailCodeBlock` now supports a `codes: string[]` + `columns: 1 | 2` grid path for recovery-code style emails, alongside the existing single-code path.
  - All primitives continue to accept inline `style` objects and inherit the `brand` tokens (primary, background, surface, text, muted, fontFamily, radius, brandName) passed to `renderEmail`, so consumers can fully re-brand without forking.

  **@fusorb/facet-cli**

  - New `facet emails init` command that detects the consumer's mail setup (react-email, mjml, nodemailer, resend, sendgrid, SES, postmark) from the manifests and either:
    - offers a migration path when an existing renderer is found, or
    - scaffolds a fresh `emails/` dir (brand tokens, layout wrapper, template registry with a sample welcome template, dev preview server, provider `send.ts` for resend/nodemailer, and `.env.example`).
  - Auto-installs `@fusorb/facet-emails` plus the provider SDK via the detected package manager (fails soft printing the exact command), and prints the setup guide (provider keys, preview URL, how to send).
  - Flags: `-y`, `--framework`, `--migrate` / `--fresh`, `--provider resend|nodemailer|none`, `--location`, `--name`.

  **Consumer validation**

  - SovGrant's mail system (13 templates, components, engine, preview route) now renders through `@fusorb/facet-emails` with ArcID's own design tokens mapped into the brand option; all templates verified rendering valid HTML + plain text with no `undefined`. react-email is removed from SovGrant; resend stays for delivery.

## 0.5.0

### Minor Changes

- 8a7aef3: feat(cli): add `facet icons generate`

  New command that scans the consumer repo for icon call sites and emits a
  slim generated registry (`icons.generated.tsx`) with direct lucide
  imports for exactly the icons used - tree-shaken, with legacy-name
  mapping and unresolved-name reporting. Includes `--path` and `-y` flags.

  Adds a `lucide-react` dependency for the catalog.

## 0.4.0

### Minor Changes

- 8595d91: feat(cli): facet docs scan -- read the repo and draft documentation

  `facet docs scan` inspects the current repo and drafts a documentation
  layer for review:

  - Detects the stack: package manager, monorepo layout, framework
    (next/remix/react-vite/plain-js/python), language, styling, and
    @fusorb/facet-* usage.
  - Detects the API surface: Fastify + @fastify/swagger (dynamic mode,
    OpenAPI info + a bounded route inventory from route files) or a
    committed openapi.json/swagger.json.
  - Detects existing docs: README, docs/ tree, planning files.
  - Drafts pages (Overview, Getting Started, API Reference with a
    method/path/schema table per route group) + a docs config for the
    facet-docs engine, plus a normalized openapi.json.

  Non-destructive: refuses to overwrite existing files without --yes.
  Then run `facet docs init` to mount the drafted site.

## 0.3.1

### Patch Changes

- 9599bfe: fix(cli): facet up/pkg now detect installed versions correctly

  `readInstalledVersion` built paths ending at the package directory but
  read them as files, so `fs.readFileSync` threw EISDIR and `installed`
  always showed `-` -- which made `facet up` report "All up to date" even
  when updates existed (e.g. auth 1.1.1 vs latest 1.1.3). The path now
  appends `package.json`, so `facet pkg` shows real installed versions and
  `facet up` offers the correct updates. Regression tests added.

## 0.3.0

### Minor Changes

- feat(cli): add clean/scripts/prep/up commands + doctor dep detection + alias-aware imports; layout: full/rail sidebar + verified section behavior

  CLI -- new commands for consumer-safety and repo hygiene:

  - `facet clean`: detects dependencies already bundled by @fusorb/facet-components
    (radix primitives, lucide-react, cmdk, input-otp, qrcode.react, react-hook-form,
    sonner, class-variance-authority, clsx, tailwind-merge), removes them from the
    consumer's manifests, rewrites shadcn/ui-style imports (and direct radix/lucide
    imports) to `@fusorb/facet-components`, and deletes dead local `ui/` components.
    Safe by default: `--dry-run` shows the plan, prompts for confirmation (or `-y`),
    and prints the exact remove command for the detected package manager instead of
    auto-running it.
  - `facet scripts`: adds useful npm scripts (docs:dev/build/preview, quality
    lint/typecheck/test/build, facet:doctor/clean/prep) to package.json, never
    overwriting scripts the consumer already has.
  - `facet prep`: pre-go-live sync -- checks facet deps are current (pkg), audits
    repo health (doctor), and runs the consumer's own typecheck/build/test when the
    scripts exist. Non-destructive.
  - `facet up`: applies the facet package updates (non-dry-run sibling of
    `facet update`) using the detected package manager.
  - `facet doctor` now also reports dependencies that @fusorb/facet-components
    already bundles and suggests `facet clean`.
  - `facet docs init` UX fixes: "Decide for me" now skips the question prompts
    (it previously asked everything then discarded the answers); the summary says
    where files actually land per framework (Next: src/app/docs + src/lib/docs;
    Remix: app/routes/docs + src/lib/docs); and it installs the facet packages
    automatically at the resolved latest versions instead of printing the command.
  - Alias-aware imports: the generators read tsconfig/jsconfig `paths` (and common
    framework aliases like `@/`, `~/`) and emit a configured alias when one fits,
    else a correct relative path. Fixes generated route imports that pointed at
    the wrong location.

  Layout -- ConsoleLayout keeps `mode="full"` and `mode="rail"` only (the overlay
  variant is removed; it was never released and did not display as intended). The
  sidebar section expand/collapse + auto-open-active-section behavior is now
  covered by tests, and the mobile Sheet close behavior is verified.

- 502a54c: feat(cli): add pkg/doctor/update commands; -y shorthand; help docs link

  New commands for inspecting and maintaining a consumer's facet setup:

  - `facet pkg`: lists every published @fusorb/facet-* package with the latest
    registry version, the declared range in the consumer's manifests, and the
    resolved installed version. Flags `(update available)` when outdated.
  - `facet doctor`: audits the current repo (package manager, monorepo layout,
    facet usage) and suggests best practices (wire facet-tokens when components
    are used without it, swap workspace:* ranges before publishing, run
    `facet update` when packages are stale).
  - `facet update`: lists outdated facet packages and prints the exact install
    command for the detected package manager, workspace-aware.

  These are the foundation of a shared command core: the registry resolver,
  monorepo/workspace detection, and dependency scanning live in reusable lib
  modules so future product CLIs (e.g. an arcid CLI) can build on them.

  Also: `-y` shorthand for `--yes` on `facet docs init`, and a docs link
  (https://docs.facet.arcevocirqle.com.ng/cli) in `facet --help`.

## 0.2.0

### Minor Changes

- 79ec07a: - Adds `facet docs init`: an interactive wizard that scaffolds a docs site
  in any repo. The wizard opens with a **"Decide for me"** option -- detect
  my stack and use the best defaults (also available as `--yes`) -- or lets
  the consumer walk through each choice. Asks for the docs site name
  (blank falls back to the default `docs`), location (`.`, `docs/`, or
  `src/docs/` -- root recommended), language, framework (React+Vite,
  Next.js, Remix, plain JS, Python), and template kind.
  - Detects the consumer's styling setup (facet tokens / Tailwind / plain
    CSS) and recommends wiring `@fusorb/facet-tokens` so consumers get the
    Alpha Palette theming without restyling every component.
  - Adds a **barrel export decision** (`--barrel auto|always|never`, or a
    wizard prompt): `auto` creates an `index.ts` when it fits the layout,
    `always` forces one, `never` leaves the consumer's tree untouched.
  - Adds **per-framework generators**:
    - **React+Vite**: a thin consumer app exactly like facet's own `apps/docs`
      (config + pages registry + app shell), which doubles as a reference
      implementation.
    - **Next.js**: a real `src/app/docs` route (`"use client"` rendering
      `DocsApp`) plus `src/lib/docs/config` and `src/lib/docs/pages` -- the
      docs site mounts at `/docs` in an existing Next app. Next scaffolds
      get `next`/`react` deps and `docs:dev`/`docs:build` scripts.
    - **Remix**: a real `app/routes/docs` route rendering `DocsApp` plus
      `src/lib/docs/config` and `src/lib/docs/pages`, with
      `@remix-run/react` deps and `docs:dev`/`docs:build` scripts.
    - **Plain JS**: a framework-agnostic `pages` registry + markdown content
      pipeline with no React shell.
    - **Python**: a `docs_pipeline.py` markdown → `pages.json` compiler plus
      a starter registry, so a Python repo can own its docs content in
      markdown and hand the JSON to any React host for rendering.
  - Adds `facet add <component>`: a shadcn-style copy-into-source workflow,
    with a recommendation to import from `@fusorb/facet-components` instead.
    Placement is flexible: by default it decides based on what the consumer
    already has (flat into the components root when a barrel exists, else a
    clean `facet/` subdirectory), with `--dir`, `--ui-dir`, `--flat`,
    `--no-barrel`, and `--barrel` for explicit control. An existing barrel
    is merged (never overwritten) so the consumer's own exports stay intact,
    and the generated subdirectory barrel stays in sync across adds.
  - Every wizard prompt and CLI option carries a description of what it does
    or what the choice represents, so consumers know what each step will
    generate before committing.
