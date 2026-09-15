import { Link } from "react-router-dom";
import { extendedManifest } from "../lib/manifest.js";
import { ComponentPreview } from "../components/previews.js";
import { ThemePreviewFrame } from "../components/ThemePreviewFrame.js";
import { CodeBlock } from "../components/CodeBlock.js";
import { usageCode } from "../lib/usage.js";
import { PageNav } from "../components/Guide.js";
import { useDocsKeyboardNav, useDocsNavigation } from "../lib/keyboard-nav.js";

/**
 * Dedicated "Pages" section: full-page components (FeedbackPage, Footer,
 * ...) that you can drop into a route and customize via props. Unlike the
 * base primitives or the Ready-to-Use composites, these replace an entire
 * app page (feedback/contact, site footer, ...) and carry a config-driven
 * API so you can reuse them across products without re-implementing.
 *
 * New page components added to the library land here automatically.
 */
export function PagesPage() {
  const entries = extendedManifest.filter(
    (entry) => entry.category === "pages",
  );

  const { prev, next } = useDocsNavigation();
  useDocsKeyboardNav();

  return (
    <article>
      <p className="mb-2 text-sm text-muted-foreground">
        <Link
          to="/components"
          className="inline-flex items-center gap-1.5 hover:text-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 4L6 8L10 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Components
        </Link>{" "}
        / Pages
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground">Pages</h1>
      <p className="mt-2 text-muted-foreground">
        Full-page components you can mount at a route and customize through
        props: feedback/contact pages, site footers, and more to come. Each page
        ships with a live preview, a copyable usage snippet, and a config-driven
        API for reusing it across products.
      </p>

      <div className="mt-8 space-y-8">
        {entries.map((entry) => (
          <section
            key={entry.slug}
            id={entry.slug}
            className="overflow-visible rounded-lg border border-border"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {entry.name}
                </h2>
                {entry.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                )}
              </div>
              <Link
                to={`/components/${entry.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                All variants →
              </Link>
            </div>

            <ThemePreviewFrame>
              <div className="w-full py-2">
                <ComponentPreview slug={entry.slug} />
              </div>
            </ThemePreviewFrame>

            <div className="border-t border-border p-4">
              <CodeBlock code={usageCode(entry.slug)} title="Usage" />
            </div>
          </section>
        ))}
      </div>

      <PageNav
        prev={prev ? { label: prev.label, to: prev.path } : undefined}
        next={next ? { label: next.label, to: next.path } : undefined}
      />
    </article>
  );
}
