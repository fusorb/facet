import { Button, SparkleButton } from "@fusorb/facet-components";
import { getDocsUrl } from "../lib/docs-url.js";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <div className="glass-card rounded-2xl p-12 lg:p-16">
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Build something people love to use
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
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
            onClick={() => window.open("https://github.com/fusorb/facet")}
          >
            Star on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}
