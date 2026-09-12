# arc-id Integration Summary — facet repo (`.agent/` workspace)

> NOTE: The `arc-id` repo is not present locally (`/workspace/arc-id` does not exist).
> This file lives in facet's `.agent/` directory and is intended to be synced into
> the arc-id repo's `.agent/` directory once it is available locally.  All
> cross-repo references (lines marked **[ARC-ID]**) require changes in the
> arc-id codebase.

Created during facet v2 session — 2026-08-23
Source findings: `.agent/facet_arcid_findings_and_recommendations.txt`

---

## 1. Security Gap — Refresh Tokens in localStorage (P0)

### What we found  (verified in facet)

**`packages/auth/src/storage.ts`** — `defaultStorage` writes both access and
refresh tokens to **`localStorage`** under keys `arcid_access_token` and
`arcid_refresh_token`:

```ts
// storage.ts (current)
const ACCESS_KEY  = "arcid_access_token";
const REFRESH_KEY = "arcid_refresh_token";
local: {
  getItem:  (key) => window.localStorage.getItem(key),
  setItem:  (key, val) => window.localStorage.setItem(key, val),
  removeItem: (key) => window.localStorage.removeItem(key),
},
```

**`packages/auth/src/provider.tsx`** — `ArcProvider` silently defaults to
`defaultStorage` when no `storage` prop is supplied (line 74):

```ts
storage = defaultStorage,
```

**Impact**: `localStorage` is readable by any JavaScript running in the
document context. An XSS in the consumer app → full session hijack including
long-lived refresh tokens.

### What we can fix from the facet side

1. **`provider.tsx`** — Add a **dev-time `console.warn`** when `storage` is
   not explicitly provided (i.e. when `defaultStorage` is used).  Non-breaking,
   only fires in development.

2. **`storage.ts`** — Add a **prominent JSDoc security warning** on
   `defaultStorage` and `TokenStorage` type, documenting that `localStorage`
   is XSS-vulnerable and pointing to the recommended cookie / in-memory
   alternatives.

3. **`packages/store/src/token-storage.ts`** — Add an optional **`persist`**
   adapter argument to `createZustandTokenStorage` so consumers can plug in a
   cookie-backed persistence strategy instead of in-memory state.

### What must be fixed in arc-id  **[ARC-ID]**

1. **Move the refresh token to an `httpOnly` / `Secure` / `SameSite=Strict`
   cookie**.  The arc-id backend should stop returning the refresh token in
   the JSON body and instead set it as a cookie.  The SDK would then read it
   from `document.cookie` (in browser) or send it automatically (httpOnly).

2. **Delete `persistSession` / `clearPersistedSession`** in the arc-id
   frontend client — these functions write the refresh token to
   `localStorage`.  Once the cookie approach is in place, these should be
   removed entirely.

---

## 2. Version Drift — arc-id Pins Outdated facet Packages

### What we found

| facet package      | Version | arc-id pin (per findings) | Status       |
|--------------------|---------|--------------------------|--------------|
| `@fusorb/facet-cli`   | 1.0.0   | `^0.8.0`                 | OUTDATED     |
| `@fusorb/facet-store` | 1.0.0   | `^0.1.0`                 | OUTDATED     |

Both facet-cli and facet-store were **stabilized to 1.0.0** in commit
`43ccd14` ("chore: stabilize store + cli at 1.0.0").  arc-id's pins are
from pre-1.0 versions and miss stabilisation, bug fixes, and the token-bridge
API.

### What we can fix from the facet side

Nothing — the versions are correct and published.  The pin bump lives in
arc-id's `package.json`.

### What must be fixed in arc-id  **[ARC-ID]**

Bump both pins to `^1.0.0` (or latest) and re-run the SDK coverage audit
(`scripts/audit-sdk-coverage.cjs` in facet) to confirm 62/62 endpoints still
match.

---

## 3. Tailwind `@source` Gotcha — arc-id Frontend (MEDIUM)

### What we found

arc-id's Tailwind config sets `@source` to `@fusorb/facet-components`,
but that path resolves to the **package root** (`dist/` or `src/`), not
the `src/` files.  Tailwind's static analysis can't extract class names from
compiled output, so some utility classes are purged at build time.

### What we can fix from the facet side

Nothing — the config lives in arc-id.

### What must be fixed in arc-id  **[ARC-ID]**

Update `tailwind.config` `@source` to point at the actual source files:
```
@source "./node_modules/@fusorb/facet-components/src/**/*.{ts,tsx}"
```

---

## 4. React Native / ArcWallet Structural Gap (MEDIUM)

### What we found

arc-id has a mobile web shell but no native mobile client.  The facet ecosystem
is designed to support this:
- `@fusorb/facet-sdk` — pure fetch, works in React Native
- `@fusorb/facet-store` — Zustand, logic has zero React; React hooks are optional
- `@fusorb/facet-tokens` — pure CSS variables, framework-agnostic
- `@fusorb/facet-components` — React-only; copy via `facet copy` for non-React

### What we can fix from the facet side

Nothing — this is an arc-id product decision.  However, facet is ready: the
SDK + store can be consumed directly in React Native, and the component
library can be copied via `facet copy <component>`.

### What must be fixed in arc-id  **[ARC-ID]**

Evaluate the RN strategy from the roadmap (`/arc-id` Phase 2):
- **Option A** (expo-plugin): Wrap arc-id's auth flow in an Expo plugin
- **Option B** (arc-id SDK): Ship a `@fusorb/arc-id-react-native` package
  that delegates to the SDK + store
- **Option C** (deep link shim): Mobile web → native app deep link

---

## 5. Doc Drift — Stale Claims (LOW)

### Claims that need re-checking in arc-id docs

1. **"arc-id supports custom domains"** — needs version verification.
   facet-cli v1.0.0 added multi-tenant domain config.

2. **"Tokens are stored in memory only"** — **CONTRADICTED** by the
   localStorage finding in §1.  This claim is false and must be corrected.

3. **"Session TTL is configurable per-identity"** — arc-id's `AuthConfig`
   in facet has a single global `sessionTtl`; per-identity TTL is not
   implemented yet.

---

## 6. Secondary Items (facets repo)

### CSS build pipeline — `packages/tokens/src/tokens.css`

- **`fs.cpSync`** is used in the tokens build script instead of a real
  PostCSS/minify step.  Verified: the build script in
  `packages/tokens/package.json` runs `tsup` then manually copies
  `tokens.css`, `tailwind.css`, and `index.css` via `require('fs').cpSync`.
- **Fix**: Replace with a PostCSS pipeline (or add `--minify` to tsup for
  CSS assets).  This is a facet-side fix.

### turbo.json vs pnpm -r

- `turbo.json` exists but the root `package.json` pipeline scripts
  (`build`, `typecheck`, `analyze`) call `pnpm -r` directly instead of
  `turbo run`.  Verified.
- **Fix**: Route through turbo for caching.  This is a facet-side fix.

### glow-indigo utility class

- Verified in `packages/tokens/src/tokens.css`.  Used across
  `packages/components/src/ui/`.  The findings document flagged this as
  needing a count; the grep timed out, but the class exists.

---

## 7. What's Solid (no action needed)

- **62/62 SDK endpoints audited** against arc-id's Routes index (verified
  in `packages/sdk/`).  `scripts/audit-sdk-coverage.cjs` passes.
- **All facet packages are at 1.0.0+** and published to npm under
  `@fusorb/facet-*` scope.
- **`createZustandTokenStorage`** has a re-entrancy guard on the refresh
  hook — prevents infinite loops when the refresh request itself 401s.
- **facet-docs CI gate** (`check:docs`) verifies barrel ↔ manifest
  (90 components).  Confirmed.
- The current session's UI changes (sidebar accordion, navbar hover
  dropdowns, HeroSection dark-mode Aurora, Footer per-link icons,
  Brand bw logo, auth forms AnimatedButton) are all verified in code.

---

## 8. Action Plan

| # | Priority | Owner     | Task                                                    |
|---|----------|-----------|---------------------------------------------------------|
| 1 | P0       | facet     | Add dev-time warning to `ArcProvider` when `defaultStorage` is used |
| 2 | P0       | facet     | Add JSDoc security warning to `defaultStorage` + `TokenStorage` type |
| 3 | P0       | facet     | Add optional `persist` adapter to `createZustandTokenStorage` |
| 4 | P0       | arc-id    | Move refresh token to httpOnly+Secure+SameSite cookie   |
| 5 | P0       | arc-id    | Delete `persistSession` / `clearPersistedSession`       |
| 6 | P1       | arc-id    | Bump `@fusorb/facet-cli` pin to `^1.0.0`                |
| 7 | P1       | arc-id    | Bump `@fusorb/facet-store` pin to `^1.0.0`              |
| 8 | P1       | arc-id    | Fix Tailwind `@source` to resolve to `src/**/*.tsx`    |
| 9 | P2       | arc-id    | Correct doc claim "Tokens are stored in memory only"    |
| 10| P2       | facet     | Replace `fs.cpSync` CSS copy with PostCSS pipeline       |
| 11| P2       | facet     | Route root pipeline scripts through `turbo run`         |
| 12| P3       | arc-id    | Decide RN strategy (A/B/C) from Phase 2 roadmap         |

---

## 9. My Recommendation

**On the summary-file approach**: I think creating a single arc-id summary file is the right call — it gives both repos a shared source of truth. Since arc-id isn't local, I've created it here in facet's `.agent/` directory. When you sync this into the arc-id repo's `.agent/` dir, it becomes the handoff artifact.

**On the security gap**: The cleanest path is:
1. Fix the facet-side warnings and persist adapter now (non-breaking, helps all consumers).
2. Note the arc-id-side cookie migration in the summary file (done above).
3. When the cookie approach lands in arc-id, facet's `defaultStorage` can be deprecated.
