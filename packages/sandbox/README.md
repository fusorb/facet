# @fusorb/facet-sandbox

Framework-agnostic artifact model and lab kit for facet playgrounds/docs surfaces.

- **Core model (`@fusorb/facet-sandbox` / `/core`)** — zero-dependency types and helpers: `Artifact`, `Example`, `ViewportSpec`, control schema/types, artifact-kind registry (`registerArtifactKind`, `getArtifactKind`, `listArtifactKinds`), control inference, code/state helpers (`inferControls`, `toCode`, `encodeState`, `decodeState`).
- **React lab kit (`@fusorb/facet-sandbox/react`)** — composable presentation components: `Stage`, `ArtifactRenderer`, `Inspector`, `Catalog`, `CodeView` (schema-driven, host-styled via injectable control renderers).
- **Live runtime (`@fusorb/facet-sandbox/live`)** — no-`eval` live JSX/runtime utilities and URL sanitization used by facet’s live preview surfaces.

## Install

```bash
pnpm add @fusorb/facet-sandbox
```

`react` is an optional peer dependency (required for `@fusorb/facet-sandbox/react`).

## Usage (React lab kit)

```tsx
import { Stage } from "@fusorb/facet-sandbox/react";
import type { Artifact, Example } from "@fusorb/facet-sandbox";

const artifact: Artifact = {
  id: "button",
  kind: "component",
  title: "Button",
  package: "@fusorb/facet-components",
  examples: ["default"],
};

const example: Example = {
  id: "default",
  artifact: "button",
  title: "Default",
  defaults: { label: "Save" },
  render: (values) => <button>{String(values.label ?? "Save")}</button>,
};

<Stage artifact={artifact} example={example} />;
```

## Subpath exports

| Import | Description |
|--------|-------------|
| `@fusorb/facet-sandbox` | Main barrel re-exporting `/core` (artifact model, registry, helpers). |
| `@fusorb/facet-sandbox/core` | Framework-agnostic core types/functions only. |
| `@fusorb/facet-sandbox/react` | React lab kit (`Stage`, `ArtifactRenderer`, `Inspector`, `Catalog`, `CodeView` and related types). |
| `@fusorb/facet-sandbox/live` | Live JSX/runtime and sanitization utilities (no `eval`). |

## Notes

- The core is framework-agnostic; the React lab kit is a React binding over the artifact/example model. Non-React runtimes can build adapters around the same core contract.
- Consumer styling is host-owned; the lab kit ships minimal structure and supports injected control renderers.

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.
