# M1 pins proof — `workspace:^` → published `^` range

**Date:** 2026-11-01  
**Branch:** chore/release-hygiene  
**Commit:** (M1 commit)  

## Method

1. Converted every `workspace:*` sibling entry in published packages to
   `workspace:^` (20 entries across auth, components, docs, layout, motion,
   native, store).
2. Ran `pnpm pack` on `@fusorb/facet-auth` and `@fusorb/facet-components`
   from the working tree (which already uses `workspace:^`) and extracted the
   resulting tarballs.
3. Read the published `package.json` from each tarball.

## Evidence

`@fusorb/facet-auth@2.0.2` (tarball `fusorb-facet-auth-2.0.2.tgz`):

```
dependencies:
  @fusorb/facet-components: ^3.2.0
  @fusorb/facet-sdk: ^2.1.0
```

`@fusorb/facet-components@3.2.0` (tarball `fusorb-facet-components-3.2.0.tgz`):

```
dependencies:
  @fusorb/facet-motion: ^1.2.1
  @fusorb/facet-tokens: ^1.5.0
  @fusorb/facet-utils: ^0.1.0
peerDependencies:
  @fusorb/facet-sandbox: ^3.0.0
```

## Conclusion

`workspace:^` resolves to a caret range (`^x.y.z`) in the published tarball,
whereas `workspace:*` would have resolved to an exact version. The pin change
is therefore effective and consumers can dedupe across versions. `check:pins`
enforces that no published package reintroduces bare `workspace:*`.

## Changesets

`changeset version` was also run in a temp copy (with the three M1 changesets)
and produced the expected version bumps (auth 2.0.2→2.1.0 minor, components
3.2.0→3.2.1 patch, layout 1.7.1→1.7.2 patch) without errors.