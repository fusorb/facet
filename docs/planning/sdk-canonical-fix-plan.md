# Facet SDK — Canonical Fix Plan

> Companion to the SovGrant system-perfection plan. Tracks gaps between
> `@fusorb/facet-sdk` and its consumers (sovgrant, sovport, sg-cli). Lives in
> the facet repo so SDK work is owned where the code is.

**Status (2026-11-11, audit-remediation checkpoint):** Plan kept **active** (not archived) — gaps G1–G7 remain relevant and are not superseded. Repo context since last major note: active retired `arc*`/`ArcId*` identifiers removed from source/config (historical records remain in changelogs/episodes/planning/rebuild docs); SDK route coverage gate is deterministic via `scripts/fixtures/sg-routes.json` with live-contract preference when available (`scripts/audit-sdk-coverage.cjs`); published/package versions have advanced beyond the v2.0.0 snapshot below (see root/package manifests). Re-validate G3/G4/G5 against current HEAD and SovGrant contract before execution; treat this file as the live gap tracker for SDK-side follow-up.

**2026-11-11 (SDK contract follow-up, added while reconciling SovGrant):** the
`approveDeviceApproval` `deviceId` gap is fixed on `main` (`7709af1`) and now
carries the changeset that lets it publish (`71b1de6`); the rest of the contract
drift found by diffing `packages/sdk/src` against SovGrant's route schemas is
recorded below as **G8–G10**. One trap worth knowing: `changeset status
--since=<ref>` only counts **committed** changesets, so a changeset written but
left in the working tree still fails the `ci` job.

## 1. Current state

- Package: `@fusorb/facet-sdk` v2.1.1 (facet `packages/sdk`). Unreleased on `main`:
  a **major** for `approveDeviceApproval` (G8), patches for `facet-components` /
  `facet-motion` (comment-only), and the `facet-auth` / `facet-store` follow-ons
  that `updateInternalDependencies` derives from the sdk major.
- 10 domain classes: AuthSdk, TenantSdk, VcSdk, IdentitySdk, OAuthSdk, WebhooksSdk,
  PasskeySdk, IdpSdk, BillingSdk, AuditSdk.
- 62 SovGrant routes covered (gate `audit-sdk-coverage.cjs` passes).
- Tests: one `*.sdk.test.ts` per domain class plus `client.test.ts`. **They assert
  URL and method but not request bodies** — which is how the payload bugs in G8/G9
  passed CI (see G10).

## 2. Gaps

### G1 — Method-level test coverage (high)
Domain SDKs other than Auth have zero direct tests. Add smoke tests for each
class's primary methods (list/get/create/update/delete) using a mocked fetch.

### G2 — TenantSdk.create() coverage (medium, carried from sovgrant P4.3)
sovgrant's sdk.test.ts covers create/acceptInvite, but facet itself has none.
Add to facet's TenantSdk tests.

### G3 — SDK version alignment (low)
sovgrant pins `@fusorb/facet-sdk@2.0.0`; facet package.json declares 2.0.0.
Verify the published npm version matches; bump + changeset if drift.

### G4 — New backend routes (api-key, wallet-did) (medium)
SovGrant's wallet-did registration is exposed via `IdentitySdk.registerWalletDid`
(`/identity/wallet/did`). API-key CRUD is not present in SovGrant's ROUTES index
(62/62 covered) and is not yet exposed in the SDK — tracked as planned work;
documented as "not yet exposed" in the SDK docs page.

### G5 — Naming finalization (low)
`SgClient` (renamed from `ArcIdClient`) and `SgProvider` (from `ArcProvider`)
are now canonical. Verify no consumer still references old names (sovgrant
already migrated; sovport uses new names).

### G6 — Third-party client credentials (medium)
`SgClient.setClientCredentials(clientId, clientSecret)` exists for
confidential clients. Document usage for sg CLI `--oauth-client` mode and
external integrators. Add a usage example to facet docs.

### G7 — Error handling contract (medium)
Document the `ApiResponse<T>` shape and `bare` option for protocol endpoints
(`/oauth/token`, JWKS, userinfo, credential verify). Ensure all consumers use
`bare: true` where required.

### G8 — `approveDeviceApproval` dropped `deviceId` (FIXED on main; unreleased)
The method posted only `{ signature }` to
`POST /identity/device-approvals/:challenge/approve`, but SovGrant's route requires
`{ deviceId, signature }` — so the call could never succeed. Fixed in `7709af1`;
the required major changeset landed in `71b1de6`, without which the `ci` job fails
on `changeset status --since=origin/main` and nothing publishes. SovPort currently
bypasses the SDK for this call (raw `fetch` against the route, with a comment
naming the gap); that workaround can go once this ships.

### G9 — Remaining contract drift vs SovGrant's route schemas (open)
Diffed `packages/sdk/src` against SovGrant's route validators on 2026-11-11. Each
row is a non-additive public type change (ADR-008 §5), so these belong in the
**same major** as G8 rather than a second one:

| SDK | Published shape | SovGrant route expects |
|---|---|---|
| `IdentitySdk.linkExternalId` payload | `{ provider, externalId }` | `{ type, value, displayValue? }` — the route's zod rejects the current body, so **linking a NIN/BVN/passport never worked** |
| `ExternalId` | `{ id, provider, externalId, linkedAt? }` | `{ id, type, displayValue, verified, createdAt }` |
| `Device` | `{ id, name, platform?, lastUsedAt?, createdAt }` | `{ id, platform, browser, createdAt, lastSeenAt }` — `name`/`lastUsedAt` do not exist on the wire |
| `TenantPolicy` | `{ requireMfa?, passwordRules?, loginMethods? }` | `{ requireMfa?, requireLegalConsent?, sessionTtlMinutes?, allowedEmailDomains?, maxSessionsPerUser?, allowPasskeys? }` — zod strips unknown keys, so those updates **silently did nothing** |

Also unexposed: `POST /identity/external-ids/:id/verify` and `/confirm`.
SovGrant carries local adapters (`externalIds` / `devices` / `policies` in its
`src/sdk/index.ts`) as the interim and can delete them once this ships.

### G10 — SDK tests do not assert request bodies (open)
`*.sdk.test.ts` asserts the URL and the HTTP method only. A wrong payload — which
is precisely what G8 and the `linkExternalId` row of G9 are — passes CI. One body
assertion per mutating method would have caught all of them.

## 3. Acceptance criteria

- Each domain SDK class has at least one smoke test in facet.
- `TenantSdk.create()` tested in facet.
- `audit-sdk-coverage.cjs` updated to include api-key + wallet-did routes (or
  documented exclusion).
- Published version verified against sovgrant/sovport pins.
- `setClientCredentials` documented with example.
- `bare` option documented.
- G9: `linkExternalId` / `ExternalId` / `Device` / `TenantPolicy` match SovGrant's
  route schemas, and SovGrant's adapters plus SovPort's raw-fetch workaround are
  removed afterwards.
- G10: every mutating SDK method's test asserts the request body, not just the URL
  and method.

## 4. Owners

- G1, G2: facet maintainers (SDK tests).
- G3: release owner (changeset).
- G4: sovgrant + facet (route + SDK sync).
- G5, G6, G7: docs + SDK maintainers.

## 5. Tracking

Referenced from facet CLAUDE.md and AGENTS.md. Update this doc as gaps close.