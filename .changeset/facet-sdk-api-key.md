---
"@fusorb/facet-sdk": minor
---

Add `ApiKeySdk` — machine-to-machine API key management over SovGrant's
`/api-keys` routes: `list()`, `create()` (returns the plaintext key exactly
once, then never again), and `revoke()`. Also exports the `ApiKey`,
`CreateApiKeyParams`, and `CreatedApiKey` types.
