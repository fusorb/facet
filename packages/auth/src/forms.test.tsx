import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ArcProvider } from "./provider.js";
import { ArcIdClient } from "@fusorb/facet-sdk";
import { createMemoryStorage } from "./test-storage.js";
import { SignUp } from "./sign-up.js";
import { LoginForm } from "./forms/auth/login-form.js";

afterEach(() => cleanup());

const client = new ArcIdClient({ baseUrl: "https://auth.example.dev/api/v1" });

describe("auth form copy overrides", () => {
  it("SignUp renders custom copy when provided", () => {
    render(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignUp
          copy={{
            title: "Join the platform",
            nameLabel: "Your name",
            emailLabel: "Work email",
            passwordLabel: "Secret",
            confirmLabel: "Repeat secret",
            submitLabel: "Sign up now",
            alreadyHaveAccount: "Have an account?",
            signInLink: "Log in",
          }}
        />
      </ArcProvider>,
    );
    expect(screen.getByText("Join the platform")).toBeInTheDocument();
    expect(screen.getByText("Your name")).toBeInTheDocument();
    expect(screen.getByText("Work email")).toBeInTheDocument();
    expect(screen.getByText("Secret")).toBeInTheDocument();
    expect(screen.getByText("Repeat secret")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up now/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Have an account?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("SignUp falls back to default copy when no override", () => {
    render(
      <ArcProvider client={client} storage={createMemoryStorage()}>
        <SignUp />
      </ArcProvider>,
    );
    expect(screen.getByText("Create an Account")).toBeInTheDocument();
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("LoginForm renders custom copy when provided", () => {
    render(
      <LoginForm
        copy={{
          title: "Welcome back",
          emailLabel: "Email address",
          passwordLabel: "Passcode",
          submitLabel: "Enter",
        }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Email address")).toBeInTheDocument();
    expect(screen.getByText("Passcode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enter/i })).toBeInTheDocument();
  });

  it("LoginForm falls back to default copy", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    // Default title and submit label are both "Sign In" - both render.
    expect(screen.getAllByText("Sign In")).toHaveLength(2);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });
});
