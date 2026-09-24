import { Outlet, useNavigate } from "react-router-dom";
import {
  DocsLayout as LayoutDocsLayout,
  SidebarAuth,
  CommandPalette,
  useDocsLayout,
} from "@fusorb/facet-layout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  LightIcon,
  Kbd,
} from "@fusorb/facet-components/light";
import { buildDocsLayoutConfig } from "../lib/nav.js";
import { useDocsRouterAdapter } from "../lib/docs-router.js";
import { useDocsApp } from "../context.js";
import { DocsTableOfContents } from "./DocsTableOfContents.js";

/**
 * Settings gear dropdown: ecosystem links, sidebar mode, and shortcuts.
 *
 * Mode toggle comes from the layout DocsLayout context (toggleMode).
 * The theme toggle is handled by ConsoleLayout directly.
 */
function SettingsMenu({
  label,
  links,
}: {
  label: string;
  links: { label: string; href: string; icon?: string }[];
}) {
  const { mode, toggleMode, collapsedAll, toggleCollapseAll } =
    useDocsLayout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/5 focus-visible:outline-none"
        >
          <LightIcon name="settings" className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleMode}>
          <LightIcon
            name={mode === "rail" ? "panel-left" : "layout-panel-left"}
            className="size-4"
          />
          Sidebar: {mode === "rail" ? "Rail" : "Full"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleCollapseAll}>
          <LightIcon
            name={collapsedAll ? "maximize-2" : "minimize-2"}
            className="size-4"
          />
          {collapsedAll ? "Expand all" : "Collapse all sidebar + aside"}
          <Kbd className="ml-auto">
            Ctrl+Shift+B
          </Kbd>
        </DropdownMenuItem>
        {links.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {links.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2"
                >
                  {link.icon && <LightIcon name={link.icon} className="size-4" />}
                  {link.label}
                </a>
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <div className="px-2.5 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <LightIcon name="search" className="size-3.5" />
            Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search docs
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Docs site shell.
 *
 * A thin adapter over the layout package's DocsLayout that wires up
 * docs-specific content: the CommandPalette search trigger in the sidebar,
 * DocsTableOfContents in the aside, SidebarAuth at the bottom, and the
 * SettingsMenu + GitHub link in the docs topbar.
 *
 * The heavy lifting (mode state, aside toggle, responsive rail/full,
 * persistent layout) lives in @fusorb/facet-layout's DocsLayout.
 */
export function DocsLayout() {
  const {
    config,
    pages,
    showComponents,
    showTableOfContents,
    topbar,
    links,
  } = useDocsApp();
  const router = useDocsRouterAdapter();
  const navigate = useNavigate();
  const layoutConfig = buildDocsLayoutConfig(config, pages, showComponents);

  return (
    <LayoutDocsLayout
      config={layoutConfig}
      router={router}
      sidebarSearch={
        <CommandPalette
          config={layoutConfig}
          navigate={(href) => navigate(href)}
          placeholder="Search docs..."
        />
      }
      aside={showTableOfContents ? <DocsTableOfContents /> : undefined}
      sidebarBottom={<SidebarAuth actions={links ?? []} />}
      topbar={
        <>
          {topbar}
          <SettingsMenu
            label={config.brand?.name ?? "Docs"}
            links={links ?? []}
          />
        </>
      }
      links={links}
    >
      <Outlet />
    </LayoutDocsLayout>
  );
}
