# ADR-008: Release Policy (behaviour breaks are majors)

**Status:** Accepted (accepted under architect delegation 2026-11-01; owner may reverse)  
**Deciders:** Surface Rebuild spec author, Phase 2 review  
**Date:** 2026-11-01

## Context

Facet's published packages are the product; consumers depend on their public
exports and on observable runtime behaviour. In the past a change that altered
runtime behaviour a consumer relies on (removing auth auto-detection from layout
shells), renamed a persisted key, or changed a peer range shipped as a **minor**
(see `packages/layout/CHANGELOG.md` `## 1.6.0`: "Layout shells now read auth
from an injected `session` ... `@fusorb/facet-auth` is no longer a runtime
dependency", shipped under `### Minor Changes`). That breaks semver's contract
and leaves consumers unable to trust a minor bump.

## Decision

A change ships as a **major** when it does any of:

1. Alters runtime behaviour a consumer relies on (e.g. removing auto-detection
   of an ancestor provider, changing default props, changing render output).
2. Removes a previously-supported code path or export.
3. Renames or changes the shape of a persisted key (localStorage, cookie, URL
   param).
4. Changes a peer-dependency range in a way that excludes previously-supported
   host versions.
5. Changes the public type of an exported symbol in a non-additive way.

Additive changes (new exports, new optional props, new components) ship as
**minor**. Bug fixes and internal refactors with no observable change ship as
**patch**.

Published inter-package dependencies use `workspace:^` (not `workspace:*`) so
the published range keeps the caret and consumers can dedupe across versions
(M1 pins). `workspace:*` is forbidden in published packages and enforced by
`check:pins`.

Changesets are required for every change to a published package's `src/` or
`package.json`. CI runs `pnpm changeset status --since=origin/main` and fails
if a published package changed without a changeset.

## Consequences

- **Positive:** Consumers can trust minor/patch bumps. Migration notes become
  mandatory for majors (Changeset body lists removed exports with replacements).
- **Negative:** More major bumps; some previously-minor releases would now be
  major. Historical 1.6.0-style breaks cannot be retroactively fixed, but
  future ones are prevented.

## Alternatives

| Alternative | Rejected |
|---|---|
| Keep "minor for behaviour changes" (status quo) | Breaks semver trust; consumers cannot upgrade safely. |
| Use a separate "breaking" changeset kind | Changesets only models major/minor/patch; mapping breaking→major is the standard. |