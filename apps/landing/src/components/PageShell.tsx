import type { ReactNode } from "react";
import { LandingLayout } from "@fusorb/facet-layout";
import { Nav } from "./Nav.js";
import { Footer } from "./Footer.js";
import { BrandMark } from "./Brand.js";

/**
 * Shared chrome for subpages: every routed page gets the same navbar,
 * footer, and a consistent hero header built from its title.
 */
export function PageShell({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <LandingLayout
      nav={<Nav />}
      footer={<Footer />}
      hero={
        <div className="mx-auto max-w-3xl text-center">
          {kicker ?? <BrandMark className="mx-auto h-10 w-10 text-lg" />}
          {title && (
            <h1 className="mt-4 font-heading text-4xl font-bold text-foreground sm:text-5xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          )}
        </div>
      }
    >
      {children}
    </LandingLayout>
  );
}
