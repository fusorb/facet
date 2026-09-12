import * as React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  GuidePage,
  H2,
  P,
  Ul,
  Li,
  PageNav,
} from "../components/Guide.js";
import { DocsTable } from "../components/DocsTable.js";
import { CodeBlock } from "../components/CodeBlock.js";
import { InstallTabs } from "../components/InstallTabs.js";
import { InteractiveDemo } from "../components/InteractiveDemo.js";
import { KeyboardShortcuts } from "../components/KeyboardShortcuts.js";
import { ChangelogList, type ChangelogRelease } from "@fusorb/facet-components";
import type { DocsBlock } from "../lib/pages.js";
import { useDocsApp } from "../context.js";
import { useDocsKeyboardNav, useDocsNavigation } from "../lib/keyboard-nav.js";

// The auth/layout demo blocks pull the heavy facet component graph; they
// are only rendered for specific block types, so they are lazy-loaded to
// keep the eager content-page bundle light.
const AuthDemo = React.lazy(() =>
  import("../components/AuthDemo.js").then((m) => ({ default: m.AuthDemo })),
);
const AuthPreviews = React.lazy(() =>
  import("../components/AuthPreviews.js").then((m) => ({ default: m.AuthPreviews })),
);
const LayoutPreviews = React.lazy(() =>
  import("../components/LayoutPreviews.js").then((m) => ({ default: m.LayoutPreviews })),
);
const PlaygroundPage = React.lazy(() =>
  import("../components/PlaygroundPage.js").then((m) => ({ default: m.PlaygroundPage })),
);

/** Render a single structured content block. */
function Block({ block }: { block: DocsBlock }) {
  switch (block.type) {
    case "h2":
      return <H2>{block.text}</H2>;
    case "p":
      return <P>{block.text}</P>;
    case "code":
      return <CodeBlock code={block.text} />;
    case "install":
      return (
        <InstallTabs
          commands={[{ pkg: block.pkg, extras: block.extras }]}
        />
      );
    case "ul":
      return (
        <Ul>
          {block.items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>
      );
    case "table":
      return <DocsTable headers={block.headers} rows={block.rows} />;
    case "link":
      return (
        <Link to={block.href} className="text-primary underline-offset-4 hover:underline">
          {block.label}
        </Link>
      );
    case "authDemo":
      return (
        <React.Suspense fallback={<p className="text-sm text-muted-foreground">Loading demo...</p>}>
          <AuthDemo />
        </React.Suspense>
      );
    case "demo":
      return (
        <InteractiveDemo
          slug={block.slug}
          title={block.title}
          description={block.description}
          labels={block.labels}
        />
      );
    case "authPreviews":
      return (
        <React.Suspense fallback={<p className="text-sm text-muted-foreground">Loading previews...</p>}>
          <AuthPreviews />
        </React.Suspense>
      );
    case "layoutPreviews":
      return (
        <React.Suspense fallback={<p className="text-sm text-muted-foreground">Loading previews...</p>}>
          <LayoutPreviews />
        </React.Suspense>
      );
    case "keyboardShortcuts":
      return (
        <KeyboardShortcuts
          shortcuts={[
            { label: "Open search / command palette", keys: ["mod", "K"] },
            { label: "Collapse / expand sidebar", keys: ["mod", "B"] },
            { label: "Previous page", keys: ["Alt", "←"] },
            { label: "Next page", keys: ["Alt", "→"] },
            { label: "Previous", keys: ["Alt", "↑"] },
            { label: "Next", keys: ["Alt", "↓"] },
          ]}
        />
      );
  case "changelog":
    return (
      <ChangelogList
        releases={block.releases as ChangelogRelease[]}
        showFilter={block.showFilter ?? true}
      />
    );
  case "playground":
    return (
      <React.Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading playground…</p>}
      >
        <PlaygroundPage defaultSlug={block.defaultSlug} />
      </React.Suspense>
    );
  }
}

/**
 * Content-driven docs page. Renders whatever pages the DocsApp config
 * declares for the current path (consumers pass their own registry and it
 * renders here with zero component edits).
 */
export function DocsContentPage() {
  const { pages } = useDocsApp();
  const { pathname } = useLocation();
  const page = pages.find((p) => p.path === pathname);
  if (!page) return <Navigate to="/" replace />;

  // Unified prev/next across the whole docs site (content pages +
  // components), so Alt+Up/Down works on every page.
  const { prev, next } = useDocsNavigation();
  useDocsKeyboardNav();

  return (
    <GuidePage title={page.title} description={page.description}>
      {page.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
      <PageNav
        prev={prev ? { label: prev.label, to: prev.path } : undefined}
        next={next ? { label: next.label, to: next.path } : undefined}
      />
    </GuidePage>
  );
}
