/**
 * Content-driven docs pages.
 *
 * A page is data: a route, a title, a sidebar section, and a list of
 * content blocks. The sidebar nav (src/lib/nav.tsx) derives its Guides /
 * Foundations / Ecosystem sections from the pages a consumer passes to
 * <DocsApp>, so pages and navigation stay in lockstep: add a page to the
 * registry and it renders via DocsContentPage and appears in the sidebar
 * and search palette with zero component edits.
 *
 * Consumers author their own pages (e.g. SovGrant's "Overview", "Getting
 * Started", "API Reference") and pass them to <DocsApp>; the engine ships
 * the block types here, not any specific content.
 */
export interface DocsLink {
  label: string;
  href: string;
}

export type DocsBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "pre"; text: string }
  | { type: "code"; text: string; lang?: string }
  | { type: "install"; pkg: string; extras?: string[] }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "link"; label: string; href: string }
  | { type: "authDemo" }
  | { type: "authPreviews" }
  | { type: "layoutPreviews" }
  | { type: "keyboardShortcuts" }
  | {
      /** Reusable interactive demo: variant switcher + live preview + copyable code. */
      type: "demo";
      /** Manifest slug, e.g. "console-layout", "form", "sign-in". */
      slug: string;
      /** Optional heading above the demo; defaults to the manifest entry name. */
      title?: string;
      /** Optional one-line description under the title. */
      description?: string;
      /** Optional subset of variant labels to surface as tabs. */
      labels?: string[];
    }
  | {
      /** Release log block - renders the facet-components ChangelogList. */
      type: "changelog";
      /** Releases to render, newest first. Each entry mirrors ChangelogRelease. */
      releases: Array<{
        version: string;
        date: string;
        tag?: string;
        title?: string;
        pre?: boolean;
        changes: Array<{
          kind:
            | "added"
            | "changed"
            | "fixed"
            | "removed"
            | "deprecated"
            | "security";
          text: string;
          href?: string;
          author?: string;
        }>;
      }>;
      /** Show the kind filter row. Default: true. */
      showFilter?: boolean;
      /**
       * Visual layout for the release log.
       * - "list" (default): the standard ChangelogList (kind-filter + version cards)
       * - "date": ChangelogWithDate — releases grouped by year with a date axis (Lovable-style)
       */
      layout?: "list" | "date";
    }
  | {
      /** Centralised live playground: component selector + editable usage code with a live preview. */
      type: "playground";
      /** Manifest slug to pre-select. Defaults to "button". */
      defaultSlug?: string;
    };

export interface DocsPage {
  /** Route path, e.g. "/getting-started". */
  path: string;
  /** Page title (rendered as the h1 and used for prev/next). */
  title: string;
  /**
   * Sidebar section this page belongs to (drives the nav tree). Any
   * string works: "guides", "auth", "ready-to-use", "foundations",
   * "ecosystem", or a custom section id.
   */
  section: string;
  /**
   * Optional parent nav item. When set, this page renders as a nested
   * child under a collapsible parent item named `parent` in the sidebar
   * instead of as a flat section item. E.g. section "auth" + parent
   * "Auth" renders Auth ▸ [Overview, Sign In, ...]. Default: no nesting.
   */
  parent?: string;
  /** Optional one-line description under the title. */
  description?: string;
  /** Structured content blocks rendered in order. */
  blocks: DocsBlock[];
}

/** Convert a page title to a URL-safe slug ("Getting Started" -> "getting-started"). */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
