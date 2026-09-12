import { Footer as FacetFooter } from "@fusorb/facet-components";
import type { FooterSocial, FooterLink, FooterColumn } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { CONTACT } from "../lib/socials.js";
import { getDocsUrl } from "../lib/docs-url.js";

const SOCIALS: FooterSocial[] = [
  { label: "LinkedIn", href: CONTACT.linkedin, icon: "linkedin" },
  { label: "Instagram", href: CONTACT.instagram, icon: "instagram" },
  { label: "Facebook", href: CONTACT.facebook, icon: "facebook" },
  { label: "TikTok", href: CONTACT.tiktok, icon: "tiktok" },
];

const FOOTER_LINKS: FooterLink[] = [
  { label: "Feedback", href: "/feedback", icon: "mail" },
  { label: "GitHub", href: "https://github.com/fusorb/facet", icon: "github" },
  { label: "Documentation", href: getDocsUrl(), icon: "book-open" },
];

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Packages", href: "#packages" },
      { label: "Features", href: "#features" },
      { label: "Demo", href: "#demo" },
      { label: "Console demo", href: "/dashboard-demo" },
      { label: "Security surfaces", href: "/security" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Components", href: "/ecosystem/components" },
      { label: "Auth", href: "/ecosystem/auth" },
      { label: "Layout", href: "/ecosystem/layout" },
      { label: "Tokens", href: "/ecosystem/tokens" },
      { label: "Docs Package", href: "/ecosystem/docs-package" },
      { label: "CLI", href: "/ecosystem/cli" },
      { label: "Emails", href: "/ecosystem/emails" },
      { label: "SDK", href: "/ecosystem/sdk" },
      { label: "Store", href: "/ecosystem/store" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Console demo", href: "/dashboard-demo" },
      { label: "Security surfaces", href: "/security" },
      { label: "Free forever", href: "/pricing" },
      { label: "FAQ", href: "#faq" },
      { label: "Feedback", href: "/feedback" },
      { label: "Documentation", href: getDocsUrl() },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Install", href: "#install" },
      { label: "GitHub", href: "https://github.com/fusorb/facet" },
    ],
  },
];

export function Footer() {
  return (
    <FacetFooter
      variant="columns"
      brand={{
        name: "facet",
        tagline: "Component library for the Arcevo ecosystem",
      }}
      columns={FOOTER_COLUMNS}
      socials={SOCIALS}
      bottomLinks={FOOTER_LINKS}
      legal={`© ${new Date().getFullYear()} facet. MIT License.`}
      socialArea={
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={/^https?:\/\//.test(link.href) ? "_blank" : undefined}
                rel={/^https?:\/\//.test(link.href) ? "noreferrer" : undefined}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <LightIcon name={link.icon ?? "mail"} size={14} />
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Feedback:{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="hover:text-foreground"
            >
              {CONTACT.email}
            </a>
            {" "}· WhatsApp:{" "}
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              <LightIcon name="whatsapp" size={12} className="inline" /> Chat
            </a>
          </p>
          <div className="flex items-center gap-4">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <LightIcon name={social.icon} size={16} />
              </a>
            ))}
          </div>
        </div>
      }
    />
  );
}
