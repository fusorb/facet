import * as React from "react";
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  GithubIcon,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@fusorb/facet-components";
import type { NavLink, NavbarRouter } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { site, getDocsUrl } from "../site.config.js";
import { pages } from "../pages.js";
import { Wordmark } from "./Brand.js";

/** Nav links derived from the pages registry + in-page anchors.
 *  Built lazily (not at module scope) so importing this module never
 *  triggers a circular-init crash: `pages` imports the page components,
 *  and those components import Nav back. */
function getLinks(): NavLink[] {
  return [
  {
    href: "#product",
    label: "Product",
    children: pages
      .filter((p) => p.navGroup === "product")
      .map((p) => ({
        href: p.path,
        label: p.title,
        description: p.description,
      })),
  },
  {
    href: "#resources",
    label: "Resources",
    children: [
      ...pages
        .filter((p) => p.navGroup === "resources")
        .map((p) => ({
          href: p.path,
          label: p.title,
          description: p.description,
        })),
      {
        href: "#faq",
        label: "FAQ",
        description: "Quick answers to common questions",
      },
    ],
  },
  {
    href: "#developers",
    label: "Developers",
    children: [
      {
        href: "#install",
        label: "Install",
        description: "Get started in minutes",
      },
      {
        href: site.links.github,
        label: "GitHub",
        description: "Source, issues, and releases",
        icon: <GithubIcon size={14} />,
      },
    ],
  },
  ];
}

function Brand({ onHome }: { onHome: () => void }) {
  return (
    <button
      type="button"
      onClick={onHome}
      className="flex cursor-pointer items-center gap-2.5"
      aria-label={`${site.brand.name} home`}
    >
      <Wordmark />
    </button>
  );
}

/** Mobile menu: grouped accordion sections + GitHub + docs. */
function MobileMenu({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      {getLinks().map((link) => {
        if (link.children?.length) {
          const isOpen = openGroup === link.href;
          return (
            <div key={link.href} className="flex flex-col">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : link.href)}
                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
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
                    <button
                      key={child.href}
                      type="button"
                      onClick={() => onNavigate(child.href)}
                      className="flex cursor-pointer flex-col items-start gap-0.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        {child.icon}
                        {child.label}
                      </span>
                      {child.description && (
                        <span className="text-xs text-muted-foreground">
                          {child.description}
                        </span>
                      )}
                    </button>
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
            onClick={() => onNavigate(link.href)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          >
            {link.label}
          </button>
        );
      })}

      <div className="my-1 h-px bg-border" />
      <a
        href={site.links.github}
        target="_blank"
        rel="noreferrer"
        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
      >
        <GithubIcon size={16} />
        GitHub
      </a>
      <button
        type="button"
        onClick={() => window.open(getDocsUrl())}
        className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
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
  // scroll in-page; real routes navigate via the router.
  const handleNav = (href: string) => {
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document
            .getElementById(href.slice(1))
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document
          .getElementById(href.slice(1))
          ?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  const router: NavbarRouter = {
    Link: RouterLink as unknown as React.ComponentType<{
      href: string;
      className?: string;
      onClick?: (event: React.MouseEvent) => void;
      children?: React.ReactNode;
      "aria-current"?: "page" | undefined;
    }>,
    isActive: (href: string) => {
      if (href === "/") return location.pathname === "/";
      return (
        location.pathname === href || location.pathname.startsWith(`${href}/`)
      );
    },
  };

  return (
    <Navbar
      variant="pill"
      brand={<Brand onHome={() => handleNav("/")} />}
      links={getLinks()}
      onNavigate={handleNav}
      router={router}
      mobileMenu={<MobileMenu onNavigate={handleNav} />}
      mobileBreakpoint="lg"
      hoverDropdowns
      showThemeToggle
      actions={
        <div className="flex items-center gap-2">
          <a
            href={site.links.github}
            target="_blank"
            rel="noreferrer"
            className="hidden cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
                  aria-label="Browse components"
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
