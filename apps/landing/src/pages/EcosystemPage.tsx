import { Link } from "react-router-dom";
import { ShineButton, buttonVariants, cn } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { PageShell } from "../components/PageShell.js";
import { ECOSYSTEM } from "../data/ecosystem.js";
import { getDocsUrl } from "../site.config.js";

export function EcosystemPage() {
  return (
    <PageShell
      kicker={
        <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
          <LightIcon name="boxes" className="size-5 text-primary" />
        </span>
      }
      title="The ecosystem"
      description="Nine packages, one source of truth. Each package below is fully analyzed on its own page, with a direct link to the corresponding docs site entry."
    >
      {/* Package grid */}
      <section className="mx-auto max-w-5xl px-8 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ECOSYSTEM.map((entry) => (
            <Link
              key={entry.slug}
              to={`/ecosystem/${entry.slug}`}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 text-left transition-all hover:translate-y-[-2px] hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <LightIcon
                  name={entry.icon}
                  className="mt-1 size-5 text-primary"
                />
                <div>
                  <div className="font-medium text-foreground transition-colors group-hover:text-primary">
                    {entry.name}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {entry.short}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground/70">
                    v{entry.version}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-8 py-16 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Dive deeper
        </h2>
        <p className="mt-3 text-muted-foreground">
          Visit the docs site for live component previews, full API reference,
          and installation guides for every package.
        </p>
        <ShineButton
          type="button"
          onClick={() => window.open(getDocsUrl(), "_blank")}
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "mt-6",
          )}
        >
          <LightIcon name="book-open" className="size-4" />
          Browse the docs
        </ShineButton>
      </section>
    </PageShell>
  );
}
