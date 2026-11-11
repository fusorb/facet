---
"@fusorb/facet-sdk": major
---

Forward `deviceId` in `approveDeviceApproval`

`approveDeviceApproval` posted only `{ signature }` to
`POST /identity/device-approvals/:challenge/approve`, but the route requires
`{ deviceId, signature }` — so the method could never succeed. It now takes and
forwards `deviceId` too.

Shipped as a **major** under ADR-008 §5: the parameter type changes
non-additively, so existing callers no longer typecheck.

Migration:

- `approveDeviceApproval({ challenge, signature })`
  → `approveDeviceApproval({ challenge, deviceId, signature })`

The server verifies the signature against the `publicKey` that the named paired
device registered at pairing time, and requires that device to be the caller's
own, unrevoked and trusted — a bare `deviceId` is not sufficient.
