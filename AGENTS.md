# facet: Agent Session Rules

This file is loaded at the start of every session.
It overrides/supplements CLAUDE.md for AI agents.

## Session Protocol

1. Always write analysis and planning output to `.agent/output.txt` first,
   so the user can read from that file instead of scrolling the terminal.
2. After every significant milestone, update `.agent/output.txt` status dashboard.
3. When starting a new package, read any existing `.agent/**` planning files
   first before writing code.
4. `.agent/` is local-only (gitignored); it contains the live dashboard
   (`output.txt`) and the architectural episode canon (`episodes.md`).

## Architecture Rules

- Auth components must be domain-customizable (different configs for
  fintech vs med vs edu): not one-size-fits-all.
- Include a welcoming landing page and deployed documentation site alongside
  the component library.
- Build a differentiated component library wired to SovGrant SDK, not a generic
  clone of existing UI libraries.

## File Structure Rules

- Every package has: `src/`, `package.json`, `tsconfig.json`
- Every package exports from `src/index.ts` as barrel
- Re-export types alongside implementations

## Current Build Status

See `CLAUDE.md` and the README for the verified build/test/typecheck state.
`.agent/output.txt` is the local-only live dashboard.

The repo's tracked state reflects the latest committed work; the working tree
may contain in-progress changes. The three P0
breakages from the previous analysis (storiesDir path, missing
@storybook/react, root tsconfig reference) were fixed on 2026-08-03 in
commit 43ccd14: Storybook is fully purged and the drift gate is a barrel

- manifest check. See CLAUDE.md build status for the verified
  build/test/typecheck state.

## Publish Status

Packages publish to npm under the `@fusorb/facet-*` scope via Changesets,
driven by GitHub Actions (`.github/workflows/ci-cd.yml`). The workflow runs
three jobs:

1. **ci** -- validation gate: `pnpm install`, `pnpm build`, `pnpm check:docs`,
   `pnpm check:icons`, `pnpm check:sdk-drift`, `pnpm -r typecheck`, `pnpm test`,
   `pnpm sandbox:e2e`.
2. **changeset** -- auto-opens/updates a "Version Packages" PR on `main`
   whenever changesets land. It only versions (bumps `package.json` +
   `CHANGELOG`, opens a PR) -- never publishes. Requires
   `permissions: contents: write` so the release bot can push the
   changeset-release branch.
3. **publish** -- after the version PR merges to `main`, builds `dist` from a
   clean checkout and publishes any unpublished packages to npm. It
   `needs: [ci]` (the gate must pass) and runs `pnpm -r build` before
   `pnpm changeset publish`, so a stale or dirty tree is never shipped.
   Requires the `NPM_TOKEN` repo secret exported as `NODE_AUTH_TOKEN` in the
   job env.

**Release rule:** publish ONLY from a clean working tree, AFTER `pnpm -r
build` passes. The `publish` CI job enforces this automatically -- it rebuilds
`dist` from merged HEAD before publishing. See the README Publishing section.
