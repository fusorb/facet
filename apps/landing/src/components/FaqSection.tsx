import { Link } from "react-router-dom";
import { FaqSection as FacetFaqSection } from "@arcevo/facet-components";
import { LightIcon } from "@arcevo/facet-components/light";
import { FAQ } from "../data/features.js";
import { getDocsUrl } from "../lib/docs-url.js";

export function FaqSection() {
  return (
    <FacetFaqSection
      items={FAQ}
      title="FAQ"
      description="Quick answers to the questions consumers ask most."
      type="single"
      id="faq"
      className="mx-auto max-w-3xl px-8 py-24"
    >
      {/* Explore / feedback strip composed as children */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center sm:flex-row sm:gap-6">
        <a
          href={getDocsUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <LightIcon name="book-open" className="size-4" />
          Explore the docs for a deeper view
        </a>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <Link
          to="/feedback"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-foreground"
        >
          <LightIcon name="message-square" className="size-4" />
          Drop feedback or contact the maintainers
        </Link>
      </div>
    </FacetFaqSection>
  );
}
