import { Link } from "react-router-dom";
import {
  FaqSection as FacetFaqSection,
  Pill,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { FAQ } from "../../data/faq.js";
import { getDocsUrl } from "../../site.config.js";
import { useDomain } from "../../lib/domain-context.js";

export function FaqSection() {
  const { domain } = useDomain();
  const { faqSection } = domain;

  return (
    <FacetFaqSection
      items={FAQ}
      tag={
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name={faqSection.labelIcon} size={12} />}
        >
          {faqSection.label}
        </Pill>
      }
      title={faqSection.title}
      description={faqSection.subtitle}
      align="center"
      type="single"
      limit={6}
      id="faq"
      className="mx-auto max-w-3xl px-8 py-24"
    >
      {/* Explore / feedback strip composed as children */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center sm:flex-row sm:gap-6">
        <a
          href={getDocsUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <LightIcon name="book-open" className="size-4" />
          Explore the docs for a deeper view
        </a>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <Link
          to="/feedback"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-foreground"
        >
          <LightIcon name="message-square" className="size-4" />
          Drop feedback or contact the maintainers
        </Link>
      </div>
    </FacetFaqSection>
  );
}
