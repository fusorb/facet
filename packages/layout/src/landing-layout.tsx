/**
 * @fusorb/facet-layout: LandingLayout
 *
 * Full-bleed marketing/landing page shell.
 * Glassmorphic hero section, glow CTAs, text-gradient headings.
 * Uses tokens.css utility classes (glass-card, glow-primary, text-gradient).
 */

import type { ReactNode } from "react";
import { cn } from "@fusorb/facet-components";

export interface LandingLayoutProps {
  /** Hero section content */
  hero: ReactNode;
  /** Feature/content sections */
  children: ReactNode;
  /** Navigation bar content (brand logo, CTA button, etc.) */
  nav?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Extra classes merged onto the root element. */
  className?: string;
}

export function LandingLayout({
  hero,
  children,
  nav,
  footer,
  className,
}: LandingLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {/* Top nav. Rendered as-is so the consumer owns positioning:
          the Navbar component's sticky/pill variants handle their own
          top offset, width, and backdrop. */}
      {nav}

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient glow */}
        <div
          className="pointer-events-none absolute -inset-40 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, var(--hero-glow), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-8 py-16 lg:py-24">
          {hero}
        </div>
      </section>

      {/* Content sections */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
