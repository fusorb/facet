# facet: Episodic Canon
## (what broke, how we fixed it, what survived) – local tracker

> Purpose: a living narrative of how this repo reached a working,
> automated state. Written in `.agent/` (gitignored, local-only) so
> the tracker reflects process without polluting the published tree.
> Canonical facts live in README/CLAUDE.md; this file lives in the
> head between sessions.
>
> Mantra: evolution is the only option.
> Rule chain: manual → semi-automated → automated. If a fix is
> still manual after a release, it is not done.

================================================================================

EP 01 -- The Great Storybook Purge
--------------------------------------------------------------------------------
What broke:
  Three P0 breakages cascaded through CI at once:
  (a) `storiesDir` pointed at a deleted fixture dir; (b) `@storybook/react`
  was imported but missing from root devDeps; (c) root `tsconfig.json`
  referenced packages that no longer had Storybook configs. CI refused to
  typecheck, and every PR red-flagged.

How we fixed it:
  Storybook was treated as a dependency, not a feature. We purged it entirely:
  deleted 48 story fixtures, removed `@storybook/react-vite` from root devDeps,
  and stopped pretending the gallery needed a story renderer. The docs
  inventory became a barrel+manifest drift gate instead --
  `node scripts/check-docs-inventory.mjs` now verifies every `ui/` component
  is barrel-exported AND present in the docs manifest. No stories required.

What survived:
  The repo never needed Storybook to ship. It only needed a source-of-truth
  contract between barrel exports and the docs gallery. One shell script does
  what a whole build-time tool did.

State: automated. `pnpm check:docs` runs the gate in CI.

Lesson: don't retrofit a showcase tool onto a publishable library. Verify the
contract (barrel ↔ manifest) instead of rendering stories.

================================================================================

EP 02 -- The Count That Wouldn't Sync
--------------------------------------------------------------------------------
What broke:
  A stale sweep from 68 → 85 styled Radix components landed in CLAUDE.md,
  README, and `packages/components/package.json` -- but `apps/docs/src/pages.ts`
  was missed, still printing "68 styled UI components" in the docs page list.
  A consumer would have read the docs and seen a count that contradicted the
  README. The canonical number existed in three places but not four.

How we fixed it:
  The 2026-08-03 sweep was reopened as a tracked todo. After diffing all
  "68" / "84" references, the single holdout was found in `pages.ts`. One-line
  patch, committed, pushed.

State: automated (the drift gate in EP 01 now catches barrel/manifest drift,
but not prose counts -- prose counts still drift; the cure is fewer prose
counts, not a linter for them).

Lesson: a number that lives in prose is a bug that waits to happen. Counts
belong in one place and should be derived, not repeated.

================================================================================

EP 03 -- Docs Inventory Drift Gate
--------------------------------------------------------------------------------
What broke:
  Components existed in `packages/components/src/ui/` but were missing from
  either the barrel export or the docs manifest. The docs gallery and the
  published package silently diverged. No test caught it because there was no
  test -- only a hope that people kept them in sync by hand.

How we fixed it:
  `scripts/check-docs-inventory.mjs` compares the set of files in `src/ui/`
  against the barrel (`src/index.ts`) and the docs manifest
  (`packages/docs/src/manifest.ts`). Missing in either = fail. Wired into
  `pnpm check:docs` and the CI gate.

State: automated. CI fails open if a component is unexported or undocumented.

Lesson: treat "is this component actually shipped and documented?" as a
build invariant, not a checklist item.

================================================================================

EP 04 -- The Billing Interval Trap
--------------------------------------------------------------------------------
What broke:
  In the Pricing/Billing demo, clicking "yearly" left "monthly" visually
  active. Prices stayed "fixed" (ignored the selected tab entirely). The
  Quarterly option the docs referenced didn't exist as a tab.

Root cause:
  `IntervalToggle` read the immutable `config.interval` for active styling
  instead of the parent's local `interval` state. The price was hardcoded in
  the table rather than derived from the selected interval.

How we fixed it:
  - `IntervalToggle` now receives the parent's local `interval` state as a
    prop (read from state, not config).
  - Added `BillingInterval += "quarterly"` to `billing-types.ts`.
  - Added `planPriceForInterval(plan, interval)`: explicit `prices[]` wins,
    then `%` discounts, then the default (yearly = 2 months free).
  - Added `planPriceLabel(plan, currency, interval)` + `intervalMonths`.
  - `PlanHeader` + `BillingPageTable` recompute price per interval and honor
    `config.currency`. Nothing is hardcoded in the component anymore.
  - Mobile grid: `min-w-0 lg:min-w-[1152px]` so no horizontal scroll on
    small screens; 4-col scroll preserved on desktop.
  - Docs `usage.ts` + variants updated with `discounts` + quarterly.

State: semi-automated. The pricing math is now data-driven and tested
(`billing-types.test.ts`, 12/12). The test runs in a node-env vitest config
because the components pool (jsdom+CSS) hangs in-session on this box.

Lesson: any UI that "looks right" but ignores its own state is a lie the
component tells you. Drive display from a single source of truth, then test
the math, not the pixels.

================================================================================

EP 05 -- The Publish Auth Death Spiral
--------------------------------------------------------------------------------
What broke:
  The "Version Packages" CI job died with a 403 push error. Root cause was
  not a missing repo fetch -- it was `permissions: contents: write` absent from
  the version job, so `changesets/action@v1` could not create its branch.
  Separately, the `publish` job published nothing because `NPM_TOKEN` /
  `NODE_AUTH_TOKEN` were not exported as env in the job, so npm auth never
  resolved. Eight packages sat at the wrong version with stale `dist`.

How we fixed it:
  - Added `permissions: contents: write` to the `changeset` (version) job so
    the bot can push the "Version Packages" branch.
  - Exported `NPM_TOKEN` / `NODE_AUTH_TOKEN` into the `publish` job env.
  - The publish job now `needs: [ci]` (gate must pass) and runs
    `pnpm -r build` before `pnpm changeset publish`, so a stale/dirty tree
    is never shipped.

State: automated. CI versions → auto-PR → merge → CI publishes from a clean
checkout at HEAD. Local `pnpm changeset publish` is now a fallback, not the
primary path.

Lesson: a publish that requires a human at the terminal is a feature waiting
to be wrong. Wire the secret into the job env and let the gate enforce order.

================================================================================

EP 06 -- The Vercel Rolldown Meltdown
--------------------------------------------------------------------------------
What broke:
  Vercel deploys of `apps/docs` failed with a Rolldown resolution error: the
  app imported `@fusorb/facet-components` / `@fusorb/facet-docs`, but those
  packages' `dist/` didn't exist yet because the app's `buildCommand` ran
  before workspace deps were built.

Root cause:
  `vercel.json` `buildCommand` was `pnpm build`, which only built the app
  itself -- not its workspace dependencies. The packages resolved to unbuilt
  sources and Rolldown exploded.

How we fixed it:
  Changed each app's `vercel.json` `buildCommand` from `pnpm build` to
  `turbo run build --filter=<app>...` (and the landing analog). Turbo's
  `--filter` respects `^build` so `@fusorb/facet-components` and
  `@fusorb/facet-docs` build before the app that consumes them. Verified
  `turbo run build --filter=@fusorb/facet-docs-site...` exits 0 locally
  (7 pkgs) and `--filter=@fusorb/facet-landing...` (6 pkgs).

State: automated. Vercel now runs the full turbo build graph per app.

Lesson: in a workspace, "build my app" must mean "build my app AND what it
imports." Filter, don't recurse into the whole repo.

================================================================================

EP 07 -- The Dirty Tree Almost Shipped
--------------------------------------------------------------------------------
What broke:
  The local tracker claimed `@fusorb/facet-store@0.1.0` was published and
  README said "9 packages" -- but the working tree was a 64-entry mess of
  uncommitted refinements, version bumps, new components (`not-found.tsx`,
  the 85th), untracked `packages/store`, and 2 pending changesets. Nothing
  was published. The tracker had outrun reality (the classic stale-claim bug).

Root cause:
  A `changeset version` had been run locally (consuming `cli-templates.md`
  and `email-react-children-fix.md`) and bumped versions in the tree, but the
  result was never committed or published. The tracker/README were updated to
  match the *local* bumps, not the *published* state.

How we fixed it:
  - Committed the 29 modified files + new store package + `not-found.tsx` +
    billing test + the 2 pending changesets.
  - CI auto-created the "Version Packages" PR; merged it (`994bd28`).
  - CI `publish` job shipped the 8 packages (auth 1.2.2, cli 0.8.0,
    components 1.10.0, docs 1.4.6, emails 1.1.1, layout 1.4.1, store 0.1.0,
    tokens 1.1.4; sdk 1.1.0 already on npm, skipped).
  - Re-verified repo-wide typecheck clean.

State: automated + corrected. The release rule is now enforced by CI: clean
checkout, `pnpm -r build`, then publish. Local publish is a recovery path.

Lesson: the tracker is a claim, not a fact. After every release,
re-sync tracker/README to git tags -- never to local bumps.

================================================================================

EP 08 -- Crash Recovery & the Mail-Input Four
--------------------------------------------------------------------------------
What broke:
  Session resumed mid-edit on `packages/components/src/ui/mail-input.tsx`
  (an untracked, barrel-exported file). LSP diagnostics reported 4 errors:
  `currentValue` used as non-string, and `filteredDomains` possibly undefined.

How we fixed it:
  - Narrowed `currentValue` to `string`.
  - Guarded `filteredDomains` against `undefined`.
  - Wired `mail-input` into the docs gallery (`usage.ts`, `variants.tsx`,
    `previews.tsx`) and regenerated the docs manifest.
  - Integrity sweep: NUL-byte / truncation check across 24 edited files →
    0 corruption.

State: automated. The docs inventory gate (EP 03) now proves the wiring is
complete; the manifest regeneration is scripted.

Lesson: a crash mid-edit is only dangerous if the barrel and manifest are
not the source of truth for "what ships." When they are, the file is either
in or it is not -- no ambiguity.

================================================================================

EP 09 -- Router Coupling
--------------------------------------------------------------------------------
What broke:
  `layout/UserMenu` imported its own dropdown, duplicating
  `@fusorb/facet-components`. Worse, the layout shell was coupled to one
  router, so Next.js App Router, Remix, and React Router could not share it.

How we fixed it:
  - `layout/UserMenu` now uses `@fusorb/facet-components`' `DropdownMenu`
    (one dropdown, one implementation).
  - Introduced the `RouterAdapter` pattern (`layout/src/router.tsx`): an
    injectable adapter that each consumer provides for App Router / Remix /
    React Router. The shell owns no router.

State: automated. The adapter is the contract; the shell is router-agnostic.

Lesson: a shell that knows your router is a shell that you can't move between
apps. Inject the router, don't import it.

================================================================================

EP 10 -- The Manual → Semi → Auto Rule
--------------------------------------------------------------------------------
The spine of everything above. The repo evolved the same way a consumer
adopts it:

  MANUAL    -- a fix lives in someone's head or a not-yet-shared script.
              (Examples: Storybook fixtures hand-maintained; version bumps
              typed by a human into CLAUDE.md; "someone remembers to rebuild
              deps before the app".)

  SEMI-AUTOMATED -- the fix is codified and run on demand, but still requires
              a human trigger. (Examples: `check-docs-inventory.mjs` run by
              the developer before pushing; `pnpm -r build` typed manually;
              local `changeset publish`.)

  AUTOMATED -- the fix is wired into CI and fails the build or ships the
              package without human intervention. (Examples: CI runs the drift
              gate on every PR; CI auto-opens + versions + publishes after the
              gate passes; Vercel builds the full turbo graph per app.)

The line that matters: if a fix is still MANUAL after it's been released,
the release is a lie. Every episode above promoted one fix from MANUAL →
the next rung. None stayed manual.

State: automated. And still evolving -- the next consumer bug will become EP 11.

Lesson: evolution, not perfection. Ship the manual fix so you can measure it,
then automate the thing that hurt.

================================================================================
PHASE TWO -- THE CONSUMER LOOP
--------------------------------------------------------------------------------
The first cycle (EP 01–09) was internal: we found the bugs, we shipped the fix.
The second cycle is how it really ends: a consumer -- arc-id, the live consumer,
a downstream repo -- installs a published package, hits something we swore was
done, and reports it. Each episode below is a "we thought it was perfect"
moment that cracked open on a consumer's machine.

================================================================================

EP 11 -- The Consumer Who Said "Your Tokens Are Dark-Only"
--------------------------------------------------------------------------------
What broke:
   A downstream consumer dropped `@fusorb/facet-tokens` onto a subtree with
   `data-theme="light"` and half the palette went undefined. The complaint:
   "light theme is incomplete."

Root cause:
   The light-theme block existed, but 28 semantic tokens were defined only in
   the dark `:root` block. A presence-check ("is there a light selector?")
   passed; a per-token diff ("does every token exist in BOTH blocks?") failed.
   We had shipped a half-complete theme and called it done.

How we fixed it:
   Diffed the two `:root` blocks token-by-token; back-filled every missing
   semantic (success/warning, chart-1..5, sidebar-ring, radius scale,
   sub-brand-accent) and theme-independent token (alpha palette, font families)
   into the light block. Now every token shipped in BOTH.

State: automated. A future token-gate script can assert light↔dark parity.

Lesson: "done" is a claim until the consumer proves it. A theme that is half
dark-only is a bug that only a real consumer finds.

================================================================================

EP 12 -- The Regeneration That Needed Hand-Completion
--------------------------------------------------------------------------------
What broke:
   arc-id installed the new `facet icons generate` CLI, ran it, and got a
   generated `icons.ts`. But 8 icons were missing -- someone had to hand-write
   them. The generated file was supposed to be zero-maintenance.

Root cause:
   The CLI scanner saw only JSX props (`<Icon name="x">`) and `registerIcon`.
   It missed object-literal references (`icon: "whatsapp"` inside nav configs
   and feature grids, with and without `as const`), and it pulled in false
   positives from HTML `<meta name>` / `<link name>` attributes and
   `this.name = "..."` assignments.

How we fixed it:
   Extended the scanner to cover every legitimate reference pattern (object
   literals, `as const` variants), and added guards against the HTML/property
   false positives. Verified end-to-end against the live consumer: the
   hand-completed blocks disappeared, all 68 icons auto-resolved, zero
   unresolved names.

State: automated. Codegen must be reviewable-diff-clean against a live
consumer. If a consumer hand-edits generated output, the scanner is still
broken.

Lesson: a codegen tool is only finished when a real consumer drops it into a
real repo and the output needs zero hand-editing.

================================================================================

EP 13 -- When Brand Icons Vanished
--------------------------------------------------------------------------------
What broke:
   Social/OAuth buttons that relied on brand icons (Github, Linkedin,
   Instagram, Facebook) rendered nothing. lucide-react had deprecated them.

Root cause:
   The icon registry pointed at lucide exports that no longer resolve. Every
   deprecated brand icon turned into a null render.

How we fixed it:
   Remade each deprecated brand icon as an in-house inline SVG (matching
   lucide's stroke style: viewBox 24, stroke=currentColor, strokeWidth 2),
   registered them in the icon registry's defaults, and wired the icon-map
   generator to EXCLUDE every deprecated lucide icon -- not just the brands.

State: automated. The registry is now the single home for brand icons; the
generator refuses to emit deprecated glyphs.

Lesson: a dependency deprecation that the consumer feels as a missing icon is a
shared-package liability. Own the deprecated thing in-house.

================================================================================

EP 14 -- The Search That Wasn't Universal
--------------------------------------------------------------------------------
What broke:
   The LocationPicker had a sticky search inside its selects. Another consumer
   wanted the same search -- in a plain `<Select>`. They had to re-implement it.

Root cause:
   The sticky-search feature lived only inside the LocationPicker's private
   markup. It was proven in one composite but not promoted to the shared
   primitive underneath.

How we fixed it:
   Promoted sticky search into a first-class `SelectSearch` export on the
   Select component (drop it into `SelectContent` and any Select gets type-to-
   filter). Deduplicated the LocationPicker to use it.

State: automated. The select is the contract; the picker is a consumer.

Lesson: a feature proven in one composite should be generalized into the
shared primitive so every consumer inherits it for free.

================================================================================

EP 15 -- Live Preview Theater
--------------------------------------------------------------------------------
What broke:
   Docs pages for DateInput, PasswordInput, and InfiniteScroll showed
   "Live preview … not implemented yet" -- even though usage.ts, variants.tsx,
   and previews.tsx were all wired.

Root cause:
   Wiring the docs data (manifest, usage, variants) is not the same as wiring a
   demo component behind the preview switch. The slug existed; the renderer did
   not.

How we fixed it:
   Added real demo components for each missing slug and wired them into
   `previews.tsx`. (The QRCode `logo` variant was the same: implemented + unit
   tested, but still flagged because the live demo lacked a real brand mark +
   position switcher.)

State: automated. The canon rule is now "every shipped component must be a
rendered live demo on the docs site, not just present in code."

Lesson: a manifest entry is paperwork until a human clicks it and sees pixels.

================================================================================

EP 16 -- The Infinite Scroll That Never Ended
--------------------------------------------------------------------------------
What broke:
   After a claimed fix (removing a forced `max-h`), the consumer reported:
   "still the same for the infinite scrol.. both on desktop and mobile."

Root cause:
   The fix was reasoned about in CSS/geometry and trusted on a green typecheck.
   It was never verified in a real browser -- desktop or mobile.

How we fixed it:
   Drove the running docs page with browser automation: scrolled the container
   to the bottom, watched items load 20→30→40→50→60. The geometry-only fix
   did nothing; the real constraint lived in the scroll-area height. Redid the
   fix and verified it live on both desktop and mobile viewports.

State: semi-automated. Behavioral fixes must be verified in a real
browser on both form factors before they close.

Lesson: a green typecheck is evidence the code compiles, not that it works.
Trust the running page, not the diff.

================================================================================

EP 17 -- The Marquee That Ate Text
--------------------------------------------------------------------------------
What broke:
   A `Marquee` rendering `Card` surfaces clipped their inner content -- text ran
   off the edge and wrapped badly.

Root cause:
   Marquee forced `whitespace-nowrap` on ALL children, including block/card
   children that need to wrap naturally.

How we fixed it:
   String items get wrapped in `nowrap` spans; card/block nodes are left free
   to wrap naturally. The marquee now respects the shape of what it scrolls.

State: automated. A single CSS assumption broke every non-text marquee.

Lesson: a global rule applied to heterogeneous children is a bug factory.
Per-shape behavior, not per-container styling.

================================================================================

EP 18 -- The Sidebar That Ate Components
--------------------------------------------------------------------------------
What broke:
   11 base UI components (Accordion, Breadcrumb, Tabs, Sheet, …) vanished from
   the sidebar, the command palette, AND the gallery grid.

Root cause:
   A section-group exclusion filter, meant for the extended layout-guide
   entries (which have their own pages), was applied to the entire `layout`
   category. The exclusion was correct for its target, wrong for everything
   else.

How we fixed it:
   Narrowed the exclusion to the specific slugs that need it. Confirmed the
   missing components reappear across all three nav surfaces.

State: automated. (Still semi -- the rule lives in config, not a test, so a
future over-broad exclusion can still hide components until a human notices.)

Lesson: an exclusion filter with a broad selector is a time bomb. Scope it to
the slug, not the category.

================================================================================

EP 19 -- The CLI That Lied About Updates
--------------------------------------------------------------------------------
What broke:
   A consumer ran `facet up` and got "All up to date" -- while newer versions
   sat on npm. Separately, `facet up` "just printed the command" instead of
   applying it.

Root cause (two bugs, one symptom):
   1) A single flaky registry fetch of `/latest` returned `undefined` (429 /
      network error) and was treated as "current." The CLI had no fallback.
   2) `facet up` printed the install command text instead of executing it,
      then handed a print-only result back as "done."

How we fixed it:
   - Retry the registry fetch; fall back to the packument `dist-tags.latest`.
     Any package whose latest could not be verified is surfaced as a warning
     with exit code 2 (never silently "up to date").
   - `facet update` now runs the install by default (with a confirmation
     prompt unless `-y`); `--dry-run` prints only. `facet up` stays the
     always-apply variant.
   - Added regression tests so the lie can't recur.

State: automated. CLI honesty is a build invariant now.

Lesson: automation that reports success without proof is a bug -- not a feature.

================================================================================

EP 20 -- The Emails That Swallowed Children
--------------------------------------------------------------------------------
What broke:
   A React consumer rendered an email template; the body vanished while
   heading and footer rendered fine.

Root cause:
   The emails package's `wrap()` / `toReactNode` bridge destructured
   `{ tag, props, children }` on children that were actually React elements
   (which have `type` / `props`, no `tag`). The mismatch silently produced
   `React.createElement(undefined, …)` → the child dropped.

How we fixed it:
   Ran React-element children through the conversion bridge before rendering.
   The framework-agnostic core (`render.ts`) stayed React-free throughout the
   fix -- React only enters at the JSX convenience layer.

State: automated. The core stays React-free; the bridge converts at the edge.

Lesson: a bridge between two models that doesn't translate both directions
will silently eat data. Test the round trip, not one direction.

================================================================================

EP 21 -- The Tests That Never Ran
--------------------------------------------------------------------------------
What broke:
   `facet-emails` shipped with a body-children bug that the existing test
   suite should have caught -- and didn't.

Root cause:
   The emails package's vitest config only included `src/**/*.test.ts`, so the
   `.tsx` React-bridge tests were silently skipped. The tests existed, were
   green, and never executed.

How we fixed it:
   Fixed the include glob to match the real test file extensions (`.tsx`).
   Re-ran; the skipped suite now fails → fix → passes.

State: automated. A test that doesn't run is a gap, not coverage.

Lesson: "tests pass" is meaningless if the runner's include glob doesn't match
the filenames. Audit the runner, not just the report.

================================================================================

EP 22 -- The Stale Dist That Shipped
--------------------------------------------------------------------------------
What broke:
   A consumer installed the latest `@fusorb/facet-layout` and got a type error:
   `ConsoleLayoutMode` was `"full" | "rail"` but the source had shipped an
   `"overlay"` mode. The consumer was on the new version; the `dist` was stale.

Root cause:
   Source changed; `dist` was not rebuilt before publish. Consumers resolve
   workspace packages through `exports` → `dist/*.d.ts`, so stale dist = stale
   types in every consumer.

How we fixed it:
   Crash-recovery rule extended to dist: compare built declarations against
   source, rebuild affected packages, re-run consumer typechecks. The release
   rule from the tracker now enforces it: "publish ONLY from a clean tree,
   AFTER `pnpm -r build` passes."

State: automated. CI runs `pnpm -r build` in the publish job before
`changeset publish`. The tree is green or it doesn't ship.

Lesson: the `dist` is the product. A green source tree with a stale dist is a
lie the publisher tells consumers.

================================================================================

EP 23 -- The Loop (Reflection)
--------------------------------------------------------------------------------
The arc of the canon is not linear progress. It is a loop:

   1. THOUGHT IT WAS DONE -- green typecheck, merged PR, published package,
      tracker marked DONE.
   2. CONSUMER BUG -- a downstream repo installs it, hits the crack, reports it.
   3. ROOT CAUSE -- strip away the "it works on my machine" layer; find the real
      invariant that was never asserted (tokens not in both themes, a scanner
      that misses a reference shape, a dist that didn't rebuild, a test that
      never ran).
   4. EVOLUTION -- promote the fix one rung up the ladder (manual → semi → auto)
      so the same class of bug can't recur.

EP 01–09 were us fixing our own mistakes. EP 11–22 are consumers fixing our
blind spots. The two halves are the same machine: a claim is provisional until a
stranger's repo proves it false.

The mantra is not "perfect first." It is "evolve fast, automate the hurt, and
trust the consumer to find the thing we missed." Every automated gate in this
repo exists because a consumer once reported a bug we swore couldn't happen.

    State: evolving. The next consumer bug will become EP 24.

================================================================================

EP 24 -- The Resizable That Ate Half Its Size
--------------------------------------------------------------------------------
What broke:
   A consumer using `<ResizablePanel defaultSize={50}>` got a 50-pixel-wide
   panel instead of 50 percent. The docs, examples, and JSDoc all showed
   `defaultSize={50}` (number 0–100) expecting a percentage, but
   react-resizable-panels v4 interprets bare numbers as **pixels**, not
   percentages.

Root cause:
   The facet wrapper was a thin pass-through with no size normalization.
   The v4 API had changed (direction → orientation, PanelResizeHandle →
   Separator, and critically: number = pixels, unit-less string = percent)
   but the wrapper never bridged the unit gap. Every consumer following the
   facet docs got 50 px panels instead of 50 %.

How we fixed it:
   - Added `normalizeSize`: converts 0–100 numbers to `%`-strings, passes
     unit strings (`"200px"`, `"1rem"`, `"30%"`) through untouched. Applied
     to `defaultSize`, `minSize`, `maxSize`, and `collapsedSize`.
   - Added `useResizable` hook: imperative API (collapse, expand, resize,
     getLayout, setLayout, isCollapsed, getSize) via v4's `useGroupRef` /
     `usePanelRef`.
   - Added `useResizableLayout` hook: localStorage persistence via v4's
     `useDefaultLayout` (v4 has no `autoSaveKey` prop).
   - Exported TypeScript types: `ResizablePanelGroupProps`,
     `ResizablePanelProps`, `ResizableHandleProps`, `ResizableImperativeHandle`.
   - Exposed collapsible panel support (`collapsible`, `collapsedSize` props).
   - Fixed stale manifest description ("ResizablePanelGroup" → descriptive).
   - Fixed flaky docs-app.test.tsx: `findByTestId("console-layout")` timeout
     raised from 1000 ms → 5000 ms for lazy-loaded DocsLayout under load.
   - Added 8 new tests covering normalization, collapsible, hooks, variants.
   - Added collapsible variant to the docs gallery (ComponentPage, previews,
     usage.ts).

State: automated. The drift gate (EP 03) confirms barrel↔manifest parity (90
components); typecheck and tests pass across two full `pnpm -r build && pnpm -r
typecheck && pnpm test` runs (595/595 tests both times).

    Lesson: a pass-through wrapper that doesn't normalize consumer-facing units
    behind a dependency's breaking API change is a silent bug factory. Bridge the
    version gap at the component boundary — the consumer should never have to know
    that v4 treats numbers as pixels.

================================================================================

EP 25 -- The Footer and Icons That Didn't Come From Home
--------------------------------------------------------------------------------
What broke:
   The landing app shipped a hand-rolled `Footer.tsx` and a hand-rolled
   `BrandIcons.tsx` that re-implemented SVG brand icons (GitHub, LinkedIn,
   Instagram, Facebook, TikTok) the same ones facet-components already owned
   in `icon/brand-icons.tsx`. Meanwhile the AboutPage hardcoded the docs URL
   (`https://docs.facet.arcevocirqle.com.ng`) instead of using `getDocsUrl()`,
   and the facet-components `Footer` — already exported from the barrel — was
   never wired in.

Root cause:
   The landing app was built before facet-components had a config-driven Footer
   and before brand icons were registered in the icon registry (EP 13). When
   those pieces landed in the shared package, the landing was never refactored
   to consume them — the old local copies just lingered, silently drifting.

How we fixed it:
   - Exported the individual brand icon components (GithubIcon,
     LinkedinIcon, InstagramIcon, FacebookIcon, TiktokIcon, WhatsappIcon,
     XIcon, TwitterIcon, YoutubeIcon, SlackIcon, DiscordIcon, TelegramIcon,
     FigmaIcon, SpotifyIcon) from the facet-components barrel
     (`src/index.ts` + `src/icon/index.ts`).
   - Rewrote `apps/landing/src/components/BrandIcons.tsx` as a thin
     re-export from `@fusorb/facet-components` (aliasing `TiktokIcon` →
     `TikTokIcon` to preserve the landing's local naming). Nav.tsx and
     FeedbackPage.tsx now pull brand icons from the single source of truth.
   - Rewrote `apps/landing/src/components/Footer.tsx` to render
     `<Footer>` from `@fusorb/facet-components` (variant="minimal"),
     configured with the landing's brand, legal line, socials, footer
     links, and contact info — all resolved through `LightIcon` (which
     includes `brandIcons` in its map) and `CONTACT` from `../lib/socials`.
   - Fixed the AboutPage hardcoded docs URL to use `getDocsUrl()`.
   - Added a changeset (`@fusorb/facet-components: minor`).

State: automated. The landing now consumes the shared Footer + brand icons;
no SVG is duplicated in the landing anymore. The drift gate (EP 03) still
passes — brand icons live in `src/icon/` (not `src/ui/`), so they are outside
the barrel↔manifest gate by design.

Lesson: a shared component library ships pieces that are useless until a
consumer reaches for them. Every component that lands in the library should
come with a one-line refactor check: "does any consumer still reimplement this?"
================================================================================

EP 26 -- The Accordion That Wouldn't Close
--------------------------------------------------------------------------------
What broke:
  The docs-site sidebar's singleOpen (accordion) mode stopped working: opening
  one section did not reliably collapse others. If a section contained the
  active page, it stayed permanently open — clicking the chevron appeared to do
  nothing.

Root cause:
  A staged change to `NavSectionRenderer` reordered the `open` calculation:
    STAGED:  hasActive ? true : (explicitlyCollapsed ? false : !collapsedSections[sectionKey])
    ORIGINAL: explicitlyCollapsed ? false : (hasActive ? true : !collapsedSections[sectionKey])
  The STAGED version put `hasActive` first, so an active section's `open` was
  always `true` regardless of the user's explicit collapse action (which calls
  `toggleSection`, flipping `collapsedSections[sectionKey]`). On the next render
  the formula recomputed `open = true` via `hasActive`, undoing the toggle.
  The visible state and the persisted state diverged — the user could never
  close the active section, breaking accordion semantics.

  Additionally, `router?.asPath` was referenced on a `RouterAdapter` type that
  only declared `Link` and `isActive`, producing a TS2339 error in the layout
  package typecheck.

How we fixed it:
  - Restored the explicit-collapse-wins rule in the `open` formula: a section
    whose `collapsedSections[key]` is `true` is closed, period — even if active.
    Active sections no longer bypass explicit collapse.
  - Moved "auto-open on navigation" out of the render formula and into a
    `useEffect` keyed on `routeKey` (router.asPath ?? window.location). The
    effect only fires when the URL changes (mount + navigation), never on
    state writes from chevron clicks or `openSection`. This preserves both
    behaviors: navigate to a section → it auto-opens; click chevron → explicit
    collapse is respected.
  - Added `asPath?: string` to the `RouterAdapter` interface and provided it in
    `createDefaultAdapter()` (via `window.location.pathname + window.location.hash`).
  - Added two layout tests: "singleOpen: opening a section closes the others
    (accordion)" and "singleOpen: the active section can still be explicitly
    collapsed". Added `afterEach` cleanup (localStorage + URL) to all sidebar
    tests to prevent state leakage between cases.
  - The existing "auto-opens regardless of persisted collapse" test still passes
    — the useEffect runs within `act()` and opens the section before assertions.

State: automated. The route-change gate is the invariant: auto-open happens
only on URL change, never on user collapse action.

Lesson: deriving visible state from context (active route) that fights with
user state (persisted collapse) creates an unsolvable toggle. Decouple them:
let a one-shot effect handle auto-open; let user actions own the toggle.

================================================================================

EP 27 -- The Handle That Wouldn't Stick (to the Right Orientation)
--------------------------------------------------------------------------------
What broke:
  In a vertical resizable group, the `ResizableHandle` rendered with horizontal
  styling — a thin full-height strip (`w-1.5 h-full cursor-col-resize`) that
  looked "stuck to the top" instead of a full-width separator
  (`h-1.5 w-full cursor-row-resize`). The collapsible variant looked identical
  to the horizontal one because the handle never picked up the group's
  orientation.

  Additionally, the sidebar toolbar's `<Icon name="chevrons-up" />` and
  `<Icon name="chevrons-down" />` didn't render their glyphs — these icons
  were absent from the eagerly-loaded `SEMANTIC_LUCIDE` map and fell through
  to the lazy lucide catalog, which hadn't loaded yet (returns `null`), causing
  a flash of missing icons.

Root cause:
  - `ResizableHandle` accepted an `orientation` prop (default "horizontal") but
    never read the parent `ResizablePanelGroup`'s orientation. The JSDoc said
    "inferred from the parent group" but the code contradicted the docs.
  - `chevrons-up` and `chevrons-down` were not in `SEMANTIC_LUCIDE` or
    `SEMANTIC_ICONS`, so the `Icon`/`LightIcon` components had to lazy-load them.

How we fixed it:
  - Added `OrientationContext` (`<horizontal" | "vertical">`) that
    `ResizablePanelGroup` provides via `Context.Provider`.
  - `ResizableHandle` now reads `useContext(OrientationContext)` as a fallback
    when the consumer doesn't pass `orientation` explicitly. Explicit prop
    still overrides (backward compatible).
  - Added `ChevronsUp` and `ChevronsDown` to `SEMANTIC_ICONS` (semantic-icons.ts),
    the `SemanticIconName` union (registry.tsx), and `SEMANTIC_LUCIDE`
    (light-icon.tsx) — all eagerly loaded, no lazy catalog needed.
  - Added a "vertical-collapsible" preview variant to the docs ComponentPage
    + previews.tsx, with a toggle button wired to `useResizable`'s
    collapse/expand imperative API (mini sandbox for verification).
  - Updated usage.ts with a `verticalCollapsible` example.
  - Added two component tests: "vertical group auto-infers handle orientation
    (no explicit orientation on handle)" and "explicit handle orientation
    overrides group orientation". Added "vertical + collapsible auto-infers
    handle orientation" for the combined case.

State: automated. The handle now inherits orientation from context; the doc
comment ("inferred from the parent group") is now actually true.

    Lesson: a prop with a misleading default — especially one that contradicts its
    own JSDoc — is a silent footgun. When a child can read its parent's config,
    it should — override should be the exception, not the requirement.

--------------------------------------------------------------------------------

EP 28 -- The Tests That Hung on the Registry
--------------------------------------------------------------------------------
What broke:
   Six tests in commands.test.ts and wizard.e2e.test.ts failed with 5s timeouts
   when the npm registry was unreachable or slow. Two functions in the CLI's
   registry.ts were responsible:
   - resolveFacetVersions: called fetch() with no AbortController — hung forever.
   - discoverFacetPackages: had a 5s abort that exactly matched the 5s vitest
     default testTimeout, leaving zero margin for test setup/teardown.

Root cause:
   Network calls in production code had no independent timeout bound. When a
   fetch hung (DNS stall, 502, slow CDN), the test inherited the full 5s default
   timeout with no headroom. The 5s abort in discoverFacetPackages was intended
   to protect users, but it aligned exactly with the test timeout — so any slow
   registry response killed the test.

How we fixed it:
   - resolveFacetVersions: added a 3s AbortController timeout on the fetch
     (was unbounded).
   - discoverFacetPackages: reduced abort timeout from 5s to 3s.
   - vitest.config.ts: set testTimeout: 15000 as a global ceiling to absorb slow
     CI, DTS parsing overhead, and occasional network bumps.
   - icons.ts: added LUCIDE_ALIASES entry "alert-circle" → "circle-alert" so the
     deprecated lucide name resolves correctly in generated icon registries
     (AlertCircle was renamed to CircleAlert in the installed lucide-react 1.30).
   - light-icon.tsx: added AlertCircle, ExternalLink, Globe, Store to the
     SEMANTIC_LUCIDE map so the landing/docs sites' LightIcon usage renders
     synchronously instead of falling through to the lazy catalog.

State: automated. pnpm test: 609/609 pass. check:docs (90 components),
   check:icons (1763 icons @ lucide v1.30.0), check:sdk-drift (10 SDK classes)
   all green.

Lesson: a network timeout that equals the test timeout leaves no headroom for
   execution overhead. Production code needs its own timeout bound (3s); tests
   need a wider ceiling (15s) that absorbs variance.

================================================================================

EP 29 -- The Crosshair That Drifted Past Its Mark
--------------------------------------------------------------------------------
What broke:
   The Chart component's crosshair (vertical line + dot that highlights a data
   point on hover) was made "dynamic" -- it followed the raw cursor position
   instead of snapping to data points. The crosshair dot used `mousePos.x`
   (continuous mouse coordinates) while the data-point dots used
   `xOf(hover.dataIndex)` (band-centered positions). The result: the crosshair
   dot floated at wherever the mouse happened to be, drifting away from the
   data-point dots (the "sharp edges" that grow on hover), appearing to sit to
   the right of the point it was meant to showcase.

   Additionally, `animationDuration` and `transitionDuration` props were
   declared on ChartProps but NOT wired into the CSS -- the fade-in used a
   hardcoded 0.3s and all hover transitions used hardcoded 0.15s (crosshair-
   point tracking used 0.05s). The props were accepted but silently ignored.

Root cause:
   - The crosshair dot `cx` bound to `mousePos.x` while data dots bound to
     `xOf(i2)`. When hovering a data point, `hover.dataIndex` snapped to the
     nearest index (for the tooltip + data-dot growth), but the crosshair dot
     stayed at the raw mouse X -- no alignment.
   - `transitionDuration` was destructured from props but the inline `style`
     objects all used string literals (`"0.15s"`, `"0.05s"`, `"0.3s"`), so
     changing the prop had zero effect on the actual transitions.

How we fixed it:
   - Added `crosshairSnap` prop (default: `true`). When enabled, both the
     crosshair vertical line and the intersection dot bind to
     `xOf(hover.dataIndex)` -- the exact data-point X -- so the dot sits
     concentric with the growing data-point markers. When `false`, the
     crosshair follows `mousePos.x` (the previous free-follow behavior).
   - Wired `animationDuration` into the CSS fade-in animation (was 0.3s
     hardcoded; now `${animationDuration/1000}s`).
   - Wired `transitionDuration` into every inline transition: dot radius/
     opacity/stroke-width/transform, bar scale, slice hover, label opacity,
     crosshair line/stroke-dash, crosshair-point tracking (was 0.15s/0.05s;
     now `${transitionDuration/1000}s` and `${transitionDuration/3000}s`).
   - Replaced the tooltip's Tailwind `duration-150` class with an inline
     `transition: \`opacity ${transitionDuration/1000}s ease\`` so the prop
     covers tooltips too.
   - Updated 3 chart tests: replaced the old "crosshair follows cursor" test
     with a "crosshair snaps to data point (cx=128, cy=140 at dataIndex=0)"
     test; added a `crosshairSnap={false}` regression test; added a
     `transitionDuration` test asserting the custom duration appears in the
     active dot's inline style.

State: automated. `pnpm test` passes 745/745. `check:docs` green (114
   components). `pnpm -r typecheck` clean. `crosshairSnap` defaults to true,
   so the crosshair aligns with data points out of the box; consumers who
   want free-cursor tracking opt in with `crosshairSnap={false}`.

Lesson: a prop declared but not wired is worse than no prop at all -- it
creates a false promise to the consumer. Always verify the full data flow
from prop → resolved value → style/attribute, not just that the prop is
accepted in the destructuring.

================================================================================

EP 30 -- The Chart That Became a System (And the Tooltip That Vanished)
--------------------------------------------------------------------------------
What broke:
   EP 29 covered the crosshair snap fix narrowly. In truth, the work that
   landed in the same sweep was far broader: 4 changesets across 3 commits,
   104 lines of chart.tsx changes (79 added, 27 removed), a hidden-tooltip
   bug with THREE compounding root causes, a DataTable feature expansion +
   DataTablePage removal, Fusorb migration fixes, and a manifest drift fix
   that had silently hidden a component from the docs.

   EP 30 exists because the canon is not a single-patch log — every past
   drift, correction, changeset, and repo-state change gets written here.
   This is that write.

Scope of recent changes (2026-09-12 through 2026-09-13):
   - 4 changesets: chart-crosshair-snap, chart-axes-scroll-fixes,
     chart-pie-label-improvements, chart-datatable-enhancements
   - 5 commits: d7da2c6 → bbcd766 → 63fb165 → 776a8a1 → 0506770
     → f2ebd1a → 046ca4f → 94158a5 → 70b7054 → 3bc29f2
   - 107 lines of chart.tsx (32→128 lines), plus full chart.test.tsx rewrite
   - 4 additional components added to barrel + manifest (total: 114)
   - 15 changesets in .changeset/ spanning chart, datatable, stepper,
     kanban, pill, playground, and ready-to-use components

Root cause A — Hidden tooltip (3 compounding bugs):
   1. The tooltip's Tailwind `duration-150` class was a hardcoded string
      literal, not wired to the `transitionDuration` prop. Changing the
      prop did nothing — the same "declared but not wired" bug from EP 29.
   2. `crosshairPoints` (colored dot markers) defaulted to `true`. These
      dots rendered above the tooltip, intercepting hover events and making
      the tooltip invisible at certain cursor positions.
   3. `handlePointerMove` bailed when `rect.width === 0` — a jsdom quirk
      in test environments that masked pointer events and caused tests to
      miss the real crosshair positioning logic.

Root cause B — Hardcoded visual debt:
   chart.tsx accumulated ~30 hardcoded magic numbers over its evolution:
   crosshair width 1.5, dot radius 3→6, bar hover scale 1.15, fade 0.3s,
   transition 0.15s, crosshair tracking 0.05s, label gap 24 (was hardcoded
   ignoring parameter), donut inner radius ratio, curve tension, font
   sizes, gridline widths, opacity thresholds. Each was a consumer
   customization barrier — a prop you couldn't actually change.

Root cause C — TypeScript drift (Fusorb migration):
   - TS2304: `isRadial` and `n` missing `const` keyword in chart.tsx —
     the Fusorb build (stricter TS config) caught what the old lax config
     silently allowed.
   - TS6133: unused `isHovered` variable in donut path rendering —
     dead code from an earlier hover-scale iteration.
   - CSS `hsl(var(--x))` → `var(--x)` in 4 files: CSS variables now resolve
     to oklch directly; the `hsl()` wrapper was a left-over from the
     pre-Alpha-Palette era and caused invalid color values in some builds.

Root cause D — Manifest drift:
   `ChartRangeSelector` was exported in the barrel but its docs manifest
   entry was missing. The drift gate (EP 03) caught the mismatch: 113
   barrel exports vs 112 manifest entries. Added the entry; CLAUDE.md
   count: 113 → 114.

How we fixed it:
   Chart v2 (8 named constants + configurable props):
   - `crosshairSnap` (default true): snaps line+dot to xOf(hover.dataIndex)
   - `crosshairPoints` (default false): dot markers opt-in (was true)
   - `width` (default 800): customizable viewBox width
   - `axisFontSize` (default 11), `pieLabelFontSize` (default 12)
   - `renderSliceLabel`: fully custom pie/donut label content
   - `sliceLabelThreshold`, `barRadius`, `maxHeight`, `rowHeight` (default 36)
   - `animationDuration` (default 500), `transitionDuration` (default 150):
     wired to ALL CSS transitions/animations (was hardcoded 0.15s/0.05s/0.3s)
   - Named constants: CROSSHAIR_SNAP_TRUE_TYPES, CROSSHAIR_SNAP_FALSE_TYPES,
     DEFAULT_ROW_HEIGHT, DEFAULT_DOT_HOVER_SCALE, DEFAULT_SLICE_HOVER_SCALE,
     DEFAULT_BAR_HOVER_SCALE, etc.
   - 6 chart types: Line, Bar, Area, Pie, Donut, Composed + smooth/step/
     stacked/grouped/histogram/horizontal variants
   - Visible axis spine lines (solid y-axis + x-axis), increased left
     padding 48→56px
   - Horizontal bars: full X↔Y axis swap via isHorizontal + catY positioning
   - Horizontal crosshair: guide line tracks Y, dot tracks X
     (commit 3bc29f2 — extends EP 29's snap to horizontal layout)
   - Radial hover: scale 1.15 → opacity 0.85 dim (eliminates layout jitter)
   - Pie/Donut: leader lines, two-line labels, text anchoring, 24px gap
   - Bar opacity: 1.0 default, 0.85 non-hovered on hover (consistent)
   - Fixed 3 failing tests: handlePointerMove zero-width bail,
     ResizeObserver scaleRef formula (was `scaleRef * rect.width`,
     now `width / rect.width`), tooltip duration-150 → prop-wired

   DataTable:
   - `loading` prop: Skeleton rows during async fetch
   - `density` prop: "compact" | "comfortable" (row height control)
   - `emptyState` prop: custom empty-state rendering
   - `total` prop: footer summary row

   DataTablePage:
   - REMOVED entirely — features merged into DataTable
   - barrel + manifest + previews.tsx + usage.ts all updated

   Fusorb migration:
   - Fixed TS2304 (missing const) + TS6133 (unused var) in chart.tsx
   - Fixed CSS `hsl(var())` → `var()` in shine-border, glow-border,
     consent-capture, TestimonialsSection
   - Created `packages/docs/tsup.config.ts` (DTS module resolution fix
     for @fusorb/facet-components/light)
   - Added `check:components` script to package.json

   Test counts:
   - Chart tests: 55 → 57 (EP 29) → 57 (EP 30, no change, horizontal bar
     tests added to existing file) — 57/57 pass
   - Full suite: 739 (baseline) → 745/745 across 56 files, 7 projects
   - 3 previously failing tests fixed (handlePointerMove, ResizeObserver,
     manifest)

   Changesets created (in .changeset/):
   - chart-crosshair-snap.md — crosshairSnap + animation props
   - chart-axes-scroll-fixes.md — axis spines, maxHeight, rowHeight,
     crosshairPoints, pie hover, 3 test fixes
   - chart-pie-label-improvements.md — width, fontSize, leader lines,
     pie/donut hover, bar opacity, ThemeToggle sizing
   - chart-datatable-enhancements.md — chart types, DataTable props,
     DataTablePage removal

State: automated. `pnpm build` — all 11 packages + 2 apps clean ✓.
   `pnpm -r typecheck` — all 12 packages + 2 apps green ✓.
   `pnpm test` — 745/745 across 56 files ✓. `check:docs` — 114
   components, barrel↔manifest↔CLAUDE.md all synced ✓.
   Commit 3bc29f2: "fix(chart): crosshair snap + animation props for
   horizontal bar layout" — closes the loop on the session.

   Lesson: a rewrite that lands as multiple changesets across multiple
   commits is not "not done" — it's the evolution the canon tracks.
   EP 29's narrow frame missed the breadth. EP 30 captures the whole:
   the Chart didn't just get a snap toggle — it became a configurable
   system. The tooltip didn't just come back — the animation wiring that
   hid it was the same bug class as the crosshair animation props. Three
   independent root causes can live in the same feature. Write them all
   down.

================================================================================
END
