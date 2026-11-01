---
"@fusorb/facet-components": patch
"@fusorb/facet-docs": patch
"@fusorb/facet-emails": patch
"@fusorb/facet-motion": patch
"@fusorb/facet-native": patch
"@fusorb/facet-sandbox": patch
"@fusorb/facet-sdk": patch
"@fusorb/facet-store": patch
"@fusorb/facet-tokens": patch
"@fusorb/facet-utils": patch
"@fusorb/facet-cli": patch
---

Switch published inter-package dependencies from `workspace:*` to `workspace:^` so the
published range keeps the caret and consumers can dedupe across versions (ADR-008, M1).
Enforced by the new `check:pins` gate.