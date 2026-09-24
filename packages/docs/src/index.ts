/**
 * @fusorb/facet-docs
 *
 * Installable, config-driven documentation site engine.
 *
 * Mount <DocsApp config={...} pages={...} /> with your own brand, nav,
 * content pages, and ecosystem links. Ships the component gallery
 * (paginated index + per-component variant pages with per-variant usage
 * tabs), install tabs, and a searchable sidebar shell, all driven by
 * the config you pass.
 */

// Mountable app
export { DocsApp } from "./docs-app.js";
export type { DocsAppProps } from "./docs-app.js";

// Config + context
export {
  DocsAppProvider,
  useDocsApp,
  PackageManagerProvider,
  usePackageManager,
} from "./context.js";
export type { DocsAppValue } from "./context.js";

// Page registry
export type { DocsPage, DocsBlock, DocsLink } from "./lib/pages.js";
export { slugify } from "./lib/pages.js";

// Nav config
export type { DocsSiteConfig } from "./lib/nav.js";
export { buildDocsLayoutConfig } from "./lib/nav.js";
export type { NavItem, NavSection } from "./lib/nav.js";

// Gallery manifest (components + auth + layout)
export { extendedManifest, extendedEntries } from "./lib/manifest.js";
export type { DocsManifestEntry } from "./lib/manifest.js";

// Reusable docs components
export {
  GuidePage,
  H2,
  H3,
  P,
  Pre,
  Ul,
  Li,
  Code,
  PageNav,
  InlineText,
} from "./components/Guide.js";
export type { GuidePageProps } from "./components/Guide.js";
export { DocsTable } from "./components/DocsTable.js";
export type { DocsTableProps } from "./components/DocsTable.js";
export { PageActionBar } from "./components/PageActionBar.js";
export type { PageActionItem } from "./components/PageActionBar.js";
export { CodeBlock } from "./components/CodeBlock.js";
export type { CodeBlockProps } from "./components/CodeBlock.js";
export { InstallTabs } from "./components/InstallTabs.js";
export type { InstallCommand } from "./components/InstallTabs.js";
export { InteractiveDemo } from "./components/InteractiveDemo.js";
export type { InteractiveDemoProps } from "./components/InteractiveDemo.js";
export { ThemePreviewFrame } from "./components/ThemePreviewFrame.js";
export type { ThemePreviewFrameProps } from "./components/ThemePreviewFrame.js";

// Live playground (editable default-usage code → live preview)
export { LiveCodePlayground } from "./components/LiveCodePlayground.js";
export type { LiveCodePlaygroundProps } from "./components/LiveCodePlayground.js";
export { PlaygroundPage } from "./components/PlaygroundPage.js";
export type { PlaygroundPageProps } from "./components/PlaygroundPage.js";

// Content engine
export { DocsContentPage } from "./pages/DocsContentPage.js";
export { DocsTableOfContents } from "./components/DocsTableOfContents.js";
export type { DocsTableOfContentsProps } from "./components/DocsTableOfContents.js";
export { slug } from "./lib/ids.js";

// Component manifest (auto-generated)
export { docsManifest } from "./manifest.js";
