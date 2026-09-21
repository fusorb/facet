import { Link } from "react-router-dom";
import {
  ShineButton,
  Stagger,
  Motion,
  buttonVariants,
  cn,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { PageShell } from "../components/PageShell.js";
import { ECOSYSTEM } from "../data/ecosystem.js";
import { getDocsUrl } from "../site.config.js";
import { SITE_PACKAGES_COUNT } from "../data/site-data.generated.js";

export function EcosystemPage() {
  return (
    <PageShell
      kicker={
        <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
          <LightIcon name="boxes" className="size-5 text-primary" />
        </span>
      }
      title="The ecosystem"
      description={`${SITE_PACKAGES_COUNT} packages, one source of truth. Each package below is fully analyzed on its own page, with a direct link to the corresponding docs site entry.`}
    >
      {/* Package grid */}
      <section className="mx-auto max-w-5xl px-8 py-12">
        <Stagger delay={60}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM.map((entry, i) => (
              <Motion
                key={entry.slug}
                effect="fade"
                direction="up"
                staggerIndex={i}
                className="group cursor-pointer rounded-xl border border-border bg-card p-5 text-left transition-all hover:translate-y-[-2px] hover:shadow-lg"
              >
                <Link to={`/ecosystem/${entry.slug}`} className="block">
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
              </Motion>
            ))}
          </div>
        </Stagger>
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
