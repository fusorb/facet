import { Link } from "react-router-dom";
import { LandingLayout } from "@fusorb/facet-layout";
import { ShineButton, buttonVariants, cn } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { ECOSYSTEM } from "../data/ecosystem.js";
import { getDocsUrl } from "../lib/docs-url.js";
import { Nav } from "../components/Nav.js";
import { Footer } from "../components/Footer.js";

export function EcosystemPage() {
  return (
    <LandingLayout
      nav={<Nav />}
      footer={<Footer />}
      hero={
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
            <LightIcon name="boxes" className="size-5 text-primary" />
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-foreground sm:text-5xl">
            The facet ecosystem
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nine packages, one source of truth. Each package below is fully
            analyzed on its own page, with a direct link to the corresponding
            docs site entry.
          </p>
        </div>
      }
    >
      {/* Package grid */}
      <section className="mx-auto max-w-5xl px-8 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ECOSYSTEM.map((entry) => (
            <Link
              key={entry.slug}
              to={`/ecosystem/${entry.slug}`}
              className="group rounded-xl border border-border bg-card p-5 text-left transition-all hover:translate-y-[-2px] hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <LightIcon name={entry.icon} className="mt-1 size-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
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
      <section className="bg-secondary/30 mx-auto max-w-5xl px-8 py-16 text-center">
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
          className={cn(buttonVariants({ variant: "default", size: "default" }), "mt-6")}
        >
          <LightIcon name="book-open" className="mr-2 size-4" />
          Browse the docs
        </ShineButton>
      </section>
    </LandingLayout>
  );
}
