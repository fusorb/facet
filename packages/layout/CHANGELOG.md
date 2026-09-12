# @fusorb/facet-layout

## 1.4.2

### Patch Changes

- 1bf5de5: Fix sidebar accordion (singleOpen) collapse, auto-infer ResizableHandle orientation, and export brand icons from the components barrel.

  - facet-components: `ResizableHandle` now inherits `orientation` from its parent
    `ResizablePanelGroup` via context (explicit prop still overrides). Exported
    individual brand icon components (`GithubIcon`, `LinkedinIcon`, etc.) from the
    barrel for direct import. Added `ChevronsUp`/`ChevronsDown` to the eagerly-loaded
    semantic icon maps so they render synchronously.
  - facet-layout: restored explicit-collapse-wins rule in `NavSectionRenderer.open`
    so active sections can be collapsed (fixes accordion/singleOpen). Auto-open-on-
    navigation moved to a `useEffect` keyed on route change. Added `asPath` to
    `RouterAdapter` interface and default adapter.

- cfabae9: Add an ESM `"use client"` banner to the `dist` builds of `@fusorb/facet-components`,
  `@fusorb/facet-auth`, and `@fusorb/facet-layout`.

  Next.js 15+/16 App Router builds React Server Components with the `react-server`
  condition, which resolves `react-hook-form` to `react-server.esm.mjs` - an entry that
  does not export `Controller`, `FormProvider`, `useForm`, or `useFormContext`. Importing
  any of these packages from a Server Component therefore failed the build with
  `Export Controller/FormProvider/useForm/useFormContext doesn't exist in target module`.

  The banner marks each package's module graph as a client boundary, so those imports
  resolve to the normal client entry under RSC. The directive is a no-op for non-RSC
  consumers (Vite/CRA/Rolldown ignore it), so this is a transparent fix.

  Consumers hitting the Next 16 error pick this up on the next published release.

- Updated dependencies [205d83b]
- Updated dependencies [205d83b]
- Updated dependencies [1bf5de5]
- Updated dependencies [205d83b]
- Updated dependencies [b1da261]
- Updated dependencies [205d83b]
- Updated dependencies [1bf5de5]
- Updated dependencies [1bf5de5]
- Updated dependencies [cfabae9]
  - @fusorb/facet-auth@1.2.3
  - @fusorb/facet-components@1.11.0

## 1.4.1

### Patch Changes

- Updated dependencies [b7accc3]
  - @fusorb/facet-components@1.10.0
  - @fusorb/facet-auth@1.2.2

## 1.4.0

### Minor Changes

- 18547dc: feat(components): MailInput with domain suggestions + Dissolve animation family

  ### @fusorb/facet-components (minor)
  - **MailInput** -- email input with a domain-suggestion dropdown. Typing `@` (or
    continuing after it) surfaces common provider domains (gmail.com,
    icloud.com, etc.); click or press Enter to auto-complete. Works controlled
    (RHF/Shadcn forms) and uncontrolled.
  - **DissolveText** -- 10th text animation (char-by-char dissolve-in). SSR-safe.
  - **DissolveButton** -- micro-interaction that emits a particle-dissolve burst
    on click. SSR-safe.
  - **DissolveCard** -- card-surface animation that dissolves in on mount with a
    subtle hover overlay.
  - **AnimatedButton** -- new `animation="dissolve"` variant.
  - **Footer** -- new `variant="streamline"` with `steps` (how-it-works grid) and
    `notices` (research notices, cookie callouts) slots; new `FooterStep` type.
  - **FaqSection** -- `type="multiple"|"single"` accordion behavior + `children`
    slot for footer strips.
  - **Roadmap** -- `maxHeight` prop for scrollable timeline layouts.
  - **BillingPage / PlanCta** -- CTA now renders a real `<a>` (via `Button
asChild`) for accessible, right/middle-clickable links; `renderButton`
    override preserved.
  - New `facet-dissolve` CSS keyframe in tokens (shared by DissolveText,
    DissolveButton, DissolveCard, AnimatedButton dissolve variant).

  ### @fusorb/facet-layout (minor)
  - **Sidebar** -- new `singleOpen` (accordion) prop; `Collapse all` / `Expand
all` toolbar buttons; active section scrolls into view.
  - **ConsoleLayout** -- passes `singleOpen` through to the sidebar (both docked
    and mobile Sheet).
  - **LayoutContext** -- new `openSection`, `collapseAll`, `expandAll` methods
    (all persisted to localStorage alongside the existing `toggleSection`).
  - The docs layout opts into `singleOpen`.

  ### @fusorb/facet-tokens (patch)
  - New `--animate-facet-dissolve` keyframe (500ms ease-out, both fill-mode).

  ### @fusorb/facet-docs (patch)
  - Docs manifest regenerated: `mail-input` added (inputs category);
    `typewriter-text` now documented as tabs on the text-animations page
    instead of a standalone slug.
  - Animation sidebar is now a flat list (removed nested Text/Cards parents).
  - Variant previews + usage snippets for DissolveText, DissolveButton,
    DissolveCard, AnimatedButton dissolve, and the Footer streamline variant;
    TypewriterText preview moved to the text-animations tab set.
  - `check-docs-inventory` drift gate accounts for `typewriter-text`
    (documented elsewhere), `gen-docs-manifest` excludes it from generation.

### Patch Changes

- Updated dependencies [18547dc]
  - @fusorb/facet-components@1.9.0
  - @fusorb/facet-auth@1.2.1

## 1.3.4

### Patch Changes

- Updated dependencies [9360e93]
- Updated dependencies [9360e93]
- Updated dependencies [8d922f7]
- Updated dependencies [2236aa8]
- Updated dependencies [78b6543]
  - @fusorb/facet-auth@1.2.0
  - @fusorb/facet-components@1.8.0

## 1.3.3

### Patch Changes

- Updated dependencies [d2b43d0]
  - @fusorb/facet-components@1.7.0
  - @fusorb/facet-auth@1.1.6

## 1.3.2

### Patch Changes

- Updated dependencies [8a7aef3]
  - @fusorb/facet-components@1.6.0
  - @fusorb/facet-auth@1.1.5

## 1.3.1

### Patch Changes

- @fusorb/facet-auth@1.1.4

## 1.3.0

### Minor Changes

- 3554506: Animated surfaces + page components + full location dataset.

  Components:
  - Button gains `shine` (hover sweep) and `ripple` (click ink burst)
    variants plus a `magnetic` prop (button gravitates toward the cursor).
  - Card gains `tilt` (3D cursor-follow), `gradient-border`, `zoom`
    (image hover), and `flip` (state-driven 3D reveal: flips on hover,
    returns on mouse-out, click toggles for touch; `flipDirection`
    horizontal/vertical; `CardFlipBack` back-face component).
  - New `animated` module: Spotlight (cursor glow), Aurora (conic
    gradient motion), Beams (sweeping light), GridPattern (masked grid),
    SparkleButton (click sparkle burst). Zero-dependency, backed by new
    facet-* keyframes in the tokens tailwind.css.
  - New `Footer` (config-driven site footer: brand, link columns,
    socials, bottom links, legal, bottomBar override) and `FeedbackPage`
    (ready-to-use feedback/contact page: mailto form, config channels,
    form override).
  - `SelectSearch` added to the Select component: a sticky search input
    that stays pinned while the option list scrolls. The LocationPicker's
    searchable selects use it (Country/State/LGA type-to-filter).
  - LocationPicker: DEFAULT_COUNTRIES + DEFAULT_REGIONS regenerated from
    the dr5hn countries-states dataset (ODbL) - 168 countries, ~3,600
    states/regions (was 16). Nigeria's full 774-LGA layer preserved.
    Dynamic region labels (state/county/province/governorate/emirate)
    resolve per country.

  Layout:
  - Topbar + ConsoleLayout gain a `themeToggle` prop that renders the
    built-in ThemeToggle (requires a ThemeProvider ancestor), so apps no
    longer hand-wire theme switching.
  - AuthLayout default brand panel is theme-token + config driven (no
    hardcoded Arcevo colors or footer text); `brand.footerText` and
    `brandPanel`/`brandPanelClassName` cover customization.

  Docs:
  - New dedicated "Pages" section (sidebar + /pages route) for full-page
    components (FeedbackPage, Footer) with live previews, usage, and
    customization docs. New page components land there automatically.
  - Card variants (tilt/gradient-border/zoom/flip) + SelectSearch +
    animated surfaces documented with usage snippets.

### Patch Changes

- Updated dependencies [3554506]
  - @fusorb/facet-components@1.5.0
  - @fusorb/facet-auth@1.1.3

## 1.2.1

### Patch Changes

- Updated dependencies
  - @fusorb/facet-components@1.4.0
  - @fusorb/facet-auth@1.1.2

## 1.2.0

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
  - `facet docs init` UX fixes: "Decide for me" now skips the q prompts
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

### Patch Changes

- 251a0e4: fix: alert success/warning colors, mobile table overflow, auth docs cleanup

  - components: Alert success and warning variants now use their semantic
    text colors (text-success green, text-warning amber) matching the
    destructive variant, instead of text-foreground. Added an alert test.
  - layout: the ConsoleLayout main area gets min-w-0 so wide tables scroll
    inside their own overflow-x-auto container instead of overflowing the
    page on mobile.
  - docs: remove the /auth/forms page (its LoginForm demo rendered a blank
    page) and the redundant /auth/layouts page (covered by the Ecosystem
    Layout page). Cleaned up the login-form manifest entry, variant, and
    usage. Fixed stale docs claims: 52 -> 57 components, added facet-cli to
    the package list, corrected the publishing note (CI is validation-only)
    and the fintechAuthPreset -> fintechPreset snippet name.

- 2dae8e2: fix: mobile overflow, contained layout docs, settings menu cleanup

  - layout: responsive `p-4 md:p-8` main padding, `px-4 md:px-6` topbar,
    and a `w-40 sm:w-64` search trigger so the docs shell fits phones.
  - docs: the /layout page documents full app shells code-first (their
    fixed-position sidebars escaped the docs shell); standalone Sidebar +
    Topbar and pill Navbar keep live previews.
  - docs: settings gear no longer duplicates the theme toggle (it has its
    own icon); it now shows ecosystem links + a Ctrl+K search hint.
  - docs: accordion previews now show 3 items so spacing consistency is
    visible; Docs Package + Layout pages moved under the Ecosystem section.
  - apps/docs + apps/landing vercel.json SPA-fallback rewrites fix 404s on
    deep-route refresh.

- Updated dependencies [251a0e4]
- Updated dependencies [865bf7e]
- Updated dependencies [69c1fec]
- Updated dependencies [b878bfd]
- Updated dependencies [6bb55a2]
  - @fusorb/facet-components@1.3.0
  - @fusorb/facet-auth@1.1.1

## 1.1.1

### Patch Changes

- Updated dependencies [3de0e04]
- Updated dependencies [568497d]
  - @fusorb/facet-components@1.2.0
  - @fusorb/facet-auth@1.1.0
