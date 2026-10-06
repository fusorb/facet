import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LayoutProvider } from "./layout-context.js";
import { ConsoleLayout } from "./console-layout.js";
import { DocsAside } from "./docs-aside.js";
import { Sidebar } from "./sidebar.js";
import { TenantSwitcher } from "./tenant-switcher.js";
import { LandingLayout } from "./landing-layout.js";
import { AuthLayout } from "./auth-layout.js";
import { defaultLayoutPreset } from "./presets.js";

afterEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

const headings = [
  { id: "alpha", text: "Alpha", level: 2 as const },
  { id: "beta", text: "Beta", level: 3 as const },
];

describe("ConsoleLayout", () => {
  it("renders children and merges className onto the root", () => {
    const { container } = render(
      <ConsoleLayout config={defaultLayoutPreset} className="my-shell">
        <div>CHILD</div>
      </ConsoleLayout>,
    );
    expect(screen.getByText("CHILD")).toBeInTheDocument();
    expect(container.querySelector(".my-shell")).not.toBeNull();
  });
});

describe("DocsAside", () => {
  it("controlled: toggle reports the inverse state without mutating props", () => {
    const onToggle = vi.fn();
    render(
      <DocsAside headings={headings} collapsed={false} onToggle={onToggle} />,
    );
    const toggle = screen.getByRole("button", {
      name: /collapse on this page/i,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(true);
    // Controlled: the panel does not change state on its own.
    expect(
      screen.getByRole("button", { name: /collapse on this page/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("uncontrolled: toggle flips and notifies the consumer", async () => {
    const onToggle = vi.fn();
    render(<DocsAside headings={headings} onToggle={onToggle} />);
    fireEvent.click(
      screen.getByRole("button", { name: /collapse on this page/i }),
    );
    await waitFor(() => expect(onToggle).toHaveBeenCalledWith(true));
  });
});

describe("Sidebar", () => {
  it("sidebar no longer renders a hardcoded version string", () => {
    render(
      <LayoutProvider>
        <Sidebar config={defaultLayoutPreset} />
      </LayoutProvider>,
    );
    expect(screen.queryByText(/v1\.0\.0/)).toBeNull();
  });
});

describe("TenantSwitcher", () => {
  const tenants = [
    { id: "a", name: "Acme" },
    { id: "b", name: "Globex" },
  ];

  it("closes the menu on Escape", async () => {
    render(
      <TenantSwitcher
        tenants={tenants}
        activeTenant={tenants[0] ?? null}
        onSwitch={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /acme/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});

describe("layout className passthrough", () => {
  it("LandingLayout merges className onto the root", () => {
    const { container } = render(
      <LandingLayout hero={<h1>Hero</h1>} className="land-x">
        <p>body</p>
      </LandingLayout>,
    );
    expect(container.querySelector(".land-x")).not.toBeNull();
  });

  it("AuthLayout merges className and augments (not replaces) the brand panel classes", () => {
    const { container } = render(
      <AuthLayout
        config={defaultLayoutPreset}
        className="auth-x"
        brandPanelClassName="my-panel"
      >
        <p>form</p>
      </AuthLayout>,
    );
    expect(container.querySelector(".auth-x")).not.toBeNull();
    const panel = container.querySelector(".my-panel");
    expect(panel).not.toBeNull();
    // The responsive defaults survive the custom class.
    expect(panel?.className).toMatch(/lg:w-1\/2/);
  });
});
