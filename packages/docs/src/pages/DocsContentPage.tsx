import * as React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { GuidePage, H2, H3, P, Ul, Li, PageNav } from "../components/Guide.js";
import { PageActionBar } from "../components/PageActionBar.js";
import { slug } from "../lib/ids.js";
import { DocsTable } from "../components/DocsTable.js";
import { CodeBlock } from "../components/CodeBlock.js";

import { InstallTabs } from "../components/InstallTabs.js";
import { InteractiveDemo } from "../components/InteractiveDemo.js";
import { KeyboardShortcuts } from "../components/KeyboardShortcuts.js";
import {
  cn,
  ChangelogFeed,
  toChangelogItem,
} from "@fusorb/facet-components";
import type { DocsBlock } from "../lib/pages.js";
import { useDocsApp } from "../context.js";
import { useDocsKeyboardNav, useDocsNavigation } from "../lib/keyboard-nav.js";

const sectionLabels: Record<string, string> = {
  "getting-started": "Get Started",
  auth: "Auth",
  components: "Components",
  foundations: "Foundations",
  guides: "Guides",
  ecosystem: "Ecosystem",
  "ready-to-use": "Ready to Use",
  pages: "Pages",
  animation: "Animation",
};

function getSectionLabel(section?: string): string | undefined {
  if (!section) return undefined;
  return (
    sectionLabels[section] ??
    section.charAt(0).toUpperCase() + section.slice(1)
  );
}

// The auth/layout demo blocks pull the heavy facet component graph; they
// are only rendered for specific block types, so they are lazy-loaded to
// keep the eager content-page bundle light.
// Facet demo/preview blocks live in the consuming app (apps/docs/src/facet);
// the engine omits them (L3).
const PlaygroundPage = React.lazy(() =>
  import("../components/PlaygroundPage.js").then((m) => ({
    default: m.PlaygroundPage,
  })),
);

/** Render a single structured content block. */
function Block({ block }: { block: DocsBlock }) {
  switch (block.type) {
    case "h2":
      return <H2 id={slug(block.text)}>{block.text}</H2>;
    case "h3":
      return <H3 id={slug(block.text)}>{block.text}</H3>;
    case "p":
      return <P>{block.text}</P>;
    case "pre":
      return (
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground">
          {block.text}
        </pre>
      );
    case "code":
      return <CodeBlock code={block.text} />;
    case "install":
      return (
        <InstallTabs commands={[{ pkg: block.pkg, extras: block.extras }]} />
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
       <Link
         to={block.href}
         className="text-primary underline-offset-4 hover:underline"
       >
         {block.label}
       </Link>
     );
    case "callout": {
     const tone = block.tone ?? "note";
     return (
       <div
         className={cn(
           "rounded-lg border p-4 text-sm",
           tone === "note" && "border-border bg-muted/40",
           tone === "warning" && "border-amber-300 bg-amber-50 text-amber-900",
           tone === "error" && "border-red-300 bg-red-50 text-red-900",
           tone === "success" && "border-green-300 bg-green-50 text-green-900",
         )}
       >
         {block.text}
       </div>
     );
    }
    case "reference":
     return (
       <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
         Reference: {block.kind ?? "item"} {block.id}
         {block.text ? `  - ${block.text}` : ""}
       </div>
     );
    case "image":
      return (
        <figure className="my-8">
          <img
            src={block.src}
            alt={block.alt}
            {...(block.width ? { width: block.width } : {})}
            {...(block.height ? { height: block.height } : {})}
            className={cn(
              "rounded-xl border border-border",
              block.full ? "w-full" : "max-w-full",
            )}
          />
          {block.caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "card": {
      const variant = block.variant ?? "default";
      return (
        <div
          className={cn(
            "rounded-xl p-6",
            variant === "default" &&
              "border border-border bg-muted/30",
            variant === "outline" &&
              "border border-border bg-transparent",
            variant === "ghost" &&
              "border-transparent bg-transparent",
            variant === "elevated" &&
              "border border-border bg-muted/30 shadow-lg",
          )}
        >
          {block.icon && (
            <span className="mb-3 block text-2xl">{block.icon}</span>
          )}
          {block.title && (
            <h3 className="text-lg font-semibold text-foreground">
              {block.title}
            </h3>
          )}
          {block.content && (
            <p className="mt-2 text-sm text-muted-foreground">
              {block.content}
            </p>
          )}
          {block.href && (
            <a
              href={block.href}
              className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Learn more →
            </a>
          )}
        </div>
      );
    }
    case "grid":
      return (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${block.columns ?? 3}, minmax(0, 1fr))`,
          }}
        >
          {block.items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-muted/30 p-5"
            >
              {item.icon && (
                <span className="mb-2 block text-2xl">{item.icon}</span>
              )}
              {item.title && (
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
              )}
              {item.content && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.content}
                </p>
              )}
              {item.href && (
                <a
                  href={item.href}
                  className="mt-2 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>
      );
    case "hero":
      return (
        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {block.title}
          </h2>
          {block.subtitle && (
            <p className="mt-4 text-lg text-muted-foreground">
              {block.subtitle}
            </p>
          )}
          {block.cta && (
            <a
              href={block.cta.href}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {block.cta.label}
            </a>
          )}
        </section>
      );
    case "authDemo":
      return null;
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
      return null;
    case "layoutPreviews":
      return null;
    case "keyboardShortcuts":
      return (
        <KeyboardShortcuts
          shortcuts={[
            { label: "Open search / command palette", keys: ["mod", "K"] },
            { label: "Collapse / expand sidebar", keys: ["mod", "B"] },
            { label: "Previous page", keys: ["Alt", "↑"] },
            { label: "Next page", keys: ["Alt", "↓"] },
          ]}
        />
      );
    case "changelog": {
      const releases = block.releases ?? [];
      const items = releases.map((release, index) =>
        toChangelogItem(release, index),
      );
      return <ChangelogFeed items={items} />;
    }
    case "playground":
      return (
        <React.Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading playground…</p>
          }
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
  const { pages, pageActions } = useDocsApp();
  const { pathname } = useLocation();

  // Unified prev/next across the whole docs site (content pages +
  // components), so Alt+Up/Down works on every page.
  const { prev, next } = useDocsNavigation();
  useDocsKeyboardNav();

  const page = pages.find((p) => p.path === pathname);

  // Per-page code-splitting (ADR-003/005): when a page declares `load`
  // and has no inline blocks, fetch them lazily and cache on the page.
  // Hooks must be called unconditionally (rules-of-hooks), so they run even
  // when `page` is undefined; the early return below handles the 404 case.
  const [loadedBlocks, setLoadedBlocks] = React.useState<DocsBlock[] | null>(
    page && page.blocks && page.blocks.length ? page.blocks : null,
  );
  React.useEffect(() => {
    if (!page) return;
    if (loadedBlocks) return;
    if (!page.load) return;
    let cancelled = false;
    page.load().then((blocks) => {
      if (cancelled) return;
      page.blocks = blocks;
      setLoadedBlocks(blocks);
    });
    return () => {
      cancelled = true;
    };
  }, [page, loadedBlocks]);

  if (!page) return <Navigate to="/" replace />;

  const blocks = loadedBlocks ?? page.blocks ?? [];

  return (
    <GuidePage
      title={page.title}
      description={page.description}
      sectionLabel={getSectionLabel(page.section)}
      pageActions={<PageActionBar actions={pageActions} />}
    >
      <div className="space-y-5">
        {blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
        <PageNav
          prev={prev ? { label: prev.label, to: prev.path } : undefined}
          next={next ? { label: next.label, to: next.path } : undefined}
        />
      </div>
    </GuidePage>
  );
}
