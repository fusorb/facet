import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme, ThemeToggle } from "./index.js";

function Probe() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} data-testid="probe">
      {theme}:{resolvedTheme ?? "none"}
    </button>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
    // jsdom has no matchMedia: provide a controllable stub.
    const mql = {
      matches: false,
      media: "(prefers-color-scheme: light)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mql);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the default theme to the data attribute", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("resolves system to the OS preference", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    render(
      <ThemeProvider defaultTheme="system">
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists setTheme to localStorage and re-applies it", async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(localStorage.getItem("facet-theme")).toBeNull();

    // dark → light via the probe's toggleTheme
    await userEvent.click(screen.getByTestId("probe"));
    expect(localStorage.getItem("facet-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // A fresh provider reads the stored value back
    const { unmount } = render(
      <ThemeProvider defaultTheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByTestId("probe")[0]).toHaveTextContent(
        "light:light",
      ),
    );
    unmount();
  });

  it("applies overrideVars to the root element", () => {
    render(
      <ThemeProvider
        defaultTheme="dark"
        overrideVars={{ "--primary": "oklch(0.5 0.2 30)" }}
      >
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "oklch(0.5 0.2 30)",
    );
  });

  it("useTheme throws outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      "useTheme must be used within a <ThemeProvider>",
    );
    spy.mockRestore();
  });
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    const mql = {
      matches: false,
      media: "(prefers-color-scheme: light)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mql);
  });

  it("renders a trigger and switches themes", async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: /toggle theme/i });
    await userEvent.click(trigger);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("facet-theme")).toBe("light");
  });
});
