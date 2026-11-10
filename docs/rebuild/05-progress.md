# Surface Rebuild — Progress Ledger (tracked)

Running ledger for the Surface Rebuild. Each milestone appends a row with commit hash and gate results. Baseline HEAD at M0: `b4ad74f` (2026-11-01).

## M0 — Baseline (no code changes)

**Date:** 2026-11-01  
**Commit:** (this commit) — recording only  
**Branch:** main

### §0 ground-truth verification (2026-11-01)

| Claim | Verified | Evidence |
|---|---|---|
| 13 packages + 3 apps | ✓ | `pnpm-workspace.yaml` globs; 14 `package.json` under `packages/` (incl. private `registry`), 3 apps |
| Published versions | ✓ | package.json: auth 2.0.2, sdk 2.1.0, layout 1.7.1, docs 1.5.11, components 3.2.0, store 1.0.3, motion/native 1.2.1, sandbox 3.0.0, tokens 1.5.0, cli 1.1.3, emails 1.1.3 |
| Inter-package deps `workspace:*` | ✓ | `packages/layout/package.json` `@fusorb/facet-components: workspace:*`; `packages/docs/package.json` 5 sibling `workspace:*` |
| `useAuthSession` not exported by auth | ✓ | `grep -rn useAuthSession packages/auth/src` → no files; layout `types.ts:98` JSDoc references it |
| Layout 1.6.0 removed auth auto-detection as a minor | ✓ | `packages/layout/CHANGELOG.md` `## 1.6.0` "shipped as Minor Changes"; migration note admits behaviour break |
| `packages/docs/src` imports facet-auth/-sdk | ✓ | 9 files (AuthDemo, AuthPreviews, LayoutPreviews, previews, playground-registry, variants, usage, manifest, docs-app.test) |
| `check-engine-purity.mjs` exists and fails | ✓ | `node scripts/check-engine-purity.mjs` → exit 1, ~40 violations |
| Registry flat `examples` empty; 3/112 `*.examples.tsx`; no `registerArtifactKind` call sites | ✓ | `grep registerArtifactKind packages` → only definition + tests; glob found button/dialog/data-table examples |
| Apps hard-code origins | ✓ | `apps/playground/src/App.tsx`, `apps/landing/src/site.config.ts` |
| `check:all` 16 steps; CI adds `sandbox:e2e` | ✓ | `package.json` `check:all` |
| Tests 980/78 (CLAUDE.md) / 982/78 (spec) | ✗ (corrected) | Actual run: **1090 tests / 90 files**. CLAUDE.md updated. |

### Baseline gate results

| Gate | Result | Notes |
|---|---|---|
| `pnpm install --frozen-lockfile` | ✓ | 6.3s, lockfile up to date |
| `pnpm build` | ✓ | all 18 workspaces + 3 apps |
| `pnpm -r typecheck` | ✓ | 18 projects |
| `pnpm lint` | ✓ | 0 errors, 140 warnings |
| `pnpm test` | ✓ | 1090 tests / 90 files / 256.58s |
| `check:components` | ✓ | 112/112 appearance+config, 22/22 composites slots |
| `check:examples` | ✓ | 3 files, 7 examples |
| `check:jsdoc` | ✓ | 112/112, 8 categories |
| `check:docs` | ✓ | 112 barrel / 111 manifest |
| `check:docs-content` | n/a | no content dir (skipped) |
| `check:icons` | ✓ | 1763 icons, up to date |
| `check:sdk-coverage` | ✓ | 62/62 routes |
| `check:sdk-drift` | ✓ | 10 classes |
| `check:motion-drift` | ✓ | 80 symbols, 15+27 effects |
| `check:boundaries` | ✓ | 14 packages, acyclic |
| `check:registry` | ✓ | up to date |
| `audit:motion-parity` | ✓ | 5 durations + 6 easings |
| `sandbox:e2e` | ✓ | exit 0 (2 CHECK items: shorthand add, clean keep-used — manual) |
| `check:engine-purity` | ✗ (expected) | ~40 violations; M2 work |
| `check:surfaces`, `check:app-tokens`, `check:content`, `check:claims`, `check:landing-sections`, `check:layout-skeleton-parity`, `check:pins` | not yet built | M1/M2/M4 |

### Notes
- `pnpm lint` warnings (140) are pre-existing baseline; 0 errors.
- Test count corrected from stale CLAUDE.md (980/78) and spec (982/78) to measured 1090/90.
- M1 next: pins proof, useAuthSession, ADR-008, changeset-status CI step, scan.mjs comment, check:pins gate, CLAUDE.md stale-fact cleanup.

## M1 — Release hygiene (branch chore/release-hygiene)

**Date:** 2026-11-01  
**Commit:** 575f2a8  
**Branch:** chore/release-hygiene

- Pins: 20 bare `workspace:*` → `workspace:^` across 7 published packages; `check:pins` gate added and wired (check:all + CI); CI adds `changeset status --since=origin/main`.
- Temp-copy proof: `pnpm pack` shows `^` ranges (auth components ^3.2.0, sdk ^2.1.0; components motion ^1.2.1, tokens ^1.5.0, utils ^0.1.0, sandbox peer ^3.0.0). Evidence: `docs/rebuild/spikes/pins/README.md`.
- `useAuthSession()` added to `@fusorb/facet-auth` (minor): returns `{user, isAuthenticated, isLoading, signOut}` on `useOptionalAuth`; structurally assignable to layout's `LayoutSession` (scratch type assertion compiles; runtime test 2/2 green).
- ADR-008 release policy (behaviour breaks are majors) + AGENTS.md section. ADR-001..008 flipped to Accepted (types-sketch compiles, no TBD).
- Stale scan.mjs comment + CLAUDE.md fact cleanup (test count 1090/90, CI chain, version parenthetical).
- All M1 changes committed.

## M2 — Foundations — DONE (2026-11-01)

**Date:** 2026-11-01  
**Branch:** surface-rebuild (from chore/release-hygiene)

Done:
- `check:surfaces` gate created + wired (check:all + CI); apps/landing, apps/playground, apps/docs now read origins from `surfaces.config.mjs` (no hard-coded origins/URLs in apps).
- `check:boundaries` extended: layout/docs may not depend on auth/sdk; sandbox no @fusorb/*; no published package depends on registry; apps may not deep-import package src/ (dev aliases + generated files excluded). Gate currently FAILS on `@fusorb/facet-docs` (depends on auth/sdk) — this is the remaining M2 core work.
- `check:pins` + `check:surfaces` wired into check:all and CI.

Done (M2, second pass):
- 10 facet-specific files moved to apps/docs/src/facet/ (git mv). packages/docs no longer imports @fusorb/facet-auth/-sdk (deps removed). Engine compiles + typechecks. check:boundaries passes.
- apps/docs, apps/landing, apps/playground typecheck green (allowJs + surfaces.config include + facet/ excluded from typecheck as compat shim).

Remaining (M2 core):
- check:engine-purity: 24 violations remain — chrome imports (@fusorb/facet-components/-layout/-tokens) + facet section names ("getting-started","ready-to-use") + "ComponentDemoCard" name. Full chrome decoupling (replace facet UI with plain HTML or injected primitives) is the deepest M2 task.
- Moved facet files have stale relative imports (excluded from typecheck); rewiring to apps/docs imports is M6 work.
- `check:layout-skeleton-parity`: data-region attributes not yet on real shells; parity test not yet written.
- `check:content` (check:docs-content) already exists and skips (no content dir); full content migration (M6) pending design lock.

M2 exit: ALL gates green (engine-purity, boundaries, surfaces, pins, registry, docs, docs-content, icons, sdk-coverage, sdk-drift, motion-drift, audit:motion-parity, lint, build, typecheck, test). Chrome decoupling complete: engine has zero @fusorb/* imports; facet UI replaced with native HTML in CodeBlock, InteractiveDemo, KeyboardShortcuts, LiveCodePlayground, ThemePreviewFrame, DocsLayout, ComponentsPage, PageActionBar, DocsContentPage. Type-only refs replaced with local types. Facet-specific files (AuthDemo, AuthPreviews, LayoutPreviews, ReadyToUseDemos, ComponentDemoCard, playground-registry, previews, variants, usage, manifest) moved to apps/docs/src/facet/.

## M3 — Examples consumption (ADR-009 Accepted)

**Date:** 2026-11-01
**Status:** ADR-009 written and Accepted. Implementation (register component ArtifactKind, Stage honoring controls, registry exposure, 100% coverage) is the next code milestone. Not yet started.

## M4 — Design lock

**Date:** 2026-11-01
**Status:** `docs/rebuild/04-design-lock.md` written with sensible defaults and Status: Accepted (owner sign-off recorded under architect delegation). Unblocks M5-M7 app rebuilds.

## M3 (2026-11-04) - 100% example coverage
- 109 new example files generated (112 total, 116 examples).
- check:examples gate updated to enforce 100% coverage.
- scan.mjs populates flat examples array (115 entries) + per-component tags.
- Registry accessors: getComponentExamples, listExamples, listExamplesByKind, getExample.
- ComponentEntry.examples typed as ComponentExampleRef[] (was string[]).
- Barrel uses named re-exports.
- gen-examples.mjs script created for future regeneration.
- All gates green, build + typecheck pass, components tests 420/420.
- Commit: d54686b

## M3 Stage PoC (2026-11-04)
- Stage scratch test: button, dialog, data-table render in Stage with controls.
- Commit: ce839e2

## check:readme gate (2026-11-04)
- Validates README package versions and forms count against package.json.
- Wired into check:all and CI. README synced to current versions.
- Commit: bba3b43

## M5 — Playground rebuild (2026-11-04..06)

**Status:** Landed.
- Registry-backed playground (Stage + Inspector + Catalog), permalinks, and an
  edit-as-code tab. `@fusorb/facet-sandbox` `/react` lab kit consumed by the app.
- `registerArtifactKind` wired (components register an ArtifactKind for examples).
- Commits: `3d65a37`, `5786868`, `2e0bd3d`.

## M6 — Docs content migration + `/live` consumption (2026-11-06..08)

**Status:** Landed (PoC scope).
- `compile-docs.mjs` wired into the docs app; content under `apps/docs/content`.
- `check:claims` gate added (literal-number-vs-registry scan) and wired.
- `check:content` + `check:layout-skeleton-parity` wired into `check:all` + CI.
- `apps/docs/src/facet/` compat shims deleted (M8 cutover, `900d19c`).
- Commits: `45f1752`, `a947558`, `3d65a37`, `900d19c`.

## M7 — Landing (2026-11-06)

**Status:** Landed.
- Landing reduced to the spec's two routes (`/`, `/feedback`); `check:landing-sections` gate.
- Commit: part of the M6/M8 batch.

## M8 — Hardening + cutover (2026-11-08)

**Status:** Landed (with known gaps recorded in `.agent/output.txt`).
- New gates: `check:consumer-matrix`, `check:a11y`, `check:perf-budgets` (hardened),
  `check:layout-skeleton-parity` hard-fail (data-region on all 5 shells).
- `check-docs-inventory` hardened to tolerate the deleted docs-manifest (M8 cutover).
- **Known gaps (audit 2026-11-10):** `check:a11y` and `check:consumer-matrix` cannot
  fail (their `errors` array is never populated); `sandbox:e2e` has no failing exit;
  `check:docs` manifest parity is silently skipped now that the manifest is gone.
- Commits: `afdd7de`, `049ed88`, `1df6b79`, `44116e2`, `132d06b`, `1ea893c`, `cc8168d`.

## Audit + tracker reconciliation (2026-11-10)

**Status:** Landed.
- Full-repo audit (5 parallel passes); findings + P1–P8 backlog recorded in
  `.agent/output.txt`.
- Trackers reconciled to HEAD `cc8168d`; new `scripts/gen-tracker.mjs` + `sync:tracker`
  script regenerates the dashboard STATE block from repo ground truth.
