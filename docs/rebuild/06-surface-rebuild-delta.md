# 06 — Surface Rebuild Delta (Current-State Plan)

**Status:** Proposed (draft for alignment)  
**Date:** 2026-11-14  
**Baseline:** `main@0e80368` (clean, `pnpm check:all` green, pushed; playground deployed)  
**Companions (still authoritative where not superseded):** [`SURFACE-SPEC.md`](./SURFACE-SPEC.md), [`01-product-model.md`](./01-product-model.md), [`04-design-lock.md`](./04-design-lock.md), [`05-progress.md`](./05-progress.md)

> This is an **addendum/delta** to the 2026-10-07 surface spec, not a replacement. It reconciles the spec with the repo's current state and locks the near-term rebuild direction: **Playground is the live component showcase; Docs and Landing are rebuilt from scratch around it** while retaining necessary features.

---

## 1. Why this delta exists

The spec's direction (one registry, one example model, thin app consumers; playground proves, docs teaches, landing tells the story) remains correct, but assumptions have drifted:

| Area | Spec-era assumption | Current state (verified 2026-11-14) |
|---|---|---|
| Playground | Planned lab rebuild (M5) | **Shipped & deployed.** `apps/playground/src/App.tsx` is a registry-driven lab over `@fusorb/facet-registry` + `@fusorb/facet-components/examples` + `@fusorb/facet-sandbox` (`/core`,`/react`,`/live`): catalog, per-example preview, schema-driven inspector/controls, preview+code tabs, viewport presets, reduced-motion, copy-permalink (URL state), mobile sheets, surfaces-config links. Structural refinements remain. |
| Docs (`apps/docs`) | Content-compiled, registry/gallery-driven reference consumer | **Hybrid/legacy-heavy.** Thin `DocsApp` consumer with `facetDataSource` (`registry.json` + examples) for the component gallery, but content is a monolithic `pages.ts` (~1883 lines, typed blocks) + `changelog.ts` (~2791 lines). Gallery wiring exists; component sidebar/nav is minimal (“All components”). |
| Landing (`apps/landing`) | Minimal, factual, registry-driven, section-registry | **Section-composed legacy page.** Routes `/` + `/feedback`; `HomePage` stacks many hand-crafted sections (Hero, Install, DemoShowcase, Features, AuthShowcase, MotionPreview, Faq, TokensExplorer, Architecture, CTA) with hand-authored data files (`scratchpad.ts`, `features.ts`, `ecosystem.ts`, `faq.ts`) + generated `site-data.generated.ts`. |
| Surfaces | `facet.so` era references in older text | **`surfaces.config.mjs` is source of truth** → planned `fusorb.com` subdomains (`facet.`, `docs.facet.`, `playground.facet.`). |
| Facts | Spec-era counts | **112 components**, 14 packages (1 private), `@fusorb/facet-sdk@4.1.0`, `store@1.1.0`, 1093 passing tests / 92 files (last recorded `check:all`). |
| Cross-repo | Earlier session notes assumed states | **Partially unverified.** Recheck confirms `../sovgrant` is on `@fusorb/facet-sdk@4.1.0`; other sibling claims (local api-keys adapter presence, SovPort device-approval ownership, Relnex usage) need a focused re-audit before being treated as facts. |

---

## 2. Locked role split (what lives where)

**Principle:** one live implementation of component previewing; docs and landing *reference* it. Apps compose; capability stays in packages/registry.

| Surface | Primary job | Owns (retained/necessary) | Delegates / does not own |
|---|---|---|---|
| **Playground** (`playground.facet.fusorb.com`) | **Live component showcase & lab** — “what it does / try it” | Registry-driven catalog, per-component examples, real renders, prop/variant controls (schema/inferred), preview + code, viewport presets, reduced-motion, theme, shareable permalinks (URL state), error boundaries, docs↔playground links. Near-term: structural refinements, a11y, example coverage/quality, optional embed mode. | Authored narrative, long-form guides, marketing copy. |
| **Docs** (`docs.facet.fusorb.com`) | **Learn & integrate** — “how to understand and use it” | Guides (intro/mental model/install/theming/tokens/motion/a11y), package & API/reference, architecture/contracts, migration/changelog, search + nav + TOC + keyboard nav, page actions, install/usage snippets. **Component reference pages = explanation + API/props + usage + “Open in Playground” (and optional embed) per slug/example.** | Bespoke live prop-play/duplicate gallery UI, hand-maintained component catalogs, marketing sections. |
| **Landing** (`facet.fusorb.com`) | **Explain & route** — “why Facet, what it is, where to go” | Value prop, accurate product/package overview, domain/preset framing, ecosystem & surfaces links, trust/feedback, primary CTAs to docs + playground. Factual counts/links sourced from registry/facts + `surfaces.config`. Fast, accessible, minimal routes. | Full docs/guides, full interactive catalog, hand-typed stats, bespoke demos not backed by registry/examples. |

**Cross-surface contract:** `surfaces.config.mjs` owns origins/routes/links; deep-links/permalinks are generated (`/<component-slug>?example=…&props=…&viewport=…`), never hand-written per app.

---

## 3. Current-state audit → keep / reshape / drop

### 3.1 Playground — **keep & refine** (not a rebuild)
- **Keep:** registry + example-map data flow, stage/inspector/catalog/toolbar/mobile-sheets decomposition, sandbox runtime (`/live`), permalink state, viewport presets, surfaces-config nav, theme/reduced-motion.
- **Refine (incremental):** embed-friendly mode (chrome-less/query-flag) for docs/landing, deep-link contract hardening, a11y/keyboard polish, example/controls coverage gaps, perf/structure cleanup. *Do after docs/landing contracts are defined so refinements are targeted.*

### 3.2 Docs (`apps/docs`) — **rebuild from scratch** (app), reusing engine + data
- **Retain (migrate, audited):** necessary guide/reference content and concepts currently embedded in `pages.ts`/`changelog.ts` (installation, theming/tokens, auth/layout/sdk/store/motion/CLI usage, package docs, verified facts); `facetDataSource`/registry-backed component & example access; surfaces-config links; search/nav/TOC/keyboard affordances provided by `@fusorb/facet-docs`.
- **Drop/rework:** monolithic `pages.ts` block-authoring as the long-term source; duplicated showcase UI; stale/duplicated claims; dead/unwired manifest-era remnants. Replace with a clean, maintainable content structure (source-of-truth decided in Stage 0) rendered through `DocsApp`/engine.
- **New contract:** every component reference page is *generated/templated from registry + component metadata/examples* plus short authored guidance, and prominently links/embeds the Playground for live preview (slug/example preselected) instead of reimplementing prop-play.

### 3.3 Landing (`apps/landing`) — **rebuild from scratch**
- **Retain (migrate):** core value-prop messaging that is still accurate, domain/preset positioning (fintech/med/edu/enterprise/default) once verified against registry/presets, ecosystem/surface links, feedback route, brand/assets worth keeping.
- **Drop/rework:** current stacked bespoke sections and their hand-maintained data (`features.ts`, `scratchpad.ts`, `ecosystem.ts`, `faq.ts`, section components) where they duplicate docs/playground, encode stale counts, or aren’t registry/facts-driven. Recompose from a small, purposeful section set with factual/derived content and (where useful) a curated Playground embed/deeplink or registry-backed example — not custom demos.

---

## 4. Target IA & routes (proposed)

### 4.1 Playground
- `/` (or `/#/<slug>[/<example>]?…`) — lab shell. State in URL (slug, example, props, viewport, reduced-motion). Optional `?embed=1` hides chrome for inline use.
- Outbound: “View docs” per component → docs component/reference page; “GitHub”, “Docs”.

### 4.2 Docs (rebuilt)
- `/` — docs home/overview + quickstart.
- `/guides/*` — **Learn/Build**: getting started, installation, theming/tokens, accessibility, auth, layout, motion, store/sdk, CLI/emails (only what’s current).
- `/components` — gallery/index (registry-driven).
- `/components/:slug` — **Reference** per component: description, install/import, props/API, variants/usage notes, examples list, **Open in Playground** (and optional embedded preview).
- `/packages/*` (or equivalent) — package/reference docs.
- `/changelog` (or generated/referenced) — if retained, sourced/generated, not a hand-maintained mega-file.
- `/feedback` or link-out (optional) — align with landing.
- 404. *Exact slugs/sections finalized in Stage 0 content map; preserve/redirect any live URLs that matter.*

### 4.3 Landing (rebuilt)
- `/` — single narrative page: hero/value prop → what/why (model) → what you can build (curated, truthful) → ecosystem/packages (facts/registry-driven) → get started / CTAs (docs, playground, GitHub/npm) → feedback/trust.
- `/feedback` — retained.
- 404. No orphan routes unless justified.

---

## 5. Source-of-truth & data contracts

| Concern | Source of truth | Notes |
|---|---|---|
| Components, packages, facts/counts, presets, tokens/motion metadata | `@fusorb/facet-registry` (`registry.json` / accessors) & package manifests | No hand-typed counts in prose/UI. |
| Live examples/previews & renderable demos | `@fusorb/facet-components/examples` + `@fusorb/facet-sandbox` | Single showcase path; consumed by playground and referenced/embedded by docs/landing. |
| Cross-app URLs/routes | `surfaces.config.mjs` | Dev/prod, links, embed origins. |
| Authored guides/reference prose | Rebuilt docs content source (structure chosen Stage 0; prefer per-topic files over monoliths) | Audited/migrated from current `pages.ts`/`changelog.ts` where accurate. |
| Design tokens, shells, UI primitives | `@fusorb/facet-tokens`, `@fusorb/facet-components`, `@fusorb/facet-layout` | Per `04-design-lock.md` and component rules. |
| Landing copy & section composition | New `apps/landing` content/config, fed by registry/facts | Purposeful, minimal, factual. |

---

## 6. Staged execution plan (recommended)

**Approach:** staged & verified (baseline stays green; playground refined in parallel but not a blocker). Treat stages as checkpoints with build/typecheck/tests and relevant `check:*` gates.

### Stage 0 — Align & specify (no UI rebuild yet)
- **Freeze contracts:** docs component-page template (generated vs authored fields), playground deep-link/embed API, landing section list & claims.
- **Content/route map:** inventory current `apps/docs/pages.ts` + changelog into keep/merge/drop; define new docs IA/routes and content source format/location; define landing sections + data sources.
- **Cross-repo re-audit (factual):** SovGrant (actual facet deps, api-keys/`ApiKeySdk`/adapter state), SovPort (device-approval flow ownership), Relnex (facet package usage) → recorded report, not assumptions. (Partially started: SovGrant confirmed on `facet-sdk@4.1.0`.)
- **Output:** agreed plan (this doc updated/accepted) + content map; optional ADR/update if contracts change.

### Stage 1 — Playground embed/readiness (small, targeted)
- Harden permalink/deep-link params and add lightweight embed mode (e.g. hide nav/chrome via query/prop) so docs/landing can consume it.
- Verify example coverage/controls for components that will be featured; fix gaps that block docs/landing.
- Keep deployed playground working throughout.

### Stage 2 — Rebuild `apps/docs` from scratch
- Scaffold a clean docs app shell consuming `@fusorb/facet-docs` + `facetDataSource`/registry (no monolithic `pages.ts`).
- Implement content structure + migrated/rewritten guides; generated/templated component & package reference pages with **Playground open/embed**.
- Wire search/nav/TOC/keyboard, surfaces links, changelog strategy, redirects for important legacy paths.
- Remove/retire superseded legacy docs-app content once parity on retained features is confirmed.

### Stage 3 — Rebuild `apps/landing` from scratch
- Scaffold a clean landing with minimal routes (`/`, `/feedback`) and a purposeful section composition.
- Drive all facts/counts/links from registry + `surfaces.config`; replace bespoke/duplicative demos with curated playground embeds/deeplinks or registry-backed examples.
- Verify messaging accuracy (packages, presets, capabilities) against current repo.

### Stage 4 — Cutover, hardening & refinement
- Cross-surface link/permalink audit, SEO/meta/accessibility/perf passes, responsive checks (per `04-design-lock.md` budgets).
- Prune dead code/data/assets left from old apps; update docs/README/trackers; ensure gates stay green.
- Resume **playground refinements** (structure, UX polish, richer controls/examples) on the now-stable contracts.

---

## 7. Risks & decisions to confirm

- **Content format/location (docs):** keep typed blocks, adopt per-page MD/MDX/content files, or a hybrid — choose for maintainability and engine fit (Stage 0). Avoid reintroducing a 2k-line monolith.
- **Embed vs link:** default to “Open in Playground” deep-links; add inline embeds only where they add clear value and don’t regress perf/a11y.
- **Changelog:** `apps/docs/src/data/changelog.ts` is very large — decide generate vs curate vs split; don’t hand-maintain divergent histories.
- **Registry/facts coverage:** landing/docs must fail-safe if a fact/example is missing (no stale hardcodes).
- **Redirects/SEO:** preserve or redirect any externally used docs URLs during rebuild.
- **Cross-repo actions:** treat as follow-ups only after the focused re-audit report (don’t assume adapter/ownership state).

## 8. Immediate next actions (recommended)

1. **Accept/adjust this delta** (roles, IA, staging) — resolve Stage 0 open choices (content format, embed policy, changelog handling).
2. **Run the focused cross-repo re-audit** and produce a factual report (sovgrant/sovport/relnex) to replace unverified claims.
3. **Draft the Stage 0 artifacts:** docs content/route map + component-page template + landing section spec; then start Stage 1 (playground embed/deeplink hardening).
4. Keep `pnpm check:all` green per stage and record progress in `docs/rebuild/05-progress.md` / `.agent` trackers when work begins.
