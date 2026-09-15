import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./password-input.js";

describe("PasswordInput", () => {
  it("renders as a password field by default", () => {
    const { container } = render(<PasswordInput value="secret" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("aria-label", "Password");
  });

  it("toggles visibility on click", async () => {
    const { container } = render(<PasswordInput value="secret" />);
    const toggle = screen.getByLabelText("Show password");
    await userEvent.click(toggle);
    expect(container.querySelector("input")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();
  });

  it("renders a label when provided", () => {
    render(<PasswordInput label="Password" />);
    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  it("respects controlled visibility", async () => {
    const onVisibleChange = vi.fn();
    const { container } = render(
      <PasswordInput
        value="secret"
        visible={false}
        onVisibleChange={onVisibleChange}
      />,
    );
    await userEvent.click(screen.getByLabelText("Show password"));
    expect(onVisibleChange).toHaveBeenCalledWith(true);
    // Controlled: stays hidden because visible prop is still false.
    expect(container.querySelector("input")).toHaveAttribute(
      "type",
      "password",
    );
  });
});
