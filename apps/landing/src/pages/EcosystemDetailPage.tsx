import { useParams, useNavigate } from "react-router-dom";
import { ShineButton, buttonVariants, cn } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { PageShell } from "../components/PageShell.js";
import { ECOSYSTEM, getEcosystemDocsUrl } from "../data/ecosystem.js";

export function EcosystemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const entry = ECOSYSTEM.find((e) => e.slug === slug);

  if (!entry) {
    return (
      <PageShell
        kicker={
          <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
            <LightIcon name="alert-circle" className="size-5 text-primary" />
          </span>
        }
        title="Package not found"
        description="We couldn't find an ecosystem package matching that URL."
      >
        <section className="mx-auto max-w-3xl px-8 py-12 text-center">
          <ShineButton
            type="button"
            onClick={() => navigate("/ecosystem")}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "mt-2",
            )}
          >
            <LightIcon name="arrow-left" className="size-4" />
            Back to ecosystem
          </ShineButton>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      kicker={
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
          <LightIcon name={entry.icon} className="size-6 text-primary" />
        </span>
      }
      title={entry.title}
      description={entry.description}
    >
      {/* Package at a glance */}
      <section className="mx-auto max-w-3xl px-8 py-8">
        <div className="mb-4 flex items-center justify-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {entry.short}
          </p>
          <span className="text-xs text-muted-foreground/50">•</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/70">
            v{entry.version}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <LightIcon name="terminal" className="size-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground/70">Package</div>
              <code className="text-sm font-medium text-foreground/90">
                {entry.name}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <LightIcon name="tag" className="size-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground/70">Version</div>
              <div className="text-sm font-medium text-foreground/90">
                {entry.version}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <LightIcon name="external-link" className="size-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground/70">Docs</div>
              <a
                href={getEcosystemDocsUrl(entry)}
                className="cursor-pointer text-sm font-medium text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Open docs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture highlights (first analysis paragraph as a callout) */}
      {entry.analysis[0] && (
        <section className="mx-auto max-w-3xl px-8 py-8">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Architecture highlights
          </h2>
          <blockquote className="mt-4 border-l-4 border-primary/30 pl-6 italic text-muted-foreground">
            {entry.analysis[0]}
          </blockquote>
        </section>
      )}

      {/* Full analysis */}
      <section className="mx-auto max-w-3xl px-8 py-12">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Overview
        </h2>
        <div className="mt-4 space-y-4">
          {entry.analysis.slice(1).map((para, i) => (
            <p key={i} className="leading-relaxed text-muted-foreground">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Key features */}
      <section className="mx-auto max-w-3xl px-8 py-12">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Key features
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {entry.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <LightIcon name="check" className="mt-1 size-4 text-success" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* All examples */}
      <section className="mx-auto max-w-4xl px-8 py-12">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Example usage
        </h2>
        <div className="mt-4 space-y-6">
          {entry.example.map((ex, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground/70">
                <LightIcon name="code" className="size-3" />
                <span>{ex.lang}</span>
              </div>
              <pre className="overflow-x-auto text-sm">
                <code className="text-foreground/90">{ex.code}</code>
              </pre>
              <div className="mt-3 flex gap-3">
                <a
                  href={getEcosystemDocsUrl(entry)}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <LightIcon name="external-link" className="size-3" />
                  View in docs
                </a>
                <a
                  href={`https://www.npmjs.com/package/${entry.name}`}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <LightIcon name="external-link" className="size-3" />
                  npm package
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA with breathing room */}
      <section className="mx-auto max-w-5xl px-8 py-20 text-center">
        <div className="rounded-xl border border-border bg-card p-8">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Ready to use {entry.title}?
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Read the full documentation for {entry.name}. Live component
            previews, API reference, and installation guides.
          </p>
          <ShineButton
            type="button"
            onClick={() => window.open(getEcosystemDocsUrl(entry), "_blank")}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "mt-6",
            )}
          >
            <LightIcon name="external-link" className="size-4" />
            Open docs
          </ShineButton>
        </div>
      </section>
    </PageShell>
  );
}
