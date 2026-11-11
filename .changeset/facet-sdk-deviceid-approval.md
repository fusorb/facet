---
"@fusorb/facet-sdk": major
---

Align SDK identity/VC/device-approval contracts with SovGrant route schemas (G8, G9, G10 follow-up)

**Breaking (response/type and payload contract changes):**

- `identity.approveDeviceApproval` now requires and forwards `deviceId` in both params and body: `approveDeviceApproval({ challenge, signature })` -> `approveDeviceApproval({ challenge, deviceId, signature })`, posting `{ deviceId, signature }` to `/identity/device-approvals/:challenge/approve`.
- `identity.registerWalletDid` result type is now `{ did, didDocument, walletId, keyType }` (was void-like), matching the route response.
- `vcs.acceptOffer` result type is now `{ credentialId, credential }` (was void-like), matching the route response, and now sends an explicit `{}` body.
- `identity.linkExternalId` payload now matches the route: `{ type, value, displayValue? }` (was `{ provider, externalId }`), and it returns `ExternalId`.
- `ExternalId` type shape: `{ id, type, displayValue, verified, createdAt }` (was `{ id, provider, externalId, linkedAt? }`).
- `Device` type shape: `{ id, platform, browser, createdAt, lastSeenAt }` (was `{ id, name, platform?, lastUsedAt?, createdAt }`).
- `TenantPolicy` type shape: `{ requireMfa?, requireLegalConsent?, sessionTtlMinutes?, allowedEmailDomains?, maxSessionsPerUser?, allowPasskeys? }` (replaces `passwordRules`/`loginMethods` which the route rejected/stripped).

**Additions (same major):**

- `identity.verifyExternalId(id)` -> `POST /identity/external-ids/:id/verify`
- `identity.confirmExternalId(id, { verification })` -> `POST /identity/external-ids/:id/confirm`

**Tests (G10):**

- Mutating SDK methods now assert request bodies (not just URL/method), so payload contract drift is caught by CI.

**Migration notes:**

- Update device approval calls to pass `deviceId` (the paired/trusted device whose key signs the challenge).
- Update `linkExternalId` callers to send `{ type, value, displayValue? }` (e.g. NIN/BVN/passport) and handle the returned `ExternalId`.
- Replace reads of `ExternalId.provider/externalId/linkedAt` with `type/displayValue/verified/createdAt`.
- Replace reads of `Device.name/lastUsedAt` with `platform/browser/lastSeenAt`.
- Replace `TenantPolicy.passwordRules/loginMethods` updates with the route-supported fields (`requireLegalConsent`, `sessionTtlMinutes`, `allowedEmailDomains`, `maxSessionsPerUser`, `allowPasskeys`).
- Handle typed responses from `registerWalletDid` and `acceptOffer` instead of assuming empty/void data.

Consumers (SovGrant/SovPort) can remove workarounds/adapters for these once 3.0.0 is published. (Typed under ADR-008: non-additive public contract/type changes ship as a major.)
