import { Link as RouterLink } from "react-router-dom";
import { Footer as FacetFooter } from "@fusorb/facet-components";
import type {
  FooterSocial,
  FooterLink,
  FooterColumn,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { site, getDocsUrl } from "../site.config.js";

const SOCIALS: FooterSocial[] = site.socials;

const FOOTER_LINKS: FooterLink[] = [
  { label: "Feedback", href: "/feedback", icon: "mail" },
  { label: "GitHub", href: site.links.github, icon: "github" },
  { label: "Documentation", href: getDocsUrl(), icon: "book-open" },
];

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Ecosystem", href: "/ecosystem" },
      { label: "Component catalog", href: "/components" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security surfaces", href: "/security" },
      { label: "Console demo", href: "/dashboard-demo" },
    ],
  },
  {
    title: "Lab",
    links: [
      { label: "Auth Lab", href: "/lab/auth" },
      { label: "Motion Lab", href: "/lab/motion" },
      { label: "Token Explorer", href: "/lab/tokens" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "#faq" },
      { label: "Feedback", href: "/feedback" },
      { label: "Documentation", href: getDocsUrl() },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Install", href: "#install" },
      { label: "GitHub", href: site.links.github },
    ],
  },
];

export function Footer() {
  return (
    <FacetFooter
      variant="columns"
      brand={{
        name: site.brand.name,
        tagline: site.brand.tagline,
      }}
      columns={FOOTER_COLUMNS}
      socials={SOCIALS}
      bottomLinks={FOOTER_LINKS}
      legal={`© ${new Date().getFullYear()} ${site.brand.name}. MIT License.`}
      renderLink={(link) => {
        const isExternal = /^https?:\/\//.test(link.href);
        if (isExternal) {
          return (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          );
        }
        if (link.href.startsWith("#")) {
          // Native fragment navigation scrolls to the section in-place.
          return (
            <a
              href={link.href}
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          );
        }
        return (
          <RouterLink
            to={link.href}
            className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </RouterLink>
        );
      }}
      socialArea={
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={/^https?:\/\//.test(link.href) ? "_blank" : undefined}
                rel={/^https?:\/\//.test(link.href) ? "noreferrer" : undefined}
                className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <LightIcon name={link.icon ?? "mail"} size={14} />
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Feedback:{" "}
            <a
              href={`mailto:${site.feedbackEmail}`}
              className="cursor-pointer hover:text-foreground"
            >
              {site.feedbackEmail}
            </a>
          </p>
        </div>
      }
    />
  );
}
