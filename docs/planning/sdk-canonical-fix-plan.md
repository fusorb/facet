# Facet SDK — Canonical Fix Plan

> Companion to the SovGrant system-perfection plan. Tracks gaps between
> `@fusorb/facet-sdk` and its consumers (sovgrant, sovport, sg-cli). Lives in
> the facet repo so SDK work is owned where the code is.

**Status (2026-11-14, reconciled):** Historical gap tracker, kept **active** for follow-up work.
`@fusorb/facet-sdk` is **v4.1.0** on `origin/main` (shipped: G8/G9/G11–G14/`ApiKeySdk`). This doc was
previously stale (3.0.0/3.0.1-framed); the sections below now separate **shipped/fixed** items from
**still-open** work. Re-validate any consumer cleanup against the actual consumer code + backend
routes before deleting adapters/workarounds.

## 1. Current state (as of 4.1.0)

- Package: `@fusorb/facet-sdk` **v4.1.0** (`packages/sdk/package.json`), changelog confirms 4.1.0 added
  `ApiKeySdk` (`list`/`create`/`revoke`, plaintext key returned once) and 4.0.0 aligned/fixed the
  external-id, tenant-policy, and delegation contracts (G11–G14). 3.0.0 carried G8/G9 fixes.
- 11 domain classes exported: `AuthSdk`, `TenantSdk`, `VcSdk`, `IdentitySdk`, `OAuthSdk`,
  `WebhooksSdk`, `PasskeySdk`, `IdpSdk`, `BillingSdk`, `AuditSdk`, `ApiKeySdk` (see `src/index.ts`).
- `SgClient`/`setClientCredentials`/`bare` request option exist in `src/client.ts`. Device-approval
  flow is fully exposed in `IdentitySdk` (`create/poll/approve/rejectDeviceApproval`); `approveDeviceApproval`
  sends `{ deviceId, signature }`.
- Tests: `*.sdk.test.ts` per domain class plus `client.test.ts`. **G10 remains open:** many mutating
  methods still assert URL/method but not request bodies.

## 2. Shipped / fixed (historical record)

### G8 — `approveDeviceApproval` `deviceId` (FIXED, shipped 3.0.0)
`approveDeviceApproval` now requires `{ challenge, deviceId, signature }` and posts `{ deviceId, signature }`.

### G9 — Contract drift vs SovGrant route schemas (FIXED across 3.0.0/4.0.0)
`linkExternalId` payload `{ type, value, displayValue? }`, `ExternalId`/`Device`/`TenantPolicy` shapes,
and external-id verify/confirm/policy nullability were corrected through 3.0.0/4.0.0. Verify against
current SovGrant schemas before consumer-side adapter removal.

### G11/G12 — external-id verify/confirm contracts (FIXED, shipped 4.0.0)
`confirmExternalId(id, { code })` posts `{ code }` and returns `{ id, verified }`.
`verifyExternalId(id)` returns `{ success, type }`.

### G13 — `getPolicy` nullability (FIXED, shipped 4.0.0)
`getPolicy(tenantId)` returns `TenantPolicy | null`.

### G14 — Delegation methods (RESOLVED, shipped 4.0.0)
Delegation APIs/types removed (endpoints were 501 by design; no enforceable grant path).

### G4 — API key routes (SHIPPED 4.1.0)
`ApiKeySdk` (`GET /api-keys`, `POST /api-keys/create`, `DELETE /api-keys/:id`) and types
`ApiKey`/`CreateApiKeyParams`/`CreatedApiKey` are exported. Wallet DID remains exposed via
`IdentitySdk.registerWalletDid` (`/identity/wallet/did`). Re-validate route coverage/gate fixtures
against the live SovGrant ROUTES index when the sibling checkout is available.

### G5 — Naming finalization (DONE)
`SgClient` / `SgProvider` are canonical. Spot-check consumers for legacy names only if touching them.

## 3. Still open / follow-up

### G1 — Method-level test coverage (medium, ongoing)
Domain SDK coverage is broader than the 2026-11-11 snapshot but still uneven. Prioritize smoke tests
for primary CRUD/lifecycle methods where missing.

### G2 — `TenantSdk.create()` / invite coverage (medium)
Ensure `TenantSdk.create()` and invite accept paths are exercised in facet SDK tests.

### G3 — Version alignment with consumers (operational)
`sovport`/`relnex` pin 4.1.0; `sovgrant` was on 4.0.1 in the 2026-11-14 audit. Treat consumer bumps as
consumer-repo work and validate contract parity before removing local adapters.

### G6 — Third-party client credentials docs (medium)
`SgClient.setClientCredentials` exists; add/refresh usage examples (CLI `--oauth-client`, external
integrators) in SDK docs if still missing or thin.

### G7 — Error handling / `bare` contract docs (medium)
`ApiResponse<T>` and `bare: true` are implemented; ensure docs clearly state when to use `bare`
(protocol/public endpoints like `/oauth/token`, JWKS, userinfo, credential verify flows).

### G10 — Request-body assertions in SDK tests (open, important)
`*.sdk.test.ts` still under-assert request bodies for mutating methods. Add body assertions so payload
contract drift is caught by CI (this was the root gap behind G8/G9-class bugs).

## 4. Consumer cleanup checklist (verify-first, do in consumer repos)

- **SovGrant:** validate `modules/api-key/*` parity, then replace local `apiKeys` adapter with
  `ApiKeySdk`; confirm any claimed externalIds/devices/policies adapters are actually gone before
  cleanup. Run relevant typecheck/tests.
- **SovPort:** verify `device-identity`/approval flows for raw-fetch workarounds before removal; note
  `approveDeviceApproval` requires `deviceId` (4.0.0+/4.1.0 contract) and polling is available via
  `IdentitySdk.pollDeviceApproval`. Requester/poll ownership belongs to the app/harness that creates the
  challenge, not the approver UI by default.
- **Relnex:** no immediate SDK-contract migration expected from 4.1.0; watch `facet-auth/components/layout/store/tokens` for UI/behavior drift on bumps.

## 5. Acceptance criteria (remaining)

- Mutating SDK methods have request-body assertions (G10).
- G1/G2 coverage gaps closed or explicitly tracked with scope.
- G6/G7 documented with accurate 4.1.0 examples (`bare`, `setClientCredentials`, `ApiKeySdk` usage where relevant).
- Route-coverage gate/fixtures kept in sync when SovGrant routes change.
- Consumer adapter/workaround removals done only after parity verification in each consumer repo.