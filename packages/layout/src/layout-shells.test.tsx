import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutProvider } from "./layout-context.js";
import { ConsoleLayout } from "./console-layout.js";
import { Topbar } from "./topbar.js";
import { ChatLayout, ChatInput } from "./chat-layout.js";
import { PageHeader } from "./page-header.js";
import { UserMenu } from "./user-menu.js";
import { defaultLayoutPreset, fintechLayoutPreset } from "./presets.js";

afterEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

describe("Topbar", () => {
  it("renders brand, nav, and right-side children", () => {
    render(
      <LayoutProvider>
        <Topbar
          brand={<span>Brand</span>}
          nav={<span>Nav</span>}
        >
          <button type="button">Action</button>
        </Topbar>
      </LayoutProvider>,
    );
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Nav")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    // Mobile hamburger is present by default.
    expect(
      screen.getByRole("button", { name: /toggle sidebar/i }),
    ).toBeInTheDocument();
  });

  it("shows the rail collapse toggle only in rail mode", () => {
    const { rerender } = render(
      <LayoutProvider>
        <Topbar mode="full" />
      </LayoutProvider>,
    );
    expect(
      screen.queryByRole("button", { name: /collapse sidebar/i }),
    ).toBeNull();

    rerender(
      <LayoutProvider>
        <Topbar mode="rail" />
      </LayoutProvider>,
    );
    expect(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    ).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("renders title, description and actions", () => {
    const { container } = render(
      <PageHeader
        title="Title"
        description="Desc"
        actions={<button type="button">Go</button>}
        className="ph-x"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    expect(container.querySelector(".ph-x")).not.toBeNull();
  });

  it("supports a custom title renderer", () => {
    render(
      <PageHeader title="T" renderTitle={(t) => <h2>{t}!</h2>} />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "T!" }),
    ).toBeInTheDocument();
  });
});

describe("UserMenu", () => {
  it("renders nothing without an auth context", () => {
    const { container } = render(
      <LayoutProvider>
        <UserMenu />
      </LayoutProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ChatInput", () => {
  it("sends on Enter and clears the value", () => {
    const onSend = vi.fn();
    render(<ChatInput onSendMessage={onSend} />);
    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "hello" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("hello");
    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });

  it("does not send on Shift+Enter", () => {
    const onSend = vi.fn();
    render(<ChatInput onSendMessage={onSend} />);
    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "line" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe("ChatLayout", () => {
  it("renders children and the brand only once in the sidebar", () => {
    render(
      <ChatLayout config={defaultLayoutPreset} onSendMessage={() => {}}>
        <div>MESSAGE</div>
      </ChatLayout>,
    );
    expect(screen.getByText("MESSAGE")).toBeInTheDocument();
    // ChatSidebar header is the only place the brand renders (Sidebar's
    // default brand block is suppressed).
    expect(screen.getAllByText("App")).toHaveLength(1);
  });
});

describe("ConsoleLayout features wiring", () => {
  const tenants = [
    { id: "a", name: "Acme" },
    { id: "b", name: "Globex" },
  ];

  it("honors features.tenantSwitcher === false even with tenants", () => {
    render(
      <ConsoleLayout
        config={defaultLayoutPreset}
        tenants={tenants}
        activeTenant={tenants[0] ?? null}
      >
        <div>content</div>
      </ConsoleLayout>,
    );
    expect(screen.queryByRole("button", { name: /acme/i })).toBeNull();
  });

  it("shows the tenant switcher when features.tenantSwitcher is true", () => {
    render(
      <ConsoleLayout
        config={fintechLayoutPreset}
        tenants={tenants}
        activeTenant={tenants[0] ?? null}
      >
        <div>content</div>
      </ConsoleLayout>,
    );
    expect(screen.getByRole("button", { name: /acme/i })).toBeInTheDocument();
  });

  it("renders the command-palette trigger when features.search is true", () => {
    render(
      <ConsoleLayout
        config={{ ...defaultLayoutPreset, features: { search: true } }}
      >
        <div>content</div>
      </ConsoleLayout>,
    );
    expect(screen.getByText("Search docs...")).toBeInTheDocument();
  });

  it("does not render the search trigger by default", () => {
    render(
      <ConsoleLayout config={defaultLayoutPreset}>
        <div>content</div>
      </ConsoleLayout>,
    );
    expect(screen.queryByText("Search docs...")).toBeNull();
  });
});
