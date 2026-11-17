# `@fusorb/facet-native` — Real Plan and Intent-Drift Remediation

Date: 2026-11-17
Origin: execution of the approved disposition plan
(`~/.commandcode/plans/facet-native-audit-disposition.md` — “Audit: usefulness of
`@fusorb/facet-native` to SovPort — disposition plan”).
Status: active plan (pending disposition sign-off).

## 1. Shipped state (baseline, verified 2026-11-17)

- `@fusorb/facet-native` **1.2.2** — React Native motion driver bridge for
  `@fusorb/facet-motion`.
- Mechanism: `bindAnimated()` → `facetDriver` (auto-registered via
  `registerDriver()`) → `resolveDriver()` selects the native driver on React Native
  (`cssDriver` unsupported) → `<Motion>` resolves effects through the shared motion
  registry and drives the bound `Animated` module.
- Deps: `@fusorb/facet-tokens` + `@fusorb/facet-motion` only; the `Animated` API is
  consumer-provided via `bindAnimated`.
- Verified gates: `check:boundaries` OK (§21 — native isolated; 14 packages; acyclic;
  M2 boundaries clean); `check:motion-drift` OK (80 barrel symbols; 15 generative + 27
  authored effects); `audit:motion-parity` OK (5 durations + 6 easings in sync).

## 2. Original intent (pre-drift plan)

- Source: `~/.commandcode/plans/facet-native-plan.md`.
- Intended shape: `@fusorb/facet-native` as an **React Native component library**
  porting `@fusorb/facet-components` auth UI to native on **Tamagui** primitives.
- Consumer app: `apps/expo/` (sign-in + MFA).
- Motion integration: registry → Reanimated driver; `useNativeMotion` hook; native
  component drift gate.

## 3. The drift

- Shipped v1.x (1.0.0 → 1.2.2) narrowed the package to the **motion driver bridge**
  only; Stage 1 (native `<Motion>`) shipped, and the Tamagui/auth-component-library
  plan was never built.
- The shipped driver-only scope is coherent and green, but it no longer matches the
  original component-library intent. Both live under the same package name.

## 4. Real plan — reestablish the native motion system without further drift

### Phase 0 — Freeze

- Baseline captured in §1; gates green (verified 2026-11-17).

### Phase 1 — Disposition (decision required)

- **Recommended:** `@fusorb/facet-native` remains the single motion-only native bridge
  package (the shipped spine). The original component-library intent is either revived
  later under a distinct scope, or deliberately dropped.
- No half-state: do not merge component logic into the driver package.

### Phase 2 — Complete the motion bridge (reestablishment work)

1. Finish the original plan's motion-integration work on top of the shipped bridge:
   - token-driven `withTiming`/`withSpring` mapping from `ResolvedMotion` using
     `motionValues`-derived duration/easing (no re-hardcoded tables);
   - `useNativeMotion`-equivalent hook (registry → RN animation).
2. Confirm `<Motion>` RN enter/exit/stagger/spring behaviour against
   `check:motion-drift`.
3. Wire reduced motion (`AccessibilityInfo` → `setReduceMotion(true)`).
4. Keep token parity via `audit:motion-parity`.

### Phase 3 — Component-library path (only if disposition revives intent)

- Rebuild under a distinct native UI scope; keep `@fusorb/facet-native` motion-only.

### Phase 4 — Drop path (only if disposition chooses drop)

- Retire the package; update `check:boundaries`, `check:motion-drift`, docs, changesets.

### Phase 5 — Anti-drift rules

1. One meaning per package: `@fusorb/facet-native` = motion bridge (unless Phase 3
   revives a clearly-named sibling).
2. Native deps ⊆ {`@fusorb/facet-tokens`, `@fusorb/facet-motion`}; `Animated` API
   consumer-provided via `bindAnimated`.
3. Native stays a SovGrant/SovPort leaf; never merged into `motion` src or web build.
4. Single source of truth for tokens (`motionValues`) and driver registry.
5. Every native behaviour ships with a gate (boundaries, motion-drift, parity, tests).

## 5. Verification

- `node scripts/check-boundaries.mjs` → OK (§21).
- `node scripts/audit-motion-parity.mjs` → OK.
- `node packages/motion/scripts/check-motion-drift.mjs` → OK.

## 6. Next steps

1. Confirm Phase 1 disposition (bridge completion vs component revival vs drop).
2. If bridge completion: implement Phase 2, add changeset, re-run verification.
3. Re-run full native + motion package test suites and record in ecosystem status.
