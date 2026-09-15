import * as React from "react";
import { Link } from "react-router-dom";

export interface GuidePageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Optional back link rendered above the title (e.g. "← Components"). */
  back?: { label: string; to: string };
}

/** Shared guide page header + prose wrapper. */
export function GuidePage({
  title,
  description,
  children,
  back,
}: GuidePageProps) {
  return (
    <article>
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 4L6 8L10 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {back.label}
        </Link>
      )}
      <h1 className="font-heading text-3xl font-bold text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
      <div className="prose-docs mt-6 space-y-5 text-sm leading-7 text-foreground/90">
        {children}
      </div>
    </article>
  );
}

/** Inline markdown-ish renderer: `code`, **bold**, and [link](href). */
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return <Code key={i}>{part.slice(1, -1)}</Code>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link?.[1] && link?.[2]) {
          return (
            <Link
              key={i}
              to={link[2]}
              className="text-primary underline-offset-4 hover:underline"
            >
              {link[1]}
            </Link>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

/** Small inline code span. */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
      {children}
    </code>
  );
}

/** Block code sample. */
export function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-[13px] leading-6 text-foreground">
      {children}
    </pre>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-4 font-heading text-xl font-semibold text-foreground">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  if (typeof children === "string")
    return (
      <p>
        <InlineText text={children} />
      </p>
    );
  return <p>{children}</p>;
}

export function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
}

export function Li({ children }: { children: React.ReactNode }) {
  if (typeof children === "string")
    return (
      <li>
        <InlineText text={children} />
      </li>
    );
  return <li>{children}</li>;
}

/** Bottom prev/next navigation for docs pages. */
export function PageNav({
  prev,
  next,
}: {
  prev?: { label: string; to: string };
  next?: { label: string; to: string };
}) {
  return (
    <nav
      aria-label="Page navigation"
      className="mt-10 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          to={prev.to}
          className="group flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-accent/40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          >
            <path
              d="M10 4L6 8L10 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">
              Previous
            </span>
            <span className="block truncate text-sm font-medium text-foreground">
              {prev.label}
            </span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={next.to}
          className="group flex items-center justify-end gap-3 rounded-lg border border-border px-4 py-3 text-right transition-colors hover:border-primary/50 hover:bg-accent/40"
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Next</span>
            <span className="block truncate text-sm font-medium text-foreground">
              {next.label}
            </span>
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
