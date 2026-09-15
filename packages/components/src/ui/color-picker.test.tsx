import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorPicker, normalizeHex, isValidHex } from "./color-picker.js";

describe("normalizeHex", () => {
  it("expands shorthand to six digits", () => {
    expect(normalizeHex("#f00")).toBe("#ff0000");
  });

  it("normalizes case and strips a missing #", () => {
    expect(normalizeHex("ABC123")).toBe("#abc123");
  });

  it("returns empty for invalid input", () => {
    expect(normalizeHex("not-a-color")).toBe("");
  });
});

describe("isValidHex", () => {
  it("accepts 3 and 6 digit hex", () => {
    expect(isValidHex("#abc")).toBe(true);
    expect(isValidHex("#aabbcc")).toBe(true);
  });

  it("rejects invalid strings", () => {
    expect(isValidHex("red")).toBe(false);
    expect(isValidHex("#ggg")).toBe(false);
  });
});

describe("ColorPicker", () => {
  it("renders a color input with the current value", () => {
    render(<ColorPicker value="#6366f1" />);
    const colorInput = screen
      .getByRole("group")
      .querySelector('input[type="color"]');
    expect(colorInput).toHaveValue("#6366f1");
  });

  it("fires onValueChange from the hex field with a normalized value", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker value="#000000" onValueChange={onValueChange} />);
    const hex = screen.getByLabelText(/hex/i);
    fireEvent.change(hex, { target: { value: "#abc" } });
    expect(onValueChange).toHaveBeenLastCalledWith("#aabbcc");
  });

  it("does not fire onValueChange for invalid hex", async () => {
    const onValueChange = vi.fn();
    render(<ColorPicker value="#000000" onValueChange={onValueChange} />);
    const hex = screen.getByLabelText(/hex/i);
    await userEvent.clear(hex);
    await userEvent.type(hex, "zzz");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("marks an invalid draft with a destructive border", async () => {
    render(<ColorPicker value="#000000" />);
    const hex = screen.getByLabelText(/hex/i);
    await userEvent.clear(hex);
    await userEvent.type(hex, "zzz");
    expect(hex).toHaveClass("border-destructive");
  });

  it("fires onValueChange from the native color swatch", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker value="#000000" onValueChange={onValueChange} />);
    fireEvent.change(
      screen.getByRole("group").querySelector('input[type="color"]')!,
      {
        target: { value: "#ff0000" },
      },
    );
    expect(onValueChange).toHaveBeenCalledWith("#ff0000");
  });
});
