import { afterEach, describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutProvider, useLayout } from "./layout-context.js";
import { Sidebar } from "./sidebar.js";
import { AuthLayout } from "./auth-layout.js";
import {
  defaultLayoutPreset,
  enterpriseLayoutPreset,
  fintechLayoutPreset,
  medLayoutPreset,
  eduLayoutPreset,
} from "./presets.js";
import type { LayoutConfig } from "./types.js";

describe("domain presets", () => {
  it("exports all five presets with brand + navigation", () => {
    const presets = [
      fintechLayoutPreset,
      medLayoutPreset,
      eduLayoutPreset,
      enterpriseLayoutPreset,
      defaultLayoutPreset,
    ];
    expect(presets).toHaveLength(5);
    for (const p of presets) {
      expect(p.brand.name).toBeTruthy();
      expect(p.navigation.length).toBeGreaterThan(0);
    }
  });

  it("default preset keeps tenant switcher off", () => {
    expect(defaultLayoutPreset.features?.tenantSwitcher).toBe(false);
  });

  it("fintech + enterprise enable tenant switching", () => {
    expect(fintechLayoutPreset.features?.tenantSwitcher).toBe(true);
    expect(enterpriseLayoutPreset.features?.tenantSwitcher).toBe(true);
  });

  it("every nav item has unique hrefs within a preset", () => {
    for (const preset of [fintechLayoutPreset, enterpriseLayoutPreset]) {
      const hrefs = preset.navigation.flatMap((s) =>
        s.items.map((i) => i.href),
      );
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it("presets satisfy the LayoutConfig shape", () => {
    const config: LayoutConfig = defaultLayoutPreset;
    expect(config).toBeDefined();
  });
});

describe("Sidebar", () => {
  function renderSidebar(config: LayoutConfig, isLoading?: boolean) {
    return render(
      <LayoutProvider>
        <Sidebar config={config} isLoading={isLoading} />
      </LayoutProvider>,
    );
  }

  afterEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("renders brand name", () => {
    renderSidebar(defaultLayoutPreset);
    expect(screen.getByText("App")).toBeInTheDocument();
  });

  it("renders section titles and nav labels", () => {
    renderSidebar(defaultLayoutPreset);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/settings/profile",
    );
  });

  it("shows skeleton when loading", () => {
    renderSidebar(defaultLayoutPreset, true);
    expect(screen.queryByText("Overview")).toBeNull();
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });

  it("shows empty state when no navigation", () => {
    const empty: LayoutConfig = { brand: { name: "Empty" }, navigation: [] };
    renderSidebar(empty);
    expect(screen.getByText(/no navigation items/i)).toBeInTheDocument();
  });

  it("renders badges on nav items", () => {
    const config: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Alerts",
          items: [{ href: "/alerts", label: "Alerts", badge: 3 }],
        },
      ],
    };
    renderSidebar(config);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("collapses and expands nested nav groups", async () => {
    const config: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Workspace",
          items: [
            {
              href: "/projects",
              label: "Projects",
              children: [
                { href: "/projects/active", label: "Active" },
                { href: "/projects/archived", label: "Archived" },
              ],
            },
          ],
        },
      ],
    };
    renderSidebar(config);

    // Group trigger renders but children are hidden initially
    const group = screen.getByRole("button", { name: /projects/i });
    expect(screen.queryByText("Active")).toBeNull();

    await userEvent.click(group);
    expect(screen.getByRole("link", { name: /active/i })).toHaveAttribute(
      "href",
      "/projects/active",
    );
    expect(screen.getByRole("link", { name: /archived/i })).toHaveAttribute(
      "href",
      "/projects/archived",
    );
  });

  it("section headers toggle open/closed and persist via localStorage", async () => {
    const config: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Overview",
          id: "overview",
          items: [{ href: "/dashboard", label: "Dashboard" }],
        },
        {
          title: "Account",
          id: "account",
          items: [{ href: "/settings/profile", label: "Profile" }],
        },
      ],
    };
    renderSidebar(config);

    const overview = screen.getByRole("button", { name: /overview/i });
    // Open by default (absent key => open), so aria-expanded is true.
    expect(overview).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();

    // Click collapses the section and persists the choice.
    await userEvent.click(overview);
    expect(overview).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /dashboard/i })).toBeNull();

    const stored = JSON.parse(
      localStorage.getItem("facet:sidebar-sections") ?? "{}",
    );
    expect(stored).toMatchObject({ overview: true });

    // Re-open restores the links.
    await userEvent.click(overview);
    expect(overview).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it("a section containing the active route auto-opens regardless of persisted collapse", async () => {
    window.history.pushState({}, "", "/settings/profile");
    const config: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Account",
          id: "account",
          items: [{ href: "/settings/profile", label: "Profile" }],
        },
      ],
    };
    // Pre-collapse it, as if the user had closed it earlier.
    localStorage.setItem(
      "facet:sidebar-sections",
      JSON.stringify({ account: true }),
    );
    renderSidebar(config);

    const account = screen.getByRole("button", { name: /account/i });
    // Active section force-opens: aria-expanded is true even though persisted.
    expect(account).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/settings/profile",
    );
    window.history.pushState({}, "", "/");
  });

  it("singleOpen: opening a section closes the others (accordion)", async () => {
    const config: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Overview",
          id: "overview",
          items: [{ href: "/dashboard", label: "Dashboard" }],
        },
        {
          title: "Account",
          id: "account",
          items: [{ href: "/profile", label: "Profile" }],
        },
      ],
    };
    render(
      <LayoutProvider>
        <Sidebar config={config} singleOpen />
      </LayoutProvider>,
    );

    const overview = screen.getByRole("button", { name: /overview/i });
    const account = screen.getByRole("button", { name: /account/i });
    // Both open by default (no persisted collapse).
    expect(overview).toHaveAttribute("aria-expanded", "true");
    expect(account).toHaveAttribute("aria-expanded", "true");

    // Click "Overview" → closes it (toggle on open section in single-open).
    await userEvent.click(overview);
    expect(overview).toHaveAttribute("aria-expanded", "false");

    // Click "Overview" again → opens it and closes "Account" (single-open).
    await userEvent.click(overview);
    expect(overview).toHaveAttribute("aria-expanded", "true");
    expect(account).toHaveAttribute("aria-expanded", "false");
  });

  it("singleOpen: the active section can still be explicitly collapsed", async () => {
    window.history.pushState({}, "", "/dashboard");
    localStorage.setItem(
      "facet:sidebar-sections",
      JSON.stringify({ overview: true }),
    );
    const config: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Overview",
          id: "overview",
          items: [{ href: "/dashboard", label: "Dashboard" }],
        },
        {
          title: "Account",
          id: "account",
          items: [{ href: "/profile", label: "Profile" }],
        },
      ],
    };
    render(
      <LayoutProvider>
        <Sidebar config={config} singleOpen />
      </LayoutProvider>,
    );

    const overview = screen.getByRole("button", { name: /overview/i });
    // Auto-opened on mount via route-change effect.
    await waitFor(() => {
      expect(overview).toHaveAttribute("aria-expanded", "true");
    });

    // User explicitly collapses the active section - must stay collapsed.
    await userEvent.click(overview);
    expect(overview).toHaveAttribute("aria-expanded", "false");

    window.history.pushState({}, "", "/");
  });

  it("leaf item click closes the mobile sidebar (setSidebarOpen(false))", async () => {
    function SidebarOpenProbe() {
      const { sidebarOpen, setSidebarOpen } = useLayout();
      return (
        <div>
          <button type="button" onClick={() => setSidebarOpen(true)}>
            open
          </button>
          <Sidebar config={testConfig} />
          <output data-testid="sidebar-open">{String(sidebarOpen)}</output>
        </div>
      );
    }
    const testConfig: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Overview",
          id: "overview",
          items: [{ href: "/dashboard", label: "Dashboard" }],
        },
      ],
    };
    render(
      <LayoutProvider>
        <SidebarOpenProbe />
      </LayoutProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");

    await userEvent.click(screen.getByRole("link", { name: /dashboard/i }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("false");
  });
});

describe("Hamburger hover-toggle + click-to-pin", () => {
  function Probe() {
    const {
      sidebarOpen,
      sidebarPinned,
      hoverEnterSidebar,
      hoverLeaveSidebar,
      toggleSidebar,
      setSidebarOpen,
    } = useLayout();
    return (
      <div>
        <button type="button" onClick={hoverEnterSidebar}>
          hover-enter
        </button>
        <button type="button" onClick={hoverLeaveSidebar}>
          hover-leave
        </button>
        <button type="button" onClick={toggleSidebar}>
          toggle
        </button>
        <button type="button" onClick={() => setSidebarOpen(true)}>
          open
        </button>
        <output data-testid="sidebar-open">{String(sidebarOpen)}</output>
        <output data-testid="sidebar-pinned">{String(sidebarPinned)}</output>
      </div>
    );
  }

  afterEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
    vi.useRealTimers();
  });

  it("hover enter opens the sidebar (not pinned)", () => {
    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("false");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("false");

    fireEvent.click(screen.getByRole("button", { name: "hover-enter" }));

    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("false");
  });

  it("click-to-pin: toggle when closed opens + pins", () => {
    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("true");
  });

  it("click-to-pin: toggle on a hover-open sidebar pins it in place", () => {
    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );
    // Open via hover (not pinned)
    fireEvent.click(screen.getByRole("button", { name: "hover-enter" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("false");

    // Click toggle → should pin
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("true");
  });

  it("click-to-close: toggle on a pinned sidebar closes and unpins", () => {
    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );
    // Pin the sidebar
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("true");

    // Click toggle again → closes
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("false");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("false");
  });

  it("hover leave on an unpinned sidebar closes it after the 150ms delay", () => {
    vi.useFakeTimers();
    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "hover-enter" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "hover-leave" }));
    // Still open immediately after hover-leave
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("false");
  });

  it("hover leave does NOT close a pinned sidebar", () => {
    vi.useFakeTimers();
    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "hover-leave" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("true");
  });

  it("expanding a section while the sidebar is hover-open does not close it", async () => {
    const config: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Overview",
          id: "overview",
          items: [{ href: "/dashboard", label: "Dashboard" }],
        },
        {
          title: "Account",
          id: "account",
          items: [{ href: "/profile", label: "Profile" }],
        },
      ],
    };

    function SidebarHoverProbe() {
      const { sidebarOpen, hoverEnterSidebar } = useLayout();
      return (
        <div>
          <button type="button" onClick={hoverEnterSidebar}>
            hover-enter
          </button>
          <Sidebar config={config} />
          <output data-testid="sidebar-open">{String(sidebarOpen)}</output>
        </div>
      );
    }

    // Pre-collapse Account so we can verify expanding it.
    localStorage.setItem(
      "facet:sidebar-sections",
      JSON.stringify({ account: true }),
    );

    render(
      <LayoutProvider>
        <SidebarHoverProbe />
      </LayoutProvider>,
    );

    // Hover-open the sidebar
    fireEvent.click(screen.getByRole("button", { name: "hover-enter" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");

    // Expand the Account section
    await userEvent.click(screen.getByRole("button", { name: /account/i }));
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();

    // Sidebar must still be open
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");
  });

  it("leaf nav click closes the sidebar and resets the pin", async () => {
    const testConfig: LayoutConfig = {
      brand: { name: "App" },
      navigation: [
        {
          title: "Overview",
          id: "overview",
          items: [{ href: "/dashboard", label: "Dashboard" }],
        },
      ],
    };

    function PinnedSidebarProbe() {
      const { sidebarOpen, sidebarPinned, toggleSidebar } = useLayout();
      return (
        <div>
          <button type="button" onClick={toggleSidebar}>
            toggle
          </button>
          <Sidebar config={testConfig} />
          <output data-testid="sidebar-open">{String(sidebarOpen)}</output>
          <output data-testid="sidebar-pinned">{String(sidebarPinned)}</output>
        </div>
      );
    }

    render(
      <LayoutProvider>
        <PinnedSidebarProbe />
      </LayoutProvider>,
    );

    // Pin the sidebar open
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("true");

    // Click a page link → sidebar closes and pin resets
    await userEvent.click(screen.getByRole("link", { name: /dashboard/i }));
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("false");
    expect(screen.getByTestId("sidebar-pinned")).toHaveTextContent("false");
  });
});

describe("Sidebar collapsed (rail mode)", () => {
  function renderCollapsedSidebar() {
    return render(
      <LayoutProvider>
        <Sidebar config={fintechLayoutPreset} collapsed />
      </LayoutProvider>,
    );
  }

  it("hides brand name and section titles when collapsed", () => {
    renderCollapsedSidebar();
    expect(screen.queryByText("facet")).toBeNull();
    expect(screen.queryByText("Overview")).toBeNull();
    expect(screen.queryByText("Security")).toBeNull();
  });

  it("collapsed rail shows one expandable button per section", () => {
    renderCollapsedSidebar();
    // Rail mode: each section collapses to a single icon button that
    // expands the sidebar (YouTube-style), not a list of links.
    const overview = screen.getByRole("button", { name: /overview/i });
    expect(overview).toHaveAttribute("aria-label", "Overview");
    expect(screen.queryByRole("link", { name: /dashboard/i })).toBeNull();
  });

  it("collapsed links are icon-only (label text not rendered)", () => {
    renderCollapsedSidebar();
    // Label text is hidden in collapsed mode; only the accessible name remains.
    expect(screen.queryByText("Dashboard")).toBeNull();
  });
});

describe("LayoutProvider collapsed state", () => {
  function CollapseProbe() {
    const { sidebarCollapsed, toggleSidebarCollapsed } = useLayout();
    return (
      <button
        type="button"
        onClick={toggleSidebarCollapsed}
        aria-pressed={sidebarCollapsed}
      >
        toggle
      </button>
    );
  }

  it("toggles the collapsed flag", async () => {
    render(
      <LayoutProvider>
        <CollapseProbe />
      </LayoutProvider>,
    );
    const toggle = screen.getByRole("button", { name: "toggle" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});

describe("AuthLayout", () => {
  it("renders the default config-driven brand panel", () => {
    render(
      <AuthLayout config={fintechLayoutPreset}>
        <div>Sign in form</div>
      </AuthLayout>,
    );
    expect(screen.getByText("Sign in form")).toBeInTheDocument();
    // Brand name appears in the desktop panel and the mobile header.
    expect(
      screen.getAllByText(fintechLayoutPreset.brand.name).length,
    ).toBeGreaterThan(0);
  });

  it("replaces the left panel with a custom brandPanel", () => {
    render(
      <AuthLayout
        config={fintechLayoutPreset}
        brandPanel={
          <div className="flex h-full items-center justify-center">
            <video src="/hero.mp4" data-testid="hero-video" />
          </div>
        }
      >
        <div>Sign in form</div>
      </AuthLayout>,
    );
    // The custom panel (video) replaces the default logo/name block.
    expect(screen.getByTestId("hero-video")).toBeInTheDocument();
    expect(
      screen.queryByText(fintechLayoutPreset.brand.name),
    ).not.toBeInTheDocument();
    // The form still renders on the right.
    expect(screen.getByText("Sign in form")).toBeInTheDocument();
  });

  it("applies a custom brandPanelClassName to the left panel", () => {
    const { container } = render(
      <AuthLayout
        config={fintechLayoutPreset}
        brandPanelClassName="hidden bg-gradient-to-br from-indigo-600 to-purple-700 lg:flex lg:w-1/2"
      >
        <div>Sign in form</div>
      </AuthLayout>,
    );
    expect(container.querySelector(".bg-gradient-to-br")).not.toBeNull();
  });
});
