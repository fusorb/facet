# ADR-009: Examples Consumption (component ArtifactKind)

**Status:** Accepted (accepted under architect delegation 2026-11-01; owner may reverse)  
**Deciders:** Surface Rebuild spec author, Phase 2 review  
**Date:** 2026-11-01

## Context

Phase 5 authored colocated `*.examples.tsx` files (button, dialog, data-table = 7
examples across 3 components) plus a `./examples` subpath and a `check:examples`
gate. The `registry` scanner populates each component's `examples` array from
the sibling file, but:

- `Example.controls` (`ControlOverrides`) is dead data — `Stage` derives its
  Inspector from `inferControls(example.defaults)` and never reads `controls`.
- There is no `registerArtifactKind` call site anywhere, so sandbox `/react`
  `Stage`/`ArtifactRenderer` cannot resolve a "component" artifact kind.
- No host consumes the arrays: playground uses inline `LivePlayground code=`,
  docs has no example embed, and the registry's flat `examples: []` is empty.
- Coverage is 3/112 by design (PoC); consumption was never in the Phase 5 plan.

ADR-001 settled the Artifact/Example/Control model. This ADR settles how
component examples are *consumed*.

## Decision

1. **Register a `component` ArtifactKind in `@fusorb/facet-sandbox/core`.**
   - Owner: `@fusorb/facet-sandbox` (the kit). Registration happens at module
     load of a new `@fusorb/facet-components/examples` entry (or a registry-backed
     module), not in the engine.
   - The kind's `render` mounts the example's `render(props)` inside a bounded
     `Stage` viewport; `inferControls` returns the example's `controls` when
     present, falling back to `inferControls(example.defaults)`.
   - Kind id: `"component"`. Label: "Component".

2. **`Stage` honors `Example.controls`.**
   - When an example declares `controls`, those override inferred controls
     (label/group/options) — the Inspector uses them verbatim.
   - When absent, `Stage` falls back to `inferControls(example.defaults)`.
   - Slot props (`ReactNode`) use slot presets from the example; text/number/
     boolean/enum use the inferred or overridden control.

3. **Registry exposes examples.**
   - Fill the flat `examples` array in `registry.json` (currently `[]`) with
     `{ artifact, example, title, tags }` entries derived from the colocated
     files.
   - Populate each component's `examples` array (already wired in `scan.mjs`,
     currently empty placeholder replaced in M3).
   - Add registry accessors: `getComponentExamples(slug)`,
     `listExamplesByKind(kind)`, `getExample(artifact, exampleId)`.

4. **Apps consume via registry accessors only (L6).**
   - Playground's artifact picker reads from the registry; no hand-typed
     component lists.
   - Docs embeds examples via the registry-backed `DocsDataSource`.
   - No app imports `*.examples.tsx` directly; the `./examples` subpath is the
     only entry point, and `check:examples` enforces it is not reachable from
     the main barrel (zero bundle impact on main-barrel imports).

5. **Coverage rollout.**
   - Examples for all 112 public components (inferred controls plus overrides
     only where inference is wrong), then layouts, motion, flows, token
     inspectors.
   - Parallelize by component category (8 allowed `@category` values), one
     agent per category at a time.
   - `check:examples` enforces 100%: a component without an example, a dangling
     export/prop, or an examples file reachable from a main barrel fails.

## Consequences

- **Positive:** One model serves Playground, Docs embeds, and consumer docs.
  Generated code view. Shareable permalinks. 100% coverage enforceable.
- **Negative:** TS compiler-based inference adds build-time complexity.
  Unsupported prop types are omitted (mitigation: overrides exist). Major
  version bump for sandbox (3.0 → 4.0) and components (examples subpath
  becomes load-bearing).

## Alternatives

| Alternative | Rejected |
|---|---|
| Hand-author 112 control panels | Reintroduces the duplication ADR-001 eliminates. |
| Store examples as strings (not functions) | Loses type safety and refactor safety. |
| Free-form JSX editing only (no controls) | No tier-1 inference; forces code for every tweak. |
| Use Storybook's CSF | Requires full Storybook infra + bundler plugins in every consumer. |

## Implementation order (M3)

1. ADR-009 Accepted (this document).
2. Register `component` kind in sandbox/core; `Stage` honors `controls`.
3. Registry: fill flat `examples` + per-component `examples`; add accessors.
4. Update `scan.mjs` comment (already done in M1) and populate `examples`.
5. PoC: button, dialog, data-table render in Stage with controls (scratch test).
6. Coverage rollout by category (8 agents, one per @category).
7. Measure bundle impact of `./examples` subpath on main-barrel import (must be zero); record.