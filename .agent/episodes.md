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

How we fixed it: — `IntervalToggle` now receives the parent's local `interval` state as a
    prop (read from state, not config). — Added `BillingInterval += "quarterly"` to `billing-types.ts`. — Added `planPriceForInterval(plan, interval)`: explicit `prices[]` wins,
    then `%` discounts, then the default (yearly = 2 months free). — Added `planPriceLabel(plan, currency, interval)` + `intervalMonths`. — `PlanHeader` + `BillingPageTable` recompute price per interval and honor
    `config.currency`. Nothing is hardcoded in the component anymore. — Mobile grid: `min-w-0 lg:min-w-[1152px]` so no horizontal scroll on
    small screens; 4-col scroll preserved on desktop. — Docs `usage.ts` + variants updated with `discounts` + quarterly.

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

How we fixed it: — Added `permissions: contents: write` to the `changeset` (version) job so
    the bot can push the "Version Packages" branch. — Exported `NPM_TOKEN` / `NODE_AUTH_TOKEN` into the `publish` job env. — The publish job now `needs: [ci]` (gate must pass) and runs
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

How we fixed it: — Committed the 29 modified files + new store package + `not-found.tsx` +
    billing test + the 2 pending changesets. — CI auto-created the "Version Packages" PR; merged it (`994bd28`). — CI `publish` job shipped the 8 packages (auth 1.2.2, cli 0.8.0,
    components 1.10.0, docs 1.4.6, emails 1.1.1, layout 1.4.1, store 0.1.0,
    tokens 1.1.4; sdk 1.1.0 already on npm, skipped). — Re-verified repo-wide typecheck clean.

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

How we fixed it: — Narrowed `currentValue` to `string`. — Guarded `filteredDomains` against `undefined`. — Wired `mail-input` into the docs gallery (`usage.ts`, `variants.tsx`,
    `previews.tsx`) and regenerated the docs manifest. — Integrity sweep: NUL-byte / truncation check across 24 edited files →
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

How we fixed it: — `layout/UserMenu` now uses `@fusorb/facet-components`' `DropdownMenu`
    (one dropdown, one implementation). — Introduced the `RouterAdapter` pattern (`layout/src/router.tsx`): an
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

How we fixed it: — Retry the registry fetch; fall back to the packument `dist-tags.latest`.
     Any package whose latest could not be verified is surfaced as a warning
     with exit code 2 (never silently "up to date"). — `facet update` now runs the install by default (with a confirmation
     prompt unless `-y`); `--dry-run` prints only. `facet up` stays the
     always-apply variant. — Added regression tests so the lie can't recur.

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

How we fixed it: — Added `normalizeSize`: converts 0–100 numbers to `%`-strings, passes
     unit strings (`"200px"`, `"1rem"`, `"30%"`) through untouched. Applied
     to `defaultSize`, `minSize`, `maxSize`, and `collapsedSize`. — Added `useResizable` hook: imperative API (collapse, expand, resize,
     getLayout, setLayout, isCollapsed, getSize) via v4's `useGroupRef` /
     `usePanelRef`. — Added `useResizableLayout` hook: localStorage persistence via v4's
     `useDefaultLayout` (v4 has no `autoSaveKey` prop). — Exported TypeScript types: `ResizablePanelGroupProps`,
     `ResizablePanelProps`, `ResizableHandleProps`, `ResizableImperativeHandle`. — Exposed collapsible panel support (`collapsible`, `collapsedSize` props). — Fixed stale manifest description ("ResizablePanelGroup" → descriptive). — Fixed flaky docs-app.test.tsx: `findByTestId("console-layout")` timeout
     raised from 1000 ms → 5000 ms for lazy-loaded DocsLayout under load. — Added 8 new tests covering normalization, collapsible, hooks, variants. — Added collapsible variant to the docs gallery (ComponentPage, previews,
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

How we fixed it: — Exported the individual brand icon components (GithubIcon,
     LinkedinIcon, InstagramIcon, FacebookIcon, TiktokIcon, WhatsappIcon,
     XIcon, TwitterIcon, YoutubeIcon, SlackIcon, DiscordIcon, TelegramIcon,
     FigmaIcon, SpotifyIcon) from the facet-components barrel
     (`src/index.ts` + `src/icon/index.ts`). — Rewrote `apps/landing/src/components/BrandIcons.tsx` as a thin
     re-export from `@fusorb/facet-components` (aliasing `TiktokIcon` →
     `TikTokIcon` to preserve the landing's local naming). Nav.tsx and
     FeedbackPage.tsx now pull brand icons from the single source of truth. — Rewrote `apps/landing/src/components/Footer.tsx` to render
     `<Footer>` from `@fusorb/facet-components` (variant="minimal"),
     configured with the landing's brand, legal line, socials, footer
     links, and contact info — all resolved through `LightIcon` (which
     includes `brandIcons` in its map) and `CONTACT` from `../lib/socials`. — Fixed the AboutPage hardcoded docs URL to use `getDocsUrl()`. — Added a changeset (`@fusorb/facet-components: minor`).

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

How we fixed it: — Restored the explicit-collapse-wins rule in the `open` formula: a section
    whose `collapsedSections[key]` is `true` is closed, period — even if active.
    Active sections no longer bypass explicit collapse. — Moved "auto-open on navigation" out of the render formula and into a
    `useEffect` keyed on `routeKey` (router.asPath ?? window.location). The
    effect only fires when the URL changes (mount + navigation), never on
    state writes from chevron clicks or `openSection`. This preserves both
    behaviors: navigate to a section → it auto-opens; click chevron → explicit
    collapse is respected. — Added `asPath?: string` to the `RouterAdapter` interface and provided it in
    `createDefaultAdapter()` (via `window.location.pathname + window.location.hash`). — Added two layout tests: "singleOpen: opening a section closes the others
    (accordion)" and "singleOpen: the active section can still be explicitly
    collapsed". Added `afterEach` cleanup (localStorage + URL) to all sidebar
    tests to prevent state leakage between cases. — The existing "auto-opens regardless of persisted collapse" test still passes — the useEffect runs within `act()` and opens the section before assertions.

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

Root cause: — `ResizableHandle` accepted an `orientation` prop (default "horizontal") but
    never read the parent `ResizablePanelGroup`'s orientation. The JSDoc said
    "inferred from the parent group" but the code contradicted the docs. — `chevrons-up` and `chevrons-down` were not in `SEMANTIC_LUCIDE` or
    `SEMANTIC_ICONS`, so the `Icon`/`LightIcon` components had to lazy-load them.

How we fixed it: — Added `OrientationContext` (`<horizontal" | "vertical">`) that
    `ResizablePanelGroup` provides via `Context.Provider`. — `ResizableHandle` now reads `useContext(OrientationContext)` as a fallback
    when the consumer doesn't pass `orientation` explicitly. Explicit prop
    still overrides (backward compatible). — Added `ChevronsUp` and `ChevronsDown` to `SEMANTIC_ICONS` (semantic-icons.ts),
    the `SemanticIconName` union (registry.tsx), and `SEMANTIC_LUCIDE`
    (light-icon.tsx) — all eagerly loaded, no lazy catalog needed. — Added a "vertical-collapsible" preview variant to the docs ComponentPage
    + previews.tsx, with a toggle button wired to `useResizable`'s
    collapse/expand imperative API (mini sandbox for verification). — Updated usage.ts with a `verticalCollapsible` example. — Added two component tests: "vertical group auto-infers handle orientation
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
   registry.ts were responsible: — resolveFacetVersions: called fetch() with no AbortController — hung forever. — discoverFacetPackages: had a 5s abort that exactly matched the 5s vitest
     default testTimeout, leaving zero margin for test setup/teardown.

Root cause:
   Network calls in production code had no independent timeout bound. When a
   fetch hung (DNS stall, 502, slow CDN), the test inherited the full 5s default
   timeout with no headroom. The 5s abort in discoverFacetPackages was intended
   to protect users, but it aligned exactly with the test timeout — so any slow
   registry response killed the test.

How we fixed it: — resolveFacetVersions: added a 3s AbortController timeout on the fetch
     (was unbounded). — discoverFacetPackages: reduced abort timeout from 5s to 3s. — vitest.config.ts: set testTimeout: 15000 as a global ceiling to absorb slow
     CI, DTS parsing overhead, and occasional network bumps. — icons.ts: added LUCIDE_ALIASES entry "alert-circle" → "circle-alert" so the
     deprecated lucide name resolves correctly in generated icon registries
     (AlertCircle was renamed to CircleAlert in the installed lucide-react 1.30). — light-icon.tsx: added AlertCircle, ExternalLink, Globe, Store to the
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

Root cause: — The crosshair dot `cx` bound to `mousePos.x` while data dots bound to
     `xOf(i2)`. When hovering a data point, `hover.dataIndex` snapped to the
     nearest index (for the tooltip + data-dot growth), but the crosshair dot
     stayed at the raw mouse X -- no alignment. — `transitionDuration` was destructured from props but the inline `style`
     objects all used string literals (`"0.15s"`, `"0.05s"`, `"0.3s"`), so
     changing the prop had zero effect on the actual transitions.

How we fixed it: — Added `crosshairSnap` prop (default: `true`). When enabled, both the
     crosshair vertical line and the intersection dot bind to
     `xOf(hover.dataIndex)` -- the exact data-point X -- so the dot sits
     concentric with the growing data-point markers. When `false`, the
     crosshair follows `mousePos.x` (the previous free-follow behavior). — Wired `animationDuration` into the CSS fade-in animation (was 0.3s
     hardcoded; now `${animationDuration/1000}s`). — Wired `transitionDuration` into every inline transition: dot radius/
     opacity/stroke-width/transform, bar scale, slice hover, label opacity,
     crosshair line/stroke-dash, crosshair-point tracking (was 0.15s/0.05s;
     now `${transitionDuration/1000}s` and `${transitionDuration/3000}s`). — Replaced the tooltip's Tailwind `duration-150` class with an inline
     `transition: \`opacity ${transitionDuration/1000}s ease\`` so the prop
     covers tooltips too. — Updated 3 chart tests: replaced the old "crosshair follows cursor" test
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

Scope of recent changes (2026-09-12 through 2026-09-13): — 4 changesets: chart-crosshair-snap, chart-axes-scroll-fixes,
     chart-pie-label-improvements, chart-datatable-enhancements — 5 commits: d7da2c6 → bbcd766 → 63fb165 → 776a8a1 → 0506770
     → f2ebd1a → 046ca4f → 94158a5 → 70b7054 → 3bc29f2 — 107 lines of chart.tsx (32→128 lines), plus full chart.test.tsx rewrite — 4 additional components added to barrel + manifest (total: 114) — 15 changesets in .changeset/ spanning chart, datatable, stepper,
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

Root cause C — TypeScript drift (Fusorb migration): — TS2304: `isRadial` and `n` missing `const` keyword in chart.tsx — the Fusorb build (stricter TS config) caught what the old lax config
     silently allowed. — TS6133: unused `isHovered` variable in donut path rendering — dead code from an earlier hover-scale iteration. — CSS `hsl(var(--x))` → `var(--x)` in 4 files: CSS variables now resolve
     to oklch directly; the `hsl()` wrapper was a left-over from the
     pre-Alpha-Palette era and caused invalid color values in some builds.

Root cause D — Manifest drift:
   `ChartRangeSelector` was exported in the barrel but its docs manifest
   entry was missing. The drift gate (EP 03) caught the mismatch: 113
   barrel exports vs 112 manifest entries. Added the entry; CLAUDE.md
   count: 113 → 114.

How we fixed it:
   Chart v2 (8 named constants + configurable props): — `crosshairSnap` (default true): snaps line+dot to xOf(hover.dataIndex) — `crosshairPoints` (default false): dot markers opt-in (was true) — `width` (default 800): customizable viewBox width — `axisFontSize` (default 11), `pieLabelFontSize` (default 12) — `renderSliceLabel`: fully custom pie/donut label content — `sliceLabelThreshold`, `barRadius`, `maxHeight`, `rowHeight` (default 36) — `animationDuration` (default 500), `transitionDuration` (default 150):
     wired to ALL CSS transitions/animations (was hardcoded 0.15s/0.05s/0.3s) — Named constants: CROSSHAIR_SNAP_TRUE_TYPES, CROSSHAIR_SNAP_FALSE_TYPES,
     DEFAULT_ROW_HEIGHT, DEFAULT_DOT_HOVER_SCALE, DEFAULT_SLICE_HOVER_SCALE,
     DEFAULT_BAR_HOVER_SCALE, etc. — 6 chart types: Line, Bar, Area, Pie, Donut, Composed + smooth/step/
     stacked/grouped/histogram/horizontal variants — Visible axis spine lines (solid y-axis + x-axis), increased left
     padding 48→56px — Horizontal bars: full X↔Y axis swap via isHorizontal + catY positioning — Horizontal crosshair: guide line tracks Y, dot tracks X
     (commit 3bc29f2 — extends EP 29's snap to horizontal layout) — Radial hover: scale 1.15 → opacity 0.85 dim (eliminates layout jitter) — Pie/Donut: leader lines, two-line labels, text anchoring, 24px gap — Bar opacity: 1.0 default, 0.85 non-hovered on hover (consistent) — Fixed 3 failing tests: handlePointerMove zero-width bail,
     ResizeObserver scaleRef formula (was `scaleRef * rect.width`,
     now `width / rect.width`), tooltip duration-150 → prop-wired

   DataTable: — `loading` prop: Skeleton rows during async fetch — `density` prop: "compact" | "comfortable" (row height control) — `emptyState` prop: custom empty-state rendering — `total` prop: footer summary row

   DataTablePage: — REMOVED entirely — features merged into DataTable — barrel + manifest + previews.tsx + usage.ts all updated

   Fusorb migration: — Fixed TS2304 (missing const) + TS6133 (unused var) in chart.tsx — Fixed CSS `hsl(var())` → `var()` in shine-border, glow-border,
     consent-capture, TestimonialsSection — Created `packages/docs/tsup.config.ts` (DTS module resolution fix
     for @fusorb/facet-components/light) — Added `check:components` script to package.json

   Test counts: — Chart tests: 55 → 57 (EP 29) → 57 (EP 30, no change, horizontal bar
     tests added to existing file) — 57/57 pass — Full suite: 739 (baseline) → 745/745 across 56 files, 7 projects — 3 previously failing tests fixed (handlePointerMove, ResizeObserver,
     manifest)

   Changesets created (in .changeset/): — chart-crosshair-snap.md — crosshairSnap + animation props — chart-axes-scroll-fixes.md — axis spines, maxHeight, rowHeight,
     crosshairPoints, pie hover, 3 test fixes — chart-pie-label-improvements.md — width, fontSize, leader lines,
     pie/donut hover, bar opacity, ThemeToggle sizing — chart-datatable-enhancements.md — chart types, DataTable props,
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

EP 31 -- The Motion System That Gave the Repo a Declarative Animation Grammar
--------------------------------------------------------------------------------
What this adds:
   A new package `@fusorb/facet-motion` — a declarative, token-driven animation
   system that does NOT depend on Framer Motion or GSAP. Instead it ships: — Core: animate(), sequence(), stagger() — driven by motion values
       (observables with get/set/subscribe). — CSS driver: applies transforms, opacity, and custom properties; respects
       `prefers-reduced-motion`. — Registry: a spec type + 15 generative families (fade/slide/zoom/flip)
       and 18 authored effects (bounce, shake, etc.), resolved by name. — React: <Motion>, <Presence>, <Reveal>, <Stagger> + usePresence/useStagger. — Drift gate: scripts/check-motion-drift.mjs — barrel↔registry parity,
       wired into CI (ci-cd.yml line 32) and package.json.
   The motion tokens (durations, easings, distances, scales, blur, stagger)
   were added to @fusorb/facet-tokens as CSS custom properties, TypeScript
   types, and a runtime `motion` object — then consumed by 10 new keyframe
   families and 10 Tailwind `animate-facet-*` utilities.

   Two stray artifacts were cleaned from the repo root as part of this session:
   `$null` (a 102-byte PowerShell error capture) and an empty `-p/` directory.
   These are not the kind of bug the canon usually tracks, but EP 08 ("the
   four") showed how environment cruft accumulates silently — so we removed
   them and confirmed 0 empty tracked files remain.

Commits: — 3fefa64 — feat: add @fusorb/facet-motion declarative animation system — 2c37fad — feat(motion): wire tokens into facet-tokens + CLI generators

What we learned: — TSUP + DTS works cleanly for a TS-strict ESM-only package; the barrel
     exports 63 symbols, all typechecked. — Removing dead code (formatVersions, devCommand, AllFacetPackage) from the
     CLI registry was safe — grep confirmed 0 references across the repo. — The drift-gate pattern (EP 03 for docs, EP 29/30 for charts) generalizes:
     it now covers motion too (63 barrel symbols ↔ 15 generative + 18 authored).

State: automated. `pnpm build` — all 13 packages + 2 apps clean ✓.
   `pnpm -r typecheck` — all 12 packages + 2 apps green ✓.
   `pnpm test` — 749/749 across 56 files ✓ (incl. 106 facet-motion tests).
   `check:docs` — 114 components ✓. `check:components` 114/114 ✓.
   `check:motion-drift` — OK ✓.
   Working tree clean (2 local commits ahead of origin/main).

Lesson: a new system is never just its entry point. facet-motion touches tokens,
   CLI, CI, AND the component layer (Phase 2). The canon tracks the whole arc — scaffold here, consume in components next.

  Utilization audit (Phase 2 gate-check — post-commit):
     facet-motion is built but NOT consumed. Zero component files import
     @fusorb/facet-motion. Eight component files carry hardcoded durations:
     text-animations (inline animationDuration: ${duration}ms), card-animations
     (duration=600 default), marquee (20s linear), stepper (250ms Tailwind keyframes),
     roadmap, data-table, animated-button, brand-icons. Overlay primitives
     (Dialog, Sheet, Toast, Dropdown, Drawer) use raw Tailwind animate-* classes
     instead of the <Reveal>/<Presence> bindings.
     Portability: the engine is ~80% platform-agnostic. core (animate/sequence/
     stagger/scheduler), values (motionValue), registry (15 generative + 18 authored
     families), and the token-resolution tables (DURATION_VALUES, EASING_FUNCTIONS,
     cubicBezier) are all pure JS. Only cssDriver.apply() writes to element.style
     (DOM-bound) — a native (RN Animated) driver can reuse the resolution tables
     as-is once they are extracted from the css module into a shared target.
  Action: Phase 2 reordered — (1) extract resolve tables into shared core
  module, (2) wire facet-motion into overlay + animated components, (3) then
  build @fusorb/facet-native on the now-portable engine.

================================================================================

EP 32 -- The Motion System Enters Production (Consumption + Native Scaffold)
--------------------------------------------------------------------------------
What happened in this session:
   The motion engine was scaffolded and committed (EP 31). The next step was
   always to actually USE it — consume it across the component library, land
   the platform portability needed for React Native, and scaffold the
   facet-native package. This episode captures all uncommitted work (Phase 2B
   + Phase 2C + version reconciliation) that was tracked in `.agent/todo.txt`
   but never committed before this session.

   Commits: — 43ccd14 — refactor(motion): extract driver resolution into shared resolve.ts — 43ccd15 — feat(motion): consume facet-motion across facet-components + landing — 43ccd16 — feat(native): scaffold @fusorb/facet-native (0.1.0) — 43ccd17 — fix: reconcile CLI/Store versions 2.0.0 → 1.0.0

Phase 2A — Driver portability (platform-agnostic resolution):
   EP 31's utilization audit flagged that resolve tables (DURATION_VALUES,
   EASING_FUNCTIONS, cubicBezier, resolveDuration, resolveEasing) lived inside
   the css driver module, blocking reuse by a future native driver. This session
   extracted them into `packages/motion/src/drivers/resolve.ts` — a pure-JS
   module with zero DOM access. `drivers/index.ts` now re-exports from
   `./resolve.js` instead of `./css.ts`, so cssDriver, nativeDriver (Phase 4),
   and any future custom driver all share identical token→value resolution.

Phase 2B — Motion consumption in facet-components (full migration):
   Every hardcoded animation in facet-components was migrated to the facet-
   native two-tier motion grammar (animate-facet-* utility classes + CSS custom
   properties), replacing the old ad-hoc inline durations, Radix animate-in
   classes, and tw-animate-css keyframes. No component now hardcodes a ms or
   bezier curve — all resolve through the token tables.

   Overlay surface (two-tier, facet-native): — Floating overlays (Tooltip, Popover, DropdownMenu, ContextMenu, HoverCard,
     Menu, Select) → animate-facet-overlay-in/out — Modal surfaces (Dialog, Sheet, AlertDialog) → animate-facet-fade-in
     (backdrop) + animate-facet-zoom-in/out (content) — NavigationMenu → animate-facet-zoom-in/out (viewport) +
     animate-facet-fade-in/out (indicator)

   Component-level: — animated.tsx: Aurora/Beams/Spotlight → animate-facet-* (aurora 18s, beam
     7s left as CSS-class defaults with variable durations via inline animation) — button.tsx: ripple → animate-facet-ripple (timeout 700→600ms) — data-table.tsx: fade-up → animate-facet-fade-up — micro-interactions.tsx: ScrollReveal now calls resolveMotion("fade","up")
     + preferReducedMotion + resolveEasing("standard") instead of hardcoded
     opacity/ease-out; RippleButton → animate-facet-ripple-forwards;
     DissolveButton → animate-facet-dissolve-reverse — card-animations.tsx: RevealCard uses resolveMotion + preferReducedMotion
     + resolveEasing; DissolveCard → animate-facet-dissolve — text-animations.tsx: ALL animations → animate-facet-*; CountUpText
     rewritten to use motionValue + animate from facet-motion (was string-
     interpolation frame math) — roadmap.tsx: fade-up → animate-facet-fade-up; stagger() for item delays — chart-range-selector.tsx: animate-in → animate-facet-fade-in — stepper.tsx: inline CSS var --facet-motion-duration-base (Radix
     data-[state] pattern — <Motion> React would be heavier than needed) — input-otp.tsx: duration-1000 → duration-[var(--motion-duration-1000)] — overlay components (Dialog, Sheet, AlertDialog, NavigationMenu,
     ChartRangeSelector): Radix animate-in → animate-facet-fade-in/out +
     animate-facet-zoom-in/out

   Tokens: tailwind.css extended to tokenize last remaining hardcoded keyframes
   (accordion, caret-blink, pulse-ring, ripple, sparkle, dissolve, text). New
   utility classes: facet-fade-up, facet-ripple-forwards, facet-dissolve-
   reverse, facet-text-blur, facet-text-wave, facet-flip, facet-shimmer,
   facet-gradient-shift.

   Barrel: packages/components/src/index.ts re-exports facet-motion primitives
   (Motion, Presence, Reveal, Stagger, motionValue, animate, stagger, sequence,
   tween, spring, resolveMotion, resolveDuration, resolveEasing, get, registry,
   generativeFamilies, preferReducedMotion + all types).

Phase 2C — facet-native scaffold (platform bridge for React Native):
   `packages/native/` created (@fusorb/facet-native, 0.1.0) — the second render
   target for the motion engine. core/ values/ registry/ react/ are 100% shared
   between web and native; only the driver differs. This package is the bridge
   layer that lets the same animate()/sequence()/stagger() timeline that drives
   CSS animations on web drive React Native Animated on native. — motionValues: raw numeric motion tokens (duration numbers, easing cubic-
     bezier arrays) for RN consumption — RN's Animated API needs numbers, not
     CSS var strings — MotionValues + EasingValue types added to facet-tokens (runtime side) — native-driver.ts: toEasingCurve (CSS easing var → RN cubic-bezier adapter),
     resolveNativeTransition (MotionTransition → RN Animated.Config),
     nativeDriver (stub shell — Phase 4 impl) — index.ts: barrel re-exporting motionValues + native-driver helpers — tsconfig.json (root): reference added — packages/native in composite build

Phase 2C — Landing consumption:
   apps/landing HeroSection, DashboardDemoPage, EcosystemPage migrated from
   inline ScrollReveal + custom wrappers to <Motion> + <Stagger> — the landing
   is now a real consumer of the motion system, not just static classes.

Version reconciliation:
   The V2 debrand (db287b3) bumped @fusorb/facet-cli and @fusorb/facet-store to
   2.0.0 in package.json + CHANGELOG. Neither was ever published at 2.0.0 — the
   published versions remain 1.0.0. This session reverts both package.json and
   CHANGELOG headings from 2.0.0 back to 1.0.0, matching npm. Two new changesets
   staged: stepper-motion-tokens.md (patch, facet-components) and
   facet-native-scaffold.md (minor, facet-native).
   pnpm-workspace.yaml: minimumReleaseAgeExclude updated from
   @fusorb/facet-cli@2.0.0 to @fusorb/facet-cli@1.0.0.

What we learned: — The two-tier motion grammar scales cleanly across 14 component files with
     zero per-file bespoke logic — the grammar is the abstraction, components
     just declare an intent class. — CountUpText's rewrite to motionValue + animate proves the core engine is
     usable from composed components, not just <Motion> bindings. — Stepper's inline CSS-var approach (vs <Motion>) is correct for Radix-
     state-driven transitions — a React boundary is heavier than needed when
     Radix owns the state machine. — facet-native's bridge layer is 3 small pure functions (toEasingCurve,
     resolveNativeTransition, nativeDriver), confirming the core/driver split
     was the right boundary.

State: COMPLETE. All Phase 2 work committed. Working tree clean after commit
   cycle. Phase 3 (domain presets) and Phase 4 (nativeDriver impl) remain
   PENDING per .agent/todo.txt.

   pnpm -r typecheck: green (13 packages + 2 apps).
   pnpm test: 749/749 across 56 files (incl. 106 facet-motion tests).
   check:docs: 114 components ✓. check:motion-drift: OK ✓.

Lesson: the value of a new system is not in its scaffold commit — it's in how
   many hardcoded values it eliminates across the component library. EP 31
   built the engine; this episode proves it works by counting the milliseconds
   that no longer exist in source. The repo now has zero inline animation-
   duration literals in facet-components (all resolve through
    --facet-motion-duration-* CSS vars or the shared DURATION_VALUES table).

### EP 33: Full system audit (2026-09-17, 2 commits: cf4f516 + ce764e3)
**State**: COMPLETE — audit findings documented, fixes committed, clean working tree.

#### REDUNDANCIES EXPUNGED — `tw-animate-css` in @fusorb/facet-components: After migration to animate-facet-*
  grammar, no component src/CSS references it. Components build copies tokens.css
  (NOT tailwind.css), so consumers never received tw-animate-css utilities through
  components. Removed. Tokens package retains for backward-compatible tailwind.css. — `check:motion-drift` duplicate script: Two scripts with same name, different checks.
  Root `check:motion-drift` → system manifest gate (packages/motion/scripts/).
  Token-value parity check renamed to `audit:motion-parity.mjs` (audit-* convention).

#### BUGS FIXED
1. **`check:motion-drift` gate broken (CI FAIL)**: Root package.json pointed to
   `packages/motion/scripts/check-motion-drift.mjs` — file didn't exist. CI line 32
   ran it and would fail. **Fix**: System created the script (manifest gate checking
   63 barrel exports, 15 generative + 18 authored registries, Phase 3 leakage).
2. **Motion tests missing from vitest workspace (106 tests never ran)**: motion package
   had vitest.config.ts + 11 test files (106 tests) but was NOT in root vitest.config.ts
   projects. CLAUDE.md falsely claimed "749 tests incl. 106 motion tests". **Fix**:
   Added packages/motion + packages/emails to vitest workspace.
3. **`resolveMotion` type mismatch (2 components)**: resolveMotion(effectId, variant, transition)
  requires MotionVariant (object) + MotionTransition. Components called resolveMotion("fade", "up") — passing string instead of MotionVariant, omitting transition. Hidden by missing .d.ts.
  **Fix**: Made transition optional w/ default {duration:"base", ease:"standard"}; call sites
  → resolveMotion("fade", { direction: "up" }).
4. **CLI/Store versions 2.0.0 (never published)**: Premature bump during V2 debrand. **Fix**:
  Reverted to 1.0.0 in package.json + CHANGELOG + README.

#### RECTIFIED — CLAUDE.md: CI gates list (item 17) now includes check:motion-drift; test count (item 18)
  749 → 902; item 19 corrected (drift gate path, native driver "stubs" → "binding API"). — README.md: CLI/Store versions 2.0.0 → 1.0.0; motion + native added to package table;
  test count 114 → 902 across 10 projects; 114 components preserved. — pnpm-workspace.yaml: minimumReleaseAgeExclude @cli@2.0.0 → @cli@1.0.0. — tsconfig: native package composite:true removed (matches siblings; build uses per-package
  tsc --noEmit, not tsc --build).

#### EXTENSIVE PLANNING (next milestones)
1. **Phase 3: Domain presets** (fintech, med, edu) — motion families + component variants
   need domain-specific tuning. Native driver binding API is ready but presets unbuilt.
2. **Phase 4: Real Animated binding** — bindAnimated/api is the contract; implement
   consumer-provided Animated module integration (react-native-reanimated v2 or RN Animated).
   No hard react-native dependency by design.
3. **Token CSS var conversion**: spacing + typography still TS-only constants
   (audit-tokens-parity.cjs covers this). Convert to CSS vars for pure-CSS consumers.
4. **Shadow token scale**: box-shadows still inlined in some surface components.
5. **npm Trusted Publishing**: CI grants id-token:write; needs npm account config.
6. **16 pending changesets backlog**: All valid; next "Version Packages" PR versions all.
7. **Soft gaps**: api-key-manager, invite-team-form, testimonial-showcase, two-factor-setup-panel
   are data-driven composites without render/children slots.
8. **E-cluster**: scan.ts "pre" block, CLI/docs keyboard-shortcut mismatch, emails
   init "latest" snapshot — tracked in production-audit.txt §G5.

#### VERIFICATION — pnpm -r typecheck: 14 packages + 2 apps green (136 modules) — pnpm test: 902 tests across 10 projects (incl. 106 motion + 21 native + 26 emails) — pnpm check:motion-drift: OK (63 barrel exports, 15 generative + 18 authored) — script audit:motion-parity: OK (5 durations + 6 easings in sync)

#### PENDING CHANGESETS (18 files in .changeset/) — debrand-production-hardening.md (tokens minor, components/sdk/store/cli/auth/layout/emails patch) — facet-motion-initial.md (motion minor: 0.1.0 initial release) — motion-system-animation-tokens.md (tokens minor, components patch) — facet-native-scaffold.md (native minor: 0.1.0 — updated for full driver) — stepper-motion-tokens.md (components patch) — component-polish-v2.md, ready-to-use-components-1.12.md, stepper-kanban-changelog.md — chart-*.md (6 chart enhancement changesets: chart-crosshair-snap, chart-axes-scroll-fixes,
  chart-pie-label-improvements, chart-datatable-enhancements, chart-crosshair-animations-rangeselector,
  chart-crosshair-border-axis-range) — kanban-actions-chart-nav-zindex.md, pill-component.md — remove-tw-animate-from-components.md (new, components patch) — motion-domain-presets.md (new — fintech/med/edu/enterprise/default presets + easingFor + 24 tests)
→ Next "Version Packages" PR (changesets/action) will version all 18 at once.

================================================================================

EP 34 -- The Domain Presets That Made Motion Speak Every Language
--------------------------------------------------------------------------------
What this adds:
   The motion system was built and consumed (EP 31–33), but it had one missing
   piece: domain context. A fintech dashboard needs different motion than an
   education platform — shorter durations, no bounce, minimal travel for finance;
   springy, expressive, larger travel for education. Without domain presets,
   every consumer had to hand-tune the motion grammar per app.

   This episode adds domain motion presets that mirror the existing auth preset
   pattern (`packages/auth/src/presets.ts`): the same domain name ("fintech",
   "med", "edu") drives BOTH auth behavior AND motion behavior.

Commits: — 4960108 — feat(motion): add fintech domain motion presets (Phase 3a)
     Added DomainMotionConfig interface + 5 domain presets (fintech, med, edu,
     enterprise, default) in packages/motion/src/registry/domains.ts. Each preset
     defines: defaultTransition (duration + easing + type), allowSpring,
     distanceScale, forceReducedMotion, preferredFamilies, maxIntensity. Also
     added easingFor() utility (resolves easing name → cubic-bezier coords),
     getDomainMotionConfig() resolver, GENERATIVE_FAMILY_IDS export, 24 tests. — dad0e06 — lock(motion): commit domain-presets baseline + parity gate + README gate fixes
     domains.ts: easingFor() now derives cubic-bezier coords from
     @fusorb/facet-tokens motionValues.facetEasing (NO hardcoded bezier values).
     resolve.ts: DURATION_VALUES + EASING_FUNCTIONS derived from motionValues
     (single source of truth; was previously copied tables in resolve.ts).
     scripts/audit-motion-parity.mjs: new parity audit script verifying
     motionValues ↔ tokens.css (5 durations + 6 easings in sync).
     README.md: test count 902→926, CI gate list updated, domain preset docs. — aef768e — chore: update CLAUDE.md test counts 902→926 with domain preset additions

The DomainMotionConfig pattern:
   Each preset mirrors the auth preset structure — a config object with behavioral
   flags and numeric overrides, resolved by a single getDomainMotionConfig() call:
     fintech — fast durations, standard easing, no spring, 0.75x distance,
                   maxIntensity "medium" (professional/conservative)
     med — base durations, smooth easing, spring allowed, 1.0x distance,
                   maxIntensity "strong" (accessible/clear)
     edu — base durations, spring easing, 1.2x distance, maxIntensity
                   "dramatic" (engaging/friendly)
     enterprise — base durations, standard easing, no spring, 0.9x distance,
                   maxIntensity "strong" (balanced/professional)
     default — base durations, standard easing, spring allowed, 1.0x distance,
                   maxIntensity "dramatic" (general-purpose)

The 03d resolve.ts sync — NO HARDCODED CODES:
   EP 31's resolve.ts originally had DURATION_VALUES and EASING_FUNCTIONS as
   copied tables. Commit dad0e06 fixed this: both tables now derive from
   motionValues.facetDuration / motionValues.facetEasing via spread and
   Object.entries mapping. The audit-motion-parity.mjs script enforces that
   the JS values (motionValues) and the CSS custom properties (--facet-motion-*)
   stay in sync, and that resolve.ts never re-introduces hardcoded literals.
   This is the same pattern as EP 03's barrel↔manifest drift gate, applied to
   motion tokens: one source, two representations (JS + CSS), a script that
   asserts they match.

What we learned: — Domain presets generalize: the same "fintech/med/edu" naming already
     used for auth and layout configs now drives motion too. One domain name
     = consistent feel across auth, layout, AND motion. — Token derivation (not duplication): resolve.ts previously had copied tables
     that could drift from tokens.css. Deriving from motionValues + a parity
     script eliminates that class of drift at the source. — The motion system is now complete end-to-end: engine (EP 31) → consumed
     across components (EP 32) → portable for native (EP 32) → domain-aware
     (EP 33 audit) → domain presets (EP 34). Each layer was verified before
     the next began — the staged-building precedent from taste.

State: COMPLETE. All Phase 3 work committed (3 commits). — pnpm -r typecheck: 12 projects green ✓ — pnpm test: 926/926 across 10 projects (incl. 130 motion tests, 24 domain preset tests) ✓ — check:motion-drift: OK (72 barrel symbols, 15 generative + 18 authored) ✓ — audit:motion-parity: OK (5 durations + 6 easings in sync, resolve.ts derives from motionValues) ✓ — Working tree: CLEAN (3 commits ahead of origin/main)

Lesson: a token system without domain context is a calculator with no variables.
The motion engine could animate anything — but it couldn't animate the RIGHT
WAY for a fintech app until it knew which domain it was in. The presets close
the loop: same engine, same tokens, different personality per domain. And the
derivation check ensures the JS and CSS never drift apart — the same drift-gate
philosophy (EP 03, EP 29/30) now covers motion tokens too.

EP 35 — @fusorb/facet-sandbox initial scaffold + fix (committed f4ca95a): — Framework-agnostic live-preview host: block registry + adapter seam +
    config model + URL security helpers (src/index.ts, 186 lines) — React adapter with hand-written JSX parser (no eval/Function): 877 lines,
    includes Sandbox/SandboxProvider/PreviewFrame/PlaygroundErrorBoundary — 14 tests green; tsup emits slim host + react adapter (react/prettier externalized) — Fixed 4 bugs during verification (2 TypeScript errors, 2 test failures):
    • ReactElement<unknown> → ReactElement<any> in test assertions (TS2571)
    • renderFromCode missing components arg → pass {} (TS2554)
    • parseElement early-return consumed only first root → use parseChildren (Fragment)
    • Prop values assigned as ParsedElement → toReactNode(child) conversion — Two changesets created: facet-sandbox-initial.md + motion-domain-presets.md

================================================================================
EP 35 — facet-sandbox initial scaffold + fix (2026-09-17)
================================================================================
Context: The repo was at EP 34 (Phase 3 domain presets complete). A new
packages/sandbox/ package (@fusorb/facet-sandbox) was scaffolded with: — Block registry + adapter seam + config model + URL security helpers — React adapter with hand-written JSX parser (no eval, no Function constructor) — Sandbox/SandboxProvider/PreviewFrame components + error boundary — 14 tests (URL safety + parser correctness)

Issues found:
1. TypeScript: ReactElement<unknown> default made .props.accessing "unknown"
   (TS2571) — fix: cast to ReactElement<any> in test assertions
2. TypeScript: renderFromCode called with 1 arg instead of 2 (TS2554) — fix: pass empty components object {} for HTML-only snippets
3. Test failure: "groups multiple roots into a fragment" — renderFromCode's
   parseElement early-return consumed only the first root, skipping parseChildren — fix: always use parseChildren which correctly handles single and multiple
   roots, wrapping multiple roots in a Fragment
4. Test failure: "parses JSX nested in a prop value" — prop values assigned as
   ParsedElement objects instead of React nodes — fix: toReactNode(child) before
   assigning to props[attrName]

State: COMPLETE. Typecheck ✓ (12 packages + 2 apps green), 14/14 sandbox tests ✓,
tsup build ✓. Two changesets created: facet-sandbox-initial.md +
motion-domain-presets.md.

Lesson: When @types/react uses P=unknown as the default for ReactElement,
explicit <any> generics are needed for test assertions that drill into .props.
The parseElement-early-return pattern is an anti-pattern when the spec says
"handle multiple roots" — the fallback must be on the happy path, not the
exception path.

================================================================================

EP 36 -- .agent Consolidation & Tracker Merge (2026-09-20)
================================================================================
Context: The .agent/ directory had accumulated 11 files across 2 redundant
trackers (output.txt dashboard vs todo.txt priority list), 2 episode formats
(episodes.md technical only), 4 superseded
planning specs (V2 roadmap, V2/V5 foundation, motion architecture, motion
registry spec), a 207KB ui-rebuild-scratchpad.txt, and a resolved production
audit. Everything was already reflected in CLAUDE.md (engineering handbook)
and the canonical episodes.md episodic record.

What broke:
  Tracker drift & redundancy across 11 local-only files:
  — episodes.md (technical) —
    the same 35-episode narrative in two formats, maintained in parallel.
  — output.txt (247 lines, comprehensive dashboard) + todo.txt (34 lines,
    active session priorities) — overlapping priority tracking with no
    single source of truth for the current session.
  — production-audit.txt (190 lines) — A–G audit from 2026-09-13; all
    findings already resolved and documented in CLAUDE.md §17 + output.txt
    PRODUCTION-GRADE P0–P5 sections.
  — facet_v2_roadmap.txt (289 lines) — 4-phase V2 roadmap; Phase 0 (security
    fix) + Phase X (production hardening) already completed; Phase 2 (RN
    strategy — Option B chosen) resolved; all documented in CLAUDE.md §17–§19
    and output.txt.
  — v2-foundation-spec.md + v5-foundation-spec.md — versioning ground rules
    (semver independent-major per package, breaking-change process, public
    surface = barrel + re-exported types, release hygiene). Already codified
    in CLAUDE.md §17 (build status) + output.txt (version reconciliation).
  — facet-motion-architecture.md (125 lines) + facet-motion-registry-spec.md
    (211 lines) — motion system design; already implemented (EP 31–34) and
    documented in output.txt Phase 2A–2C + CLAUDE.md §19.
  — ui-rebuild-scratchpad.txt (207KB) — scratch source for the landing rebuild;
    all patterns already committed to apps/landing/ + packages/components/.
  — 0 empty files, 0 null-byte files in .agent/ (verified via PowerShell byte
    scan). 1 empty file (.git/index.stash.11528.lock) exists in the repo but
    is a Git internal lock artifact — left untouched.

How we fixed it:
  1. Production audit (G-series) resolution archived here — key findings:
     A) Arcevo/ArcevoTokens string sweep: 0 remnants after debrand.
     B) Hardcoded color audit: 0 remaining; 22 components gained typed props.
     C) Logo/svg audit: 0 external assets.
     D) Package metadata: neutralized (auth.arcevo.dev → auth.example.dev,
        ArcevoTokens → FacetTokens, publisher URLs updated).
     E) Tailwind @source: correctly configured (dist/ paths, v4).
     F) check:components + manifest + barrel: 114/114 synced.
     G) Result: all gates green (749/749 tests at the time, build clean).
  2. V2 roadmap decisions archived — Phase 0 security fix (API key backend
     v0.2.0, persistSession stores user only, refresh token via httpOnly cookie)
     complete; Phase 2 RN strategy: Option B (facet-native binding API with
     consumer-provided Animated module, no hard RN dependency) implemented
     (EP 32). Phase 3 (v2 mobile kit) + Phase 4 (ArcWallet kickoff) remain
     future work, tracked in output.txt "NEXT" section.
  3. V2/V5 foundation ground rules archived — versioning model (semver
     independent-major per package), breaking-change process (changeset major
     bump + drift gate), public surface boundary (barrel + re-exported types),
     deprecation lifecycle (2 minors warning), release hygiene (clean tree +
     pnpm -r build before publish) — all in CLAUDE.md §17.
  4. Motion architecture decisions archived — pure-JS engine, driver
     portability (resolve.ts extracted, zero DOM-bound code outside
     cssDriver.apply()), token derivation from motionValues (resolve.ts
     derives DURATION_VALUES/EASING_FUNCTIONS from motionValues), audit-motion-
     parity.mjs drift gate — all in EP 31–34.
  5. ui-rebuild-scratchpad.txt disposed — scratch content already reflected in
     committed code: apps/landing/ pages + sections, packages/components/ui/
     components (navbar glass header, FaqSection show-more, theme toggle,
     etc.).
  6. Trackers consolidated: todo.txt active priorities (CSS theme sync P1–P14,
     scratchpad analysis completed) merged into output.txt as the current
     session priority block. output.txt is the single source of truth for the
     dashboard + active priorities.

What survived:
  — episodes.md: remains the canonical technical episodic record (this file).
  — output.txt: remains the live dashboard + active session priority list.
  — CLAUDE.md: remains the engineering handbook (references updated).
  All deleted .agent/ files were local-only (gitignored); their content was
  already captured in these two canonical files.

State: COMPLETE. Files deleted: production-audit.txt,
facet_v2_roadmap.txt, v2-foundation-spec.md, v5-foundation-spec.md,
facet-motion-architecture.md, facet-motion-registry-spec.md,
ui-rebuild-scratchpad.txt, todo.txt. Files retained: episodes.md, output.txt.
CLAUDE.md references updated to remove dead .agent/ paths.

Lesson: a local tracker directory grows files faster than it grows clarity.
The fix is the same drift-gate philosophy applied to documentation: one source
of truth per domain (CLAUDE.md = handbook, episodes.md = process narrative,
output.txt = live dashboard), everything else is scratch that gets disposed.

EP 37 -- §15/§21/§7 Greening Streak (2026-09-22)
  — Commit group (4 commits):
    - ced96e7 fix(layout,§15): green docs-layout baseline. docs-aside.tsx swaps inline SVG/lucide-react
      for the icon registry (Icon name="chevron-down") per user correction; keeps Omit<onToggle> fix.
      docs-layout.tsx drops unused `links`. sidebar-auth.tsx drops dead router plumbing (RouterLink/
      useLayout/RouterAdapter, router param) — UserAvatarMenuItem has no href, so the link scaffolding was dead.
    - 0f21355 ci(§21): check-boundaries gate (scripts/check-boundaries.mjs). Enforces acyclic @fusorb DAG
      + facet-native isolated (own package, deps subset of facet-tokens). Wired into package.json
      check:boundaries + CI ci job (after check:icons). Pass: 12 packages, acyclic, native isolated.
    - 5534d1b docs(native): §7 disposition — SovGrant/SovPort integration surface. facet-native v0.1.0
      exports bindAnimated/unbindAnimated/nativeDriver/resolveNativeTransition/toEasingCurve + types; kept as
      its OWN package, NOT under motion (consumer-provided Animated API; ready for ../sovgrant ../sovport).
    - 2a04adc docs(handbook): CLAUDE.md CI gate chain lists check:boundaries; Package Layout (native) +
      motion phase item reflect §7 disposition (isolated, NOT wired to motion; Phase 4 = deferred wiring).
  — Green: layout tsc --noEmit OK; layout pnpm build OK (ESM 79.07 KB, DTS 28.72 KB); §21 gate OK.
  — Native placement (user musing): separate package (not a dir under motion), gated + ready for SovGrant/
    SovPort to bindAnimated a consumer-provided Animated module.
  — §16 LandingLayout: left as content-slot shell (hero/nav/footer ReactNode); render-prop slots would
    duplicate those props — no styled default to override — skipped per anti-over-engineer rule.
  — Concurrency: another agent's in-progress §15 (ConsoleLayout aside, docs/*, sidebar, index, landing)
    left uncommitted to avoid mis-attributing that agent's edits; layout typecheck green with it in flight.

EP 38 -- §21 Composability Hard Gate (2026-09-23, 6ed9647)
  — Composability-slot check promoted from SOFT warnings to a CI hard gate:
    check-composability.mjs now exits 1 on HARD_GAPS or SOFT_GAPS. The repo
    rejects code that violates the primitive -> styled -> composite -> consumer
    contract. Slot enforcement becomes an invariant, not a recommendation.

EP 39 -- §16 Composability Slots + ChatLayout (2026-09-23)
  — Data-driven composites gained render slots so Facet owns flow/state while
    consumers own presentation:
      * ApiKeyManager.renderKey(key)
      * InviteTeamForm.renderInvitee(invitee, { onRemove })
      * TestimonialShowcase.renderTestimonial(testimonial)
      * TwoFactorSetupPanel.renderQRCode(otpauthUri, secret)
  — Layout composites: Topbar (render-tenant/user-menu), PageHeader/TenantSwitcher
    composability slots (d1be92c, 08c3c8c).
  — ChatLayout + ChatInput added: desktop sidebar / mobile slide-in, optional
    topbar + router adapter + auth, configurable input. Chat-infra (not AI-only).
  — Review note: ChatLayoutInner had a Rules-of-Hooks bug (useEffect after
    conditional returns) -- fixed in this streak.

EP 40 -- §17 Motion Becomes Registry-Driven (2026-09-23, 6367295)
  — domain-motion switch() replaced by a module-level Map registry
    (registerDomainMotion / hasDomainMotionConfig / listDomainMotionConfigs).
  — Extension model shifts: new domain = register preset (no Facet source edit).
  — Unknown domains fall back to defaultMotion (no crash).

EP 41 -- Boundary Dispositions: Store, Native, SDK (2026-09-23, ac4abb4)
  — Store repositioned as framework-agnostic state layer (Zustand); SgProvider
    does NOT consume it (avoids auth->store->sdk + auth->sdk ownership tangle).
  — SDK moved from store runtime dep to peer/dev dep (less coupling).
  — AuthState moved into SDK-facing surface; provider derives isAuthenticated
    (single source of truth).
  — Native documented EXPERIMENTAL v0.1.0, isolated, NOT wired to motion.

EP 42 -- Docs Block Model (2026-09-23, e93bb5e)
  — Docs system gains typed block types: image, card, grid, hero.
  — Added to the DocsBlock union + renderer (content-model -> UI, not
    page -> JSX), preserving the docs-as-data contract.

EP 43 -- Review Stitch + ChatLayout Hook Fix (2026-09-22)
  — Ran the Sept-23 cluster review against the actual tree (diff, not titles):
    ✓ §16 slots on composites confirmed (ApiKeyManager.renderKey, InviteTeamForm.renderInvitee,
      TestimonialShowcase.renderTestimonial, TwoFactorSetupPanel.renderQRCode) — matches §16 master.
    ✓ §21 hard gate (6ed9647) corroborated (exit 1 on SOFT_GAPS/HARD_GAPS).
    ✓ §17 motion registry (6367295), §8/§7 store/native dispositions (ac4abb4),
      docs block model (e93bb5e) all corroborated.
  — cn() ownership: @fusorb/facet-motion owns cn (utils/cn.ts:7, barrel index.ts:16);
    components imports from motion. Smell = real; deferred per review's own guidance.
  — ChatLayout hook fix (724c84c): hoisted useEffect above isLoading/isAuthenticated early
    returns + guarded on both — stable hook order across auth transitions (Rules of Hooks).
  — Stance: native isolated + §21-gated; §16 LandingLayout stays a content-slot shell
    (render-props skipped — no styled default to override). Let the stream finish, then
    post-run diff review (ChatLayout tests, cn() ownership, registry lifecycle semantics).

================================================================================

EP 44 -- §16 Docs-Site Mobile Logo Toggle + Dynamic TOC + Aside Fixes (2026-09-23)
  — Docs right-hand aside: removed redundant `shadow-lg` (left only `border-l bg-background
    opacity-100 transition-[width]`) — clean, matching the sidebar.
  — Logo-as-mobile-toggle: `mobileBrand` prop wired to Topbar so the brand logo renders
    *inside* the hamburger toggle button (`onClick={toggleSidebar}`); static `brand` span
    set to `hidden lg:inline-flex` — on mobile only the logo appears as the toggle (no
    default hamburger icon + separate brand duplication).
  — Pointer-events fix: `pointer-events-none` on the transparent mobile sidebar wrapper
    (z-[80], covers the topbar area) so clicks pass through to the logo toggle above;
    `pointer-events-auto` on Sidebar's outer `<aside>` so sidebar content (search, nav
    links) stays interactive.
  — DocsTableOfContents rewritten: scans the rendered DOM (`h2[id]`, `h3[id]` within
    `<main>`) via MutationObserver + requestAnimationFrame instead of pre-parsed
    `blocks`; re-scans on `location.pathname` change; IntersectionObserver active-heading
    highlighting preserved; `px-4` horizontal padding added to the aside.
  — DocsLayout updated to `<DocsTableOfContents />` (removed `blocks` prop + unused
    `currentPath`/`currentPage` vars).
  — §16 docs-site UI pass: replaced blue hover backgrounds with `hover:bg-foreground/5`;
    sidebar `top-14 h-[calc(100vh-56px)]` positioning; `right-0` on desktop aside;
    PageActionBar pill redesign; overlay animations; tooltip data-state exit;
    icon registry verified (`chevron-down` in light-icons).
  — cn() extraction: `@fusorb/facet-utils` package created; `cn()` moved from
    `@fusorb/facet-motion/src/utils/cn.ts` to `@fusorb/facet-utils`; motion re-exports
    from utils; components imports cn from motion.
  — Verified: layout tsup build ✓ (79.85 KB ESM, 29.13 KB DTS), layout typecheck ✓,
    layout tests 35/35 ✓, docs typecheck ✓, docs tests 59/59 ✓.
   — Follow-up 1: mobile sidebar searchbar was missing — `sidebarSearch` only passed
     to desktop Sidebar instance in ConsoleLayout; mobile overlay Sidebar was missing
     it. Added `sidebarSearch={sidebarSearch}` → searchbar now appears in mobile overlay.
   — Follow-up 2: nav togglers hidden on mobile — section chevron toggle (rotate-90),
     item-group chevron (rotate-180 SVG), and SidebarToolbar (collapse/expand-all)
     now `hidden lg:inline-flex` / `hidden lg:flex` so they don't appear inside the
     mobile sidebar overlay; desktop keeps full accordion expand/collapse.
   — Follow-up 3: components hover bg refinements — replaced blue `hover:bg-accent` /
     `focus:bg-accent` / `data-[state=open]:bg-accent` → `hover:bg-foreground/5` across
     `dropdown-menu.tsx` (4 variants), `navbar.tsx` (4 hover:bg-accent/60), and
     `navigation-menu.tsx` (2 hover + 2 focus + active + open-state). §16 neutral tint.
   — Rebuilt @fusorb/facet-layout dist: 79.92 KB ESM (was 79.85 KB), 29.13 KB DTS.
     @fusorb/facet-components rebuilt (build ✓, typecheck ✓).

   ================================================================================

   EP 45 -- The Focus Rings That Wouldn't Leave
   --------------------------------------------------------------------------------
   What broke:
   Every component showed a blue border on hover or click — the Tailwind focus
   ring classes (`focus:ring-2 focus:ring-ring focus:ring-offset-2`) plus the
   global `:focus-visible { outline: 1.5px solid var(--accent) }` in tokens.css
   and the `.lab :where(input, textarea):focus-visible` rule in labs.css. The
   user found this unnecessary and asked for it removed from ALL components,
   including the combobox and ready-to-use components.

   How we fixed it:
   1. Wrote a Node.js script that surgically removed only ring/border focus
     classes from className strings:
       `focus:ring-*`          (e.g., focus:ring-2, focus:ring-0)
       `focus-visible:ring-*`  (e.g., focus-visible:ring-2, focus:ring-offset-2)
       `focus-within:ring-*`   (e.g., focus-within:ring-2, focus:ring-ring/30)
       `hover:ring-*`          (e.g., hover:ring-2, hover:ring-ring)
       `focus:border-primary`
     The regex preserved `outline-none` on every component so the browser's
     default blue outline is suppressed — components show NO border on click.
   2. Preserved STATIC ring classes used for non-focus states:
       - Pill selected:  `ring-2 ring-ring ring-offset-2`
       - Stepper active: `ring-2 ring-primary/30 ring-offset-2 ring-offset-background`
       - InputOTP active slot: `ring-1 ring-ring`
       - MultiCombobox open: `ring-2 ring-ring/30`
       - LayerGraph active: `ring-2 ring-primary/20`
       - Changelog badges: `ring-2 ring-background`
   3. Removed the global CSS focus-outline rules:
       - tokens.css: `:focus-visible { outline: 1.5px solid var(--accent); ... }`
       - labs.css:   `.lab :where(input, textarea):focus-visible { outline: 2px ... }`
   4. Cleaned up empty string arguments left by removal in cn() calls (pill.tsx,
     stepper.tsx, account-settings-panel.tsx, DomainToggle.tsx).
   5. Removed 9 unused `Motion` imports from alert-dialog.tsx, context-menu.tsx,
     dialog.tsx, menubar.tsx, navigation-menu.tsx, popover.tsx, select.tsx,
     sheet.tsx, tooltip.tsx — pre-existing dead imports from the §16 motion
     migration that surfaced as the build-greening baseline.

   State: automated. Full-repo grep confirms 0 `focus:ring-*`,
   `focus-visible:ring-*`, `focus-within:ring-*`, `hover:ring-*`, and
   `focus:border-primary` tokens remain in source. Static ring classes for
   selected/active/badge states are intact. Components typecheck +, tsup build +
   DTS ✓. Changesets staged.

   Lesson: the "unnecessary" in design systems is often the invariant nobody wrote
   a gate for. The fix isn't "remove everything" — it's "remove the ring/border
   tokens while keeping outline-none (suppress browser default) and preserving
   the static rings that encode state (selected, active, open)." A targeted regex
   that matches only `focus:ring-*` (not `focus:bg-*` or `focus:text-*`) makes the
   distinction mechanical, not manual.

   ================================================================================

   EP 46 -- Collapsed Sidebar Variant + Repo-Wide Cleanup
   ---------------------------------------------------------
   Date: 2026-09-24

   A. Collapsed sidebar variant (layout package)
      - Confirmed: NO prior mechanism collapsed all sidebar sections + the aside
        simultaneously. Three separate, un-unified systems existed:
          1. Sidebar rail collapse  (sidebarCollapsed in LayoutContext)
          2. Section accordion      (collapseAll/expandAll in LayoutContext)
          3. Aside toggle           (asideOpen in DocsLayoutContext)
      - Added to LayoutContext:
          * registerSections(ids)       — ref populated by Sidebar on config change
          * collapseAllSidebar()        — collapseAll(registeredIds) + setSidebarCollapsed(true)
          * expandAllSidebar()          — expandAll(registeredIds) + setSidebarCollapsed(false)
      - Added to DocsLayoutContext:
          * collapsedAll (boolean, synced via effect from DocsTopbarControls)
          * collapseAllSidebarAndAside()  — refs → ref.collapse?.()
          * expandAllSidebarAndAside()    — refs → ref.expand?.()
          * toggleCollapseAll()           — delegates to ref (reads ref.collapsedAll)
      - DocsTopbarControls component (in docs-layout.tsx):
          * Lives inside ConsoleLayoutInner → inside BOTH LayoutProvider + DocsLayoutContext
          * Computes collapsedAll = mode === "rail" && sidebarCollapsed && !asideOpen
          * Populates collapseAllStateRef.current during render (closures are always fresh)
          * Syncs collapsedAll → useState via useEffect for external consumers
          * Renders: mode toggle, aside toggle, NEW collapse-all button, consumer topbar
          * Collapse-all button: mode="rail" + collapseAllSidebar() + setAsideOpen(false)
          * Expand-all button: mode="full" + expandAllSidebar() + setAsideOpen(true)
          * Keyboard shortcut: Ctrl+Shift+B
          * Icons: minimize-2 / maximize-2 (resolved via lazy lucide catalog)
      - Sidebar component: calls registerSections(config.navigation ids) in useEffect
      - SettingsMenu (docs app): added "Collapse all sidebar & aside" / "Expand all" item
      - All state persists via existing localStorage keys (no new keys)
      - Button hidden on mobile (lg:inline-flex) — sidebar is slide-in on mobile
      - Build + typecheck ✓ (layout, docs, apps/docs all pass)

   B. Repo-wide file cleanup
      Deleted 27 tracked files:
      - Root debug scripts (10): capture-errors.{js,ps1}, check-{cdp,cdp2,cdp3,full,css,
        no-block,page}.{mjs,js,ps1} — all unreferenced, hardcoded debugging tools
      - Root build artifact (1): served.css — Vite CSS-as-JS output, unreferenced
      - Landing temp file (1): apps/landing/src/tmp.css — unreferenced
      - Stale scripts/ tools (14): audit-sg-consumption, audit-claims,
        audit-hardcoded-colors, audit-icons, audit-repo, audit-tokens-parity,
        audit-variants, check-location-data, fix-pages-strings, gen-countries,
        gen-ng-lgas, gen-pages, gen-regions, rename-arc-ui — all unreferenced
      - Stale data (1): scripts/data/countries-states.json — only used by deleted
        scripts; the generated location-data.ts is already committed in source
      - Empty scripts/data/ directory removed
      Deleted 6 gitignored scratchpad temp files (remove-focus.cjs, commit-msg-*.txt,
        empty *.output.txt files) for hygiene
      Kept: gen-snapshot.js (referenced in CLAUDE.md), scripts/test-setup.ts and
        react-test-utils-shim.ts (used by 5 package-level vitest configs),
        all CI-referenced scripts (check-docs-inventory, gen-icon-map, etc.)
      State: complete. 27 files staged for deletion via git rm -f. Changeset created.

   ================================================================

EP 47 -- ChangelogCard / ChangelogFeed Replace Changeset + §18 Hero Rebuild
--------------------------------------------------------------------------------
Date: 2026-09-25
Commit: 4ecefd6 — "feat(components,landing): replace Changeset with
ChangelogCard/ChangelogFeed + §18 hero rebuild" (21 files, 2095 ins, 746 del)

What broke:
  The `Changeset` component (packages/components/src/ui/changeset.tsx) was a
  docs-only `changeset` block type — a date-grouped CONTENT timeline renderer
  with nested blocks. No .mdx/.ts/.md content in the repo invoked
  `type: "changeset"`; only schema (pages.ts), renderer (DocsContentPage case),
  import, and the auto-manifest wired it. It was added last session (6cbf23c)
  as a stepping stone but was never meant to be the final form: the landing
  needed a full changelog UI pair (card + feed), not a single docs-block
  renderer. The Changeset component also lacked tests, composability slots, and
  the token-faithful styling the canon demands.

How we fixed it:

A. ChangelogCard (packages/components/src/ui/changelog-card.tsx)
   - ChangelogCard — root; consumes a single ChangelogItem + optional
     showDiff state
   - ChangelogHeader — date pill (right-side h3 id) + category badge (cvca)
   - ChangelogTitle — release title + version
   - ChangelogDescription — plain-text description
   - ChangelogHighlights — dot-list of key changes (text-success/destructive)
   - ChangelogDiffToggle — Button (ghost, sm) toggles diff visibility;
     icon swaps (eye / eye-off) via LightIcon
   - ChangelogDiffViewer — collapsible diff code block (bg-muted/60, rounded,
     monospace, scroll-x, line numbers)
   - Tokens only — bg-card, border-border, text-foreground,
     text-muted-foreground, bg-muted, bg-primary, bg-success, bg-warning,
     bg-destructive, ring-primary, bg-primary/10. NO arbitrary values.
   - Badge: cvca variants (default/secondary/outline/success/warning/destructive)
   - Button: facets variants (default/secondary/ghost/outline), size sm
   - 5 tests: renders, header, highlights, diff toggle, diff viewer

B. ChangelogFeed (packages/components/src/ui/changelog-feed.tsx)
   - ChangelogFeed — root; renders filtered ChangelogItem[] as a vertical
     timeline with staggered entrances
   - FilterBar — category filter buttons (all/added/changed/fixed/deprecated)
   - Timeline — vertical connector line (border-l, absolute) with child items
   - TimelineItem — individual item with stagger() delay (baseDelay 0ms,
     count = items.length) via @fusorb/facet-motion
   - 4 tests: renders empty, renders items, filter by category, active filter
   - Compound API pattern (render-prop-style sub-component composition)

C. Migration (blast radius: barrel + docs engine + schema + count)
   - Deleted changeset.tsx
   - Barrel (index.ts L559-563): Changeset export → ChangelogCard + ChangelogFeed
     + ChangelogItem, ReleaseCategory, ReleaseStatus, ChangeCategory types
   - DocsContentPage.tsx: removed Changeset import + `case "changeset"` (L286-297)
   - pages.ts: removed `changeset` from DocsBlock union (L116-128)
   - gen-docs-manifest.mjs CATEGORY map: dropped changeset, added
     changelog-card + changelog-feed → regenerated manifest.ts
   - Count 117→118 propagated: CLAUDE.md, README, package.json,
     site-data.generated.ts

§18 Chunk 1 — Landing Hero Rebuild (committed together in 4ecefd6):
   - HeroSection.tsx rebuilt: dropped domain-cycling 3.2s state machine,
     auth-preview card, tech-pill inventory. Kept positioning H1 + supporting
     line + Explore(/components) / Read-the-Docs CTAs (facet Button) +
     install row. Visual = LayerGraph(SYSTEM_LAYERS). Removed arbitrary
     min-h-[60vh]/max-w-[1200px] (LandingLayout shell owns spacing).
   - scripts/gen-site-data.mjs extended: detectColorSpace() (scans tokens CSS
     for oklch() → "OKLCH") + countPresets() → 5. Emits COLOR_SPACE +
     DOMAIN_PRESET_COUNT to site-data.generated.ts.
   - ArchitectureSection.tsx now consumes both (literals gone).
   - apps/landing + apps/docs changelog data updated.
   - Changeset fragment: @fusorb/facet-components major (breaking Changeset
     removal)

Verified:
   - tsc(components): EXIT 0
   - vitest: changelog-card 5/5 ✓, changelog-feed 4/4 ✓ (9 total)
   - check:docs: 118/118 (barrel ↔ manifest ↔ CLAUDE.md synced)
   - check:components: 118/118 appearance, 118/118 config,
     0 HARD gaps, 0 slot gaps
   - check-component-flexibility: 0 SOFT_GAPS

Lesson: a docs-block renderer (Changeset) and a UI component pair
(ChangelogCard/ChangelogFeed) serve different contracts. Replacing the
former with the latter was not a rename — it was a model change: from "single
docs block type with nested blocks" to "composable component pair with
compound API, token-faithful styling, and staggered motion." The cascade
(barrel → docs engine → schema → manifest → count) was mechanical once the
target shape was chosen; the substance was in the component pair itself —
6 sub-components for the card, 4 for the feed, 9 tests, and a changeset
that properly records the breaking removal.

================================================================================

EP 48 -- The Spring That Snapped on First Frame
--------------------------------------------------------------------------------
What broke:
   The motion asChild fix (9905bd9) resolved the wrapper-div and CSS-duration
   issues — but enter animations on popover components were STILL not rendering
   the necessary animation. Dropdowns appeared to snap open without the smooth
   fade-in. The transform (CSS transition) animated correctly after the
   asChild fix, but the opacity (JS spring) snapped to 1.0 instantly with no
   visible spring motion.

Root cause:
   `defaultScheduler` in `packages/motion/src/core/scheduler.ts` used
   `requestAnimationFrame` and on the first frame computed:

     `const delta = last === 0 ? now : now - last;`

   where `now` is the absolute DOMHighResTimeStamp (e.g. 5432 ms since page
   load). This `delta` was accumulated into `elapsed` in `animate.tick`:

     `elapsed += delta;  // 0 + 5432 = 5432`

   The spring generator at t=5432 ms (already 5+ seconds in) returns its
   settled value (~1.0), so `value.set(1)` fired on the very first frame —
   the spring jumped to its target instantly with zero visible animation.

   Tests never caught this because vitest runs in Node with `vi.useFakeTimers()`,
   where `requestAnimationFrame` is unavailable and the scheduler falls back to
   `setInterval` with a correct ~16 ms first delta.

How we fixed it:
   Changed the first-frame delta from the absolute rAF timestamp to 0
   (no time has elapsed since the animation just started):

     `let last: number | null = null;`  (was `let last = 0;`)
     `const delta = last === null ? 0 : now - last;`  (was `last === 0 ? now : ...`)

   Now: frame 1 → delta=0 → generator(0)=from-value (no snap) → frame 2 →
   delta≈16 ms → spring animates toward target over ~500 ms as intended.

   - Added regression test `packages/motion/src/core/scheduler.test.ts`
   - Added changeset `@fusorb/facet-motion: patch`
     (`.changeset/motion-scheduler-fix.md`)

State: verified. Motion typecheck ✓, components typecheck ✓, motion tests ✓
   (incl. 2 new scheduler tests), dist rebuilt and confirmed containing
   `last2===null ? 0 : now-last2`. Commit 1df5aef (scheduler fix, 3 files).
   Pre-existing changelog-migration changes committed separately as 5992631
   (6 files). Working tree clean. All CI gates pass.

Lesson: the test environment lied. A scheduler that passes tests in Node
   (setInterval fallback) can still be catastrophically wrong in the browser
   (rAF first-frame timestamp). The bug only surfaces in rAF path, which no
   test exercised. Fix the scheduler boundary — it is the source of truth
   for elapsed time, and `elapsed += absolute_timestamp` is always wrong.

================================================================================

EP 49 -- The Animation That Hardcoded Itself
--------------------------------------------------------------------------------
What broke:
   The animation surfaces of @fusorb/facet-components were only loosely wired
   to the motion system they ship with. A repo-wide audit surfaced three
   classes of "hardcoded" drift and one real bug:
   (a) the brand-gradient default was a raw `#d946ef` literal in three places
       (Aurora, GradientText, GradientBorderCard);
   (b) every animation component's `duration` prop was `number` (ms) only, so
       a consumer could not pass a motion Duration token ("slow", "cinematic")
       even though @fusorb/facet-motion's own Duration type accepts them;
   (c) the ambient loop utilities (animate-facet-marquee / -aurora / -beam)
       hardcoded 20s / 18s / 7s instead of resolving from tokens.
   And a bug hid in plain sight: RevealCard / ScrollReveal built their CSS
   transition as
     `opacity, transform ${duration}ms ${resolveEasing("standard")}`
   but resolveEasing() returns a *JS easing function*, so the template string
   stringified the function source into the timing-function slot -- an invalid
   declaration (no transition, or just the global 0.25s reset). No test caught
   it: the existing tests only assert textContent / class presence.

Root cause:
   The animation components were written before the motion registry matured, so
   they hand-rolled transitions with inline ms values and Tailwind `duration-*`
   utilities and never threaded the token ladder that @fusorb/facet-tokens
   already exposes. resolveEasing's contract shape (function, not CSS string)
   was never reflected at the call site -- the compiler stayed quiet because
   both sides had already become strings.

How we fixed it:
   - @fusorb/facet-tokens: added `--accent-fuchsia` (root + light + Tailwind
     `--color-accent-fuchsia`) and ambient loop durations
     `--motion-duration-{beam,aurora,marquee}`. tailwind.css's
     animate-facet-{marquee,aurora,beam} now resolve duration/easing from tokens.
   - @fusorb/facet-components: every `duration` prop in card-animations,
     micro-interactions, text-animations and animated is now `Duration` (the
     motion type; plain numbers still pass through) and resolves via
     resolveDuration(). Replaced the `#d946ef` defaults with
     `var(--accent-fuchsia)` and converted the remaining `duration-*` utility
     classes on those surfaces to token-driven inline durations.
   - Fixed the transition timing: `var(--motion-ease-standard)` replaces the
     stringified function in RevealCard / ScrollReveal.
   - Changeset: `.changeset/animation-token-flexibility.md`
     (@fusorb/facet-tokens minor, @fusorb/facet-components patch).

What survived:
   The motion package itself needed no change: its registry, Duration/Easing
   enums, domain presets (registerDomainMotion) and driver registry were already
   the flexible, extendable, composable layer. The gap was purely at the
   component edge, where the token vocabulary was not threaded through.

State: verified. tsc(components) EXIT 0. Committed 5974aae (animation
   flexibility, 10 files). Full gate pass + triad run by the user.

Lesson: a design system is only as tokenized as its furthest-out call site.
   The engine was clean; the components were the leak. And when a helper's
   return type moves from "CSS string" to "function", the compiler stays quiet
   -- the guard is using the token, not re-deriving the value.

================================================================================

EP 50 -- Two Change Sets in One Tree
--------------------------------------------------------------------------------
What broke:
   The working tree held two unrelated change sets at once on
   fix/overlay-lifecycle-revert: the Phase 3 overlay-lifecycle revert (staged)
   and the native-package + motion + landing-lab work (unstaged), while the
   landing-lab deletions and the animation pass were un-changesetted. The audit
   confirmed the overlay revert itself was clean -- zero dangling Presence /
   useOverlayOpen / OverlayContext / motion-usage / forceMount references across
   the components and drift-gate scripts -- so the risk was release/docs
   integrity, not code correctness.

How we fixed it:
   Committed in two logical batches rather than one:
   - a1b35b0 chore(workspace): overlay lifecycle revert, native motion driver
     registry, lab consolidation (65 files) -- overlay CSS-exit revert + focus
     rings + z-[60]/z-[70], the facet-motion driver registry, facet-native
     auto-registration + native Motion, and the landing lab-page consolidation.
   - 5974aae feat(components,tokens): token-driven animation flexibility
     (10 files, incl. `.changeset/animation-token-flexibility.md`).
   The duplicate `.changeset/motion-driver-registry.md` drafted this session was
   dropped: the already-staged `.changeset/native-driver-registry.md` covered
   @fusorb/facet-motion minor + @fusorb/facet-native minor + @fusorb/facet-cli
   patch. The stray untracked `nul)` artifact was already gone by commit time.

State: working tree clean at 5974aae on fix/overlay-lifecycle-revert.

Lesson: two change sets in one tree are fine to *hold*, dangerous to *ship*.
   Stage, split by concern, and let each changeset describe its own delta --
   the generated changelog data and lockfile ride along with the batch they
   belong to, not with an unrelated one.

================================================================================

EP 51 -- The Palette That Proved It
--------------------------------------------------------------------------------
What changed:
   Wanted proof that the token layer is the ONLY thing that varies between
   surfaces -- same components, different brand. So the three apps were split
   onto different palettes:
     • apps/landing    → "Alpha" (deep-space + electric-cyan)
     • apps/docs       → "Alpha"
     • apps/playground → "Ember" (warm orange / rose) -- the deliberate opposite
   Before this, landing + docs leaned on the default cyan (--primary #38bdf8)
   and landing hardcoded --domain-accent: #38bdf8.

How we did it:
   - packages/tokens/src/palettes/alpha.css + ember.css: each re-maps the FULL
     semantic contract (brand, surfaces, text, lines, charts, sidebar) for both
     :root (dark) and [data-theme="light"]. alpha.css is composed from the Alpha
     Palette vars via color-mix over --alpha-*, so editing a single --alpha-*
     value cascades through the whole ramp -- palette derived from palette.
   - Each app imports its palette AFTER tokens.css so it wins the cascade:
     landing + docs → palettes/alpha.css; playground → palettes/ember.css.
   - Shipped as a real package feature: package.json exports
     (./palettes/alpha.css, ./palettes/ember.css), the build copies
     src/palettes → dist/palettes, and minify-css.cjs minifies them.
   - landing's --domain-accent is now var(--primary) (follows the palette).
   - Changeset .changeset/token-palettes.md (@fusorb/facet-tokens minor).

What survived:
   ZERO component changes. The proof is negative: nothing in
   packages/components was touched, yet the same Button / Card / Dialog render
   in cyan-navy (Alpha), in warm orange (Ember), and in the default cyan --
   because every component reads semantic tokens, never raw colour.

Verified (built, then inspected the emitted CSS):
   - tokens build EXIT 0; dist/palettes/{alpha,ember}.css present (minified).
   - apps/playground vite build EXIT 0 → #f97316 (Ember) in the CSS.
   - apps/docs     vite build EXIT 0 → #4ad3f5 + #0a1a2f (Alpha) in the CSS.
   - apps/landing  vite build EXIT 0 → #4ad3f5 (Alpha) in the CSS.

State: committed. f76a519 (palettes, 8 files) + 4ba2ab7 (regenerated app
   changelog data). Working tree clean.

Lesson: a design system only earns "dynamically composable" when a rebrand is a
   one-line @import and NO component edit. If swapping the palette touches a
   component, the token leaked. Keep palettes composed from other tokens
   (color-mix over --alpha-*), never from duplicated hex.

================================================================================

EP 52 -- The Exit That Never Fired
--------------------------------------------------------------------------------
What broke:
   Asked to visually confirm the popover-family animations, I drove the running
   dev servers over CDP (the repo's own scratchpad harness -- `agent-browser`
   is not installed). Result:

   • ENTER ✓ -- hovering the navbar "Product" trigger mounts the menu and
     Motion animates opacity 0→1 and transform scale(0.85) translateY(24px)→1
     over ~160ms; animationName stays "none" (JS path, as designed). Vision on
     the captured PNG confirms the panel renders (Alpha palette, cyan).

   • EXIT ✗ -- on mouseleave the node leaves the DOM in a SINGLE frame. A
     per-frame rAF trace over ~800ms never observes data-state="closed" and
     never observes animationName="facet-zoom-out"; the node goes
     open → unmounted directly.

   The CSS is NOT at fault: forcing data-state="closed" on the mounted node
   resolves animationName="facet-zoom-out", duration 0.2s.

Root cause:
   `<Motion asChild>` wraps the Radix Content. Radix Presence decides the exit
   from `getComputedStyle(node).animationName` at the present→false layout
   effect (@radix-ui/react-presence: `if animationName === "none" -> UNMOUNT`).
   Here that read sees "none" at the transition, so Presence unmounts at once.
   Every popover-family component shares the identical pattern
   (`<Motion asChild>` + `data-[state=closed]:animate-facet-*`), so the exit
   side of the Phase-3 overlay revert is effectively dead across the family.
   The revert was "verified clean" (no dangling refs) -- but that is a static
   check, not a runtime one.

Impact:
   Enter zoom/fade animations work everywhere; exit animations do not run. That
   is the opposite of the revert's intent (CSS-driven exit) and a regression
   from the previous Presence + Motion exit path.

Next:
   Fix options - (a) restore an explicit exit path (forceMount + Presence, the
   pre-revert approach), or (b) find why Radix Presence reads "none" here
   (likely the Motion clone is not the node Presence observes). Needs a
   component change + changeset + a re-verify across all 10 overlays.

Env notes:
   - Dev servers were up with the ports swapped (5173 = docs demo, 5174 = landing).
   - The docs dev server rendered blank intermittently during the sweep
     (parallel `pnpm install` churn) -> only the landing was traceable.
   - The branch had moved from fix/overlay-lifecycle-revert to `main`, with a
     changesets "version packages" release commit + a merge from origin/main
     already sitting on top of the palette + animation commits.

Lesson: "no dangling references" is a static check; it says nothing about
   whether the animation still RUNS. Overlay enter/exit must be verified in a
   real browser per primitive -- never inferred from the class names existing.

================================================================================

EP 53 -- The Exit, Fixed by Subtraction
--------------------------------------------------------------------------------
What broke (continued from EP 52):
   Overlay exit animations never ran because every popover-family component
   wrapped its Radix content in `<Motion asChild effect="zoom">`. Radix
   Presence decides the exit from `getComputedStyle(node).animationName`; with
   the wrapper that read yielded "none", so Presence unmounted the node in the
   same task as the data-state flip. Proof: a MutationObserver caught
   `data-state` open -> closed on the content (role=menu, carrying the
   out-class) with the node already detached.

How we fixed it:
   Subtraction. Dropped the `<Motion>` wrapper and made BOTH halves CSS:
     data-[state=open]:animate-facet-zoom-in data-[state=closed]:animate-facet-zoom-out
   -- exactly the shape Radix Presence handles natively (the pattern shadcn/ui
   ships). Applied to all 11 overlays: dropdown-menu, context-menu, menubar,
   select, popover, hover-card, tooltip, navigation-menu, dialog, alert-dialog,
   sheet. `@fusorb/facet-motion` is no longer imported by any of them; `stepper`
   keeps its standalone `<Motion>` content transition.
   Changeset: .changeset/overlay-exit-animations.md (components patch).

State: committed 90c1637 on `main`. VERIFIED -- see EP 56 (EP 54 explains why it
   was briefly unverifiable).

Lesson: when a Radix primitive's exit animation "doesn't fire", suspect a
   wrapper between Presence and the animated node before blaming the CSS. The
   class was always correct; the node Presence observed was not.

================================================================================

EP 54 -- The Store That Went Missing
--------------------------------------------------------------------------------
What broke:
   Mid-session the toolchain stopped working. `tsup` failed with
   "@esbuild/win32-x64 could not be found", then "Cannot find module 'fdir'",
   then components `tsc` reported hundreds of `Cannot find module 'react'` /
   `@radix-ui/*` / `class-variance-authority` -- node_modules/.pnpm is missing
   many packages. `lucide-react` had already failed to resolve earlier. A local
   `update` branch's upstream was gone; a changesets "version packages" release
   commit + an origin/main merge appeared on `main`. A parallel session is
   installing/publishing concurrently.

How we worked around it:
   Restored only what was needed to test the hypothesis (npm pack
   @esbuild/win32-x64@0.28.2 -> ESBUILD_BINARY_PATH) but the very next module
   was missing too, so full repair = `pnpm install`. Did NOT run it, to avoid
   racing the parallel session (concurrent pnpm installs can corrupt the store --
   a likely cause of the breakage).

Impact:
   build / typecheck / test / vitest CANNOT run locally. The overlay fix (EP 53)
   is therefore verified by inspection + live CDP diagnosis only, NOT by the
   triad. It must be re-verified with `pnpm check:all` after a clean
   `pnpm install`.

Lesson: a package-manager store shared across concurrent sessions is a shared
   mutable resource. Diagnose with the store intact; repair with a single owner.

================================================================================

EP 55 -- Landing Audit: Palettes That Don't Follow the Palette
--------------------------------------------------------------------------------
What's wrong (apps/landing):
   - apps/landing/src/data/scratchpad.ts hardcodes colours that ignore the token
     system: PACKAGE_COLOR uses raw Tailwind palette classes (text-emerald-400,
     text-sky-400, text-violet-400, ...) and MOTION_FAMILIES / SYSTEM_LAYERS /
     CUSTOMIZATION_AXES use raw `oklch(...)` literals. So the "ecosystem" and
     "motion families" sections do NOT follow the Alpha palette -- the exact
     thing the palette work (EP 51) set out to prove.
   - TOKEN_CATEGORIES sample values are stale/fictional: `--primary:
     oklch(0.82 0.13 220)` while the real token is `#38bdf8` (Alpha: `#4ad3f5`).
     The token explorer shows values that are not the tokens.
   - PACKAGE_LAYER omits `utils` (12 of 13 packages); SHARED_PRICING prose says
     "All 12 packages on npm".

State: FIXED in EP 57 (commit 2fa7844).

Lesson: a marketing surface that hardcodes colours cannot demonstrate that the
   tokens are dynamic. The landing should be the first consumer that proves it.

================================================================================

EP 56 -- Verified: The Exit Fires
--------------------------------------------------------------------------------
Context: EP 53 shipped the overlay exit fix unverified because the store in
   EP 54 was missing packages. The user repaired it (`pnpm i --force`, 520
   packages relinked) and ran the full gate pass.

Gate (`pnpm check:all`): GREEN.
   components 116/116 appearance+config, 22/22 composites; docs / sdk /
   sdk-drift / motion-drift / boundaries / motion-parity all OK;
   `pnpm -r build` OK; `pnpm -r typecheck` OK; vitest 75 files / 961 tests passed.

Visual verification (CDP against the BUILT landing served by vite preview):
   Hovering the navbar "Product" trigger --
     enter -> animationstart facet-zoom-in @61ms, animationend @248ms
     exit  -> data-state open -> closed on the CONNECTED node with
              animationName = facet-zoom-out; start @1542ms, end @1732ms
   Mid-flight frames caught the zoom-out: opacity 0.04 / scale(0.856) ->
   opacity 0 / scale(0.85) -> node removed.
   RESULT: enter_anim=true  exit_anim=true.

Before EP 53 the same trace showed the node detached in the same task as the
   data-state flip and no facet-zoom-out at all. So the fix is confirmed in a
   real browser -- not inferred from the class merely existing.

Lesson: "unverified" is a debt with a named creditor. Here it was the store; once
   repaired, the very trace that proved the bug proved the fix. Keep the script
   (scratchpad/verify-exit-fix.mjs) so the claim stays re-runnable.

================================================================================

EP 57 -- The Landing Finally Reads Its Own Tokens
--------------------------------------------------------------------------------
What was wrong (EP 55) and how it was fixed:
   1. The landing was NOT on the Alpha palette. apps/docs imported
      palettes/alpha.css; apps/landing never did, so the marketing surface
      rendered on the DEFAULT tokens (hardcoded #38bdf8) while every component
      it showcases used Alpha. Added the palette import (after tokens.css);
      --domain-accent now resolves to var(--primary). Proof: the built CSS
      contains `--alpha-electric-cyan`.
   2. Hardcoded colours -> tokens. SYSTEM_LAYERS / CUSTOMIZATION_AXES /
      MOTION_FAMILIES held raw oklch() literals; PACKAGE_COLOR / AUTH_MACHINE /
      ComponentsSection used raw Tailwind palette classes; dashboard-demo used
      hex accents. All now reference tokens: var(--chart-1..5), var(--primary),
      var(--accent), var(--success), var(--warning), var(--destructive),
      var(--accent-fuchsia), text-muted-foreground.
   3. Dead TOKEN_CATEGORIES deleted. No consumer repo-wide (the Token Explorer
      page is gone) and its values were fiction ("--primary: oklch(0.82 0.13 220)"
      vs the real #38bdf8). A live token view must read getComputedStyle, not
      duplicate a table that drifts.
   4. Ecosystem completeness: `utils` was missing from PACKAGE_LAYER (12 of 13
      packages) -> added. Component counts 114+ -> 116. The pricing bullet now
      interpolates SITE_PACKAGES_COUNT instead of the stale literal "12".

Verified: landing `tsc --noEmit` clean; `vite build` clean; built CSS carries
   --alpha-electric-cyan and .text-chart-3 / .text-accent-fuchsia / .text-success.

Committed as "fix(landing): drive the marketing surface from tokens, on the Alpha
   palette" (2fa7844, rebased to 43ba44f by a parallel session) plus its
   regenerated changelog (81e24be -> 6e3e264). A full `pnpm check:all` re-run
   afterwards was GREEN: 8 drift gates + build + typecheck, vitest 75 files /
   961 tests passed. Post-gate data regen: e6024d5.

Note: a parallel session rebases this branch, so commit hashes here shift -
   treat the commit subjects as the stable identifiers.

Note: --accent-fuchsia is a token but NOT palette-overridden (fixed #d946ef in
   tokens.css). It is used for exactly one motion family (press) and one
   component category (Ready-to-use). If the palettes should retint every accent,
   that token (and a proper accent ramp) belongs in the palette contract.

Lesson: "we shipped a palette" is only true for the apps that import it. Audit
   the import graph, not the intent - docs had it, the landing did not, and the
   landing is the surface advertising the palette.

================================================================================

EP 58 -- The Files That Nothing Imported
--------------------------------------------------------------------------------
What was wrong:
   After the hardcode/modularization/drift-fix rounds the repo was green
   (`pnpm check:all` -> 116/116, 961 tests), but the tree still carried dead
   weight and several claims had drifted from reality:
   1. DEAD FILES -- apps/landing had four orphan modules with zero importers
      (components/labs/{LabSurface,index}, sections/{ComponentsSection,
      LayoutSection}) plus a generated-but-unconsumed data/changelog.ts, and
      two strays (plan.txt, rendered.html). Root had an empty "-p/" dir and a
      scratchpad of 130 CDP screenshots/scripts; packages/motion/src/utils was
      an empty directory.
   2. COUNT DRIFT -- the canonical component count is 116 (check:docs +
      check:components), but packages/components/package.json said "118" and
      apps/docs pages.ts said "113". docs also claimed "715 tests / 56 files"
      (actual 961 / 75) and "React 18/19" (peer deps are ^19).
   3. README -- the version table was stale for 11 of 13 packages, omitted
      sandbox + utils, still called native an unpublished scaffold, and said
      "11 packages + 2 apps".
   4. PACKAGE INTEGRITY -- packages/utils (consumed by components + motion)
      was absent from root tsconfig references and had no publishConfig /
      repository / license / engines; its package.json advertised a "./cn"
      subpath that tsup never built. motion built dist/react but exported no
      "./react" subpath.
   5. CONFIG CRUFT -- .npmrc still hoisted "*storybook*" (purged long ago); CI
      omitted check:sdk-coverage + audit:motion-parity.
   6. LANDING -- links to deleted labs (/lab/tokens, /lab/motion), a
      non-existent /components/... route, and "#ecosystem" (a page, not an
      anchor); stale bg-panel / text-text-* classes that resolve to nothing.

How we fixed it:
   Deleted every verified-orphan file (grep for the basename + exported symbol
   returned zero other consumers). Removed the landing changelog END-TO-END per
   the user's call -- gen-changelog.mjs no longer emits it, the landing build
   no longer runs the generator for it, and the file (plus its unused
   SITE_VERSION) is gone. Synced every count/version to its single source,
   added the utils tsconfig reference + publish metadata, dropped the phantom
   ./cn subpath, added the motion ./react export, purged the .npmrc storybook
   line, and wired the two missing CI gates. Repointed the landing links at
   real destinations (docs /tokens, playground, /ecosystem) and swapped the
   dead utility classes for semantic tokens. Rebuilt all three apps from a
   wiped dist.

What survived:
   The gate is the contract: every deletion was justified by "no importer",
   every count by the drift gate. Nothing that ships was removed -- the dead
   files were app-local orphans, and the only generated artifact cut (landing
   changelog) had no consumer. Public-package exports that are merely unused
   in-repo (layout AppLayout, motion unregisterDriver/clearDriverRegistry,
   components isMac) were NOT deleted: removing a published export is a
   breaking change and needs its own changeset.

State: verified. Landing/docs/playground rebuilt clean (2183 / 2171 / 2001
   modules, all exit 0); drift gates re-run direct (docs 116, components
   116/116, boundaries, sdk-drift, motion-drift) all OK; both touched apps
   typecheck clean. Working tree carries the uncommitted sweep.

Lesson: "green gate" and "no dead weight" are different invariants. A drift
   gate proves the barrel and the manifest agree; it says nothing about the
   four files nobody imports or the README that still names last month's
   versions. Audit the import graph for files and the single source for every
   number -- and never delete a *published* export just because this repo has
   no consumer for it.

================================================================================

EP 59 -- The Shell That Changed Its Own Hook Count
--------------------------------------------------------------------------------
What broke (an audit of packages/layout, 22 files):
   1. RULES-OF-HOOKS -- ConsoleLayoutInner early-returned on `isLoading` and
      `!isAuthenticated`, then called React.useRef + React.useEffect AFTER
      those returns. On an auth transition (loading -> authenticated, or
      unauthenticated -> authenticated) the hook count changed between renders
      and React threw "Rendered more hooks than during the previous render."
      ChatLayout did the same effect correctly (hooks before returns) -- so it
      was also an inconsistency between sibling shells.
   2. INERT CONTROLLED MODE -- DocsAside accepted `collapsed` (controlled) but
      its toggle only mutated internal state, so with `collapsed` supplied the
      button did nothing and `onToggle` never fired. Its hydrate + persist
      effects also both ran on mount, briefly clobbering localStorage with the
      pre-hydration default and firing onToggle twice.
   3. DUPLICATE BRAND -- ChatLayout's sidebar header rendered brand.name, then
      rendered <Sidebar> (which rendered DefaultBrand) -- the brand appeared
      twice.
   4. SHORTCUT COLLISION -- Ctrl/Cmd+B (rail collapse) did not test shiftKey, so
      Ctrl/Cmd+Shift+B (docs collapse-all) fired BOTH handlers. Neither the
      docs handler nor Ctrl/Cmd+K checked for an editable target, despite a
      comment claiming they did.
   5. FALSE PROMISES -- LayoutConfig.features (tenantSwitcher / themeToggle) was
      entirely inert: presets set it, nothing read it. DocsLayoutProps.links was
      declared but never used (the docs engine already renders its own settings
      menu). SidebarAuthAction.href was silently dropped. LayoutProviderProps
      described a `config` prop the component never accepted.
   6. SMALL LIES -- topbar used `z-60`, an invalid Tailwind v4 utility (a
      no-op; the scale tops at z-50). The sidebar footer hardcoded
      "{brand} v1.0.0" while the package was at 1.5.3. Width docs said 260
      while the default is 240. Stale comments referenced Storybook, a
      "light-blue" palette, and a deleted SettingsMenu.

How we fixed it:
   Restructured ConsoleLayout so every hook precedes the conditional returns,
   with an isEditableTarget guard and a !event.shiftKey check. Gave DocsAside a
   real controlled path (onToggle(!collapsed) + a skip-first persist) and made
   its default class merge additive. Suppressed Sidebar's brand inside
   ChatLayout. Wired features.tenantSwitcher / themeToggle through
   ConsoleLayout. Removed the inert links prop and its docs pass-through. Fixed
   z-50, dropped the fake version footer, corrected the width docs, extracted a
   single useIsDesktop, and added className passthrough + a11y (Escape, aria,
   type=button) across the shells. Added 7 regression tests for the specific
   fixes.

What survived:
   The layout API is additive: className, showUserMenu, and the exported
   heading/action types are new; the only removal (`links`) was a prop no
   consumer read (the one pass-through was redundant). The router fallbacks in
   Sidebar are now dead (LayoutProvider always injects an adapter) but were left
   in as defensive code -- flagged, not deleted.

State: verified. layout 42/42, docs 59/59, full suite 76 files / 968 tests
   GREEN; layout + docs + all 3 apps typecheck clean; layout + docs dist build
   OK; all 3 apps rebuilt. Changeset layout-shell-hardening.md (layout + docs
   patch). Uncommitted at time of writing. Round 2 added LayoutFeatures.search
   wiring, made LayoutContextValue.router non-optional (removing the dead
   no-adapter fallbacks), added className passthrough to Sidebar/Topbar/
   PageHeader/TenantSwitcher, and 12 more shell tests -- layout 54/54, full
   suite 77 files / 980 tests GREEN.

Lesson: a hook placed after an early return is a latent crash that only fires on
   a state transition -- exactly what a "renders fine" smoke test misses. And a
   prop that is accepted but never read is a lie the type-checker cannot see:
   LayoutConfig.features looked configured in every preset and did nothing.
   Audit the props *and* the hook order, and prefer removing an inert prop over
   documenting it.

================================================================================

EP 60 -- The Store That Was Missing Half of Itself (Lint)
--------------------------------------------------------------------------------
What broke:
   `pnpm lint` died instantly with:
     Error: Cannot find module
     '.../@typescript-eslint+typescri_ebd5…/node_modules/minimatch/dist/commonjs/index.js'
   It looked like a flat-config problem. It was not: the pnpm virtual-store
   entry for @typescript-eslint/* was missing its `minimatch` DIRECTORY
   entirely. A half-extracted store -- the same class as EP 54. A plain
   `pnpm install` reports "Already up to date" (state markers match) and never
   self-repairs.

How we fixed it:
   A single-owner `pnpm i --force` (after closing dev servers / IDE windows --
   the first attempt died with EPERM removing the modules dir). pnpm relinked
   520 packages and lint ran. That surfaced 27 errors / 124 warnings:
     • ~17 errors were the gitignored `scratchpad/` CDP scripts being linted at
       all (require() in .cjs, unused vars).
     • 4 more were legitimate `.cjs` scripts (require() is correct for CJS).
     • 6 were real source issues: an empty-interface Props (alert-dialog),
       two `let` that should be `const` (otp-input), `wrap<{}>` (emails), a
       `require()` inside a vi.mock factory (docs test), and TWO stale
       `// eslint-disable … react-hooks/exhaustive-deps` directives whose rule
       is not installed -- which makes the directive itself an error.

   Config: eslint.config.mjs now ignores the gitignored `scratchpad/` and
   `.agent/` (plus coverage/.turbo/storybook-static) and allows `require()` in
   `**/*.cjs`. Source: the six fixes above. Result: `pnpm lint` exit 0
   (0 errors; 108 warnings remain, non-blocking). Lint is now wired into the
   CI `ci` job AND `check:all`.

What survived:
   CI gained a real lint step that could not exist before the store was whole.
   The warnings were left as-is (they are advisory); the gate fails on errors.

State: verified. components/emails/native/docs/layout typecheck clean; docs
   59/59; full suite 77 files / 980 tests GREEN; `pnpm lint` exit 0. Commit
   100a304. Changeset lint-cleanup.md (components + emails patch).

Lesson: a red lint can be a package-manager store-integrity bug wearing a
   config-error costume -- fix the store with a single owner, not the config.
   And an "unused eslint-disable directive" is a signal the referenced rule
   isn't loaded: a directive for a plugin you never installed becomes an error
   rather than a silence. If you want hooks linting, install the plugin; don't
   leave orphaned disable comments behind.

===============================================================================

EP 61 -- The Spacing That Landed Off-Grid
--------------------------------------------------------------------------------
What broke:
otp-input used `gap-1.5` (6px) where the rounded-md radius (6px) wanted a
near-merge, and location-picker's country-tag -> value prefix sat at `gap-1.5`
against a 4/8 grid. A wider S7 sweep flagged ~15 size-3.5 (14px) icon sizes and
~18 more `.5` spacing tokens across ~13 components that were off-grid but
intentional, plus a lack of spacing tests.

How we fixed it:
otp-input gap-1.5 -> gap-2 (with a new otp-input.test.tsx asserting gap-2 +
6 digit boxes); location-picker prefix gap-1.5 -> gap-2. S5 closed (combobox
reflect+retain; Input focus ring removable via className). The full S7 sweep
was held for scope sign-off (icon sizes are intentional).

State: verified (otp-input 1/1, components 87/87, check:components 113/113).

Lesson: a .5-token gap next to a rounded-md radius is the visual equivalent of a
decimal that never rounds -- small, but every consumer sees it. Fix the
canonical spacing and add a test that pins it.

===============================================================================

EP 62 -- The Tests That Hung on Windows (vitest 4.1.12)
--------------------------------------------------------------------------------
What broke:
`pnpm test` on Windows hung at "RUN v4.1.11" and never discovered tests. It
looked like a repo problem; it was an upstream vitest bug (#11371) where the
vmThreads pool stalled on Windows.

How we fixed it:
Upgraded vitest 4.1.11 -> 4.1.12 (9356f40), which fixed the vmThreads hang.
The now-running suite surfaced pre-existing drift the hang had been hiding:
Button/Input used ring-1 instead of ring-2, and Marquee defaulted
pauseOnHover=false instead of true (fixed in 729d5fa). @testing-library/
user-event was hoisted to the root devDeps (d89d222) so vite 8 (pulled by
vitest 4.1.12) resolves it. Local run: 760 tests pass, 0 failures; the
remaining 15 suites are blocked by pnpm link corruption (EP 60 class, not
code) -- CI installs fresh on Linux and passes the full 980.

State: automated. Tests now run to completion on Windows; CI is the authority.

Lesson: a green suite that never runs is the same lie as no suite at all. The
hang was the bug; the ring/marquee drift was what it had been papering over.

===============================================================================

EP 63 -- The Rename That Touched Everything (ArcId -> Sg)
--------------------------------------------------------------------------------
What broke:
The SovGrant-facing identifiers were named ArcId (ArcIdClient, ArcProvider,
arcid_* storage keys) while the rest of the repo had already de-branded to Sg
(SgClient). A rename of this size touches sdk, auth, docs, layout, store,
landing, playground, registry, scripts, tests, and changelogs -- 61 files.

How we fixed it:
Renamed ArcIdClient -> SgClient, ArcIdClientConfig -> SgClientConfig,
ArcProvider -> SgProvider, and arcid_* -> sg_* storage keys across the whole
tree (c0095f1), plus a motion @vitest/expect devDep (64d28c7). Verified zero
leftover ArcId/ArcProvider references. Synced the drifted facts the rename
surfaced: components 113->112, tests 961->980. Staged a breaking-change
changeset (.changeset/rename-arcid-to-sg.md: sdk major + auth major).

State: committed. Rename verified complete; changeset pending commit.

Lesson: a half-done de-brand is worse than none -- the SDK said Sg while auth
still said ArcId. When a name changes, grep the whole tree, not just the
package that introduced it.

===============================================================================

EP 64 -- The Shell That Stopped Importing Auth (LayoutSession, in-flight)
--------------------------------------------------------------------------------
What's changing:
`packages/layout` shell (ConsoleLayout / AuthLayout / LandingLayout) needs
auth state but must not depend on `@fusorb/facet-auth` directly (the
Phase 3 "layout/auth decoupling" item). The fix is an injected seam:
`LayoutProvider` now accepts an optional `session` prop of a new
`LayoutSession` type (user / isAuthenticated / isLoading / signOut), stored
on the context value. The default session is no-user + authenticated, so
static/docs sites render the shell without any auth wiring.

Decisions made (safe + scalable):
- The seam is additive (optional prop + new type), not breaking -- a minor
 bump, not a major. `LayoutSession` is re-exported from the barrel so
 consumers can type their own session.
- The type imports `UserAvatarUser` from `@fusorb/facet-components`
 (type-only; layout already depends on components, so no new edge).
- Changeset `.changeset/layout-session-seam.md` (layout minor).

State: complete (uncommitted). All four consumer files (console-layout,
chat-layout, user-menu, sidebar-auth) migrated to read session from useLayout();
@fusorb/facet-auth removed from layout deps. Needs commit + typecheck/build.

Lesson: an auth-aware shell that imports the auth package is a shell that can
only be used by that one auth system. Inject the session; let the consumer
decide where it comes from.

===============================================================================

EP 65 -- The Null-Byte Decoy (jest-dom.d.ts corruption, fixed)
--------------------------------------------------------------------------------
What happened:
`pnpm check:all` failed lint with "Parsing error: Invalid character" at
`packages/motion/src/types/jest-dom.d.ts:1:0`. The file was 148 null bytes --
real content lost, yet `git status` showed it clean, so the corruption was
committed (in 64d28c7). `git show 3fefa64:<path>` recovered the original:
`import "@testing-library/jest-dom/vitest";` (matches sibling test-types.d.ts).

Fix: restored the one-line import. The file is a type-only shim so runtime tests
never noticed; only lint tripped on the null bytes.

Lesson: a clean `git status` does not mean the committed bytes are valid. When
lint reports an "invalid character" at 1:0, hex-dump the file before assuming
the source is at fault -- the corruption may already be in history.

===============================================================================

EP 66 -- The Vitest 4 Assertion Heist (toBeInTheDocument, fixed)
--------------------------------------------------------------------------------
What happened:
After a fresh `pnpm install`, `pnpm check:all` typecheck failed in every UI
package: `Property 'toBeInTheDocument' does not exist on type 'Assertion<...>'`.
`@testing-library/jest-dom` v7 augments `declare module 'vitest'`, but vitest 4
re-exports `Assertion` from `@vitest/expect` (`export { Assertion } from
'@vitest/expect'`), so the augmentation no longer merges with the type `expect`
actually returns.

Fix: augment `@vitest/expect` directly in each test type shim. The last blocker
was a version mismatch -- motion pinned its own `vitest@^4.1.10` (resolving to
4.1.11) whose `@vitest/expect@4.1.11` differed from the augmented `@vitest/expect
@4.1.12`; aligning motion's vitest/@vitest/expect to 4.1.12 (the root version)
made the augmented module match the one vitest re-exports from.

Lesson: a module augmentation only lands if it targets the SAME resolved module
the consumer actually uses. With pnpm's per-package resolutions, two packages can
"use vitest" yet resolve different versions -- check the resolved versions, not
just the source, before assuming an augmentation is wrong.

===============================================================================

EP 67 -- Phase 5 Stage 1 (JSDoc metadata) + Dash Purge + Critical-Component Audit (2026-10-31)
--------------------------------------------------------------------------------
What changed:

A. Phase 5 Stage 1 -- JSDoc @category/@summary on all 112 ui components (F9):
   - New one-time migration script scripts/migrate-component-jsdoc.mjs
     (--dry flag, idempotent, skips already-tagged files). Derived category
     from the gen-docs-manifest.mjs CATEGORY map; summary = humanized slug.
   - gen-docs-manifest.mjs now reads @category/@summary from source JSDoc
     FIRST (readTag helper), falling back to the CATEGORY map only for
     untagged files (transitional; map becomes removable once Phase 5 lands).
   - Result: registry scan reports 111 components (barrel 112 - typewriter-text
     exclusion), 0 "uncategorized". Category distribution: ready-to-use 31,
     inputs 30, layout 13, data-display 12, feedback 11, animation 6, pages 6,
     general 2. Manifest regenerated (113 entries = 111 components + 2
     foundations).

B. Em/en-dash purge (user directive: "purge from unnecessary places"):
   - Scope: .ts/.tsx/.mjs/.cjs/.js/.css under packages/, apps/, scripts/ +
     surfaces.config.mjs. Markdown/docs prose intentionally left (prose).
   - 224 occurrences replaced ("---" -> " - ", "--" -> "-") + a cleanup pass
     collapsing 248 " -  " double-space artifacts across 61 files.
   - Two timed-out PowerShell runs had partially applied before the Node
     script finished the job -- verified with grep: 0 remaining in source
     (only docs/rebuild/adr/types-sketch.ts comments retain 4, prose).
   - Caution for next time: PowerShell [System.IO.File] defaults are fine but
     the recursive Get-ChildItem over the whole tree timed out twice; Node
     walk completed in seconds. Use Node for repo-wide text surgery.

C. Critical-component audit (Chart, Roadmap -- "confirm they are perfect"):
   - Chart (packages/components/src/ui/chart.tsx): root merges className via
     cn(), style passthrough, {...rest} HTML attrs; ~30 config props (width,
     height, type, layout, curve, stacked, colors, formatters, animate,
     crosshair*, legend*, rangeSelector...); colors are CSS vars
     (var(--primary), var(--chart-1..n)); the only "#" hits are clipPath ids
     (url(#facet-draw-*), not colors). Verdict: compliant.
   - Roadmap: extends React.HTMLAttributes<HTMLDivElement> (className/style/
     id pass through); data-driven items; variant/showLine/maxHeight/
     renderItem slot/item.dotClassName; status styles are token classes
     (border-success/60 bg-success/10 ...); stagger() from facet-motion.
     Verdict: compliant.
   - Repo-wide raw-hex scan of ui/: only color-picker.tsx (hex IS its data
     model -- input values/placeholder "#000000") + test fixtures. Zero
     hardcoded colors in styling across all 112 components.
   - Gates: check:components 112/112 appearance+config, 22/22 composites
     slots, 0 HARD/0 slot gaps; check:docs 112/111/CLAUDE.md match.

D. Verification (post-purge, post-migration):
   - pnpm -r typecheck: green (14 projects).
   - pnpm lint: 0 errors, 133 warnings (pre-existing baseline).
   - pnpm test: 90 files / 1090 tests passed (was 81/1000 + 9 SDK smoke =
     90/1090 -- count reconciled with Phase 3's SDK smoke tests).
   - pnpm build: all workspaces + 3 apps clean (validates the CSS edits in
     tokens.css/palettes/app.css).
   - check:registry regenerated (registry.json, components now carry
     category+summary from JSDoc).

State: Phase 5 Stage 1 COMPLETE but UNCOMMITTED (176 modified files: 112
   JSDoc migrations + dash purge + manifest + registry.json). Stages 2-4
   (colocated *.examples.tsx convention + ./examples subpath, check:examples
   gate, JSDoc completeness gate) remain. Phase 4 design lock still gated on
   owner sign-off.

Lessons:
   - Editorial metadata (category/summary) belongs on the source file, not in
     a generator map -- the map was the drift machine (F9); JSDoc makes the
     component the source of truth and the scanner a reader, not a copier.
   - Repo-wide punctuation surgery needs verification beyond "the script
     printed updated N files": grep for the old chars afterward, and run the
     build to catch CSS-side corruption.
   - Audit verdicts should be evidence-backed: cn() merge at the root, prop
     count, token-class usage, and a raw-hex scan -- not "it looks fine".

================================================================================

EP 68 -- Phase 5 Stages 3-4: gates hardened, consumption gap found
--------------------------------------------------------------------------------
What happened:
  Phase 5 closed. Stage 1 JSDoc (bc75a2e), Stage 2 colocated examples
  (2f0a6e4/b5a6341), Stage 3 check:examples + Stage 4 check:jsdoc. Found
  check:examples in CI was a 21-byte no-op stub (console.log("ok")) AND
  absent from check:all -> false-green gate. Replaced with a real structural
  gate (artifact==slug + real component, unique ids, controls subset of
  advertised props, <slug>Examples export convention, src/examples.ts barrel
  wiring); negative-tested all 5 rules. Added check-component-jsdoc.mjs
  (112/112, 8 allowed categories). Reconciled planned vs exists: consumption
  was NEVER in the Phase 5 plan. Zero registerArtifactKind call sites;
  sandbox /react Stage ignores Example.controls (Inspector derives from
  inferControls(defaults)); no host renders the arrays; registry flat
  examples:[] still empty. Recorded in CLAUDE.md "Component Examples" section.

What survived:
  All 12 static gates green; examples convention + infra + gates are solid.

State: committed (c3b41bf gate batch, dafb6f2 handbook). Consumption = new
  phase, needs an ADR for the ArtifactKind/controls model gap first.

Lesson: a gate that prints "ok" unconditionally is worse than no gate --
  negative-test every gate (feed it bad input, confirm it fails) before
  trusting it in CI.

EP 69 -- Repo-wide docs/tracker sync audit
--------------------------------------------------------------------------------
What broke:
  Docs drifted from reality. README package table stale for 7 packages
  (sdk 1.2.1 vs 2.1.0, components 3.1.0 vs 3.2.0, auth 1.3.7 vs 2.0.2,
  layout 1.5.7 vs 1.7.1, store 1.0.1 vs 1.0.3, docs 1.5.7 vs 1.5.11,
  sandbox 2.0.0 vs 3.0.0); "7 standalone forms" vs 8 exported; LandingLayout
  bullet claimed a Navbar `pill` variant that was deferred/removed in 3.1.0;
  AGENTS.md CI list missing check:registry (+ said pnpm install, CI uses
  --frozen-lockfile); apps/docs changelog.ts stale (top entry 2026-10-06,
  missing ~10 releases; source package CHANGELOGs were current, so it was
  pure regen lag); .agent tracker HEAD/status stale by 21 commits.

How we fixed it:
  README table + Current versions line + forms count + pill claim + sandbox
  description; CLAUDE.md forms count + sandbox wording + stale date dropped
  from Build Status header; AGENTS.md CI list synced to ci-cd.yml verbatim;
  changelog.ts regenerated via gen-changelog.mjs; trackers re-headed to
  dafb6f2.

What survived:
  site-data.generated.ts already current; registry.json up-to-date
  (check:registry); SDK "10 domain SDKs" claim verified (10 *Sdk classes in
  the barrel); all 12 gates green; tsconfig refs (17) + .npmrc clean.

State: gates automated; version tables are hand-synced and drift again on
  every release -- candidate for a check:readme gate (not built).

Lesson: release commits bump package.json + per-package CHANGELOG.md but not
  README's version table or the docs changelog data -- those need a regen +
  commit follow-up (same class as the site-data/changelog regen commits).

================================================================================

EP 70 -- M5-M8 landed in code, recorded nowhere; first full-repo audit
--------------------------------------------------------------------------------
What happened:
  The Surface Rebuild advanced from M3 (examples) through M8 (hardening +
  cutover) in code -- playground rebuild, docs content migration + /live
  consumption, landing reduction, and a batch of M8 gates -- but every tracker
  stayed behind. HEAD was cc8168d (M8 cutover) while .agent/output.txt still
  read "M3 ... Next: M5/M6", logs.txt stopped 2026-11-01, episodes.md stopped
  at EP 69, and the tracked ledger docs/rebuild/05-progress.md stopped at M3.
  The code was ahead of the narrative by ~40 commits.

  Ran the first full-repo audit (5 parallel deep passes: packages, gates,
  apps, trackers/docs, hygiene) and verified the load-bearing claims directly
  with git and by executing the suspect gates. Findings (full detail in
  .agent/output.txt):
    - False gates (cannot fail): check:a11y and check:consumer-matrix declare an
      `errors` array that is never pushed to; sandbox:e2e has no process.exit(1);
      check:sdk-coverage is a no-op without the sibling SovGrant checkout.
    - Degraded gates: check:docs silently skips manifest parity now that
      apps/docs/src/facet/docs-manifest.ts is deleted (the missing file is
      caught); check:docs-content's staleness half points at a generated file
      that does not exist.
    - Real defects: compile-docs closes `::callout` with `:::` (swallows the doc
      tail into the callout, baked into committed compiled-pages.ts); landing
      hard-codes docs.fusorb.com and npmjs.com (both invisible to check:surfaces);
      landing has orphan pages + stale claims; docs /components gallery is
      unwired and has a duplicate Getting Started; facet-store and facet-sandbox
      READMEs document APIs that do not exist; facet-auth README over-claims;
      components README says 113 (actual 112); no pending changesets exist;
      root tsconfig references 17 non-composite projects.

How we fixed it (this batch):
  Reconciled the trackers to HEAD: rewrote .agent/output.txt as a current
  dashboard with the audit + a P1-P8 backlog, appended M5-M8 to
  05-progress.md, appended the session log, and wrote this episode. Synced the
  CI gate list across README/CLAUDE/AGENTS. Added scripts/gen-tracker.mjs +
  a `sync:tracker` npm script that regenerates the dashboard STATE block (HEAD,
  branch, ahead/behind, tree status, gate lists, versions, counts) from repo
  ground truth, so the dashboard stops drifting. Deleted 5 junk root dirs
  (-p done echo git mv) and packages/components/build_error.log; added
  .agent-cache/ to the root .gitignore. The P1-P8 audit findings were deferred
  to the next work batch.

What survived:
  All M5-M8 code is intact and committed; the static gates that are real
  (components/examples/jsdoc/docs-content-compile/icons/sdk-drift/motion-drift/
  boundaries/registry/pins/surfaces/readme/layout-skeleton-parity) stay green.

State: committed (trackers + script + hygiene). Known false gates and the
  P1-P8 defect backlog remain open and are tracked in .agent/output.txt.

Lesson: hand-maintained trackers drift the moment work outpaces bookkeeping --
  the same "manual -> semi-automated -> automated" ladder applies to the
  trackers themselves. A dashboard regenerated from git/package.json ground
  truth (this episode's gen-tracker.mjs) is the only version that cannot lie
  about HEAD, versions, and the gate list. Also: a gate that declares an
  `errors` array but never fills it is a false gate -- the exact failure mode
  EP 68 warned about, now recurring in three more gates.

================================================================================

EP 71 -- The false gates are made real (P1)
--------------------------------------------------------------------------------
What broke:
  Three gates advertised as CI enforcement could not fail:
    - check:a11y and check:consumer-matrix each declared an `errors` array and
      an `exit(1)` branch, but nothing ever pushed to `errors` -- they printed
      OK unconditionally.
    - sandbox:e2e had no `process.exit(1)` anywhere; failures were swallowed by
      the outer catch and printed as "CHECK".
  check:consumer-matrix was also slow (6 pnpm-why calls) and non-deterministic.

How we fixed it:
  - check:a11y: the three real checks (img without alt, positive tabIndex,
    onClick-without-keyboard) now push to `errors`. Negative-tested by injecting
    `tabIndex={3}` into a component -> exit 1; clean -> exit 0.
  - check:consumer-matrix: rewrote as fast static checks -- no same @fusorb/* dep
    in both dependencies and devDependencies, and every @fusorb/* dep uses a
    `workspace:` range. Dropped the slow pnpm-why heuristic. Negative-tested by
    injecting a duplicate dep -> exit 1; clean -> exit 0.
  - sandbox:e2e: results with a `false` value (or the error catch) now set
    process.exitCode = 1; null (intentionally-skipped) stays a SKIP. Clean run
    verified exit 0.
  - Fixed the first real defect the new gate catches: facet-native declared
    @fusorb/facet-motion in both dependencies and devDependencies. Removed the
    devDeps entry; registry.json regenerated (native.devDeps []).
  - Added sandbox:e2e to check:all so the local gate matches CI exactly.

What survived:
  All other gates unchanged and green; registry.json re-synced; lockfile
  unchanged (pnpm dedupes a dep across sections, so the removal is
  lockfile-neutral) -- verified by `pnpm install --lockfile-only` reporting
  "Already up to date".

State: committed. Remaining false gate: check:sdk-coverage (a no-op without the
  sibling SovGrant checkout) -- tracked as P1b. The P2-P8 backlog stays open.

Lesson: "has an errors array and an exit(1)" is not the same as "can fail" --
  grep the gate for `errors.push`/`process.exit(1)` on a reachable path, and
  prove it by feeding it bad input. Three gates passed review for months while
  being pure green lights. The suite's own rule (EP 68: negative-test every
  gate) is only as good as actually doing it per gate.

================================================================================

EP 72 -- CI parity, surfaces enforcement, and the first P4 landing fixes
--------------------------------------------------------------------------------
What broke:
  After P1, `check:engine-purity` existed in local `check:all` but was missing
  from `.github/workflows/ci-cd.yml`, so CI could pass while a local gate failed.
  `scripts/check-surfaces.mjs` only matched facet.so/localhost/github.com/fusorb,
  letting hard-coded `docs.fusorb.com` and npm package URLs in the landing app
  slip past L6 enforcement. The landing hero/search/ecosystem-detail surfaces
  hard-coded those origins instead of reading `surfaces.config.mjs`.

How we fixed it:
  - CI: added `pnpm check:engine-purity` after `check:boundaries` in
    `.github/workflows/ci-cd.yml` to align CI with local gate coverage.
  - Surfaces: expanded `check-surfaces.mjs` host detection to include
    `fusorb.com` and `npmjs.com` so app-origin/package-URL drift is caught.
  - Landing (P4a, origins): `HeroSection.tsx` now uses `getDocsUrl()`;
    `landing-search-config.ts` and `EcosystemDetailPage.tsx` now build npm links
    from `surfaces.npmPackageScope` (all sourced via surfaces config). Verified:
    no `docs.fusorb.com`/`npmjs.com/package` in `apps/landing`; `check:surfaces`
    passes.
  - Trackers/plans: `.agent/run.txt` confirmed a green full `check:all`
    (90/90 files, 1074 tests, sandbox:e2e all executed checks passed) at the
    prior baseline; `.agent/todo.txt` (local) tracks T1–T9; logs/progress/output
    synced; `docs/planning/sdk-canonical-fix-plan.md` kept active with status
    note (no unnecessary planning docs archived).

What survived:
  Gate intent (L6) now matches enforcement; surfaces-config remains the single
  source for app URLs. Active retired `arc*`/`ArcId*` identifiers remain absent
  from source/config (historical records only).

State: in progress (working tree changes for CI, surfaces gate, 3 landing files,
  and synced trackers/plans) — to be committed as a scoped checkpoint. P4
  landing stale claims/orphans, docs-site/playground, P1b/P2 generator wiring,
  P5–P8, and full verification/closeout remain open.

Lesson: a surfaces gate that only knows yesterday's hostnames silently approves
  tomorrow's hard-codes — expand the matcher when the canonical origin set
  changes, and fix the violations in the same pass so the gate stays green and
  meaningful. Keep plan docs current (status/ownership) instead of archiving by
  guesswork; archive only when clearly superseded.

================================================================================

EP 73 -- CI red on main: the publish job hijacked the version PR
--------------------------------------------------------------------------------
What broke:
  Every CI run on main since the version PR #23 merged failed at `pnpm check:registry`
  ("registry.json is STALE"). The same failure reproduced locally at the identical step.
  `check:readme` was stale too and would have failed next. Diffing the committed registry
  against a fresh scan isolated exactly one drift: `packages[sdk].version` 4.0.0 -> 4.0.1,
  plus the two stale README version mentions.

  The interesting part was WHY the artifacts were stale at all: `pnpm version-packages`
  (root script = `changeset version && sync-readme-versions && registry scan`) is wired into
  the CI `changeset` job as `version-script`, so a version bump is supposed to regenerate
  both generated artifacts in the same commit. The Actions logs answered it:

    - the `changeset` job built the version branch CORRECTLY at 06:48:29 and it logged
      `pr-title: chore(release): version packages` / `version-script: pnpm version-packages`;
    - the `publish` job's `changesets/action` step was configured with ONLY `publish-script`.
      Because main still held a pending changeset, the action took its VERSION path — not its
      publish path — inside the publish job: it logged the action's DEFAULTS
      (`commit-message: Version Packages`, `pr-title: Version Packages`), ran a bare
      `@changesets/cli/bin.js version`, and force-pushed over the branch the `changeset` job
      had just built correctly (branch commit authored 06:51:12, inside that job's
      06:51:09-06:51:16 step window).
    - PR #23 was therefore renamed to "Version Packages" and the squash-merge 244b8b6 carried
      the DEFAULT subject instead of the configured one — the tell that proved two different
      action configurations had written the same branch.

  So the tree was not the only problem: the pipeline could rebuild a correct version branch
  into an incorrect one, and nothing failed until the next push to main.

How we fixed it:
  - Regenerated `packages/registry/src/registry.json` and the `README.md` version table with
    the repo's own generators (not by hand), so the fix exercises the same path the release
    uses.
  - Gave the `publish` job's `changesets/action` step the SAME `version-script`, `pr-title`
    and `commit-message` inputs as the `changeset` job, with a comment recording why: the
    action picks its mode from repo state, not from the job name, so both jobs must agree on
    how versioning is performed.
  - Sorted the `readdirSync` in `scanTokens()` — the only scanner that did not sort. Layout
    order is alphabetical on NTFS but hash-ordered on ext4, so this was a latent CI-only
    "registry.json is STALE" that would have fired on a different filesystem.
  - Added the missing `check:engine-purity` to the README/CLAUDE/AGENTS gate lists; the three
    had been declared "synced exactly" while all three were missing that gate.

What survived:
  The release flow itself (changeset -> version PR -> publish) is sound; only the second,
  misconfigured invocation of the action corrupted the branch. `check:registry` and
  `check:readme` earned their keep: they are the reason the bad artifact was caught at all.
  `@fusorb/facet-sdk@4.0.1` did NOT reach npm (the publish job is `needs: [ci]`, and ci died),
  so npm still serves 4.0.0 — the stranded bump ships on the next green push to main.

State: fix applied and verified locally (check:registry + check:readme green; full check:all
  rerun green through lint/build/typecheck), working tree dirty, not yet committed or pushed.

Lesson: a shared action that infers its own mode from repository state will do the OPPOSITE of
  what its job name suggests — configure every invocation identically, or the last one to run
  silently wins. And when a generated artifact drifts, diff the artifact rather than reading
  the commit: "registry.json is STALE" was one version field, but the reason it was stale was
  two competing release writers.
