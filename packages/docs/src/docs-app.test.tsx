/**
 * Integration test: docs engine rendered against a real consumer-style config.
 *
 * Q10 gap: "No integration test - docs engine + real consumer. The
 * sandbox-e2e tests the CLI, and unit tests cover packages, but there's no
 * CI gate that renders the docs engine against a real consumer like SovGrant."
 *
 * This test mounts <DocsApp> with a representative consumer config +
 * pages (brand, navigation, ecosystem, content pages with various
 * DocsBlock types) and asserts the router, context, and content pipeline
 * all work end-to-end. Heavy external modules (facet-layout ConsoleLayout,
 * facet-components NotFound, facet-components/light UI primitives) are
 * stubbed so the test focuses on the *docs engine* integration surface,
 * not the UI primitives.
 */
import * as React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// ── Stubs for heavy external modules ───────────────────────────
// ConsoleLayout + CommandPalette live in @fusorb/facet-layout, a heavy
// graph.  Stub them so we exercise the docs engine's routing/context
// rather than the layout shell.
vi.mock("@fusorb/facet-layout", () => {
  const Stub = ({ children }: any) =>
    React.createElement("div", { "data-testid": "console-layout" }, children);
  const VoidStub = () =>
    React.createElement("div", { "data-testid": "command-palette" });
  return {
    ConsoleLayout: Stub,
    CommandPalette: VoidStub,
  };
});

// NotFound comes from the full @fusorb/facet-components package (lazy
// route).  Stub it; /light subpath is mocked separately below.
vi.mock("@fusorb/facet-components", () => ({
  NotFound: () =>
    React.createElement("div", { "data-testid": "not-found" }, "404"),
}));

// facet-components/light is imported by ThemeProvider (eager in docs-app)
// and by content block components (CodeBlock, InstallTabs, KeyboardShortcuts,
// DocsLayout's SettingsMenu).  Provide lightweight stubs so jsdom doesn't
// need the full Radix + icon-catalog graph.
vi.mock("@fusorb/facet-components/light", () => {
  const stub =
    (tag: string) =>
    ({ children, ...rest }: any) =>
      React.createElement(
        tag === "svg" ? "svg" : "div",
        { "data-testid": tag, ...rest },
        children,
      );
  return {
    ThemeProvider: ({ children }: { children?: React.ReactNode }) => children,
    LightIcon: ({ name }: { name?: string }) =>
      React.createElement("svg", { "data-testid": `icon-${name}` }),
    Button: stub("button"),
    Kbd: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("kbd", null, children),
    Tabs: stub("tabs"),
    TabsList: stub("tabs-list"),
    TabsTrigger: stub("tabs-trigger"),
    TabsContent: stub("tabs-content"),
    DropdownMenu: stub("dropdown-menu"),
    DropdownMenuTrigger: stub("dropdown-menu-trigger"),
    DropdownMenuContent: stub("dropdown-menu-content"),
    DropdownMenuItem: stub("dropdown-menu-item"),
    DropdownMenuLabel: stub("dropdown-menu-label"),
    DropdownMenuSeparator: () => React.createElement("hr"),
    cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
    useTheme: () => ({ theme: "light" }),
  };
});

// react-router-dom ships ESM (.mjs) files for its "import" / "node" export
// conditions.  When jsdom tests load the CJS build, react-router-dom does
// require("react-router/dom") and Vite/Node cannot resolve that to .mjs,
// causing a SyntaxError.  Replace the entire module with a lightweight
// in-memory router that resolves routes against window.location.pathname.
vi.mock("react-router-dom", () => {
  const React = require("react") as typeof import("react");
  const {
    createContext,
    useContext,
    useEffect,
    useState,
    isValidElement,
    Children,
  } = React;

  const LocationContext = createContext({
    pathname: "/",
    search: "",
    hash: "",
    state: null as unknown,
    key: "",
  });
  const OutletContext = createContext<React.ReactNode | null>(null);

  const Route: React.FC<any> = () => null;

  function matchRoute(pathname: string, routePath: string): boolean {
    if (!routePath || routePath === "*" || routePath === "/*") return true;
    const routeParts = routePath.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);
    if (routePath.endsWith("*")) {
      for (let i = 0; i < routeParts.length - 1; i++) {
        if (routeParts[i]?.startsWith(":")) continue;
        if (routeParts[i] !== pathParts[i]) return false;
      }
      return true;
    }
    if (routeParts.length !== pathParts.length) return false;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i]?.startsWith(":")) continue;
      if (routeParts[i] !== pathParts[i]) return false;
    }
    return true;
  }

  function collectRoutes(
    nodes: React.ReactNode,
  ): Array<Record<string, unknown>> {
    const routes: Array<Record<string, unknown>> = [];
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      const props = (child as { props?: Record<string, unknown> }).props ?? {};
      if ((child as { type?: unknown }).type === Route) {
        if (props.path !== undefined) routes.push(props);
      }
      if (props.children)
        routes.push(...collectRoutes(props.children as React.ReactNode));
    });
    return routes;
  }

  const BrowserRouter: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [loc, setLoc] = useState({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null,
      key: "",
    });
    useEffect(() => {
      const handler = () =>
        setLoc({
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          state: null,
          key: "",
        });
      window.addEventListener("popstate", handler);
      return () => window.removeEventListener("popstate", handler);
    }, []);
    return React.createElement(
      LocationContext.Provider,
      { value: loc },
      children,
    );
  };

  const useLocation = () => useContext(LocationContext);

  const useNavigate = () => (to: unknown, options?: { replace?: boolean }) => {
    const path =
      typeof to === "string"
        ? to
        : ((to as { pathname?: string })?.pathname ?? "/");
    const search =
      typeof to === "object" && (to as { search?: string })?.search
        ? (to as { search: string }).search
        : "";
    if (options?.replace) {
      window.history.replaceState({}, "", path + search);
    } else {
      window.history.pushState({}, "", path + search);
    }
  };

  const useParams = () => ({});

  const Link: React.FC<any> = ({ to, children, ...rest }) =>
    React.createElement(
      "a",
      {
        href:
          typeof to === "string"
            ? to
            : ((to as { pathname?: string })?.pathname ?? "/"),
        onClick: (e: Event) => {
          e.preventDefault();
          const path =
            typeof to === "string"
              ? to
              : ((to as { pathname?: string })?.pathname ?? "/");
          const search =
            typeof to === "object" && (to as { search?: string })?.search
              ? (to as { search: string }).search
              : "";
          window.history.pushState({}, "", path + search);
        },
        ...rest,
      },
      children,
    );

  const Navigate: React.FC<any> = ({ to, replace = false }) => {
    useEffect(() => {
      if (!to) return;
      const path =
        typeof to === "string"
          ? to
          : ((to as { pathname?: string })?.pathname ?? "/");
      const search =
        typeof to === "object" && (to as { search?: string })?.search
          ? (to as { search: string }).search
          : "";
      if (replace) {
        window.history.replaceState({}, "", path + search);
      } else {
        window.history.pushState({}, "", path + search);
      }
    }, [to, replace]);
    return null;
  };

  const Outlet: React.FC = () => {
    const element = useContext(OutletContext);
    return element;
  };

  const Routes: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const loc = useContext(LocationContext);
    const pathname = loc.pathname;

    let layoutElement: React.ReactNode = null;
    let childRoutes: Array<Record<string, unknown>> = [];

    Children.forEach(children, (child) => {
      if (
        !isValidElement(child) ||
        (child as { type?: unknown }).type !== Route
      )
        return;
      const props = (child as { props?: Record<string, unknown> }).props ?? {};
      if (props.element && props.path === undefined) {
        layoutElement = props.element as React.ReactNode;
        childRoutes = collectRoutes(props.children as React.ReactNode);
      }
    });

    if (!layoutElement) {
      childRoutes = collectRoutes(children);
    }

    let matched: React.ReactNode = null;
    let found = false;

    for (const route of childRoutes) {
      const path = route.path as string | undefined;
      if (path && path !== "*" && matchRoute(pathname, path)) {
        matched = route.element as React.ReactNode;
        found = true;
        break;
      }
    }

    if (!found) {
      for (const route of childRoutes) {
        if (route.path === "*") {
          matched = route.element as React.ReactNode;
          found = true;
          break;
        }
      }
    }

    if (layoutElement) {
      return React.createElement(
        OutletContext.Provider,
        { value: matched },
        layoutElement,
      );
    }
    return matched || null;
  };

  return {
    BrowserRouter,
    Routes,
    Route,
    Outlet,
    Link,
    Navigate,
    useNavigate,
    useLocation,
    useParams,
  };
});

import { DocsApp } from "./docs-app.js";
import type { DocsSiteConfig, DocsPage } from "./index.js";

// ── Consumer-style fixtures (mirrors what an SovGrant docs site passes) ──

const consumerConfig: DocsSiteConfig = {
  brand: { name: "ArcID" },
  navigation: [{ title: "Guides", items: [{ label: "Overview", href: "/" }] }],
  ecosystem: [{ label: "GitHub", href: "https://github.com/fusorb" }],
};

const consumerPages: DocsPage[] = [
  {
    path: "/",
    title: "Overview",
    section: "guides",
    description: "Domain-customizable, auth-first component system for facet.",
    blocks: [
      {
        type: "p",
        text: "facet is what you get when you own the identity backend.",
      },
      { type: "h2", text: "Packages" },
      {
        type: "ul",
        items: [
          "`@fusorb/facet-tokens`: Design tokens.",
          "`@fusorb/facet-sdk`: API client.",
          "`@fusorb/facet-components`: UI components.",
        ],
      },
      { type: "code", text: "pnpm install\npnpm build" },
      {
        type: "link",
        label: "GitHub repo",
        href: "https://github.com/fusorb/facet",
      },
    ],
  },
  {
    path: "/guides/auth",
    title: "Authentication",
    section: "auth",
    description: "Auth flows and domain presets.",
    blocks: [
      {
        type: "p",
        text: "facet ships domain presets for fintech, med, and edu.",
      },
      { type: "h2", text: "Sign-in flow" },
      {
        type: "table",
        headers: ["Method", "Package"],
        rows: [
          ["Password", "@fusorb/facet-auth"],
          ["OAuth", "@fusorb/facet-auth"],
        ],
      },
    ],
  },
];

// ── Tests ──────────────────────────────────────────────────────

describe("DocsApp integration - consumer-style config + pages", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    window.history.pushState({}, "", "/");
  });

  it("mounts with a consumer config without crashing", async () => {
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );
    expect(
      await screen.findByTestId("console-layout", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it("renders the home page at / with title and description", async () => {
    window.history.pushState({}, "", "/");
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );

    await screen.findByTestId("console-layout", {}, { timeout: 5000 });
    expect(
      screen.getByRole("heading", { name: "Overview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Domain-customizable, auth-first component system for facet.",
      ),
    ).toBeInTheDocument();
  });

  it("renders content blocks (paragraph, heading, list, code)", async () => {
    window.history.pushState({}, "", "/");
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );

    await screen.findByTestId("console-layout", {}, { timeout: 5000 });
    expect(screen.getByText(/facet is what you get/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Packages" }),
    ).toBeInTheDocument();
    // Code blocks render as <pre><code>
    const codeBlock = screen.getByText((content) =>
      content.includes("pnpm install"),
    );
    expect(codeBlock).toBeInTheDocument();
  });

  it("renders a guide page at /guides/auth with table blocks", async () => {
    window.history.pushState({}, "", "/guides/auth");
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );

    await screen.findByTestId("console-layout", {}, { timeout: 5000 });
    expect(
      screen.getByRole("heading", { name: "Authentication" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getAllByText("@fusorb/facet-auth")).toHaveLength(2);
  });

  it("renders link blocks as anchor tags", async () => {
    window.history.pushState({}, "", "/");
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );

    await screen.findByTestId("console-layout", {}, { timeout: 5000 });
    const link = screen.getByText("GitHub repo");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/fusorb/facet",
    );
  });

  it("renders 404 for unknown routes", async () => {
    window.history.pushState({}, "", "/totally-unknown-page");
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );

    expect(await screen.findByTestId("not-found")).toBeInTheDocument();
  });

  it("respects showComponents=false - component gallery routes are absent", async () => {
    window.history.pushState({}, "", "/components");
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );

    // Without showComponents, /components is not a route - hits the 404 fallback.
    expect(await screen.findByTestId("not-found")).toBeInTheDocument();
  });

  it("passes config and pages through to the docs app context", async () => {
    // DocsApp doesn't accept children, but the context value is observable
    // through the rendered content: the page that matches the current route
    // is sourced from the `pages` prop, and the sidebar nav is sourced from
    // `config.navigation`.
    window.history.pushState({}, "", "/guides/auth");
    render(
      <DocsApp
        config={consumerConfig}
        pages={consumerPages}
        showComponents={false}
      />,
    );

    await screen.findByTestId("console-layout", {}, { timeout: 5000 });
    expect(
      screen.getByRole("heading", { name: "Authentication" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Auth flows and domain presets."),
    ).toBeInTheDocument();
  });
});
