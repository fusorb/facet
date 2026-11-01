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