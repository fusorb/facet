# ArcID ↔ Facet Cross-Repo Audit — Findings (Verified)

**Date:** 2026-09-13
**Scope:** arc-id (`../arc-id`) vs facet (`.`). All claims verified against actual
source files and git history in both repos as of this date.

> arc-id consumes facet packages under the `@arcevo/facet-*` scope locally. The
> user will personally migrate all consumers to `@fusorb/facet-*` after publishing
> to npm — this is expected and normal. Version numbers below refer to what
> arc-id's `package.json` actually pins.

---

## §0. What's Solid (Verified Against Source)

| Area | Status | Evidence |
|------|--------|----------|
| OAuth 2.0 / OIDC provider | ✅ 100% | authorize, token exchange/refresh/revoke/introspect, JWKS, mandatory PKCE |
| JTI blocklist (Redis + DB fallback) | ✅ 100% | `jti-blocklist.*` (14 tests, 3 files) |
| SSRF defense | ✅ 100% | `url-safety` (7 tests), applied on webhooks + IdP metadata URLs |
| Webhook delivery engine | ✅ 100% | Postgres queue, FOR UPDATE SKIP LOCKED, retry/backoff, dead-letter |
| SD-JWT Verifiable Credentials | ✅ 100% | issue/verify/revoke, BitstringStatusList, did:web + did:key |
| Audit logging | ✅ 100% | 51 action enum values, 51 call sites verified |
| Session kill-chain | ✅ 100% | session → refresh tokens → access tokens (DELETE /sessions/:id) |
| Per-session access token revocation | ✅ 100% | AccessToken.sessionId column + migration + Redis blockJti |
| Facet migration (Phases 0–8 + Phase E) | ✅ 100% | All facet packages genuinely wired in source (verified by reading files, not docs) |
| API key management backend | ✅ 100% | v0.2.0 — `src/modules/api-key/` (13 files: plugin, 4 flows+tests, routes, services, repos, validators) |
| Test suite | ✅ All green | 62 test files / 358 tests, 0 code failures |

---

## §1. Token Storage — RESOLVED → PARTIALLY HARDENED

**Was:** arc-id persisted the full session (user + accessToken + refreshToken)
to localStorage via `persistSession(session)`. facet's `defaultStorage` also
wrote both tokens to localStorage with no warning.

**Verified NOW (2026-09-13):**
- **facet-side:** `defaultStorage` (in `packages/auth/src/storage.ts`)
  ALREADY has the fix — a JSDoc security warning (lines 7–16) documenting the
  XSS risk, and a `warnDefaultStorage()` dev-time `console.warn` that fires
  when no explicit `storage` prop is provided (lines 33–44, called in
  `provider.tsx:79–90`). **No action needed on the facet side.**
- **arc-id-side:** The refresh-token cookie migration (commit `ab4e3a7`)
  was WIRING, not deletion. arc-id's `persistSession(user)` now stores ONLY
  the `{ user }` object to localStorage under `"arcid-session"` — NOT tokens.
  The refresh token is read from an **httpOnly cookie** by the
  `onTokenRefresh` callback in `src/sdk/index.ts:78–81` ("The refresh token
  lives in an httpOnly cookie (set by the backend). Pass an empty string —
  the /oauth/token endpoint reads from the cookie when the body value is empty.").
  The access token is in-memory only (Zustand auth store).
  `src/lib/refresh-cookies.ts` was added as part of this migration.
- **auth-provider.tsx** comment explicitly states: "Tokens are NO LONGER
  persisted to localStorage — the refresh token lives in an httpOnly cookie."

**Status:** ✅ Functionally correct — no tokens in localStorage. ⚠️
`persistSession`/`clearPersSession` still exist but are repurposed (only
persist user identity, not tokens). The `.agent` recommendation to "delete
them entirely" was not followed — they were narrowed in scope instead. Dead
code cleanup: optional low-priority.

---

## §2. Version Drift — RESOLVED

**Was:** arc-id pinned `@fusorb/facet-cli ^0.8.0` and `@fusorb/facet-store ^0.1.0`
(behind facet's stabilized 1.0.0+ releases).

**Verified NOW (2026-09-13):** RESOLVED. arc-id `package.json` now pins:

| Package | arc-id pin | facet local | Published to npm |
|---------|-----------|-------------|-----------------|
| `@arcevo/facet-auth` | `1.2.3` | 1.11.0 | ✅ 2 |
| `@arcevo/facet-cli` | `^2.0.0` | 1.0.0 | ✅ |
| `@arcevo/facet-components` | `1.11.0` | 1.11.0 | ✅ 2 |
| `@arcevo/facet-docs` | `1.4.7` | 1.4.7 | ✅ |
| `@arcevo/facet-emails` | `^1.1.1` | 1.1.1 | ✅ |
| `@arcevo/facet-layout` | `1.4.2` | 1.4.2 | ✅ |
| `@arcevo/facet-sdk` | `1.2.0` | 1.2.0 | ✅ |
| `@arcevo/facet-store` | `^2.0.0` | 1.0.0 | ✅ |
| `@arcevo/facet-tokens` | `1.1.4` | 1.1.4 | ✅ |

Commit `ab4e3a7` ("feat: wire latest facet packages") did the full bump.
The old `.agent` claim of `^0.8.0`/`^0.1.0` is stale.

---

## §3. Tailwind @source — CORRECTLY CONFIGURED

**Was:** `.agent` findings doc recommended setting `@source` to
`./node_modules/@fusorb/facet-components/src/**/*.{ts,tsx}` — which would
have been WRONG for Tailwind v4.

**Verified NOW:** arc-id `src/styles/globals.css:18–21` correctly uses
`@source "../../node_modules/@arcevo/facet-components/dist"` etc. —
pointing at the `dist/` directories (the published build output), which is
the CORRECT approach for Tailwind v4. The file even includes an
explanatory comment block (lines 13–17) documenting why each `@source`
line is needed (v4 doesn't scan node_modules by default).

**Remaining gap:** Each consumer must manually add `@source` lines for
every facet package they use. A `facet doctor` / `check:tailwind` command
would auto-verify these — still a valid P3 recommendation (see §5).

---

## §4. Phantom Feature: API Keys — RESOLVED (BUILT)

**Was:** API keys nav entry existed but backend returned 501/stub data.

**Verified NOW:** Full v0.2.0 API key management backend built.
Commit `76cc1a1` ("feat(api-key): add API key management backend")
created `src/modules/api-key/` with 13 files:
plugin, 4 flows (create/list/revoke) + tests, routes, services + tests,
repositories, presenters, validators. SHA-256 hashed bearer tokens, auth
guard extension, migration + Tier 1 rollback tests. Confirmed in
arc-id CLAUDE.md line 328. **No action needed.**

---

## §5. Doc Drift — STALE (arc-id side)

**Was:** arc-id CLAUDE.md claimed "indigo primary override."

**Verified NOW:**
- arc-id CLAUDE.md line 229 says "arc-id keeps its indigo primary via override"
  — STALE. `globals.css:28` imports `@arcevo/facet-tokens/tailwind.css` and
  does NOT override the primary color. facet-tokens resolves to **Electric
  Cyan**, not indigo. The `glow-indigo` utility class (still in facet-tokens)
  is a naming leftover from the Alpha Palette rebrand — cosmetic only.
- arc-id CLAUDE.md version pins (sdk 1.1.0, auth 1.2.2, components 1.10.0,
  layout 1.4.1, store ^0.1.0, cli ^0.8.0) are STALE vs
  package.json (sdk 1.2.0, auth 1.2.3, components 1.11.0, layout 1.4.2,
  store ^2.0.0, cli ^2.0.0).
- arc-id AGENTS.md line 102 still says "store ^0.1.0, cli ^0.8.0" — STALE.

**Action:** Update arc-id CLAUDE.md + AGENTS.md version pins and the
"indigo override" claim.

---

## §6. React Native / ArcWallet — STILL DEFERRED

**Status:** Open. No change since prior review.

- facet-store and facet-sdk are framework-agnostic (pure Zustand + fetch) —
  work today in React Native.
- facet-tokens ships CSS custom properties — do NOT work in React Native
  (no CSSOM). The Alpha Palette color constants (`packages/tokens/src/`)
  ARE plain TS and could be packaged as an RN theme object, but no
  `@fusorb/facet-native` package exists yet.
- facet-components, facet-auth, facet-layout are Radix + DOM + Tailwind —
  do NOT render in React Native.
- When ArcWallet UI work starts, a scoping decision is needed (NativeWind
  port vs. full facet-native package). **Before ArcWallet UI starts.**

---

## §7. Secondary Items (Still Open)

| Item | Status | Detail |
|------|--------|--------|
| `glow-indigo` class rename | ⚠️ Open | facet-tokens still ships `.glow-indigo` (resolves to Electric Cyan at runtime, name is misleading only) |
| CSS build pipeline | ⚠️ Open | facet-tokens still uses `fs.cpSync` to copy tokens.css (no PostCSS/autoprefixer/minify) |
| turbo.json validation | ⚠️ Open | exists but scripts still call `pnpm -r` directly (no caching benefit) |
| Component a11y audit | ⚠️ Open | SignIn state machine + MfaDialog phases need keyboard/SR testing before third-party use |
| `pnpm lint` hang | ⚠️ Env | hangs on this machine (environment issue, not repo bug) |
| Email palette (3rd brand) | ℹ️ Noted | arc-id's transactional emails use black/white (MAIL_COLOR.primary = "#000000") — intentional email-specific choice, not a bug |
| 3-palette situation | ℹ️ Noted | web = Electric Cyan (facet-tokens), docs-claim = "indigo" (stale), email = black. Needs explicit documentation. |

---

## §8. Prioritized Action List

| Priority | Action | Scope |
|----------|--------|-------|
| P2 | Update arc-id CLAUDE.md + AGENTS.md version pins to match package.json | arc-id |
| P2 | Fix stale "indigo primary override" claim in arc-id CLAUDE.md | arc-id |
| P2 | Delete repurposed `persistSession`/`clearPersistedSession` (now no-ops for tokens) | arc-id |
| P3 | `facet doctor` / `check:tailwind` CLI to auto-verify @source lines | facet |
| P3 | Rename `glow-indigo` → `glow-primary` in facet-tokens | facet |
| P3 | Ship real CSS build pipeline (PostCSS + minify) for facet-tokens | facet |
| P3 | Wire turbo.json pipeline scripts for caching | facet |
| P4 | Decide React Native strategy before ArcWallet UI starts | both |
| P4 | Component a11y audit (SignIn, MfaDialog) before third-party consumption | facet |

---

*Compiled from: arc-id git log, package.json, CLAUDE.md, AGENTS.md, source files
(src/sdk/index.ts, src/providers/auth-provider.tsx, src/providers/facet-auth-bridge.ts,
src/hooks/use-auth.ts, src/hooks/use-tenant.ts, src/styles/globals.css,
src/modules/api-key/), and facet source (packages/auth/src/storage.ts, provider.tsx).*
