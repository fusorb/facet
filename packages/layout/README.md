# @fusorb/facet-layout

Domain-configurable app shell — five pre-built layout shells (ConsoleLayout,
AuthLayout, LandingLayout, AppLayout, DocsLayout) with a preset registry,
sidebar, topbar, tenant switcher, and command palette.

## Install

```bash
pnpm add @fusorb/facet-layout
```

## Usage

### ConsoleLayout (dashboard apps)

```tsx
import { ConsoleLayout, type LayoutConfig } from "@fusorb/facet-layout";

<ConsoleLayout
  config={{
    brand: { name: "facet", tagline: "Components" },
    navigation: {
      navSections: [{ title: "Motion", items: [{ ... }] }],
    },
    features: { themeToggle: true },
  }}
  mode="sidebar"
>
  <YourContent />
</ConsoleLayout>
```

### LandingLayout (marketing pages)

```tsx
import { LandingLayout } from "@fusorb/facet-layout";

<LandingLayout nav={<NavBar />} hero={<Hero />} footer={<Footer />}>
  <YourSections />
</LandingLayout>
```

### AuthLayout (auth flows)

```tsx
import { AuthLayout } from "@fusorb/facet-layout";

<AuthLayout>
  <SignIn />
</AuthLayout>
```

### DocsLayout (documentation sites)

```tsx
import { DocsLayout } from "@fusorb/facet-layout";

<DocsLayout
  config={{
    nav: siteNav,
    sidebar: docsSidebar,
    version: "3.0.0",
  }}
>
  <DocsPage />
</DocsLayout>
```

## Layout presets

Five domain-configurable presets (fintech, med, edu, enterprise, default)
configure shell chrome — sidebar rail, topbar height, accent color, density,
and navigation style. Apply via:

```ts
import { defaultLayoutPreset, fintechLayoutPreset } from "@fusorb/facet-layout";

<ConsoleLayout config={fintechLayoutPreset}>
  <App />
</ConsoleLayout>
```

Or register a custom preset:

```ts
import { registerLayoutPreset } from "@fusorb/facet-layout";

registerLayoutPreset("myPreset", { ... });
```

## API

| Export | Type | Description |
|--------|------|-------------|
| `LayoutProvider` | component | Provides layout context (config, resolved paths, scroll anchor). |
| `useLayout` | hook | Read the current layout context. |
| `ConsoleLayout` | component | Full console/dashboard shell (sidebar + topbar). |
| `LandingLayout` | component | Marketing page shell (hero + nav + footer). |
| `AuthLayout` | component | Auth flow shell (centered card + footer). |
| `AppLayout` | component | Alias for AuthLayout (shared auth surface). |
| `DocsLayout` | component | Documentation site shell (sidebar + topbar + page gutter). |
| `PageHeader` | component | Re-usable page header (title, crumbs, actions). |
| `Sidebar` | component | Collapsible sidebar with nav + brand. |
| `Topbar` | component | Top navigation bar (user menu, tenant switcher, theme toggle). |
| `UserMenu` | component | User avatar + profile dropdown. |
| `TenantSwitcher` | component | Multi-tenant selector. |
| `CommandPalette` | component | ⌘K-style universal search / navigation. |
| `createDefaultAdapter` | function | Create a router adapter (default: hash-based, supports React Router). |
| `LayoutConfig` | type | Shell configuration interface. |
| `defaultLayoutPreset` | `LayoutConfig` | Default shell config. |
| `fintechLayoutPreset` | `LayoutConfig` | Fintech shell config. |
| `medLayoutPreset` | `LayoutConfig` | Healthcare shell config. |
| `eduLayoutPreset` | `LayoutConfig` | Education shell config. |
| `enterpriseLayoutPreset` | `LayoutConfig` | Enterprise shell config. |

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.
