import { cn, Pill } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useEffect, useState } from "react";
import { getDocsUrl, getPlaygroundUrl } from "../../site.config.js";
import { useDomain } from "../../lib/domain-context.js";
import type { DomainId } from "../../lib/domain-config.js";
import { LAB_DOMAINS } from "../../data/scratchpad.js";
import { SITE_VERSION } from "../../data/site-data.generated.js";

const HERO_TAGS = [
  "Auth",
  "Components",
  "Layout",
  "Motion",
  "Tokens",
  "SDK",
  "CLI",
  "Sandbox",
  "Native",
];

const INSTALL_COMMANDS = {
  pnpm: `pnpm add @fusorb/facet-components @fusorb/facet-auth @fusorb/facet-layout @fusorb/facet-motion`,
  npm: `npm install @fusorb/facet-components @fusorb/facet-auth @fusorb/facet-layout @fusorb/facet-motion`,
  yarn: `yarn add @fusorb/facet-components @fusorb/facet-auth @fusorb/facet-layout @fusorb/facet-motion`,
  bun: `bun add @fusorb/facet-components @fusorb/facet-auth @fusorb/facet-layout @fusorb/facet-motion`,
} as const;

export function HeroSection() {
  const { domainId, switchDomain } = useDomain();
  const [cycleIndex, setCycleIndex] = useState(0);
  const [installTab, setInstallTab] =
    useState<keyof typeof INSTALL_COMMANDS>("pnpm");
  const [copied, setCopied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );

  // Track the desktop breakpoint so the state-machine preview only drives
  // domain cycling while it is actually visible.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Auto-cycle domain presets every 3.2s — only when the preview card is
  // visible (desktop). On smaller screens the state-machine card is hidden,
  // so cycling would just flicker the rest of the page for nothing.
  useEffect(() => {
    if (!isDesktop) return;
    const iv = setInterval(() => {
      const next = (cycleIndex + 1) % LAB_DOMAINS.length;
      const nextDomain = LAB_DOMAINS[next];
      if (!nextDomain) return;
      setCycleIndex(next);
      switchDomain(nextDomain.id as DomainId);
    }, 3200);
    return () => clearInterval(iv);
  }, [cycleIndex, switchDomain, isDesktop]);

  // Sync cycleIndex when domain changes externally (user picks a preset)
  useEffect(() => {
    const idx = LAB_DOMAINS.findIndex((d) => d.id === domainId);
    if (idx !== -1 && idx !== cycleIndex) {
      setCycleIndex(idx);
    }
  }, [domainId, cycleIndex]);

  const activeDomain = (LAB_DOMAINS[cycleIndex] ??
    LAB_DOMAINS[0]) as (typeof LAB_DOMAINS)[number];

  return (
    <section className="px-4 sm:px-8">
      <div className="relative mx-auto max-w-[1200px] min-h-[60vh] lg:min-h-[calc(100vh-56px)]">
        {/* Two-column layout: message | domain preview.
            The state-machine preview (right) is hidden on small screens
            so the mobile hero stays focused on the value prop. */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          {/* LEFT: value prop */}
          <div className="lg:mx-0 lg:max-w-none">
            {/* Version badge with pulse dot */}
            <div className="mb-4 flex items-center justify-center gap-2.5 text-[11px] font-mono text-text-dim lg:justify-start">
              <span
                className="h-1.5 w-1.5 shrink-0 animate-pulse-dot rounded-full"
                style={{ background: "var(--green)" }}
              />
              <span>v{SITE_VERSION} · MIT Licensed</span>
            </div>

            {/* H1 */}
            <h1
              className="font-display text-3xl font-extrabold text-balance text-center text-pretty sm:text-5xl lg:text-[56px] lg:text-left"
              style={{
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
              }}
            >
              <span>One system. </span>
              <br className="hidden sm:block" />
              <span>Every surface.</span>
            </h1>

            {/* Body copy */}
            <p className="mt-6 max-w-md text-[16px] leading-[1.7] text-center text-pretty text-muted-foreground lg:text-left">
              Facet is a ground-up UX system that stitches design tokens,
              domain-customizable components, auth, layout, and motion into one
              composable stack. Four layers, every seam an extension point.
            </p>

            {/* Tech tag pills: Pill component, subtle variant, mono label */}
            <div className="mt-8 flex flex-wrap justify-center gap-1.5 lg:justify-start">
              {HERO_TAGS.map((tag) => (
                <Pill
                  key={tag}
                  variant="subtle"
                  radius="full"
                  size="sm"
                  indicator="none"
                  className="font-mono font-medium uppercase text-[10px] text-text-dim"
                >
                  {tag}
                </Pill>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => (window.location.href = getPlaygroundUrl())}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90"
              >
                Open Playground
                <LightIcon name="arrow-right" size={14} />
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = getDocsUrl())}
                className="rounded-lg border border-surface bg-transparent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-panel-hover"
              >
                Read the Docs
              </button>
            </div>

            {/* Install command row */}
            <div className="mt-8 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1 text-xs font-mono">
                {(["pnpm", "npm", "yarn", "bun"] as const).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setInstallTab(pm)}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium transition-all",
                      installTab === pm
                        ? "bg-background text-foreground shadow"
                        : "text-text-dim hover:text-foreground",
                    )}
                  >
                    {pm}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <code className="block w-full overflow-x-auto rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm font-mono text-text-dim">
                  {INSTALL_COMMANDS[installTab]}
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      INSTALL_COMMANDS[installTab],
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  aria-label="Copy install command"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-text-dim transition-colors hover:text-foreground"
                >
                  <LightIcon name={copied ? "check" : "copy"} size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: domain cycling + sign-in card (state machine).
              Hidden on small screens — revealed from lg up. */}
          <div className="hidden space-y-6 lg:block">
            {/* Domain preset pills (auto-cycling every 3.2s) */}
            <div className="space-y-2">
              <p className="text-center text-xs text-text-dim">
                Switch domain preset
              </p>
              <div className="flex justify-center gap-2">
                {LAB_DOMAINS.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setCycleIndex(i);
                      switchDomain(d.id as DomainId);
                    }}
                    className={cn(
                      "rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-in-out",
                      cycleIndex === i
                        ? "bg-accent-dim"
                        : "border-transparent text-text-dim hover:border-border",
                    )}
                    style={{
                      borderColor: cycleIndex === i ? d.accent : undefined,
                      boxShadow:
                        cycleIndex === i ? `0 0 12px ${d.accent}` : undefined,
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign-in card */}
            <div
              className="rounded-xl border-2 bg-panel p-6 shadow-xl transition-all"
              style={{
                borderColor: `color-mix(in srgb, ${activeDomain.accent} 22%, transparent)`,
                boxShadow: `0 0 30px color-mix(in srgb, ${activeDomain.accent} 6%, transparent)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: activeDomain.accent }}
                >
                  <LightIcon name="user" size={12} className="text-white" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Sign in to {activeDomain.label}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {activeDomain.authMethods.map((method) => (
                  <div key={method} className="flex items-center gap-2">
                    <span
                      className="h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ background: "var(--green)" }}
                    />
                    <span className="text-xs font-mono text-text-dim">
                      {method}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => (window.location.href = getPlaygroundUrl())}
                className="mt-4 w-full rounded-lg py-2 text-sm font-medium"
                style={{
                  background: activeDomain.accent,
                  color: "var(--primary-foreground)",
                }}
              >
                Continue
              </button>

              <div className="mt-3 text-center text-[9px] text-text-dim">
                preset: {activeDomain.label} · density: {activeDomain.density}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
