# @fusorb/facet-docs

Installable, config-driven documentation site **engine** for the facet
ecosystem. Mount `<DocsApp config={...} pages={...} />` with your own
brand, nav, content pages, and ecosystem links, with no forking or copied
source.

The package ships the engine only: the shell, the component gallery, and
the content block types. It does **not** ship facet's own authored guide
pages; those live in the demo consumer (`apps/docs`). You write your own
`pages` array for your product.

Ships: a searchable sidebar shell (VS Code-style collapsible rail), a
paginated component gallery with per-component variant pages, per-variant
usage tabs, install tabs for every package manager, and an optional
ecosystem links section. The gallery separates the base UI components from
the "Ready to Use" extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap,
Form), which get their own sidebar section with live previews and copyable
usage snippets.

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

Pass `showComponents` (default `true`) to mount the `/components` gallery.
It renders from the extended manifest, which covers the UI components in
`@fusorb/facet-components` plus the auth (`@fusorb/facet-auth`) and layout
(`@fusorb/facet-layout`) surfaces, so SignIn, SignUp, MfaDialog, Guard,
ConsoleLayout, AuthLayout, LandingLayout, Sidebar, and Topbar all get a
gallery page with a live preview, a full variant gallery, and per-variant
usage tabs with copy buttons. Each variant tab shows the live preview and
its matching code side-by-side on desktop.

The "Ready to Use" extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap,
Form) live in a dedicated `/ready-to-use` sidebar section with live
previews and copyable usage snippets, separate from the base gallery.

Foundational entries (Icon, Theme) are excluded from the Components
sidebar; they have their own guide pages under the Foundations section.

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

The demo consumer lives at `apps/docs` (`@fusorb/facet-docs-site`);
it installs this package via `workspace:*` exactly like an external
consumer would, proving the API surface end to end. Its `src/pages.ts`
holds facet's own authored guide pages: the package itself ships only
the engine and block types, not that content.
