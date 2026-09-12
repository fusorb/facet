import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignIn } from "./sign-in.js";
import { ArcProvider } from "./provider.js";
import { ArcIdClient } from "@fusorb/facet-sdk";
import { createMemoryStorage } from "./test-storage.js";
import { defaultConfig } from "./types.js";
// RTL's auto-cleanup doesn't fire under this setup (shared setup has no RTL),
// so unmount between tests to avoid duplicate-element matches across cases.
afterEach(() => {
  cleanup();
});

describe("SignIn OAuth providers", () => {
  it("renders provider buttons from config and calls onOAuth", async () => {
    const client = new ArcIdClient({ baseUrl: "https://auth.arcevo.dev/api/v1" });
    const onOAuth = vi.fn();

    // Config with OAuth providers: google + saml
    const config = {
      ...defaultConfig,
      oauthProviders: ["google", "saml"],
    };

    render(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignIn config={config} onOAuth={onOAuth} />
      </ArcProvider>,
    );

    // Provider buttons render on the default login form
    const google = await screen.findByRole("button", {
      name: /sign in with google/i,
    });
    expect(google).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in with saml/i })).toBeInTheDocument();

    await userEvent.click(google);
    expect(onOAuth).toHaveBeenCalledWith("google");
  });
});

describe("SignIn initialStep", () => {
  it("defaults to the login form with embedded methods", async () => {
    const client = new ArcIdClient({ baseUrl: "https://auth.arcevo.dev/api/v1" });
    render(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignIn />
      </ArcProvider>,
    );

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    // The method picker step is not shown, but the alternates are embedded.
    expect(
      screen.queryByRole("button", { name: /continue with email & password/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with magic link/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with passkey/i })).toBeInTheDocument();
  });

  it("renders the method picker when initialStep=\"select_method\"", async () => {
    const client = new ArcIdClient({ baseUrl: "https://auth.arcevo.dev/api/v1" });
    render(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignIn initialStep="select_method" />
      </ArcProvider>,
    );

    expect(
      await screen.findByRole("button", { name: /continue with email & password/i }),
    ).toBeInTheDocument();
  });

  it("renders the login form when initialStep=\"login_form\"", async () => {
    const client = new ArcIdClient({ baseUrl: "https://auth.arcevo.dev/api/v1" });
    render(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignIn initialStep="login_form" />
      </ArcProvider>,
    );

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });
});

describe("SignIn controlled step", () => {
  it("renders the given step and reports internal transitions via onStepChange", async () => {
    const client = new ArcIdClient({ baseUrl: "https://auth.arcevo.dev/api/v1" });
    const onStepChange = vi.fn();

    const { rerender } = render(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignIn step="login_form" onStepChange={onStepChange} />
      </ArcProvider>,
    );

    // Renders the controlled step.
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();

    // Clicking an embedded alternate reports the transition without
    // self-navigating (the parent owns the step).
    await userEvent.click(screen.getByRole("button", { name: /continue with magic link/i }));
    expect(onStepChange).toHaveBeenCalledWith("magic_link_form");

    // The parent re-renders with the new step -> SignIn follows it.
    rerender(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignIn step="magic_link_form" onStepChange={onStepChange} />
      </ArcProvider>,
    );
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  });
});
