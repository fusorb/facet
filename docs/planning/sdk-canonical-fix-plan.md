# Facet SDK — Canonical Fix Plan

> Companion to the SovGrant system-perfection plan. Tracks gaps between
> `@fusorb/facet-sdk` and its consumers (sovgrant, sovport, sg-cli). Lives in
> the facet repo so SDK work is owned where the code is.

## 1. Current state

- Package: `@fusorb/facet-sdk` v2.0.0 (facet `packages/sdk`).
- 10 domain classes: AuthSdk, TenantSdk, VcSdk, IdentitySdk, OAuthSdk, WebhooksSdk,
  PasskeySdk, IdpSdk, BillingSdk, AuditSdk.
- 62 SovGrant routes covered (gate `audit-sdk-coverage.cjs` passes).
- Tests: only `auth.sdk.test.ts` + `client.test.ts` (sovgrant has `sdk.test.ts`
  covering singleton wiring + TenantSdk.create/acceptInvite).

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

## 3. Acceptance criteria

- Each domain SDK class has at least one smoke test in facet.
- `TenantSdk.create()` tested in facet.
- `audit-sdk-coverage.cjs` updated to include api-key + wallet-did routes (or
  documented exclusion).
- Published version verified against sovgrant/sovport pins.
- `setClientCredentials` documented with example.
- `bare` option documented.

## 4. Owners

- G1, G2: facet maintainers (SDK tests).
- G3: release owner (changeset).
- G4: sovgrant + facet (route + SDK sync).
- G5, G6, G7: docs + SDK maintainers.

## 5. Tracking

Referenced from facet CLAUDE.md and AGENTS.md. Update this doc as gaps close.