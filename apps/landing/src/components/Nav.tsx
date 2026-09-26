import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Navbar,
  GithubIcon,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@fusorb/facet-components";
import type { NavLink, NavbarRouter } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { site, getDocsUrl, getDocsChangelogUrl } from "../site.config.js";
import { pages } from "../pages.js";
import { SITE_PACKAGES_COUNT } from "../data/site-data.generated.js";
import { Wordmark } from "./Brand.js";
import { useCommandPalette } from "./command-palette-context.js";

/**
 * Nav links derived from the pages registry + in-page anchors.
 * Built lazily (not at module scope) so importing this module never
 * triggers a circular-init crash: `pages` imports the page components,
 * and those components import Nav back.
 */
function getLinks(): NavLink[] {
  return [
    {
      href: "#product",
      label: "Product",
      columns: 2,
      panelWidth: "w-[36rem]",
      children: [
        ...pages
          .filter((p) => p.navGroup === "product")
          .map((p) => ({
            href: p.path,
            label: p.title,
            description: p.description,
            section: p.path.startsWith("/lab/") ? "Lab" : "Core",
          })),
      ],
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
        {
          href: getDocsChangelogUrl(),
          label: "Changelog",
          description: "All notable changes to the facet ecosystem",
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
          href: "#ecosystem",
          label: "Packages",
          description: `${SITE_PACKAGES_COUNT} focused packages, one stack`,
        },
      ],
    },
  ];
}

/** Inline search-bar trigger that opens the ⌘K command palette. */
function GlobalSearch() {
  const { setOpen } = useCommandPalette();
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="flex h-8 items-center gap-2 rounded-md border border-border w-[212px] justify-start bg-panel px-3 text-sm text-text-muted transition-colors hover:bg-panel-hover hover:text-foreground"
        >
          <LightIcon name="search" size={14} />
          <span className="truncate text-left">Search</span>
          <kbd className="text-xs text-text-dim">⌘K</kbd>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Search (⌘K)
      </TooltipContent>
    </Tooltip>
  );
}

/** Clickable brand mark (wordmark) that returns to the landing home. */
function Brand({ onHome }: { onHome: () => void }) {
  return (
    <div
      onClick={onHome}
      className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground/80 transition-colors"
    >
      <Wordmark className="h-6 w-auto" />
    </div>
  );
}

/** Mobile menu: grouped accordion sections + GitHub + docs. */
function MobileMenu({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col lg:px-604">
      {getLinks().map((link) => {
        if (link.children?.length) {
          const isOpen = openGroup === link.href;
          return (
            <div key={link.href} className="flex flex-col">
              <div
                onClick={() => setOpenGroup(isOpen ? null : link.href)}
                className="flex cursor-pointer items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent/5 hover:text-foreground"
                aria-expanded={isOpen}
              >
                <span>{link.label}</span>
                <LightIcon
                  name="chevron-down"
                  size={14}
                  className={`text-muted-foreground/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isOpen && (
                <div className="ml-4 flex flex-col gap-1 border-l pl-2">
                  {link.children.map((child) => (
                    <div
                      key={child.href}
                      onClick={() => onNavigate(child.href)}
                      className="flex cursor-pointer flex-row items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
                    >
                      <span className="flex flex-col">
                        <span>{child.label}</span>
                        {child.description && (
                          <span className="text-xs text-muted-foreground">
                            {child.description}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
      })}

      <hr className="my-2 border-t border-border" />

      <Button
        variant="ghost"
        onClick={() => window.open(getDocsUrl())}
        className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <GithubIcon size={16} />
        GitHub
      </Button>
      <Button
        variant="ghost"
        onClick={() => window.open(getDocsUrl())}
        className="mt-1 cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        Browse components
      </Button>
    </div>
  );
}

/**
 * Complete landing navbar:
 *   Brand (left) · Product / Resources / Developers dropdowns (center) ·
 *   Search (⌘K) + GitHub + theme toggle (right)
 */
export function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Single handler for all Navbar links (desktop + mobile). Hash anchors
  // scroll in-page; external URLs (http) navigate to other apps;
  // everything else uses the React Router.
  const handleNav = (href: string) => {
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
      } else {
        document
          .getElementById(href.slice(1))
          ?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href.startsWith("http")) {
      window.location.href = href;
    } else {
      navigate(href);
    }
  };

  const router: NavbarRouter = {
    Link: Link as unknown as React.ComponentType<{
      href: string;
      className?: string;
      onClick?: (event: React.MouseEvent) => void;
      children?: React.ReactNode;
      "aria-current"?: "page" | undefined;
    }>,
    isActive: (href: string) => {
      if (href.startsWith("http")) {
        return window.location.href === href;
      }
      if (href.startsWith("#")) {
        return window.location.hash === href;
      }
      return window.location.pathname === href;
    },
  };

  return (
    <Navbar
      variant="sticky"
      brand={<Brand onHome={() => handleNav("/")} />}
      links={getLinks()}
      onNavigate={handleNav}
      router={router}
      mobileMenu={<MobileMenu onNavigate={handleNav} />}
      mobileBreakpoint="lg"
      hoverDropdowns
      showThemeToggle
      actions={
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-2">
            {/* Icon-only GitHub link (right-aligned) */}
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <GithubIcon size={16} />
            </a>
            <div className="hidden lg:flex">
              <GlobalSearch />
            </div>
          </div>
        </TooltipProvider>
      }
    />
  );
}
