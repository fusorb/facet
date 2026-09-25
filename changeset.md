# Changeset — Daily Commit Summary

> Auto-generated from `git log` + cross-referenced with `.agent/episodes.md` (the episodic canon).
> Every commit grouped by date, oldest → newest. Episode references link to the
> narrative explanation in `episodes.md`.
>
> This file is the single source of truth for what landed per day — no manually
> authored changeset fragments. Generated for review before committing.

---

## 2026-07-29 — Foundation

4 commits — project inception

| Hash  | Message                                        |
|-------|------------------------------------------------|
| 3a6c1a4 | initial commit                                |
| 4582afb | initial commit                                |
| 30314f6 | package update                                |
| 7a6ed4a | package update                                |

Summary: Project bootstrapped as `arc-ui` (later rebranded to `facet`). Initial packages, landing site scaffold, and test infrastructure laid down. Two initial commits followed by two package-update commits.

---

## 2026-07-31 — Initial Feature Surface

4 commits — first real features

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| f0ac6d9 | feat(layout): add rail mode with collapsible icon sidebar    |
| d3ee726 | feat(components): add pill navbar variant with frosted glass |
| afd615a | feat: ship publish-ready packages, landing site, variants, test infra |
| 8ea9c8f | feat(landing): use pill navbar, fix dead routes, sync agent docs |

Summary: Laying the groundwork — rail-mode sidebar with icon collapse, a pill navbar with frosted glass styling, publish-ready package scaffolding, and the first landing-site wiring. Agent docs synced alongside.

---

## 2026-08-01 — 1.0.0 Release Prep

11 commits — rebrand + release readiness

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 5d45a4c | chore: prepare 1.0.0 release; add registries, validators, icon system |
| fc611cf | chore: verify 1.0.0 release readiness; fix docs mock types; sync agent docs |
| 150f5ef | docs: note Storybook dev stale-graph restart fix in tracker  |
| c4252dd | feat: rebrand arc-ui to facet, fix separated accordion spacing |
| 2ba6bfb | chore: ignore .agent, sync README with release details        |
| 552c41a | docs: reflect 1.0.0 publish state in README and session tracker |
| 434a19d | chore: bump landing to 1.0.0, clean docs for public audience  |
| 3d25005 | chore: update learned preferences                            |
| d94a724 | chore: point homepage links to facet.arcevocirqle.com.ng     |
| 7c36c13 | ci: build before typecheck so sibling dist output exists      |
| 264e595 | release: version 1.0.2, wire components through Icon registry, close navbar mobile menu on tap |
| dbd3f25 | docs: reflect 1.0.2 publish state in README and session tracker |
| 1dff12c | chore: architecture taste update                             |
| c8b20c8 | chore(turbo): drop stale storybook-static output glob         |

Summary: The `arc-ui` → `facet` rebrand lands across all packages. Icon registry gets components wired through it. 1.0.0 release prep with verified readiness. CI build-before-typecheck ordering fixed. Storybook references cleaned up (precursor to EP 01 purge).

Canonic refs: EP 01 (Storybook purge groundwork), EP 02 (count sync)

---

## 2026-08-02 — Component Expansion

2 commits — 14 new components

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 460484a | feat(components): add 14 components and stories (alert, combobox, menubar, toggle, etc.) |
| 3752a98 | chore: initial story release                                  |

Summary: 14 new components added to the components package (alert, combobox, menubar, toggle, etc.) with accompanying stories. Storybook used as the component showcase at this stage.

---

## 2026-08-04 — Docs Engine v1

5 commits — docs engine + landing rework

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 568497d | feat(docs): docs engine, thin consumer, +11 components, landing rework |
| 211bf98 | chore(docs): commit in-flight docs engine changeset           |
| 596571a | feat(docs): add reusable InteractiveDemo block                |
| ed1a64b | feat(docs): rework auth page — single demo home with matching code |
| 542290c | feat(docs): wire previews into auth/login/forms guide pages   |

Summary: The docs engine takes shape — a thin consumer pattern, reusable InteractiveDemo block, auth page rework with single-demo-home, and previews wired into guide pages. 11 new components added.

Canonic refs: EP 01 (docs engine as barrel↔manifest gate replacement)

---

## 2026-08-05 — Ready-to-Use & Variants

1 commit — docs content expansion

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| bb15867 | feat(docs): ready-to-use section, demo block, and InteractiveDemo rewrite |

Summary: Ready-to-use component section added to docs, with demo blocks and an InteractiveDemo rewrite.

---

## 2026-08-10 — CLI Scaffold

1 commit — CLI foundation

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 79ec07a | feat(cli): scaffold @arcevo/facet-cli ? docs init wizard + component add |

Summary: The CLI package scaffolded — `facet docs init` wizard and `facet add` component command. Still under the `arcevo` scope at this point.

---

## 2026-08-11 — Icon Registry Rebuild + CLI Expansion

9 commits — icon system + release blockers

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 88fcb2f | feat(components): rebuild icon registry on generated lucide map + brand SVGs |
| e03dc44 | feat(docs): move authored pages into consumer, rework auth demo, refresh copy |
| 07346d0 | fix(components): isolate icon registry tests + pass through brand aria-label |
| f6b2f51 | feat(scripts): guard icon map generation against semantic-key drift |
| 369d473 | feat(cli): expand docs init wizard with decide-for-me, per-framework generators, and facet add workflow |
| e24c0ff | feat(icons): migrate landing and layout to the facet Icon registry, drop lucide-react |
| 3de0e04 | chore(release): fix release-readiness blockers before full publish |
| 6800b14 | chore(release): apply version bumps via changeset version     |
| 90b677c | fix(components): NotificationDrawer alignment + Navbar megamenu/nested dropdowns |

Summary: The icon registry is rebuilt on a generated lucide map with brand SVGs. `lucide-react` is dropped in favor of the facet Icon registry across landing and layout. CLI wizard expanded with decide-for-me and per-framework generators. Release-readiness blockers fixed (version bumps applied via changeset).

Canonic refs: EP 12 (missing hand-written icons), EP 13 (brand icon vanish)

---

## 2026-08-12 — DataTable, Navbar, and Layout Features

19 commits — component depth + layout refinements

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 69c1fec | fix(components): relax DataTable generic to accept interface row types |
| 00fcbb4 | docs: add Breadcrumb ellipsis + InputOTP 8-digit variants; verify InputOTP |
| 502a54c | feat(cli): add pkg, doctor, and update commands; -y shorthand; help link |
| 91da99d | docs: Menubar/Navbar showcase variants; emdash purge repo-wide |
| 865bf7e | perf(docs): code-split the docs site; add facet-components/light subpath |
| 904e30d | fix(docs): suspend the whole route tree, not individual route elements |
| 6bb55a2 | feat(components): add timeline variant to Roadmap              |
| 2dae8e2 | feat(landing): roadmap + FAQ sections; fix mobile overflow + docs shell |
| 534e8c4 | feat(landing): FAQ icon-registry question + explore/feedback strip |
| 251a0e4 | fix: alert success/warning colors, mobile table overflow, auth docs cleanup |
| df7c8f6 | fix(docs): auth pages render again; remove crashing live demos |
| 37fa913 | docs: 8-digit OTP in 3-2-3 format; correct components count   |
| 0dfff3f | test(components): verify 8-digit 3-2-3 InputOTP layout       |
| bfc292e | docs: Marquee showcase variants (Cards, Reverse, Pause on hover) |
| b878bfd | fix(docs): layout no longer takes over the shell; back button; marquee fixes |
| 4564fc9 | fix(components): marquee pause-on-hover via handlers; dialog mobile width |
| 1a4112d | revert(docs): remove the page-body Back button                |
| 2f0cf91 | fix(docs): base layout components were missing from gallery + palette |
| 1db67da | feat(layout): overlay sidebar mode with hover-reveal + pin     |
| c28f2f4 | feat(components): NumberInput currency prefix variant + docs   |
| c1ddd8d | fix(layout): overlay opens only on click; brand morphs to window on hover |
| 9d5b89c | chore(release): publish cli 0.3.0, layout 1.2.0, components 1.3.0, docs 1.3.0, auth 1.1.1 |

Summary: A wide-ranging day — DataTable generics relaxed, Breadcrumb ellipsis + InputOTP 8-digit variants, CLI pkg/doctor/update commands, Navbar megamenu fixes, code-splitting for docs, Roadmap timeline variant, landing roadmap + FAQ sections, and overlay sidebar mode with hover-reveal. Release v1.3.0 for components, v1.2.0 for layout, v1.3.0 for docs, v1.1.1 for auth, v0.3.0 for CLI.

Canonic refs: EP 14 (crosshair/positioning fixes), part of the §16 docs-site work

---

## 2026-08-13 — DataTable Deep Dive + Auth Layout

14 commits — component features + layout auth

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| c883df5 | feat(components): component depth batch + DataTable toolbar rework (v1.4.0) |
| 4620337 | fix(components): DataTable rows-per-page selector + InfiniteScroll scroll fix |
| f158d4c | fix(components): InfiniteScroll observes sentinel with container as root |
| d06dcb2 | feat(components): LocationPicker full Nigeria LGA data + country tags |
| ba7ec50 | feat(components): full state/region lists across all covered countries |
| 17ff0d0 | feat(components): LocationPicker dynamic region labels + searchable selects |
| fc15e9c | fix(components): restore Nigeria's 37 states in DEFAULT_REGIONS  |
| 6003c27 | feat(layout): AuthLayout brandPanel + Navbar showThemeToggle    |
| dac00a9 | feat(components): animated surfaces, Footer, FeedbackPage + CLI up robustness |
| 48c8e06 | feat(components): full 168-country state dataset from dr5hn (ODbL) |
| 10a3f02 | fix(layout): AuthLayout default panel is theme-token + config driven |
| 867b609 | feat(layout): built-in theme toggles + Card flip variant + Pages docs section |
| 3554506 | feat(components): universal SelectSearch + audit fixes + changeset |
| 5f7613c | chore(release): version packages (components 1.5.0, layout 1.3.0, docs 1.4.0) |
| 9599bfe | fix(cli): facet pkg/up detect installed versions (EISDIR bug) |
| 675469d | chore(release): cli 0.3.1 (installed-version detection fix)   |
| 8595d91 | feat(cli): facet docs scan — read the repo and draft documentation |
| 38c1d8f | feat(components): drawer toolbar, currency/country search, animated landing hero |
| 0c8ba0f | style(docs): consistent 8pt spacing + variant coverage audit  |

Summary: DataTable overhaul (toolbar rework, rows-per-page, InfiniteScroll fixes), LocationPicker with full Nigeria LGA data + 168-country dataset, AuthLayout gains brandPanel + showThemeToggle, universal SelectSearch, animated landing hero, and facet docs scan CLI command. Release v1.5.0 (components), v1.3.0 (layout), v1.4.0 (docs), v0.3.1 (CLI).

---

## 2026-08-14 — SDK + Icon Light Surface + Release

17 commits — SDK integration + icon registry polish

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 0b710ac | chore(release): cli 0.4.0 (facet docs scan)                  |
| 56dee58 | feat(components): slim /light icon surface (tree-shakeable, no full lucide map) |
| 90b677c | fix(components): NotificationDrawer alignment + Navbar megamenu/nested dropdowns |
| b77d28a | fix(landing): visible animated hero + refresh stale claims   |
| b95bcb0 | feat(sdk): OAuth2/OIDC integration for external consumers + tokens light parity |
| de31ed7 | fix(sdk): correct billing/invite paths + authorize() API + full coverage audit |
| c0b8f17 | fix(tokens/components): token-driven colors — no brand hardcodes left |
| 78c49ac | feat(sdk): TenantSdk.create returns the created tenant + docs ecosystem SDK page |
| 37e8c75 | chore(release): sdk 1.1.0 (OAuth2/OIDC external flows + TenantSdk.create fix) |
| d9b55e2 | fix(tokens/landing): pointer cursor on all interactive controls |
| afe95f4 | feat(components): NotificationDrawer hover-select bulk actions + a11y fixes |
| 14be1cc | fix(components): Marquee gap clamp, password/qrcode a11y + test fixes |
| c5e23fc | test(components): NumberInput typing tests use a controlled harness |
| 8673968 | test(components): InfiniteScroll awaits state-flushed onLoadMore |
| c2a8c10 | test(components): DataTable rows-per-page selector via keyboard-open |
| e76deed | fix(components): DateInput label association + date-picker year test |
| 11f5075 | fix(components): country-code region filter keeps region-less entries + test alignment |
| 75d5800 | fix(components): Cape Verde dataset + Nigeria FCT id + country-name tags |
| 8a7aef3 | chore: add changesets for components icon/theme and cli icons generate |
| 2aca211 | feat: icon registry additions, SSR-safe theme, cli icons generate |
| 3bc89f2 | chore: update landing + docs to the new icon registry          |
| a9591ee | docs: sync README with the facet icons generate command        |
| 17bb786 | docs(landing): add icons generate to the CLI package blurb      |
| 3e23408 | chore(release): version packages (components 1.6.0, cli 0.5.0, tokens 1.1.1) |

Summary: SDK v1.1.0 ships with OAuth2/OIDC external consumer flows, `TenantSdk.create` returning the created tenant, and corrected billing/auth paths. The icon registry goes tree-shakeable with a slim `/light` surface. Token-driven colors eliminate brand hardcodes. Pointer cursor fixes across tokens/landing. SDK docs page added. Components v1.6.0, CLI v0.5.0, tokens v1.1.1.

Canonic refs: EP 11 (consumer found dark-only tokens), EP 13 (brand icon vanish)

---

## 2026-08-15 — Emails + Animation Family + Landing Polish

24 commits — facet-emails launch + animation system

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| c968869 | feat(landing): interactive demo section, animated hero, sparkle CTAs + em-dash sweep |
| d2b43d0 | feat: billing page components, footer variants, and the framework-agnostic facet-emails package |
| 76b902c | feat: email template primitives + `facet emails init` CLI command |
| 10f22f0 | fix(emails): consolidate React import + repo-aware `facet emails init` suggestions |
| 050d9ce | fix(emails): variadic children in primitives + general repo suggestion engine |
| 1bc6459 | fix(cli): remove unused installCommand import in emails init   |
| 82bb763 | fix(emails): server entry import path + type-only imports for workspace build |
| 68b953b | fix(emails): drop unused EmailBrand type import in index barrel |
| ac3c1a5 | fix(emails): drop unused name param in preview server html helper |
| 82e5474 | fix(emails): full type audit - resolve all dts/TS6133 and type errors |
| 4115bda | fix(components): dts build errors in footer + billing pages      |
| 211c0fe | chore(release): version packages                               |
| d6d7f32 | fix(cli): include facet-emails in pkg/doctor/update + discover consumer-declared facet deps |
| ca7705a | feat(cli): dynamically discover facet packages + auto-apply updates |
| e25905c | chore: changeset for cli dynamic discovery + auto-apply update |
| d05bda5 | feat(landing): remove GridPattern from hero, keep aurora + beams + spotlight |
| eed70d9 | docs: fix stale component count (63->64) + remove duplicate auth presets table from Theming |
| de69dd4 | chore(release): version packages - @arcevo/facet-cli 0.7.0      |
| 1aa6c41 | chore: remove consumed changeset for cli 0.7.0                  |
| e474779 | feat(landing+docs): add facet-emails to packages + new docs Emails page |
| 7c5d7ce | docs: audit CLI commands/flags - facet update auto-apply, emails in layer matrix + CLI intro |
| 522c3b0 | fix(landing): remove em-dashes from DemoSection copy           |
| 2a305ab | feat(components): TypewriterText component + landing hero typewriter |
| 78b6543 | chore: changeset for TypewriterText component                  |
| 448d666 | fix(auth): use PasswordInput (eye toggle) for all password fields |
| 8d922f7 | feat(components): animation family - text animations + micro-interactions + docs Animation section |
| 2236aa8 | feat(auth): full copy flexibility - every label, placeholder, button, and error editable via copy prop |
| a35b6e1 | fix(pkg): update stale package descriptions pre-publish          |
| 9360e93 | feat: uniform animated buttons in composed components (AnimatedButton, overridable) |
| f5ff339 | fix(components): remove unused AnimatedButtonRenderProps import in billing-page |
| fd6a56e | fix(auth): remove unused imports (Input, Button) tripping the dts build |
| a058223 | chore: changeset for tokens animation keyframes                |
| f93f56d | chore: changeset version bumps                                 |
| 310b27f | fix(emails): wrapped React components no longer drop element children |

Summary: `facet-emails` launches — a framework-agnostic email template package with `facet emails init` CLI command. Billing page components + footer variants shipped. Animation family born: text animations, micro-interactions, animated buttons (AnimatedButton, overridable), TypewriterText, and CSS keyframe tokenization. Auth gains full copy flexibility (all labels/placeholders/errors configurable). Landing hero polished — interactive demo section, aurora + beams + spotlight (GridPattern removed), em-dash sweeps. CLI gains dynamic package discovery + auto-apply updates.

Canonic refs: EP 15 (billing components + emails)

---

## 2026-08-16 — Ready-to-Use Surfaces + Layout Polish

10 commits — component quality + layout refinements

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 2d80f04 | docs(landing+readme): sweep stale claims + emails ReactNode type cleanup |
| 53ca15c | feat(cli): consumer templates + --use-template merge          |
| 3282f4c | docs(landing): facet update FAQ now reflects auto-apply behavior |
| 577fb09 | chore(release): version packages                               |
| 514eba4 | Merge pull request #1 from ArcevoDev/changeset-release/main   |
| 662f9c4 | feat(components): card animations + 15 ready-to-use surfaces, animation pills fix |
| 2d1228a | refactor(components): bring new ready-to-use components to full quality bar |
| e4459fc | fix(components+docs): animations now emit CSS, replayable previews, responsive tables |
| 18547dc | feat(components+layout+tokens+docs): MailInput + Dissolve animation family + footer streamline + sidebar accordion mode + docs wiring |
| 55ece8a | chore: consolidate .agent tracker (output.txt -> todo.txt, delete temp files) |
| d28a1e0 | chore: gitignore .commandcode/ (local-only Command Code config) |
| f347e8f | fix(landing): alias FaqSection import to resolve local name conflict |
| be7fc93 | feat(layout+docs): sidebar accordion fix + chevron toolbar icons + global PackageManagerProvider |

Summary: 15 ready-to-use surfaces added (cards, panels, etc.) with full quality bar pass. Card animations, MailInput component, Dissolve animation family. Sidebar gains accordion mode with chevron toolbar icons. Animations now emit CSS with replayable previews. Consumer templates for CLI with `--use-template` merge. `.commandcode/` gitignored.

Canonic refs: Part of the §16 docs-site work

---

## 2026-08-17 — CI Publish Fix + Count Reconciliation

6 commits — CI correctness + docs sync

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| b7accc3 | chore: Phase 8 polish + release-state correction              |
| 994bd28 | chore(release): version packages                              |
| 4cc56a5 | fix: sync CLAUDE.md component count to 85 to resolve docs inventory drift |
| d5afcec | fix(ci): pass NPM_TOKEN/NODE_AUTH_TOKEN to publish job so npm auth resolves |
| d69c4f6 | docs: bump published versions in README and document CI publish |
| 8dd0033 | fix(deploy): build workspace deps via turbo before app vite build |
| 3dedc4c | fix(landing): refresh stale claims to match current library state |
| a8cca29 | fix(docs): sync component count 68 -> 85 in docs pages        |

Summary: CI publish job fixed — `NPM_TOKEN`/`NODE_AUTH_TOKEN` now passed as env into the publish job (EP 05 root cause resolved). Deploy fixed to build workspace deps via turbo before app vite build. Component count synced to 85 across CLAUDE.md, README, and docs pages. Landing stale claims refreshed.

Canonic refs: EP 05 (publish auth death spiral), EP 02 (count sync)

---

## 2026-08-18 — Composable Components

1 commit — component depth

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| b1da261 | feat: 5 new composable components, CLI enhancements, marquee strip variant |

Summary: 5 new composable components added. CLI enhancements. Marquee strip variant.

---

## 2026-08-19 — Audit + CI Gate Wiring

2 commits — audit + CI hardening

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| d9f1da9 | chore(audit): repo sweep, facet add/install split, docs count reconciliation |
| 6cd44f7 | test(ci): wire CI gates + add SDK table<->barrel drift check (#8) |

Summary: Repo sweep for consistency. CLI `add`/`install` split formalized. Docs count reconciled. CI gates wired including a new SDK table↔barrel drift check (PR #8).

Canonic refs: EP 26 (sidebar accordion — test wiring)

---

## 2026-08-20 — Store Stabilization + Debt Resolution

1 commit — architectural debt

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 43ccd14 | chore: stabilize store + cli at 1.0.0, resolve 10 architectural debt items |

Summary: Store and CLI stabilized at 1.0.0. 10 architectural debt items resolved (type exports, barrel hygiene, etc.). Prep for the September motion/native work to come.

---

## 2026-08-21 — Pending Changes Commit

1 commit — catch-up

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| cfabae9 | Commit all pending changes                                    |

Summary: Catch-up commit of pending working-tree changes.

---

## 2026-08-23 — Mobile Sidebar UX

1 commit — mobile layout

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 1bf5de5 | feat(layout): hamburger hover-toggle + click-to-pin for mobile sidebar |

Summary: Mobile sidebar gains hover-toggle + click-to-pin interaction for the hamburger toggle.

---

## 2026-08-24 — CLI Timeout + Navbar Fix

3 commits — robustness + version

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 205d83b | fix(cli): 3s registry fetch timeout, 15s test ceiling; fix alert-circle alias |
| eb0b8bf | Version Packages                                             |
| 48118e5 | fix: navbar hover rendering fix                              |

Summary: CLI registry fetch gets a 3s timeout (was unbounded). Test ceiling bumped to 15s. `alert-circle` lucide alias fixed (AlertCircle was renamed to CircleAlert in lucide-react 1.30). Navbar hover rendering bug fixed. Version packages batch.

Canonic refs: EP 28 (tests that hung on registry)

---

## 2026-08-26 — Mass UI Refinement

1 commit — broad sweep

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 5dcbb02 | chore: uncommitted mass ui refinement and components addition |

Summary: Uncommitted mass UI refinement across multiple packages plus new component additions.

---

## 2026-08-27 — Dependency Sync

1 commit — maintenance

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 3ffe04b | chore: pkgs update                                            |

Summary: Package updates (dependency bump sweep).

---

## 2026-09-02 — Playground + Navbar Fixes

4 commits — playground + polish

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 56b99e7 | feat: 21 new components + z-index stack + playground integration |
| 703f4a7 | fix(docs): playground preview robustness                      |
| 6d9b9ee | chore: stage changesets for kanban actions + playground robustness |
| 24b9003 | fix: navbar tooltip z-index, icon colors, ecosystem count, feedback page, faq, qr demo |

Summary: 21 new components added. Z-index stack system introduced. Playground integration begins. Navbar tooltip z-index fixed, icon colors corrected, ecosystem count updated, feedback page + FAQ + QR demo polished.

---

## 2026-09-04 — Review-Driven Polish

2 commits — polish pass

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| d7da2c6 | fix: review-driven polish - changelog extraction, stale counts, dashboard animation, marquee testimonials, feedback layout, UserButton role badge |
| bbcd766 | fix: commit pending avatar roleBadge slot + footer renderLink prop + tracker update |

Summary: Post-review polish across changelog extraction, stale component counts, dashboard animation, marquee testimonials, feedback layout, UserButton role badge. Avatar roleBadge slot committed. Footer `renderLink` prop added. Tracker updated.

---

## 2026-09-08 — Chart System v2

3 commits — chart + DataTable evolution

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 63fb165 | feat: Chart enhancements, DataTable density/loading/emptyState, remove DataTablePage |
| 776a8a1 | fix(docs): replace DataTablePage with DataTable in previews and usage after component removal |
| 0506770 | docs(tracker): sync .agent/output.txt and .agent/todo.txt to final state |

Summary: Chart v2 enhancements (density, loading, empty states). DataTablePage removed and merged into DataTable. DataTable gains density/loading/emptyState props. Docs previews + usage updated. `.agent` trackers synced to final state.

Canonic refs: EP 29–30 (chart system v2)

---

## 2026-09-09 — V1 Polish

1 commit — final polish

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| f2ebd1a | feat: v1 polish — icon system, copy props, count/version sync, and fixes |

Summary: V1 polish pass — icon system refinements, copy props (all labels/placeholders editable), count/version sync across README/CLAUDE.md/docs, and general fixes.

Canonic refs: EP 32 (debrand to SovGrant)

---

## 2026-09-12 — Fusorb Migration

2 commits — rebrand

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 046ca4f | feat: fusorb migration + chart polish + migration fixes       |
| 94158a5 | fix(docs): clean up stray .agent artifacts and fix playground test mock prop leak |

Summary: The `arc-ui` → `facet` → `fusorb` rebrand completes. Chart v2 polish continues. Stray `.agent` artifacts cleaned. Playground test mock prop leak fixed.

---

## 2026-09-13 — Chart Crosshair Fix

7 commits — chart precision

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 70b7054 | fix(chart): crosshair snaps to data points + animation props wired |
| 3bc29f2 | fix(chart): crosshair snap + animation props for horizontal bar layout |
| 0f70d33 | docs(tracker): sync .agent canon + trackers to final state    |
| d6a688a | feat(chart): v2 polish with crosshair dot centering           |
| e3ed0a4 | fix(chart): anchor active data-point dot hover scale to its centre |
| 7daa663 | fix(chart): bar crosshair follows the cursor, drop fixed 8px snap |
| 703aea1 | chart: crosshair dot border inherits background, add tickCount/yMin/yMax |
| 19f4832 | docs(ComponentPage): remove live playground section            |

Summary: Chart crosshair snapping precision — crosshair now snaps to data points (was drifting). Animation props fully wired (was declared but not applied). Horizontal bar layout gets crosshair support. Data-point dot hover anchored to centre. tickCount/yMin/yMax props added. Live playground section removed from ComponentPage.

Canonic refs: EP 29 (crosshair drift), EP 30 (chart system)

---

## 2026-09-15 — SovGrant Debrand

1 commit — full rebrand

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| db287b3 | feat: debrand to SovGrant + V2 animation grammar + landing rebuild |

Summary: Full rebrand to SovGrant. V2 animation grammar lands (two-tier motion: animate-facet-* utility classes + CSS custom properties). Landing rebuild begins (shared lab primitives scaffolded).

Canonic refs: EP 32 (debrand + V2 animation grammar)

---

## 2026-09-16 — Motion System Scaffold

3 commits — motion engine v1

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 3fefa64 | feat: add @fusorb/facet-motion declarative animation system |
| 2c37fad | feat(motion): wire motion tokens into facet-tokens + add CLI generators |
| ac94c09 | refactor(motion): extract token resolution into platform-agnostic module |

Summary: The `@fusorb/facet-motion` package ships (v0.1.0) — a declarative, token-driven animation system (no Framer Motion/GSAP dependency). Motion tokens wired into `@fusorb/facet-tokens`. CLI generators for motion tokens. Token resolution extracted into a platform-agnostic module.

Canonic refs: EP 31 (motion system scaffold)

---

## 2026-09-17 — Full Motion + Native Scaffold

10 commits — consumption + native + domain presets + sandbox + playground

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 59ee9f9 | refactor(motion): extract driver resolution into shared core module |
| 5eac19f | feat(motion): consume facet-motion across facet-components + landing |
| 3999eee | feat(native): scaffold @fusorb/facet-native (0.1.0)          |
| cbb5d1d | fix: reconcile CLI/Store versions 2.0.0 -> 1.0.0              |
| ba7a864 | docs: sync README + CLAUDE.md + workspace config after motion + native |
| 4aa1ab5 | fix(native): drop composite:true from tsconfig (matches sibling packages) |
| cf4f516 | fix(audit): wire check:motion-drift gate, add token-parity audit, fix type errors, expand vitest workspace |
| ce764e3 | feat(native): full nativeDriver with bindAnimated/apply + binding API + 21 tests |
| 059c9f8 | chore(landing): sync generated site data with 1.0.0 version reconciliation |
| a503c7d | fix(cliud): sync CLAUDE.md test count with 902 across 10 projects |
| 4960108 | feat(motion): add fintech domain motion presets (Phase 3a)    |
| aef768e | chore: update CLAUDE.md test counts 902→926 with domain preset additions |
| dad0e06 | lock(motion): commit domain-presets baseline + parity gate + README gate fixes |
| f4ca95a | feat(sandbox): scaffold @fusorb/facet-sandbox live-preview host |
| f0359a6 | feat(playground): scaffold @fusorb/facet-playground live-preview host |
| 47d8f16 | feat(playground): style chrome with @fusorb/facet-components    |
| 5c82707 | chore: add dev:playground root script                          |
| 878d79c | feat(playground): ConsoleLayout shell with sidebar + topbar + theme toggle |

Summary: Motion system goes full production — consumed across facet-components + landing. facet-native v0.1.0 scaffolds with full nativeDriver (bindAnimated/apply + binding API + 21 tests) in a single day. Driver resolution extracted into shared core module. Domain motion presets added (fintech/med/edu/enterprise/default). CLI/Store versions reconciled back to 1.0.0 (never published at 2.0.0). check:motion-drift + audit-motion-parity gates wired. facet-sandbox scaffolded (React adapter with hand-written JSX parser, no eval). facet-playground scaffolded with ConsoleLayout shell + theme toggle. dev:playground root script. Test count: 902→926.

Canonic refs: EP 32 (motion consumption), EP 33 (audit + native driver), EP 34 (domain presets), EP 35 (sandbox)

---

## 2026-09-20 — Tracker Consolidation

1 commit — housekeeping

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 8891898 | chore: consolidate .agent trackers + commit working tree      |

Summary: `.agent` trackers consolidated. EP 36 (tracker consolidation) in episodes.md.

Canonic refs: EP 36 (tracker consolidation)

---

## 2026-09-21 — Working Changes Consolidated

1 commit — catch-up

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| cb6dd2a | feat: consolidate all working changes across packages        |

Summary: Working-tree changes across all packages consolidated into a single commit.

---

## 2026-09-23 — §16 Composability Slots + §21 Boundary Gate + §7 Native

8 commits — composability + governance

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 448a636 | fix(tokens): normalize barrel + file imports to .js ESM specifiers (P12) |
| 6ed9647 | ci: promote composability slot check to hard gate (P14)         |
| 7a9a350 | feat(components,layout): composability slots on composites + layout atoms |
| 6367295 | refactor(motion): Map-based preset registry + domain presets (§17) |
| ac4abb4 | docs,refactor(store,auth,native): dispositions + dep hygiene (§8 §20 §7 §1 §2) |
| e93bb5e | docs: content page inventory + renderers                        |
| 08c3c8c | feat(layout,Topbar): render-tenant/user-menu composability slots (§16) |
| d1be92c | feat(layout,PageHeader,TenantSwitcher): composability slots (§16) |
| c38c69b | feat(layout,ConsoleLayout): aside panel for on-this-page nav (§15) |
| 5534d1b | docs(native): §7 disposition — SovGrant/SovPort integration surface |
| ced96e7 | fix(layout,§15): green docs-layout baseline                      |
| 0f21355 | ci(§21): add check-boundaries gate (acyclic DAG + native-isolated) |
| 2a04adc | docs(handbook): sync CLAUDE.md with sec21 boundary gate + sec7 native disposition |
| 724c84c | fix(layout,ChatLayout): hoist useEffect before conditional returns (Rules of Hooks) |

Summary: §16 composability slots land on Topbar (render-tenant/user-menu), PageHeader, TenantSwitcher, and composite components. Layout atoms get composability slots. §15 ConsoleLayout aside panel for on-this-page nav. §17 Map-based motion preset registry. §21 boundary gate (acyclic DAG + native isolation) promoted to CI hard gate. §7 native disposition documented (SovGrant/SovPort). ChatLayout Rules-of-Hooks fix. Barrel imports normalized to `.js` ESM specifiers.

Canonic refs: EP 37–42 (§15/§21/§7 greening streak, §16 composability, §17 motion registry, §21 boundary gate, §7 native disposition, §21 hard gate, chat layout hook fix)

---

## 2026-09-24 — §16 Docs-Site Pass + §17 Collapsed Sidebar + Focus Ring Purge

7 commits — final polish + cleanup

| Hash  | Message                                                        |
|-------|---------------------------------------------------------------|
| 6027bc4 | feat(layout,docs,components,motion): §16 docs-site mobile logo toggle, dynamic TOC, shadow/pointer-events fixes, cn() extraction |
| fc7c12a | fix(layout): §16 mobile sidebar search bar + nav toggler visibility |
| 46a4f56 | fix(components): §16 docs-site hover bg refinements (dropdown/navbar/navigation-menu) |
| 2fcfea1 | chore: stage all in-progress changes                          |
| 6591426 | refactor(components): strip all focus-ring (blue border) styles from every component |
| 44c46a6 | feat(layout): §17 collapsed sidebar variant + repo-wide cleanup |

Summary: §16 docs-site pass — mobile logo toggle, dynamic TOC, shadow/pointer-events fixes, cn() extraction to `@fusorb/facet-utils`. Mobile sidebar search bar + nav toggler visibility. Hover bg refinements across dropdown/navbar/navigation-menu. §17 collapsed sidebar variant — new LayoutContext methods (collapseAll/expandAllSidebar) + DocsLayoutContext (collapseAllSidebarAndAside) + DocsTopbarControls with Ctrl+Shift+B shortcut. Focus rings stripped from ALL components — blue borders removed, static rings for selected/active states preserved. Repo-wide cleanup — 27 tracked files deleted (debug scripts, stale artifacts, unused scripts).

Canonic refs: EP 44 (§16 docs-site pass), EP 45 (focus ring purge), EP 46 (§17 collapsed sidebar + cleanup)

---

## In-Progress: 2026-09-25 — §18 Landing Labs Rebuild

Working tree status: In-progress (uncommitted)

Completed in this session:
- Stage 1 — Shared lab primitives: Created `LabShell.tsx`, `LabCategoryToggle.tsx`, `LabSearchInput.tsx`, `CodeViewer.tsx` (new shared primitives). Updated barrel `index.ts` to export all four. Grid-fixed `LabSurface.tsx` (CopyButton `gap-1.5`→`gap-1`).
- Stage 2 — 4 page rewrites: `ComponentsPage.tsx`, `MotionLabPage.tsx`, `AuthLabPage.tsx`, `TokensPage.tsx` rewritten to use shared primitives (`LabShell`, `LabCategoryToggle`, `LabSearchInput`, `LabPanel`, `LabTag`, `CodeLine`, `CopyButton`, `CodeViewer`).
- Stage 3 (partial) — Token migration: Stale scratchpad tokens (`text-text-dim`, `text-text-muted`, `bg-panel`, `bg-panel-hover`, `bg-accent-dim`, `border-accent`, `placeholder-text-dim`, `rounded-[2px]`) migrated to semantic Tailwind tokens across `LayoutSection.tsx` and `ComponentsSection.tsx`. Local `CopyButton` in `LayoutSection.tsx` removed (imports shared one from `LabSurface`).
- Stage 4 — Grid alignment: `.5`-fractional utilities purged across all files (`.5` grid gate passes).
- Stage 5 — Verification: `tmp.css` deleted (from EP 46 cleanup). Typecheck pending.

Task 1 — Nav rebuilt as Topbar: `Nav.tsx` rewritten from `Navbar`-based markup to use `@fusorb/facet-layout`'s `Topbar` component (configured with `brand`, `nav` via `DropdownMenu`, `children` for GitHub + search + mobile `Drawer`, `themeToggle`, `showSidebarToggle={false}`, `renderTenantSwitcher`/`renderUserMenu` null). `LayoutProvider` added to `app.tsx` root. `GlobalSearch` stale tokens migrated. No tooltip on search bar (inline label + ⌘K).
- Footer gap flagged: `facet-layout` has no `Footer` primitive — `LandingLayout` accepts a `footer` ReactNode but provides no Footer component. Landing app already uses `FacetFooter` from `@fusorb/facet-components` (not bespoke markup), so no rebuild needed — gap is in facet-layout itself.
- Footer note: no change required (already uses `FacetFooter`).

Task 2 — ChangelogSection fixed: Renders only `changelog.slice(0, 3)` (3 most recent entries, not full list). `showFilter` removed. `import.meta.env.DEV` `preventDefault()` removed — link now uses `target="_blank" rel="noreferrer"` to open docs changelog in a new tab (works in dev and prod).

Task 3 — Billing duplication audit: No duplication found. `PricingPage.tsx` (landing) is a proper consumer of the generic `BillingPage`/`BillingPageTable`/`BillingPageFreemium` components (from `billing-page.tsx`) with facet-specific config (`FACET_PLANS`, `COMPARE_ROWS`, `CONFIG`). `PricingComparison` (from `pricing-comparison.tsx`) is a separate alternative layout (tier cards + feature matrix), not used by the landing app. No duplication to fix.

Task 4 — HeroSection rebuilt: Replaced 280-line domain-cycling sign-in card with a compact auth console surface built from real Facet components (`Button`, `Pill`, `LightIcon`). Two-column layout: LEFT = one-line positioning statement, supporting line, CTAs, install command with copy; RIGHT = console/auth surface (window header with traffic-light dots, provider rows with connected status, +Add provider action). Visual language restrained: `foreground/5` borders, `bg-secondary/30` surfaces, no SaaS gradients. Stale tokens migrated.

Task 5 — Labs-to-playground note: (to be included in final report)

Canonic ref: This session's work would be a new EP (§18 numbering per the handbook).

---

## Daily Commit Counts Summary

| Date       | Commits | Milestone                          |
|------------|---------|------------------------------------|
| 2026-07-29 | 4       | Foundation                         |
| 2026-07-31 | 4       | Initial feature surface            |
| 2026-08-01 | 11      | 1.0.0 release prep + rebrand       |
| 2026-08-02 | 2       | 14 new components                  |
| 2026-08-04 | 5       | Docs engine v1                     |
| 2026-08-05 | 1       | Ready-to-use + variants            |
| 2026-08-10 | 1       | CLI scaffold                       |
| 2026-08-11 | 9       | Icon registry rebuild + CLI expand |
| 2026-08-12 | 19      | DataTable + Navbar + layout        |
| 2026-08-13 | 14      | DataTable deep dive + AuthLayout   |
| 2026-08-14 | 17      | SDK + icon light surface           |
| 2026-08-15 | 24      | facet-emails + animation family    |
| 2026-08-16 | 10      | Ready-to-use surfaces + layout     |
| 2026-08-17 | 6       | CI publish fix + count sync      |
| 2026-08-18 | 1       | Composable components              |
| 2026-08-19 | 2       | Audit + CI gate wiring             |
| 2026-08-20 | 1       | Store stabilization + debt       |
| 2026-08-21 | 1       | Pending changes                    |
| 2026-08-23 | 1       | Mobile sidebar UX                  |
| 2026-08-24 | 3       | CLI timeout + navbar fix           |
| 2026-08-26 | 1       | Mass UI refinement                 |
| 2026-08-27 | 1       | Dependency sync                    |
| 2026-09-02 | 4       | Playground + navbar fixes          |
| 2026-09-04 | 2       | Review-driven polish               |
| 2026-09-08 | 3       | Chart system v2                    |
| 2026-09-09 | 1       | V1 polish                          |
| 2026-09-12 | 2       | Fusorb migration                   |
| 2026-09-13 | 7       | Chart crosshair fix                |
| 2026-09-15 | 1       | SovGrant debrand                   |
| 2026-09-16 | 3       | Motion system scaffold             |
| 2026-09-17 | 10      | Full motion + native + presets     |
| 2026-09-20 | 1       | Tracker consolidation              |
| 2026-09-21 | 1       | Working changes                    |
| 2026-09-23 | 8       | §16 slots + §21 gate + §7 native   |
| 2026-09-24 | 6       | §16 pass + §17 + focus purge       |
| 2026-09-25 | ~7 | §18 landing labs rebuild (in-progress) |
| Total | 235 |                                     |

