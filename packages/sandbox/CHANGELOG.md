# @fusorb/facet-sandbox

## 3.0.0

### Major Changes

- 682045c: Sandbox v3: restructured into three subpaths.

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

## 2.0.0

### Major Changes

- 8891898: Evolve the facet workspace.

  No more 0.1.0 stragglers: motion and native reach their first
  stable 1.0.0, sandbox advances to 2.0.0 alongside its token/UI
  integration. The workspace root, landing app, and playground app
  also evolve to 2.0.0.

  The landing app is rebuilt with a borrowed scratchpad UI - a
  LayerGraph architecture visualization, motion effect gallery,
  token explorer, and four new dedicated route pages
  (/components, /lab/auth, /lab/motion, /lab/tokens).

### Minor Changes

- f4ca95a: ## facet-sandbox - initial release (0.1.0)

  New `@fusorb/facet-sandbox` package: framework-agnostic live-preview host for
  facet playgrounds.

  - **Block registry** - data-driven, config-first (same `{ type, ...props }`
    shape as `@fusorb/facet-docs`). Register/swap UI blocks by kind, no forking.
  - **Adapter seam** - the host ships no framework code. Each runtime supplies a
    `SandboxAdapter` that turns consumer source into a `PreviewContent`
    (`{ kind: "node", node }` or `{ kind: "html", html, css, js }`).
  - **Security** - URL sanitizer ported from the docs live playground (rejects
    `javascript:` / `data:` / `vbscript:` etc.).
  - **React adapter** (`@fusorb/facet-sandbox/react`) - hand-written JSX parser
    (no `eval`, no `Function`, no sandbox escape); renders via
    `React.createElement`. Optional Prettier formatting degrades gracefully.
  - **Components**: `SandboxProvider`, `Sandbox`, `PreviewFrame`,
    `PlaygroundErrorBoundary`
  - 14 tests (URL safety + parser) - all passing
