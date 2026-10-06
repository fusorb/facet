---
"@fusorb/facet-components": patch
"@fusorb/facet-emails": patch
---

Lint cleanup (no behavior change):

- `@fusorb/facet-components`: `AlertDialogProps` is now a type alias, and
  `OtpInput` uses `const` for its locals.
- `@fusorb/facet-emails`: `EmailDivider`'s props type is `Record<string, never>`.

Tooling: `eslint.config.mjs` now ignores the gitignored `scratchpad/` and
`.agent/` directories and allows `require()` in `.cjs` scripts, so `pnpm lint`
is green (0 errors). Lint is now wired into the CI `ci` job and `check:all`.
