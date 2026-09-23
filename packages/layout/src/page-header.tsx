/**
 * @fusorb/facet-layout: PageHeader
 *
 * Consistent page title + description + actions slot.
 */

import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Customize the title element. Receives the title; defaults to a <h1>. */
  renderTitle?: (title: string) => ReactNode;
  /** Customize the description element. Receives the description; defaults to a <p>. */
  renderDescription?: (description: string) => ReactNode;
}

/** Default title: a styled <h1>. */
function DefaultTitle({ title }: { title: string }) {
  return <h1 className="text-2xl font-bold text-foreground">{title}</h1>;
}

/** Default description: a styled <p>. */
function DefaultDescription({
  description,
}: {
  description: string;
}) {
  return (
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  renderTitle,
  renderDescription,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        {renderTitle ? renderTitle(title) : <DefaultTitle title={title} />}
        {description &&
          (renderDescription
            ? renderDescription(description)
            : <DefaultDescription description={description} />)}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
