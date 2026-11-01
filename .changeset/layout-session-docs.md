---
"@fusorb/facet-layout": patch
---

Correct JSDoc/changelog wording: layout shells no longer auto-detect an
`SgProvider` ancestor (removed in 1.6.0); consumers inject `session` explicitly
via `useAuthSession()` from `@fusorb/facet-auth`. Clarifies the migration note
per ADR-008 (behaviour breaks are majors; this documents the existing break).