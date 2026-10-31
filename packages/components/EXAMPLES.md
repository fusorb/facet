# Component Examples Convention

Colocated examples make every component verifiable in the lab without a
hand-maintained gallery. The convention is data-driven: an example is a plain
object, never a bespoke page.

## File convention

- A component `src/ui/<slug>.tsx` may ship a sibling `src/ui/<slug>.examples.tsx`.
- The file exports a single named array: `export const <slug>Examples: Example<P>[]`.
- `Example` comes from `@fusorb/facet-sandbox/core` (the ADR-001 model):
  `id`, `artifact` (must equal the component slug), `title`, `description?`,
  `render(props)`, `defaults?`, `controls?`, `code?`, `tags?`.
- Example files are **not** components: they are excluded from the barrel, the
  docs manifest, the flexibility gate, and the registry component scan.

## Rules

1. **Data, not logic.** `defaults` + `controls` describe the axes; `render`
   maps control values to JSX. No internal state except where the component
   itself requires it (e.g. a Dialog demo wraps `useState` locally).
2. **Every axis is a control.** If a prop changes appearance or behavior, it
   belongs in `controls` with a `group` ("appearance" | "content" | "state" |
   "behavior" | "layout").
3. **`code` is derived.** Provide a `code(props)` function that regenerates the
   JSX snippet from the current control values — never a frozen string.
4. **ids are unique per file**; the registry namespaces them as
   `<slug>/<id>`. `artifact` must equal the component slug (validated by the
   scanner and the `check:examples` gate).
5. **Named exports only**, `.js` import specifiers, kebab-case filenames —
   same conventions as the components themselves.

## Template

```tsx
import type { Example } from "@fusorb/facet-sandbox/core";
import { Foo, type FooProps } from "./foo.js";

export interface FooExampleProps {
  variant?: FooProps["variant"];
  label?: string;
}

export const fooExamples: Example<FooExampleProps>[] = [
  {
    id: "default",
    artifact: "foo",
    title: "Default",
    defaults: { variant: "default", label: "Hello" },
    controls: {
      variant: { label: "Variant", group: "appearance", options: ["default", "ghost"] },
      label: { label: "Label", group: "content" },
    },
    render: (p) => <Foo variant={p.variant}>{p.label}</Foo>,
    code: (p) => `<Foo variant="${p.variant ?? "default"}">${p.label ?? "Hello"}</Foo>`,
    tags: ["primitive"],
  },
];
```

## Consuming

- Published subpath: `import { buttonExamples } from "@fusorb/facet-components/examples"`.
- Registry: `scan.mjs` reads the sibling files and populates each component's
  `examples` array in `registry.json` (id + title).
- Lab: the playground/docs apps render examples through the sandbox
  `Stage`/`ArtifactRenderer` with the control schema derived from `controls`.
