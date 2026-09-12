/**
 * @fusorb/facet-components: PageHeader
 *
 * A page header: breadcrumb trail (optional), title, description, and
 * actions. Composes the Breadcrumb primitive. Fully customizable.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb.js";

export interface PageHeaderCrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  /** Optional description under the title. */
  description?: string;
  /** Optional breadcrumb trail. */
  crumbs?: PageHeaderCrumb[];
  /** Actions rendered on the right (buttons, etc). */
  actions?: React.ReactNode;
  /** Layout: "default" (stacked) or "row" (title + actions inline on lg). */
  layout?: "default" | "row";
}

/**
 * A page header with breadcrumb trail, title, description, and actions.
 * Used at the top of pages to give context and a home for primary actions.
 */
export function PageHeader({
  title,
  description,
  crumbs,
  actions,
  layout = "row",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {crumbs && crumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <React.Fragment key={i}>
                  <BreadcrumbItem>
                    {last ? (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    ) : c.href ? (
                      <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
                    ) : (
                      <span className="text-sm text-muted-foreground">{c.label}</span>
                    )}
                  </BreadcrumbItem>
                  {!last && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div
        className={cn(
          "flex flex-col gap-3",
          layout === "row" ? "lg:flex-row lg:items-end lg:justify-between" : "",
        )}
      >
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

PageHeader.displayName = "PageHeader";
