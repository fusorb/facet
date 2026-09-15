/**
 * @fusorb/facet-components: FaqSection
 *
 * A ready-to-use FAQ section built on the Accordion primitive. Data-driven
 * with optional two-column layout and a "show more" reveal. Fully
 * customizable via props.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button } from "./button.js";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion.js";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FaqItem[];
  /** Optional heading above the list. */
  title?: string;
  /** Optional description under the title. */
  description?: string;
  /** Default open items (by index). Default: [] (all closed). */
  defaultOpen?: number[];
  /** Render the heading and list side-by-side on lg. Default: false. */
  split?: boolean;
  /** Accordion behavior. "multiple" (default) allows several open; "single" opens one at a time. */
  type?: "multiple" | "single";
  /** Optional tag (e.g. a Pill/Badge chip) rendered above the title. */
  tag?: React.ReactNode;
  /** Align the header block. Default: "left"; "center" centers tag/title/description. */
  align?: "left" | "center";
  /** Number of items shown initially; the rest are revealed by "Show more".
   *  Omit (or set to items.length) to render everything at once. */
  limit?: number;
  /** Label for the show-more button. Default: "Show more". */
  showMoreLabel?: string;
  /** Label for the show-less button. Default: "Show less". */
  showLessLabel?: string;
  /** Content rendered after the accordion (e.g. an explore / feedback strip). */
  children?: React.ReactNode;
}

/**
 * An FAQ section: a title (optional) and a stacked accordion of Q&A.
 * When `split` is set, the heading sits in a left column on lg screens.
 * Set `limit` to progressively reveal items (Google-style "load more").
 */
export function FaqSection({
  items,
  title,
  description,
  tag,
  align = "left",
  defaultOpen = [],
  split = false,
  type = "multiple",
  limit,
  showMoreLabel = "Show more",
  showLessLabel = "Show less",
  className,
  children,
  ...props
}: FaqSectionProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasMore = limit != null && items.length > limit;
  const visibleItems = hasMore && !expanded ? items.slice(0, limit) : items;

  const accordionItems = visibleItems.map((item, i) => (
    <AccordionItem
      key={i}
      value={String(i)}
      className={cn(
        "border rounded-lg bg-card shadow-sm [&:not(:first-child)]:mt-2",
        "sm:border-b sm:border-l-0 sm:border-r-0 sm:border-t-0 sm:rounded-none sm:bg-transparent sm:shadow-none sm:[&:not(:first-child)]:mt-0",
      )}
    >
      <AccordionTrigger className="gap-4 text-left font-medium">
        <span className="min-w-0">{item.q}</span>
      </AccordionTrigger>
      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
        {item.a}
      </AccordionContent>
    </AccordionItem>
  ));

  return (
    <section className={cn("w-full", className)} {...props}>
      <div
        className={cn(
          split && "lg:grid lg:grid-cols-[minmax(0,1fr)_2fr] lg:gap-12",
        )}
      >
        {(title || description || tag) && (
          <div
            className={cn(
              "mb-5 space-y-1",
              align === "center" && "text-center",
              split && "lg:mb-0",
            )}
          >
            {tag && <div>{tag}</div>}
            {title && (
              <h3 className="font-heading text-2xl font-semibold text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  align === "center" && "mx-auto max-w-2xl",
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <div>
          {type === "single" ? (
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultOpen[0]?.toString()}
            >
              {accordionItems}
            </Accordion>
          ) : (
            <Accordion type="multiple" defaultValue={defaultOpen.map(String)}>
              {accordionItems}
            </Accordion>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
              >
                {expanded ? showLessLabel : showMoreLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}

FaqSection.displayName = "FaqSection";
