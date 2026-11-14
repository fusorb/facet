# @fusorb/facet-docs

Installable, config-driven documentation site **engine** for the facet
ecosystem. Mount `<DocsApp config={...} pages={...} />` with your own
brand, nav, content pages, and ecosystem links, with no forking or copied
source.

The package ships the engine only: the shell, routing/content primitives,
and a component-gallery surface. It does **not** ship facet's own authored
guide pages or component manifest/previews; those live in the consuming app
(e.g. `apps/docs`), which provides them via `pages` and `dataSource`.

Ships: a searchable sidebar shell, content-page rendering, and
`/components` + `/components/:slug` routes that render from a
`DocsDataSource` when one is supplied (no data source → no gallery items).

## Install

```bash
pnpm add @fusorb/facet-docs react react-dom react-router-dom
```

## Usage

```tsx
import { DocsApp } from "@fusorb/facet-docs";
import type { DocsPage, DocsSiteConfig } from "@fusorb/facet-docs";

const config: DocsSiteConfig = {
  brand: { name: "my-app", tagline: "My product docs" },
  navigation: [], // optional extra sections
  ecosystem: [{ label: "SovGrant", href: "/SovGrant" }], // optional
};

const pages: DocsPage[] = [
  {
    path: "/",
    title: "Overview",
    section: "guides", // "guides" | "foundations" | "ecosystem"
    description: "Welcome.",
    blocks: [
      { type: "p", text: "Hello." },
      { type: "h2", text: "Quick start" },
      {
        type: "code",
        lang: "tsx",
        text: 'import { Button } from "@fusorb/facet-components";',
      },
      { type: "install", pkg: "@fusorb/facet-components" },
      { type: "ul", items: ["One", "Two"] },
    ],
  },
];

export function App() {
  return <DocsApp config={config} pages={pages} />;
}
```

## Content blocks

| Block               | Shape                                     | Renders                                                                                                |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `p`                 | `{ text }`                                | paragraph                                                                                              |
| `h2`                | `{ text }`                                | section heading                                                                                        |
| `code`              | `{ text, lang? }`                         | code block with copy button                                                                            |
| `install`           | `{ pkg, extras? }`                        | pnpm / npm / yarn / bun tabs                                                                           |
| `ul`                | `{ items }`                               | bullet list                                                                                            |
| `link`              | `{ label, href }`                         | internal link                                                                                          |
| `authDemo`          | `{}`                                      | live `<SignIn>`: config checkboxes drive a method switcher, a live preview, and the synced config code |
| `authPreviews`      | `{}`                                      | live previews of SignUp, MfaDialog, Guard, and forms                                                   |
| `layoutPreviews`    | `{}`                                      | live previews of ConsoleLayout, AuthLayout, Sidebar/Topbar, LandingLayout                              |
| `demo`              | `{ slug, title?, description?, labels? }` | reusable interactive demo for any manifest slug: variant switcher + live preview + copyable code       |
| `keyboardShortcuts` | `{}`                                      | Kbd-chip keyboard shortcuts table                                                                      |

## Sidebar

The sidebar's Guides / Foundations / Ecosystem sections derive from the
pages you pass (by their `section` field), so pages and navigation stay in
lockstep: add a page to your registry and it appears in the sidebar and in
the search palette automatically.

## Component gallery

Pass `showComponents` (default `true`) and a `dataSource` to mount the
`/components` gallery. The gallery is data-driven (ADR-003): the consuming
app supplies component entries, previews, and examples via `DocsDataSource`
(e.g. from `@fusorb/facet-registry` plus component examples). The engine
itself stays facet-agnostic and only renders what the data source provides.

The demo consumer at `apps/docs` shows a registry-backed implementation.

## Icons

The engine renders through `@fusorb/facet-components`' semantic icon
registry, so consumers can override icons per domain via `IconProvider`
without forking the docs engine.

## Ecosystem links

Set `config.ecosystem` to add a final "Ecosystem" sidebar section linking
to your other products' docs (e.g. SovGrant, Relnex, SovPort).

## Development

```bash
pnpm build      # tsup -> dist
pnpm typecheck
```

The demo consumer lives at `apps/docs` (`@fusorb/facet-docs-site`) as a
thin in-repo consumer of this engine, proving the API surface end to end.
Its `src/pages.ts` holds facet's own authored guide pages: the package
itself ships only the engine and block types, not that content.
