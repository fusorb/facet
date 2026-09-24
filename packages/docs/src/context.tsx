import * as React from "react";
import type { IconName } from "@fusorb/facet-components";
import type { DocsPage } from "./lib/pages.js";
import type { DocsSiteConfig } from "./lib/nav.js";
import type { PageActionItem } from "./components/PageActionBar.js";

export interface DocsAppValue {
  /** Brand + nav + ecosystem config fed to the layout shell. */
  config: DocsSiteConfig;
  /** Content pages rendered by DocsContentPage and the nav builder. */
  pages: DocsPage[];
  /** Whether the /components gallery routes are mounted. */
  showComponents: boolean;
  /** Render the sticky "on this page" right rail on content pages. */
  showTableOfContents?: boolean;
  /** Extra topbar content (e.g. a GitHub link), rendered after the mode/aside toggles. */
  topbar?: React.ReactNode;
  /** External links rendered in the settings gear menu. */
  links?: { label: string; href: string; icon?: IconName }[];
  /** Additional page-level actions appended to the PageActionBar dropdown. */
  pageActions?: PageActionItem[];
}

const DocsAppContext = React.createContext<DocsAppValue | null>(null);

export function DocsAppProvider({
  value,
  children,
}: {
  value: DocsAppValue;
  children: React.ReactNode;
}) {
  return (
    <DocsAppContext.Provider value={value}>{children}</DocsAppContext.Provider>
  );
}

/** Access the active DocsApp config from any engine component. */
export function useDocsApp(): DocsAppValue {
  const ctx = React.useContext(DocsAppContext);
  if (!ctx) throw new Error("useDocsApp must be used within <DocsApp>");
  return ctx;
}

/* ── Global package manager preference ───────────────────── */

const PackageManagerContext = React.createContext<{
  activeManager: string;
  setActiveManager: (manager: string) => void;
} | null>(null);

const PACKAGE_MANAGER_KEY = "facet:docs:package-manager";

/**
 * Shares the selected package manager (pnpm/npm/yarn/bun) across every
 * InstallTabs block on the entire docs site. The choice is persisted to
 * localStorage so the user's preference survives reloads and page
 * navigation - they only pick once.
 */
export function PackageManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState<string>(() => {
    if (typeof window === "undefined") return "pnpm";
    return window.localStorage.getItem(PACKAGE_MANAGER_KEY) ?? "pnpm";
  });

  const setActiveManager = React.useCallback((manager: string) => {
    setActive(manager);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PACKAGE_MANAGER_KEY, manager);
    }
  }, []);

  return (
    <PackageManagerContext.Provider
      value={{ activeManager: active, setActiveManager }}
    >
      {children}
    </PackageManagerContext.Provider>
  );
}

export function usePackageManager() {
  const ctx = React.useContext(PackageManagerContext);
  if (!ctx)
    throw new Error(
      "usePackageManager must be used within <PackageManagerProvider>",
    );
  return ctx;
}
