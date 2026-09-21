import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { IconName } from "@fusorb/facet-components";
import { ThemeProvider } from "@fusorb/facet-components/light";
import {
  DocsAppProvider,
  PackageManagerProvider,
  type DocsAppValue,
} from "./context.js";
import { DocsContentPage } from "./pages/DocsContentPage.js";

// The layout shell (ConsoleLayout + CommandPalette) pulls the heavy
// facet-layout/components graph, so it is lazy-loaded: the eager entry is
// just the theme provider + router + a minimal fallback.
const DocsLayout = React.lazy(() =>
  import("./components/DocsLayout.js").then((m) => ({ default: m.DocsLayout })),
);

// The component gallery pages pull in the full component-preview machinery
// (every variant preview + the whole components barrel), so they are
// lazy-loaded too.
const ComponentsPage = React.lazy(() =>
  import("./pages/ComponentsPage.js").then((m) => ({
    default: m.ComponentsPage,
  })),
);
const ComponentPage = React.lazy(() =>
  import("./pages/ComponentPage.js").then((m) => ({
    default: m.ComponentPage,
  })),
);
const ReadyToUsePage = React.lazy(() =>
  import("./pages/ReadyToUsePage.js").then((m) => ({
    default: m.ReadyToUsePage,
  })),
);
const PagesPage = React.lazy(() =>
  import("./pages/PagesPage.js").then((m) => ({ default: m.PagesPage })),
);

// The 404 fallback uses the shared Facet NotFound, gradient text animation + fully customizable props. Lazy-loaded so the eager entry stays slim (theme + router + minimal fallback only).
const NotFound = React.lazy(() =>
  import("@fusorb/facet-components").then((m) => ({ default: m.NotFound })),
);

import type { DocsSiteConfig } from "./lib/nav.js";
import type { DocsPage } from "./lib/pages.js";

/** Suspense fallback shown while a lazy route chunk loads. Mimics the shape
 *  of a docs content page so the shell doesn't blank out while it loads. */
function PageLoader() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-3/4 rounded-md bg-muted"></div>
      <div className="h-4 w-1/2 rounded-md bg-muted"></div>
      <div className="h-4 w-full rounded-md bg-muted"></div>
      <div className="h-4 w-5/6 rounded-md bg-muted"></div>
      <div className="h-4 w-4/6 rounded-md bg-muted"></div>
      <div className="h-4 w-3/5 rounded-md bg-muted"></div>
    </div>
  );
}

export interface DocsAppProps {
  /** Brand, nav sections, and ecosystem links for the layout shell. */
  config: DocsSiteConfig;
  /** Content pages registry. Guides/Foundations/Ecosystem nav derives from these. */
  pages: DocsPage[];
  /** Mount the /components gallery routes (requires the component manifest). */
  showComponents?: boolean;
  /** Render the sticky "on this page" right rail on content pages. */
  showTableOfContents?: boolean;
  /** Extra topbar content (e.g. a GitHub link), rendered after the search bar. */
  topbar?: React.ReactNode;
  /** External links rendered in the settings gear menu. */
  links?: { label: string; href: string; icon?: IconName }[];
  /** Initial theme for ThemeProvider. */
  defaultTheme?: "light" | "dark" | "system";
}

/**
 * Mount a complete, config-driven docs site.
 *
 * Everything a consumer needs to publish their own docs: brand + nav from
 * `config`, content from `pages`, and an optional /components gallery.
 * Renders inside a ThemeProvider + BrowserRouter, so it works as a
 * top-level app (Vite entry) or nested under an existing router with
 * <HashRouter> where needed.
 */
export function DocsApp({
  config,
  pages,
  showComponents = true,
  showTableOfContents = true,
  topbar,
  links,
  defaultTheme = "system",
}: DocsAppProps) {
  const value: DocsAppValue = {
    config,
    pages,
    showComponents,
    showTableOfContents,
    topbar,
    links,
  };
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <BrowserRouter>
        <DocsAppProvider value={value}>
          <PackageManagerProvider>
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<DocsLayout />}>
                  {pages.map((page) => (
                    <Route
                      key={page.path}
                      path={page.path}
                      element={<DocsContentPage />}
                    />
                  ))}
                  {showComponents && (
                    <>
                      <Route path="/components" element={<ComponentsPage />} />
                      <Route
                        path="/components/:slug"
                        element={<ComponentPage />}
                      />
                      <Route
                        path="/ready-to-use"
                        element={<ReadyToUsePage />}
                      />
                      <Route path="/pages" element={<PagesPage />} />
                    </>
                  )}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </React.Suspense>
          </PackageManagerProvider>
        </DocsAppProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
