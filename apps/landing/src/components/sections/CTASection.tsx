import { Button, Pill, SparkleButton } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { site, getDocsUrl } from "../../site.config.js";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <div className="glass-card rounded-2xl p-12 lg:p-16">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name="sparkles" size={12} />}
        >
          Get started
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Build something people love to use
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          The components are free. Your time is not. Start with the essentials.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <SparkleButton
            label="Browse components"
            onClick={() => window.open(getDocsUrl())}
            className="h-11 px-8"
          />
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open(site.links.github)}
          >
            Star on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}
