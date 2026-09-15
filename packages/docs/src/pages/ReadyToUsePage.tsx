import { Link } from "react-router-dom";
import { extendedManifest } from "../lib/manifest.js";
import { ComponentPreview } from "../components/previews.js";
import { ThemePreviewFrame } from "../components/ThemePreviewFrame.js";
import { CodeBlock } from "../components/CodeBlock.js";
import { usageCode } from "../lib/usage.js";
import { PageNav } from "../components/Guide.js";
import { useDocsKeyboardNav, useDocsNavigation } from "../lib/keyboard-nav.js";

/**
 * Dedicated "Ready to Use" page: drop-in, higher-order components (Dropzone,
 * ColorPicker, QRCode, Marquee, Roadmap, Form) with a live preview and a
 * copyable usage snippet each. These are intentionally not part of the
 * base /components gallery: they compose the primitives into something
 * you can drop straight into a page.
 */
export function ReadyToUsePage() {
  const entries = extendedManifest.filter(
    (entry) => entry.category === "ready-to-use",
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
        / Ready to Use
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground">
        Ready to Use
      </h1>
      <p className="mt-2 text-muted-foreground">
        Drop-in, higher-order components built on the facet primitives. Each one
        solves a complete job (file upload, color picking, QR codes, timelines)
        with a copyable snippet to drop straight into your app.
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
