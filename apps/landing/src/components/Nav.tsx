import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@arcevo/facet-components";
import { LightIcon } from "@arcevo/facet-components/light";
import type { NavLink } from "@arcevo/facet-components";
import { getDocsUrl } from "../lib/docs-url.js";
import { GithubIcon } from "./BrandIcons.js";

/**
 * Navigation links grouped into dropdown sections.
 * Top-level entries with `children` render as dropdown menus on desktop;
 * leaf links (About) render as direct nav items.
 */
const LINKS: NavLink[] = [
  {
    href: "#product",
    label: "Product",
    children: [
      { href: "/about#packages", label: "Packages", icon: <LightIcon name="boxes" size={14} /> },
      { href: "/about#features", label: "Features", icon: <LightIcon name="sparkles" size={14} /> },
      { href: "#demo", label: "Demo", icon: <LightIcon name="layout-dashboard" size={14} /> },
      { href: "/about#roadmap", label: "Roadmap", icon: <LightIcon name="compass" size={14} /> },
    ],
  },
  {
    href: "#resources",
    label: "Resources",
    children: [
      { href: "/dashboard-demo", label: "Console demo", icon: <LightIcon name="layout-dashboard" size={14} /> },
      { href: "/security", label: "Security surfaces", icon: <LightIcon name="shield-check" size={14} /> },
      { href: "/pricing", label: "Free forever", icon: <LightIcon name="credit-card" size={14} /> },
      { href: "#faq", label: "FAQ", icon: <LightIcon name="circle-question-mark" size={14} /> },
      { href: "/feedback", label: "Feedback", icon: <LightIcon name="message-circle" size={14} /> },
    ],
  },
  {
    href: "#developers",
    label: "Developers",
    children: [
      {
        href: "#install",
        label: "Install",
        description: "Get started in 5 minutes",
        icon: <LightIcon name="terminal" size={14} />,
      },
    ],
  },
  {
    href: "/ecosystem",
    label: "Ecosystem",
    children: [
      { href: "/ecosystem/components", label: "Components", icon: <LightIcon name="boxes" size={14} /> },
      { href: "/ecosystem/auth", label: "Auth", icon: <LightIcon name="shield-check" size={14} /> },
      { href: "/ecosystem/layout", label: "Layout", icon: <LightIcon name="building" size={14} /> },
      { href: "/ecosystem/tokens", label: "Tokens", icon: <LightIcon name="palette" size={14} /> },
      { href: "/ecosystem/docs-package", label: "Docs Package", icon: <LightIcon name="book-open" size={14} /> },
      { href: "/ecosystem/cli", label: "CLI", icon: <LightIcon name="terminal" size={14} /> },
      { href: "/ecosystem/emails", label: "Emails", icon: <LightIcon name="mail" size={14} /> },
      { href: "/ecosystem/sdk", label: "SDK", icon: <LightIcon name="zap" size={14} /> },
      { href: "/ecosystem/store", label: "Store", icon: <LightIcon name="store" size={14} /> },
      { href: "/ecosystem/stack-agnosticism", label: "Stack Agnosticism", icon: <LightIcon name="globe" size={14} /> },
    ],
  },
  { href: "/about", label: "About" },
];

function Brand({ onHome }: { onHome: () => void }) {
  return (
    <button
      type="button"
      onClick={onHome}
      className="flex items-center gap-2.5"
      aria-label="facet home"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/50 ring-1 ring-border">
        <img src="/facet-b&w.png" alt="" aria-hidden="true" className="h-4 w-auto opacity-90 dark:brightness-0 dark:invert" />
      </span>
      <span className="font-heading text-lg font-bold text-foreground">facet</span>
    </button>
  );
}

function MobileMenu({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      {LINKS.map((link) => {
        if (link.children?.length) {
          const isOpen = openGroup === link.href;
          return (
            <div key={link.href} className="flex flex-col">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : link.href)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                aria-expanded={isOpen}
              >
                <span>{link.label}</span>
                <LightIcon
                  name="chevron-down"
                  size={14}
                  className={`text-muted-foreground/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="ml-4 flex flex-col gap-0.5 border-l pl-4">
                  {link.children.map((child) => (
                    <>
                      <button
                        key={child.href}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(child.href);
                        }}
                        className="flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <span className="flex items-center gap-2">
                          {child.icon}
                          {child.label}
                        </span>
                        {child.description && (
                          <span className="text-xs text-muted-foreground">{child.description}</span>
                        )}
                      </button>
                    </>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={link.href}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.href);
            }}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          >
            {link.label}
          </button>
        );
      })}

      <div className="my-1 h-px bg-border" />
      <a
        href="https://github.com/arcevodev/facet"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
      >
        <GithubIcon size={16} />
        GitHub
      </a>
      <button
        type="button"
        onClick={() => window.open(getDocsUrl())}
        className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
      >
        Browse components
      </button>
    </div>
  );
}

export function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Single handler for all Navbar links (desktop + mobile). Hash anchors
  // scroll in-page; real routes navigate via the router. Path+hash links
  // (e.g. /about#packages) navigate first, then scroll to the section.
  const handleNav = (href: string) => {
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      const hashIndex = href.indexOf("#");
      if (hashIndex > 0) {
        const hash = href.slice(hashIndex + 1);
        navigate(href);
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        navigate(href);
      }
    }
  };

  return (
    <Navbar
      variant="pill"
      brand={<Brand onHome={() => handleNav("/")} />}
      links={LINKS}
      onNavigate={handleNav}
      mobileMenu={<MobileMenu onNavigate={handleNav} />}
      mobileBreakpoint="lg"
      hoverDropdowns
      showThemeToggle
      actions={
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/arcevodev/facet"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="hidden h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
                  aria-label="Browse components"
                  title="Browse components"
                  onClick={() => window.open(getDocsUrl())}
                >
                  <LightIcon name="grid" size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Browse components</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    />
  );
}
