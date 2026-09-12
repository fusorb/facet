import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ConsoleLayout, CommandPalette } from "@fusorb/facet-layout";
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

/**
 * Docs site shell: facet ConsoleLayout with a collapsible rail sidebar.
 * The shell itself is a live demo of the facet layout system.
 *
 * - Desktop: sidebar resizes via the right-edge drag handle (VS Code
 *   style), collapsing to an icon-only rail at the minimum width. The
 *   rail shows one icon per section (YouTube-style), all together with
 *   no scroll; the full item list only shows when expanded.
 * - Mobile: sidebar becomes an overlay Sheet opened from the hamburger.
 * - The routed page renders in the main area via <Outlet />.
 * - CommandPalette renders its own search bar (icon + placeholder + "Ctrl
 *   K" badge) in the topbar. Clicking it, or pressing Ctrl/Cmd+K, opens an
 *   inline results panel that searches all sidebar routes and quick
 *   actions, grouped by section.
 */
/** Settings gear dropdown: ecosystem links, sidebar mode, and shortcuts. The
 * theme toggle has its own dedicated icon in the topbar, so it is not
 * duplicated here. */
function SettingsMenu({
  label,
  links,
  mode,
  onModeChange,
}: {
  label: string;
  links: { label: string; href: string; icon?: string }[];
  mode: "full" | "rail";
  onModeChange: (mode: "full" | "rail") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LightIcon name="settings" className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onModeChange(mode === "rail" ? "full" : "rail")}>
          <LightIcon name={mode === "rail" ? "panel-left" : "layout-panel-left"} className="size-4" />
          Sidebar: {mode === "rail" ? "Rail" : "Full"}
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

export function DocsLayout() {
  const { config, pages, showComponents, topbar, links } = useDocsApp();
  const router = useDocsRouterAdapter();
  const layoutConfig = buildDocsLayoutConfig(config, pages, showComponents);
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"full" | "rail">("rail");

  return (
    <ConsoleLayout
      config={layoutConfig}
      router={router}
      mode={mode}
      singleOpen
      themeToggle
      topbar={
        <>
          <CommandPalette
            config={layoutConfig}
            navigate={(href) => navigate(href)}
            placeholder="Search docs..."
          />
          {topbar}
          <SettingsMenu
            label={config.brand?.name ?? "Docs"}
            links={links ?? []}
            mode={mode}
            onModeChange={setMode}
          />
        </>
      }
    >
      <Outlet />
    </ConsoleLayout>
  );
}
