/**
 * @fusorb/facet-layout: AuthLayout
 *
 * Auth page shell: split panel on desktop, centered card on mobile.
 * Used for login, register, MFA, forgot-password pages.
 * Configurable via LayoutConfig.brand.
 *
 * Named AuthLayout (formerly AppLayout) so its purpose is unambiguous:
 * it is the branded auth page frame, not a general app shell. See
 * ConsoleLayout for the dashboard shell and LandingLayout for marketing.
 */

import * as React from "react";
import type { LayoutConfig } from "./types.js";

export interface AuthLayoutProps {
  config: LayoutConfig;
  children: React.ReactNode;
  /**
   * Fully replaces the left (desktop) brand panel content. Use this to
   * drop in anything: an image slideshow, video, Lottie animation, or a
   * custom branded hero. When omitted, the panel renders the standard
   * config-driven layout (logo + tagline + benefits from `config.brand`).
   */
  brandPanel?: React.ReactNode;
  /** Class applied to the left panel wrapper (custom bg/image, etc.). */
  brandPanelClassName?: string;
}

export function AuthLayout({ config, children, brandPanel, brandPanelClassName }: AuthLayoutProps) {
  const { brand } = config;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel: hidden below lg. Theme-token driven by default
          (bg-primary + text-primary-foreground), fully overridable via
          brandPanelClassName / brandPanel. */}
      <div
        className={
          brandPanelClassName ??
          "hidden flex-col justify-between bg-primary p-8 lg:flex lg:w-1/2"
        }
      >
        {brandPanel ? (
          brandPanel
        ) : (
          <>
            <div className="flex flex-col gap-8">
              {/* Logo + Name */}
              <div className="flex items-center gap-3">
                {brand.logo ?? (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-primary-foreground/80"
                  >
                    <path
                      d="M12 2L4 6V12C4 17.52 7.58 22.48 12 24C16.42 22.48 20 17.52 20 12V6L12 2Z"
                      fill="currentColor"
                      opacity="0.8"
                    />
                    <path
                      d="M12 6L8 8V12C8 14.5 9.67 16.8 12 17.5C14.33 16.8 16 14.5 16 12V8L12 6Z"
                      fill="currentColor"
                      opacity="0.4"
                    />
                  </svg>
                )}
                <span className="font-heading text-2xl font-bold text-primary-foreground">
                  {brand.name}
                </span>
              </div>

              {/* Tagline */}
              {brand.tagline && (
                <p className="text-lg text-primary-foreground/80">{brand.tagline}</p>
              )}

              {/* Benefits */}
              {brand.benefits && brand.benefits.length > 0 && (
                <div className="space-y-4">
                  {brand.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-primary-foreground/80"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-primary-foreground/70">{benefit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {brand.footerText && (
              <p className="text-xs text-primary-foreground/60">{brand.footerText}</p>
            )}
          </>
        )}
      </div>

      {/* Right panel: centered card */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 lg:p-8">
        {/* Mobile logo (hidden on lg+). Suppressed when a custom brandPanel
            replaces the left panel - the consumer owns the brand story then. */}
        {!brandPanel && (
          <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path
                d="M12 2L4 6V12C4 17.52 7.58 22.48 12 24C16.42 22.48 20 17.52 20 12V6L12 2Z"
                fill="currentColor"
                opacity="0.8"
              />
              <path
                d="M12 6L8 8V12C8 14.5 9.67 16.8 12 17.5C14.33 16.8 16 14.5 16 12V8L12 6Z"
                fill="currentColor"
                opacity="0.4"
              />
            </svg>
            <h1 className="text-xl font-bold text-foreground">{brand.name}</h1>
            {brand.tagline && <p className="text-sm text-muted-foreground">{brand.tagline}</p>}
          </div>
        )}

        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">{children}</div>
      </div>
    </div>
  );
}

/**
 * @deprecated Renamed to AuthLayout so its role as the branded auth
 * page shell is unambiguous. This alias will be removed in a future
 * major version.
 */
export const AppLayout = AuthLayout;
