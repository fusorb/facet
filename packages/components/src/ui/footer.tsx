/**
 * @arcevo/facet-components: Footer
 *
 * A dynamic, fully customizable site footer. Everything is config-driven:
 * brand block, link columns, social icons, bottom-bar links, and legal
 * text. Use it in place of ad-hoc footers (landing, docs, consumer apps).
 *
 * Usage:
 *   <Footer
 *     brand={{ name: "facet", tagline: "The Arcevo UI system" }}
 *     columns={[
 *       { title: "Product", links: [{ label: "Components", href: "#" }] },
 *     ]}
 *     socials={[
 *       { label: "GitHub", href: "https://github.com/arcevodev", icon: "github" },
 *     ]}
 *     bottomLinks={[{ label: "Feedback", href: "/feedback" }]}
 *     legal={`© ${new Date().getFullYear()} facet. MIT License.`}
 *   />
 *
 * For full control, pass `bottomBar` / `socialArea` / `children` as
 * ReactNode overrides.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Separator } from "./separator.js";
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Icon, type IconName } from "../icon/index.js";

export interface FooterLink {
  label: string;
  href: string;
  /** Open in a new tab. Default: false for internal, true for http(s). */
  external?: boolean;
  /** Optional icon name (resolved through the Icon registry). */
  icon?: IconName;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSocial {
  /** Accessible label, e.g. "GitHub". */
  label: string;
  href: string;
  /** Semantic icon name resolved through the Icon registry. */
  icon: IconName;
}

/** A numbered step for the "how it works" / steps grid. */
export interface FooterStep {
  number: string;
  label: string;
  description?: string;
}

export interface FooterNewsletter {
  /** Newsletter title. Default: "Stay in the loop". */
  title?: string;
  /** Description under the title. */
  description?: string;
  /** Input placeholder. Default: "you@example.com". */
  inputPlaceholder?: string;
  /** Submit button label. Default: "Subscribe". */
  buttonLabel?: string;
  /** Called with the entered email. When omitted, renders a mailto fallback. */
  onSubmit?: (email: string) => void;
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Layout variant. Default: "default" (unchanged behavior). */
  variant?: "default" | "minimal" | "columns" | "newsletter" | "split" | "streamline";
  /** Brand block: name, optional logo element, tagline. */
  brand?: {
    name?: string;
    logo?: React.ReactNode;
    tagline?: string;
  };
  /** Link columns rendered in the middle section. */
  columns?: FooterColumn[];
  /** Social icon links in the bottom bar. */
  socials?: FooterSocial[];
  /** Bottom-bar text links (e.g. Feedback, Status, Privacy). */
  bottomLinks?: FooterLink[];
  /** Legal / copyright text in the bottom bar. */
  legal?: string;
  /** Replace the entire bottom bar (overrides legal + bottomLinks + socials). */
  bottomBar?: React.ReactNode;
  /** Override the bottom bar's social + links section (keeps the bar's border/layout). */
  socialArea?: React.ReactNode;
  /** Extra content rendered below the columns (newsletter, CTAs, ...). */
  children?: React.ReactNode;
  /** Newsletter capture slot (used by the "newsletter" variant). */
  newsletter?: FooterNewsletter;
  /** Research notices, cookie-consent callouts, or other alert blocks. */
  notices?: React.ReactNode[];
  /** Optional "how it works" steps shown below columns (streamline variant). */
  steps?: FooterStep[];
  /** Max content width class. Default: "max-w-7xl". */
  containerClassName?: string;
  /**
   * Custom link renderer for SPA-compatible navigation (e.g. react-router
   * `<Link>`). Receives a `FooterLink` and should return a link element.
   * When omitted, a plain `<a href>` is used.
   */
  renderLink?: (link: FooterLink) => React.ReactNode;
}

/** Auto-detect external links unless explicitly set. */
function isExternal(link: FooterLink): boolean {
  if (link.external !== undefined) return link.external;
  return /^https?:\/\//.test(link.href);
}

/** Brand block: logo + name + tagline. */
function FooterBrand({ brand }: { brand: FooterProps["brand"] }) {
  if (!brand?.name && !brand?.logo) return null;
  return (
    <div className="max-w-sm">
      <div className="flex items-center gap-2">
        {brand?.logo}
        {brand?.name && (
          <span className="font-heading text-lg font-bold text-foreground">{brand.name}</span>
        )}
      </div>
      {brand?.tagline && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{brand.tagline}</p>
      )}
    </div>
  );
}

/** Link columns. */
function FooterColumns({
  columns,
  renderLink,
}: { columns: FooterColumn[]; renderLink?: (link: FooterLink) => React.ReactNode }) {
  if (!columns.length) return null;
  return columns.map((col) => (
    <div key={col.title}>
      <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
      <ul className="mt-4 space-y-3">
        {col.links.map((link) => (
          <li key={link.label + link.href}>
            {renderLink ? (
              renderLink(link)
            ) : (
              <a
                href={link.href}
                target={isExternal(link) ? "_blank" : undefined}
                rel={isExternal(link) ? "noreferrer" : undefined}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  ));
}

/** Bottom bar: legal + bottom links + socials. */
function FooterBottomBar({
  legal,
  bottomLinks = [],
  socials = [],
  bottomBar,
  socialArea,
  renderLink,
  className,
}: Pick<FooterProps, "legal" | "bottomLinks" | "socials" | "bottomBar" | "socialArea" | "renderLink"> & {
  className?: string;
}) {
  if (bottomBar) return bottomBar;
  return (
    <div
      className={cn(
        "mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row",
        className,
      )}
    >
      {legal && <p className="text-sm text-muted-foreground">{legal}</p>}
      {socialArea ?? (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {bottomLinks.map((link) => (
          <span key={link.label + link.href}>
            {renderLink ? (
              renderLink(link)
            ) : (
              <a
                href={link.href}
                target={isExternal(link) ? "_blank" : undefined}
                rel={isExternal(link) ? "noreferrer" : undefined}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            )}
          </span>
        ))}
        {socials.length > 0 && (
          <span className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon name={social.icon} className="size-4" />
              </a>
            ))}
          </span>
        )}
      </div>
      )}
    </div>
  );
}

/** Newsletter capture slot (newsletter variant). */
function FooterNewsletter({ newsletter }: { newsletter: FooterNewsletter }) {
  const [email, setEmail] = React.useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletter.onSubmit) newsletter.onSubmit(email);
    else window.location.href = `mailto:?subject=${encodeURIComponent(newsletter.title ?? "Newsletter")}&body=${encodeURIComponent(email)}`;
  };
  return (
    <form onSubmit={submit} className="mt-10 flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          {newsletter.title ?? "Stay in the loop"}
        </h3>
        {newsletter.description && (
          <p className="mt-1 text-sm text-muted-foreground">{newsletter.description}</p>
        )}
      </div>
      <div className="flex w-full max-w-sm gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={newsletter.inputPlaceholder ?? "you@example.com"}
          className="flex-1"
        />
        <Button type="submit" variant="default" className="shrink-0">
          {newsletter.buttonLabel ?? "Subscribe"}
        </Button>
      </div>
    </form>
  );
}

/** How-it-works steps grid (streamline variant). */
function FooterSteps({ steps }: { steps: FooterStep[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <div key={step.label}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm font-bold">
            {step.number}
          </div>
          <h4 className="mt-3 text-sm font-semibold text-foreground">{step.label}</h4>
          {step.description && (
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Notice / alert blocks (research notices, cookie consent, etc.). */
function FooterNotices({ notices }: { notices: React.ReactNode[] }) {
  return (
    <div className="flex flex-col gap-3">
      {notices.map((notice, i) => (
        <div
          key={i}
          className="text-xs text-muted-foreground"
        >
          {notice}
        </div>
      ))}
    </div>
  );
}

export function Footer({
  variant = "default",
  brand,
  columns = [],
  socials = [],
  bottomLinks = [],
  legal,
  bottomBar,
  socialArea,
  children,
  newsletter,
  notices,
  steps,
  className,
  containerClassName = "max-w-7xl",
  renderLink,
  ...props
}: FooterProps) {
  return (
    <footer className={cn("w-full", className)} {...props}>
      <div className={cn("mx-auto w-full px-6 py-12 md:px-8", containerClassName)}>
        <Separator className="mb-10" />

        {variant === "minimal" && (
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <FooterBrand brand={brand} />
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon name={social.icon} className="size-4" />
                </a>
              ))}
            </div>
          </div>
        )}

        {variant === "split" && (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <FooterBrand brand={brand} />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <FooterColumns columns={columns} renderLink={renderLink} />
            </div>
          </div>
        )}

        {(variant === "default" || variant === "columns" || variant === "newsletter") && (
          <div
            className={
              variant === "default"
                ? "grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(auto-fit,minmax(140px,1fr))]"
                : "grid gap-10 md:grid-cols-[minmax(0,1fr)_repeat(auto-fit,minmax(160px,1fr))]"
            }
          >
            <FooterBrand brand={brand} />
            <FooterColumns columns={columns} renderLink={renderLink} />
          </div>
        )}

        {variant === "newsletter" && newsletter && <FooterNewsletter newsletter={newsletter} />}

        {variant === "streamline" && (
          <div className="mt-10 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <FooterColumns columns={columns} renderLink={renderLink} />
          </div>
        )}

        {variant === "streamline" && steps && <FooterSteps steps={steps} />}

        {/* Notices (research notices, cookie consent, etc.) */}
        {notices && <FooterNotices notices={notices} />}

        {/* Extra content (CTAs, etc.) */}
        {children}

        {/* Bottom bar */}
        <FooterBottomBar
          legal={legal}
          bottomLinks={bottomLinks}
          socials={socials}
          bottomBar={bottomBar}
          socialArea={socialArea}
          renderLink={renderLink}
        />
      </div>
    </footer>
  );
}
