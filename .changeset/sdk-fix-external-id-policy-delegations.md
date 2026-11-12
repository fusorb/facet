---
"@fusorb/facet-sdk": major
---

Align external-id, tenant policy, and delegation contracts with SovGrant 3.0.0 routes.

- `confirmExternalId` now sends `{ code }` (was `{ verification }`), accepts `{ code: string }`, and returns `{ id: string; verified: boolean }` (was `ExternalId`), matching the route body/handler and response.
- `verifyExternalId` now returns `{ success: boolean; type: string }` (was `{ verification: string }`), matching the route response.
- `getPolicy` now returns `TenantPolicy | null` (was `TenantPolicy`), matching routes that return `data: null` when no policy is set.
- Removed delegation APIs and types (`listDelegations`, `createDelegation`, `revokeDelegation`, `Delegation`) because the corresponding SovGrant endpoints are 501 by design and cannot succeed.

**Release note:** these signature/type changes are published as a major under ADR-008 even though the affected external-id/policy shapes did not work correctly against the real SovGrant 3.0.0 API, to make the contract break explicit and safe for consumers upgrading. Remove any local adapters/workarounds for the fixed external-id and policy methods after upgrading to this release.
