import {
  SparkleButton,
  Stagger,
  Motion,
  Pill,
  GradientText,
  TypewriterText,
  cn,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useState } from "react";
import { site } from "../../site.config.js";
import { useDomain } from "../../lib/domain-context.js";
import type { DomainId } from "../../lib/domain-config.js";
import { LAB_DOMAINS, PACKAGES } from "../../data/scratchpad.js";
import { SITE_PACKAGES, SITE_VERSION } from "../../data/site-data.generated.js";

const INSTALL_PKG =
  SITE_PACKAGES.find((p) => p.name === "@fusorb/facet-components")?.name ??
  "@fusorb/facet-components";

const INSTALL_COMMANDS = {
  pnpm: `pnpm add ${INSTALL_PKG}`,
  npm: `npm install ${INSTALL_PKG}`,
  yarn: `yarn add ${INSTALL_PKG}`,
  bun: `bun add ${INSTALL_PKG}`,
} as const;

const HERO_TAGS = PACKAGES.map((p) => {
  const s = p.short;
  return s === "sdk"
    ? "SDK"
    : s === "cli"
      ? "CLI"
      : s.charAt(0).toUpperCase() + s.slice(1);
});

export function HeroSection() {
  const { domain, domainId, switchDomain, handleCta } = useDomain();
  const { hero, stats } = domain;
  const {
    headline,
    headlineAccent,
    subtext,
    phrases,
    badges,
    primaryCta,
    secondaryCta,
  } = hero;

  const labDomain =
    (LAB_DOMAINS.find((d) => d.id === domainId) ?? LAB_DOMAINS[0])!;

  const [installTab, setInstallTab] = useState<keyof typeof INSTALL_COMMANDS>(
    "pnpm",
  );

  return (
    <section className="px-8 py-20 lg:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Brand line: version badge with pulse dot + tag row */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2.5 text-sm text-muted-foreground">
            <span className="lab-live h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span>v{SITE_VERSION}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>MIT</span>
            <span className="text-muted-foreground/40">·</span>
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              github.com/fusorb/facet
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 text-xs font-mono text-muted-foreground/50">
            {HERO_TAGS.map((tag, i) => (
              <span key={tag}>
                {tag}
                {i < HERO_TAGS.length - 1 && (
                  <span className="mx-1.5 text-muted-foreground/30">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Two-column grid: scratchpad layout: message | domain preview */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* LEFT: value prop */}
          <div>
            {/* Badge pills */}
            <Stagger
              delay={60}
              className="flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              {badges.map((badge, i) => (
                <Motion
                  key={badge.label}
                  effect="fade"
                  direction="up"
                  staggerIndex={i}
                  className="inline-flex"
                >
                  <Pill
                    indicator="icon"
                    icon={<LightIcon name={badge.icon} size={14} />}
                    size="sm"
                    color="secondary"
                  >
                    {badge.label}
                  </Pill>
                </Motion>
              ))}
            </Stagger>

            {/* Headline */}
            <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-balance text-center text-pretty lg:text-left sm:text-5xl">
              {headline}
              <GradientText
                text={headlineAccent}
                className="block sm:inline"
              />
            </h1>

            {/* Phrases */}
            <div className="mt-6">
              <TypewriterText phrases={phrases} />
            </div>

            {/* Subtext */}
            <p className="mt-6 max-w-2xl text-center text-lg text-muted-foreground lg:text-left">
              {subtext}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <SparkleButton
                label={primaryCta.label}
                onClick={() => handleCta(primaryCta.action)}
                className="h-10 px-8"
              />
              <button
                type="button"
                onClick={() => handleCta(secondaryCta.action)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {secondaryCta.label}
              </button>
            </div>

            {/* Install command with package-manager tabs */}
            <div className="mt-10 max-w-md">
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
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {pm}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <code className="block w-full overflow-x-auto rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm">
                  {INSTALL_COMMANDS[installTab]}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      INSTALL_COMMANDS[installTab],
                    )
                  }
                  aria-label="Copy install command"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LightIcon name="copy" size={14} />
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="mt-12 grid w-full grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-heading text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* License note */}
            <p className="mt-6 text-center text-xs text-muted-foreground lg:text-left">
              MIT Licensed · Free forever ·{" "}
              <a
                href={site.links.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                View on GitHub
              </a>
            </p>
          </div>

          {/* RIGHT: domain preview */}
          <div className="mt-12 space-y-6 lg:mt-0">
            {/* Domain selector */}
            <div className="space-y-2">
              <p className="text-center text-xs text-muted-foreground">
                Switch domain preset
              </p>
              <div className="flex justify-center gap-2">
                {LAB_DOMAINS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => switchDomain(d.id as DomainId)}
                    className={cn(
                      "rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all",
                      domainId === d.id
                        ? "bg-background shadow"
                        : "border-transparent hover:border-muted",
                    )}
                    style={{
                      borderColor: domainId === d.id ? d.accent : undefined,
                      boxShadow:
                        domainId === d.id
                          ? `0 0 12px ${d.accent}`
                          : undefined,
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth preview card */}
            <div
              className="relative rounded-2xl border-2 bg-card p-6 shadow-xl"
              style={{
                borderColor: `${labDomain.accent}40`,
                boxShadow: `0 0 30px ${labDomain.accent}15`,
              }}
            >
              {/* Floating stat badge */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                {stats.slice(0, 2).map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-full border border-border bg-background/95 px-2.5 py-0.5 text-xs font-medium backdrop-blur"
                  >
                    <span className="text-foreground">{stat.value}</span>{" "}
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Auth surface preview */}
              <div className="space-y-4 text-center">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Sign in to {labDomain.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {labDomain.desc}
                  </p>
                </div>

                {/* Auth method chips */}
                <div className="flex flex-wrap justify-center gap-1.5">
                  {labDomain.authMethods.map((method) => (
                    <span
                      key={method}
                      className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs"
                    >
                      {method}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground"
                >
                  Continue
                </button>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Density: {labDomain.density}</span>
                  <span>Domain: {labDomain.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
