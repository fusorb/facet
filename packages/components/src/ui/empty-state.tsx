/**
 * @category feedback
 * @summary Empty State
 */
import * as React from "react";
import { cn } from "../utils.js";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional icon element (e.g. lucide <Inbox /> or <Icon name="document" />). */
  icon?: React.ReactNode;
  /** Main heading. */
  title: string;
  /** Supporting description. */
  description?: string;
  /** Action area, e.g. a <Button>. */
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon && <div className="mb-1 text-muted-foreground">{icon}</div>}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
