import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@fusorb/facet-components/light";
import { CodeBlock } from "./CodeBlock.js";
import { ThemePreviewFrame } from "./ThemePreviewFrame.js";
import { variantUsage } from "../lib/usage.js";
import { extendedManifest } from "../lib/manifest.js";

// lib/variants.tsx renders every component variant, pulling in the full
// component preview graph (the whole facet-components barrel). It is
// lazy-loaded so importing InteractiveDemo on an eager content page does
// not drag that heavy graph into the initial bundle.
const VariantPreview = React.lazy(() =>
  import("../lib/variants.js").then((m) => ({ default: m.VariantPreview })),
);

export interface InteractiveDemoProps {
  /** Manifest slug, e.g. "console-layout", "form", "sign-in". */
  slug: string;
  /** Optional heading above the demo; defaults to the manifest entry name.
   *  Pass `null` to hide the header entirely (e.g. on a component page
   *  that already renders the name as its h1). */
  title?: string | null;
  /** Optional one-line description under the title. */
  description?: string;
  /** Optional subset of variant labels to surface as tabs. */
  labels?: string[];
  /**
   * Desktop layout: "side-by-side" renders the preview and the code block
   * in one flex row on lg screens (stacked below lg); "stacked" always
   * renders them vertically.
   */
  layout?: "side-by-side" | "stacked";
}

/**
 * Reusable interactive demo block: a variant/method switcher drives a live
 * preview and a copyable code snippet that always matches the selected
 * variant. Used on the guide pages (auth, layout, forms) so every surface
 * is previewable with copyable code, not just the component gallery.
 *
 * Preview comes from lib/variants.tsx (variantCells) and the code from
 * lib/usage.ts (variantUsage): the two stay in lockstep per slug.
 */
export function InteractiveDemo(props: InteractiveDemoProps) {
  return <InteractiveDemoBody {...props} />;
}

function InteractiveDemoBody({
  slug,
  title,
  description,
  labels,
  layout = "side-by-side",
}: InteractiveDemoProps) {
  const entry = extendedManifest.find((e) => e.slug === slug);
  const tabs = variantUsage(slug);
  const [active, setActive] = React.useState(tabs[0]?.label ?? "Default");

  // When the slug changes (Alt+Arrow navigation), reset to the first tab.
  React.useEffect(() => {
    setActive(variantUsage(slug)[0]?.label ?? "Default");
  }, [slug]);

  const visibleTabs = labels
    ? tabs.filter((tab) => labels.includes(tab.label))
    : tabs;

  const activeTab =
    visibleTabs.find((tab) => tab.label === active) ?? visibleTabs[0];

  // Re-mount the preview when replay is clicked so one-shot animations
  // (Blur/Flip/Split/FadeUp/CountUp) run again from the start.
  const [replayKey, setReplayKey] = React.useState(0);
  const replay = () => setReplayKey((k) => k + 1);

  const heading = title === undefined ? (entry?.name ?? slug) : title;
  const sub = title === null ? undefined : (description ?? entry?.description);

  return (
    <section className="not-prose mt-8">
      {(heading || sub) && (
        <header className="mb-3">
          {heading && (
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {heading}
            </h2>
          )}
          {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
        </header>
      )}

      {visibleTabs.length > 1 && (
        <Tabs value={active} onValueChange={setActive} className="mb-4">
          <TabsList className="h-auto w-auto flex-wrap justify-start gap-1 rounded-lg bg-muted/40 p-1">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.label}
                value={tab.label}
                className="h-7 rounded-md px-2.5 text-xs font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div
        className={
          layout === "side-by-side"
            ? "flex flex-col gap-4 lg:flex-row lg:items-stretch"
            : "flex flex-col gap-4"
        }
      >
        {/* Live preview */}
        <div className="min-w-0 flex-1 overflow-visible rounded-lg border border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              Preview · {activeTab?.label ?? "Default"}
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                live
              </span>
              <button
                type="button"
                onClick={replay}
                title="Replay animation"
                aria-label="Replay animation"
                className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5V5h-3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Replay
              </button>
            </div>
          </div>
          <ThemePreviewFrame>
            <React.Suspense
              fallback={
                <span className="text-sm text-muted-foreground">
                  Loading preview...
                </span>
              }
            >
              <VariantPreview
                key={`${slug}-${activeTab?.label}-${replayKey}`}
                slug={slug}
                label={activeTab?.label}
              />
            </React.Suspense>
          </ThemePreviewFrame>
        </div>

        {/* Copyable code for the selected variant */}
        {activeTab && (
          <div className="min-w-0 flex-1">
            <CodeBlock
              code={activeTab.code}
              title={`${activeTab.label} usage`}
            />
          </div>
        )}
      </div>
    </section>
  );
}
