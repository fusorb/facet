import * as React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { GuidePage, H2, H3, P, Ul, Li, PageNav } from "../components/Guide.js";
import { DocsTableOfContents } from "../components/DocsTableOfContents.js";
import { slug } from "../lib/ids.js";
import { DocsTable } from "../components/DocsTable.js";
import { CodeBlock } from "../components/CodeBlock.js";

import { InstallTabs } from "../components/InstallTabs.js";
import { InteractiveDemo } from "../components/InteractiveDemo.js";
import { KeyboardShortcuts } from "../components/KeyboardShortcuts.js";
import {
  cn,
  ChangelogList,
  ChangelogWithDate,
  type ChangelogRelease,
} from "@fusorb/facet-components";
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
  import("../components/AuthPreviews.js").then((m) => ({
    default: m.AuthPreviews,
  })),
);
const LayoutPreviews = React.lazy(() =>
  import("../components/LayoutPreviews.js").then((m) => ({
    default: m.LayoutPreviews,
  })),
);
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
      return (
        <React.Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading demo...</p>
          }
        >
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
        <React.Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading previews...</p>
          }
        >
          <AuthPreviews />
        </React.Suspense>
      );
    case "layoutPreviews":
      return (
        <React.Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading previews...</p>
          }
        >
          <LayoutPreviews />
        </React.Suspense>
      );
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
    case "changelog":
      return block.layout === "date" ? (
        <ChangelogWithDate
          releases={block.releases as ChangelogRelease[]}
          showFilter={block.showFilter ?? true}
        />
      ) : (
        <ChangelogList
          releases={block.releases as ChangelogRelease[]}
          showFilter={block.showFilter ?? true}
        />
      );
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
  const { pages, showTableOfContents } = useDocsApp();
  const { pathname } = useLocation();
  const page = pages.find((p) => p.path === pathname);
  if (!page) return <Navigate to="/" replace />;

  // Unified prev/next across the whole docs site (content pages +
  // components), so Alt+Up/Down works on every page.
  const { prev, next } = useDocsNavigation();
  useDocsKeyboardNav();

  const hasHeadings =
    showTableOfContents &&
    page.blocks.some((b) => b.type === "h2" || b.type === "h3");

  return (
    <GuidePage title={page.title} description={page.description}>
      <div
        className={cn(
          hasHeadings
            ? "grid grid-cols-1 gap-8 xl:grid-cols-[1fr_260px]"
            : "space-y-5",
        )}
      >
        <div className={cn("min-w-0", hasHeadings && "space-y-5")}>
          {page.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
          <PageNav
            prev={prev ? { label: prev.label, to: prev.path } : undefined}
            next={next ? { label: next.label, to: next.path } : undefined}
          />
        </div>
        {hasHeadings && <DocsTableOfContents blocks={page.blocks} />}
      </div>
    </GuidePage>
  );
}
