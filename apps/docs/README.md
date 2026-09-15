# @fusorb/facet-docs-site

facet's own docs site: a **thin consumer** of the `@fusorb/facet-docs`
package. It proves the install-and-configure model works exactly as an
external consumer (SovGrant, Relnex, SovPort) would use it, with no forking
and no copied source. Everything renders from the config + pages passed to
`<DocsApp>`.

Run locally with `pnpm dev:docs-site` (port 5173).

## What it is

- **`src/demo-config.tsx`**: the `DocsSiteConfig` (brand "facet", ecosystem
  link to SovGrant) and the pages registry (facet's canonical pages).
- **`src/pages.ts`**: facet's own authored guide pages: the documentation
  _content_. This lives in the consumer, not in the `@fusorb/facet-docs`
  package, so installing the package never ships facet's docs.
- **`src/app.tsx`**: mounts `<DocsApp config={demoConfig} pages={demoPages} />`.

The `/components` gallery renders the extended manifest, so the auth and
layout surfaces (SignIn, SignUp, MfaDialog, Guard, ConsoleLayout,
AuthLayout, LandingLayout, Sidebar, Topbar) are previewable alongside the
UI components: each with live previews, variant galleries, and per-variant
usage tabs.

## Consume it like an external consumer

```tsx
import { DocsApp } from "@fusorb/facet-docs";
import type { DocsPage, DocsSiteConfig } from "@fusorb/facet-docs";

const config: DocsSiteConfig = { brand: { name: "my-app" }, navigation: [] };
const pages: DocsPage[] = [
  { path: "/", title: "Overview", section: "guides", blocks: [...] },
];

export function App() {
  return <DocsApp config={config} pages={pages} />;
}
```

## Scripts

- `pnpm dev`: Vite dev server (port 5173)
- `pnpm build`: production build to `dist/`
- `pnpm typecheck`: TypeScript check

This app is private and never published. The publishable artifact is
`@fusorb/facet-docs` under `packages/`.
