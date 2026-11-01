# @fusorb/facet-utils

## 0.1.1

### Patch Changes

- 9bc65e6: Switch published inter-package dependencies from `workspace:*` to `workspace:^` so the
  published range keeps the caret and consumers can dedupe across versions (ADR-008, M1).
  Enforced by the new `check:pins` gate.
