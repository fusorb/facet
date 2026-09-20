# @fusorb/facet-sandbox

Framework-agnostic live-preview host for facet playgrounds.

- **Block registry** - data-driven, config-first (same `{ type, ...props }`
  shape as `@fusorb/facet-docs` pages). Register/swap UI blocks by kind, no
  forking.
- **Adapter seam** - the host ships no framework code. Each runtime supplies a
  `SandboxAdapter` that turns consumer source into a `PreviewContent`
  (`{ kind: "node", node }` or `{ kind: "html", html, css, js }`).
- **Security** - URL sanitizer ported from the docs live playground (rejects
  `javascript:` / `data:` / `vbscript:` etc.).
- **React adapter** - shipped under `@fusorb/facet-sandbox/react`. Uses the same
  hand-written JSX parser as the docs engine (no `eval`, no `Function`, no
  sandbox escape) and renders via `React.createElement`. Formatting is optional
  (gracefully no-ops when `prettier` is absent).

## Install

```bash
npm i -D @fusorb/facet-sandbox
```

`react` is an optional peer dependency (required by `/react`).

## Usage

```tsx
import { Sandbox } from "@fusorb/facet-sandbox/react";
import * as Facet from "@fusorb/facet-components";

<Sandbox
  config={{
    defaultCode: 'return <Button size="sm">Edit me</Button>;',
    sections: [{ title: "Preview", blocks: ["motion-preset"] }],
  }}
  components={Facet}
/>;
```

## Framework agnosticism (v1)

The host + block model + adapter seam are framework-agnostic. The live-JSX
parser currently ships with the React adapter (it emits `React.createElement`);
non-JSX frameworks can bring their own adapter/translator through the same
`SandboxAdapter` contract. We do **not** host per-framework preview apps -
stack agnosticism is certified via CI snapshots of `facet docs init` /
`facet emails init` across `react-vite` / `next` / `remix` / `plain-js` /
`python` instead.
