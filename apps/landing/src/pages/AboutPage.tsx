import { Link } from "react-router-dom";
import { LandingLayout } from "@arcevo/facet-layout";
import { LightIcon } from "@arcevo/facet-components/light";
import { STATS, PACKAGES, FEATURES, ROADMAP } from "../data/features.js";
import { getDocsUrl } from "../lib/docs-url.js";
import { Nav } from "../components/Nav.js";
import { Footer } from "../components/Footer.js";
import type { Package } from "../data/features.js";

/** "Built with" stack for the About page. Hand-curated to match the toolchain
 *  declared in the repo (pnpm workspaces + Turbo, Vite, tsup, Radix, lucide). */
const STACK = [
  { name: "Node 20", tag: "runtime" },
  { name: "React 19", tag: "runtime" },
  { name: "pnpm 11 + Turbo", tag: "build" },
  { name: "Vite 6 (Rolldown)", tag: "build" },
  { name: "tsup + TypeScript 5", tag: "build" },
  { name: "Tailwind CSS v4", tag: "styles" },
  { name: "@arcevo/facet-tokens", tag: "styles" },
  { name: "Radix UI", tag: "ui" },
  { name: "lucide-react 1.30", tag: "ui" },
  { name: "react-hook-form + Zod", tag: "forms" },
  { name: "Zustand", tag: "state" },
  { name: "react-email", tag: "email" },
  { name: "Vitest + Playwright", tag: "test" },
] as const;

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-heading text-4xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <div className="glass-card rounded-xl p-6 transition-all hover:translate-y-[-2px]">
      <div className="flex items-start gap-3">
        <LightIcon name={pkg.icon} className="mt-1 size-5 text-primary" />
        <div>
          <div className="font-medium text-foreground">{pkg.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">{pkg.desc}</div>
          <div className="mt-2 text-xs text-muted-foreground/70">v{pkg.version}</div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <LandingLayout
      nav={<Nav />}
      footer={<Footer />}
      hero={
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
            <img src="/facet-2d-flat.png" alt="" aria-hidden="true" className="h-6 w-auto" />
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-foreground sm:text-5xl">
            facet
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A domain-customizable component system for identity-heavy apps. Built by Arcevo
            to keep design, auth, and docs in lockstep across fintech, healthcare, and
            education.
          </p>
        </div>
      }
    >
      {/* The problem */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground">The problem</h2>
        <p className="mt-4 text-muted-foreground">
          Building auth-heavy user interfaces is fragmented. You cobble together an unstyled
          component library, a generic auth flow, hand-rolled layouts, and separate docs -
          then watch them drift on every release. Worse, auth isn't one-size-fits-all:
          fintech needs MFA and audit trails, healthcare needs HIPAA-aware sessions, and
          education needs low-friction social login. A single auth surface can't serve all
          three without becoming a tangle of feature flags.
        </p>
        <p className="mt-4 text-muted-foreground">
          Teams either rebuild the same primitives per project, or ship a compromise that
          no domain actually wants. There was no system where the design tokens, the
          components, the auth flow, the SDK, and the docs all come from the same source of
          truth and stay in sync automatically.
        </p>
      </section>

      {/* What facet is */}
      <section id="packages" className="bg-secondary/30 mx-auto max-w-5xl px-8 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-foreground">What facet is</h2>
          <p className="mt-3 text-muted-foreground">
            Nine packages, published to npm under <code className="rounded px-2 py-1 bg-background">@arcevo</code>, that share one token system and stay in
            sync through CI gates. The numbers below are live and verified on every release.
          </p>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          One component surface, three auth axes - <span className="font-medium text-foreground">appearance</span>,{" "}
          <span className="font-medium text-foreground">config</span>, and{" "}
          <span className="font-medium text-foreground">slots</span> - so each domain gets
          its own auth experience from the same package.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.name} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* Mission / vision */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground">Mission &amp; vision</h2>
        <p className="mt-4 text-muted-foreground">
          <span className="font-medium text-foreground">Mission.</span> Make it possible to ship
          a domain-tailored, auth-first application without rebuilding the boring parts - and
          without sacrificing accessibility, type safety, or consistency.
        </p>
        <p className="mt-3 text-muted-foreground">
          <span className="font-medium text-foreground">Vision.</span> An ecosystem where the
          design system, the auth flow, the API client, and the documentation are one
          integrated source of truth. Change a token and the whole stack reflects it; release a
          component and the docs render its live preview automatically.
        </p>
      </section>

      {/* Core capabilities */}
      <section id="features" className="mx-auto max-w-5xl px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground">Core capabilities</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card rounded-xl p-6 transition-all hover:translate-y-[-2px]"
            >
              <LightIcon name={f.icon} className="size-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built with */}
      <section className="bg-secondary/30 mx-auto max-w-3xl px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground">Built with</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          The same toolchain you can see in the open-source repo.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
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
      </section>

      {/* How it's maintained */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground">How it's maintained</h2>
        <p className="mt-3 text-muted-foreground">
          facet is MIT-licensed and published to npm under <code className="rounded px-2 py-1 bg-secondary/50">@arcevo</code>.
          Releases are driven by Changesets: a PR is opened automatically whenever a changeset
          lands, and packages publish from a clean, rebuilt tree after CI passes - never from a
          stale or dirty checkout.
        </p>
        <p className="mt-3 text-muted-foreground">
          Every change clears five gates before it ships: dependency install, full build, and
          the sync checks - <code className="rounded px-2 py-1 bg-secondary/50">check:docs</code> (components
          barrel ↔ docs manifest, 113 components), <code className="rounded px-2 py-1 bg-secondary/50">check:icons</code>
          (lucide rename/deprecation drift), and <code className="rounded px-2 py-1 bg-secondary/50">check:sdk-drift</code>{" "}
          (SDK table ↔ barrel). Typecheck, unit tests, and an end-to-end CLI sandbox close the
          loop, so the counts you see here never drift from the code.
        </p>
        <div className="mt-8">
          <h3 id="roadmap" className="text-lg font-semibold text-foreground">Roadmap</h3>
          <ul className="mt-4 space-y-3">
            {ROADMAP.map((r) => (
              <li key={r.phase} className="flex items-start gap-3">
                <span className="mt-1 text-xs font-medium text-muted-foreground">{r.phase}</span>
                <span className="flex-1">
                  <span className="font-medium text-foreground">{r.title}</span>
                  <span className="ml-2 text-xs font-medium uppercase">
                    {r.status === "done" ? (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-green-500">
                        done
                      </span>
                    ) : r.status === "in-progress" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-500">
                        in progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-0.5 text-slate-500">
                        planned
                      </span>
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 mx-auto max-w-3xl rounded-2xl px-8 py-16 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">Ready to try it?</h2>
        <p className="mt-3 text-muted-foreground">
          Browse the live component gallery, read the docs, or drop a line.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            onClick={() => window.open(getDocsUrl(), "_blank")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <LightIcon name="book-open" className="mr-2 size-4" />
            Read the docs
          </Link>
          <Link
            to="/feedback"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LightIcon name="mail" className="mr-2 size-4" />
            Send feedback
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
