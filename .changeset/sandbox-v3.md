---
"@fusorb/facet-sandbox": major
---

Sandbox v3: restructured into three subpaths.

- `/core`: framework-agnostic artifact model (types, kind registry, control
  inference, `toCode`, URL-state encode/decode) — zero external dependencies.
- `/react`: React lab kit — `Stage`, `ArtifactRenderer`, `Inspector`
  (injectable control renderers), `Catalog`, `CodeView`.
- `/live`: no-`eval` JSX interpreter (`renderFromCode`), URL sanitizer
  (`isSafeUrl`/`sanitizeUrlProps`), `PlaygroundErrorBoundary`, `PreviewFrame`,
  optional Prettier formatting, and a `LivePlayground` controlled preview host.

Breaking: removed the block registry and adapter seam — `Sandbox`,
`SandboxProvider`, `useSandbox`, `reactAdapter`, `SandboxConfig`,
`registerSandboxBlock`/`get/sandboxBlock`, and the adapter registry. Migrate the
live editor+preview widget to `<LivePlayground code={...} components={...} />`
from `@fusorb/facet-sandbox/live`.
