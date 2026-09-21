import * as React from "react";
import { cn, Pill } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { LAYOUT_MODES, type LayoutMode } from "../../data/scratchpad.js";

const ROUTER_ADAPTERS = [
  { label: "Next.js App Router", value: "nextjs" },
  { label: "React Router", value: "react-router" },
  { label: "Remix", value: "remix" },
  { label: "Custom", value: "custom" },
];

/** Visual ConsoleLayout preview that mirrors the real shell without
 *  mounting the full component (which needs LayoutProvider context).
 *  This matches the scratchpad LayoutPreview approach. */
function ConsoleLayoutPreview({ mode }: { mode: LayoutMode }) {
  return (
    <div className="relative h-[196px] w-full overflow-hidden rounded-md border border-border-bright shadow-lg">
      <div
        className="absolute inset-0 origin-top-left"
        style={{ width: "784px", height: "400px", transform: "scale(0.46)" }}
      >
        <div className="flex h-full w-full flex-col">
          {/* Topbar */}
          <div className="flex h-10 items-center justify-between border-b border-border bg-surface px-3">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-accent text-[9px] font-bold text-accent-foreground">
                f
              </div>
              <span className="text-xs font-medium text-foreground">facet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="flex h-6 w-6 items-center justify-center rounded text-xs text-text-muted">
                <LightIcon name="search" size={12} />
              </button>
              <button className="flex h-6 w-6 items-center justify-center rounded text-xs text-text-muted">
                <LightIcon name="moon" size={12} />
              </button>
            </div>
          </div>

          <div className="flex flex-1">
            {/* Sidebar */}
            {mode !== "collapsed" && (
              <div
                className={`${
                  mode === "rail" ? "w-12" : "w-[200px]"
                } flex flex-col gap-1 border-r border-border bg-surface p-2 overflow-y-auto`}
              >
                <div className="text-xs font-medium text-accent">Overview</div>
                {["Dashboard", "Components", "Auth", "Motion", "Tokens"].map(
                  (item) => (
                    <div key={item} className="text-xs text-text-muted">
                      {item}
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 bg-panel p-3">
              <div className="text-xs text-text-dim">
                Main content — mode: {mode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded border border-border bg-panel px-2 py-1 text-xs text-text-muted hover:text-text"
      aria-label="Copy JSX"
    >
      {copied ? (
        <LightIcon name="check" size={12} />
      ) : (
        <LightIcon name="copy" size={12} />
      )}
    </button>
  );
}

export function LayoutSection() {
  const [mode, setMode] = React.useState<LayoutMode>("full");

  const jsxSnippet = `<ConsoleLayout
  config={config}
  mode={mode}
  router={useLayoutRouterAdapter(navigate)}
  themeToggle
/>`;

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-8 py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-1">
          <Pill
            color="primary"
            indicator="icon"
            icon={<LightIcon name="ruler" size={12} />}
          >
            Layout
          </Pill>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            One layout primitive. Every shell.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            ConsoleLayout auto-adapts between desktop, tablet, and mobile.
            Rail-collapsed via keyboard (⌘B) or prop.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Left: Controls */}
          <div className="w-48 flex flex-col gap-6">
            <div>
              <div className="mb-2 text-xs font-medium text-text-dim">
                SIDEBAR MODE
              </div>
              <div className="flex flex-col gap-1.5">
                {(LAYOUT_MODES as LayoutMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "cursor-pointer rounded-md border px-3 py-1.5 text-left text-sm font-medium transition-all",
                      mode === m
                        ? "border-accent bg-accent-dim text-accent"
                        : "border-border bg-panel text-text-muted hover:bg-panel-hover hover:text-text",
                    )}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-text-dim">
                ROUTER ADAPTERS
              </div>
              <div className="flex flex-wrap gap-2">
                {ROUTER_ADAPTERS.map((adapter) => (
                  <span
                    key={adapter.value}
                    className="rounded-[2px] border border-border px-2 py-0.5 text-xs font-mono text-text-dim"
                  >
                    {adapter.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1">
            <ConsoleLayoutPreview mode={mode} />

            <div className="mt-4 flex items-center justify-between gap-2 rounded-md border border-border bg-panel p-3">
              <code className="text-xs text-text-dim">{jsxSnippet}</code>
              <CopyButton code={jsxSnippet} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
