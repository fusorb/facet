import { Link } from "react-router-dom";
import { LightIcon } from "@fusorb/facet-components/light";
import { PageShell } from "../components/PageShell.js";
import { BrandMark } from "../components/Brand.js";
import { FEATURES, ROADMAP } from "../data/features.js";
import { SITE_PACKAGES, SITE_STATS } from "../data/site-data.generated.js";
import { site, getDocsUrl } from "../site.config.js";

/** "Built with" stack for the About page. Curated to match the toolchain
 *  declared in the repo (pnpm workspaces + Turbo, Vite, tsup, Radix). */
const STACK = [
  { name: "Node 22", tag: "runtime" },
  { name: "React 19", tag: "runtime" },
  { name: "pnpm + Turbo", tag: "build" },
  { name: "Vite 8", tag: "build" },
  { name: "tsup + TypeScript 5", tag: "build" },
  { name: "Tailwind CSS v4", tag: "styles" },
  { name: site.brand.name + " tokens", tag: "styles" },
  { name: "Radix UI", tag: "ui" },
  { name: "react-hook-form + Zod", tag: "forms" },
  { name: "Zustand", tag: "state" },
  { name: "Vitest", tag: "test" },
] as const;

const STATUS_STYLES: Record<(typeof ROADMAP)[number]["status"], string> = {
  done: "bg-success/10 text-success",
  "in-progress": "bg-warning/10 text-warning",
  planned: "bg-muted text-muted-foreground",
};

export function AboutPage() {
  return (
    <PageShell
      kicker={<BrandMark className="mx-auto h-10 w-10 text-lg" />}
      title={site.brand.name}
      description={site.brand.tagline}
    >
      {/* The problem */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          The problem
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Building auth-heavy user interfaces is fragmented. You cobble together
          an unstyled component library, a generic auth flow, hand-rolled
          layouts, and separate docs. Then they drift on every release. Worse,
          auth is not one-size-fits-all: fintech needs MFA and audit trails,
          healthcare needs compliant sessions, and education needs low-friction
          social login. A single auth surface cannot serve all three without
          becoming a tangle of feature flags.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Teams either rebuild the same primitives per project, or ship a
          compromise that no domain actually wants. There was no system where
          the design tokens, the components, the auth flow, the SDK, and the
          docs all come from the same source of truth and stay in sync
          automatically.
        </p>
      </section>

      {/* What facet is */}
      <section id="packages" className="mx-auto max-w-5xl px-8 py-16">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            What it is
          </h2>
          <p className="mt-3 text-muted-foreground">
            Nine packages, published to npm under{" "}
            <code className="rounded bg-secondary/50 px-2 py-1">@fusorb</code>,
            sharing one token system and staying in sync through CI gates. The
            numbers below are generated from the workspace at build time, so
            they never drift.
          </p>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {SITE_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-4xl font-bold text-primary">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          One component surface, three customization axes:{" "}
          <span className="font-medium text-foreground">appearance</span>,{" "}
          <span className="font-medium text-foreground">config</span>, and{" "}
          <span className="font-medium text-foreground">slots</span>. Each
          domain gets its own auth experience from the same package.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className="glass-card rounded-xl p-6 transition-all hover:translate-y-[-2px]"
            >
              <div className="flex items-start gap-3">
                <LightIcon
                  name={pkg.icon}
                  className="mt-1 size-5 text-primary"
                />
                <div>
                  <div className="font-medium text-foreground">{pkg.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {pkg.desc}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground/70">
                    v{pkg.version}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / vision */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Mission &amp; vision
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Mission.</span> Make it
          possible to ship a domain-tailored, auth-first application without
          rebuilding the boring parts, and without sacrificing accessibility,
          type safety, or consistency.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Vision.</span> An
          ecosystem where the design system, the auth flow, the API client, and
          the documentation are one integrated source of truth. Change a token
          and the whole stack reflects it; release a component and the docs
          render its live preview automatically.
        </p>
      </section>

      {/* Core capabilities */}
      <section id="features" className="mx-auto max-w-5xl px-8 py-16">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Core capabilities
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card rounded-xl p-6 transition-all hover:translate-y-[-2px]"
            >
              <LightIcon name={f.icon} className="size-5 text-primary" />
              <h3 className="mt-3 font-heading font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Built with */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Built with
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          The same toolchain you can see in the open-source repo.
        </p>
        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {STACK.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-foreground/80"
            >
              {s.name}
              <span className="text-xs opacity-50">· {s.tag}</span>
            </span>
          ))}
          </div>
        </div>
      </section>

      {/* How it's maintained */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          How it's maintained
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          MIT-licensed and published to npm under{" "}
          <code className="rounded bg-secondary/50 px-2 py-1">@fusorb</code>.
          Releases are driven by Changesets: a PR is opened automatically
          whenever a changeset lands, and packages publish from a clean, rebuilt
          tree after CI passes. Never from a stale or dirty checkout.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Every change clears the gates before it ships: dependency install,
          full build, and the sync checks:{" "}
          <code className="rounded bg-secondary/50 px-2 py-1">check:docs</code>{" "}
          (components barrel and docs manifest),{" "}
          <code className="rounded bg-secondary/50 px-2 py-1">check:icons</code>{" "}
          (icon map drift), and{" "}
          <code className="rounded bg-secondary/50 px-2 py-1">
            check:sdk-drift
          </code>{" "}
          (SDK table and barrel). Typecheck, unit tests, and an end-to-end CLI
          sandbox close the loop, so the counts you see here never drift from
          the code.
        </p>
        <div className="mt-8">
          <h3
            id="roadmap"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Roadmap
          </h3>
          <ul className="mt-4 space-y-3">
            {ROADMAP.map((r) => (
              <li key={r.phase} className="flex items-start gap-3">
                <span className="mt-1 text-xs font-medium text-muted-foreground">
                  {r.phase}
                </span>
                <span className="flex-1">
                  <span className="font-medium text-foreground">{r.title}</span>
                  <span className="ml-2 text-xs font-medium uppercase">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status === "in-progress" ? "in progress" : r.status}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl rounded-2xl bg-primary/5 px-8 py-16 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Ready to try it?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Browse the live component gallery, read the docs, or drop a line.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={getDocsUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <LightIcon name="book-open" className="mr-2 size-4" />
            Read the docs
          </a>
          <Link
            to="/feedback"
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LightIcon name="mail" className="mr-2 size-4" />
            Send feedback
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
