import * as React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { NotFound, ThemeProvider } from "@fusorb/facet-components";
import { pages } from "./pages.js";
import { CommandPaletteProvider } from "./components/command-palette-context.js";
import { LandingCommandPalette } from "./components/CommandPalette.js";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <main className="mx-auto max-w-7xl px-8 py-20">
      <NotFound
        animation="gradient"
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        actionLabel="Go back home"
        actionHref="/"
      />
    </main>
  );
}

/**
 * Routes derive from the pages registry: every entry becomes a route,
 * every nav-grouped entry becomes a navbar link.
 */
function AppRoutes() {
  return (
    <Routes>
      {pages.map((page) => (
        <Route key={page.path} path={page.path} element={page.element} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      {/* Customization proof: consumers retheme the whole surface without a
          rebuild by uncommenting overrideVars, e.g.
          overrideVars={{ "--primary": "oklch(0.7 0.2 300)" }} */}
      <CommandPaletteProvider>
        <BrowserRouter>
          <ScrollToTop />
          <LandingCommandPalette />
          <AppRoutes />
        </BrowserRouter>
      </CommandPaletteProvider>
    </ThemeProvider>
  );
}
