import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberInput, CURRENCIES, type Currency } from "./number-input.js";

/** Stateful harness so typing tests work with the controlled component. */
function Controlled({
  initial,
  onValueChange,
  ...props
}: React.ComponentProps<typeof NumberInput> & { initial: number }) {
  const [value, setValue] = React.useState(initial);
  return (
    <NumberInput
      value={value}
      onValueChange={(v) => {
        setValue(v ?? 0);
        onValueChange?.(v);
      }}
      {...props}
    />
  );
}

describe("NumberInput", () => {
  it("renders the current value", () => {
    render(<NumberInput value={5} />);
    expect(screen.getByRole("textbox")).toHaveValue("5");
  });

  it("increments with the up button", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput value={5} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByLabelText("Increase value"));
    expect(onValueChange).toHaveBeenLastCalledWith(6);
  });

  it("decrements with the down button", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput value={5} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByLabelText("Decrease value"));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it("clamps to min and max", async () => {
    const onValueChange = vi.fn();
    const maxView = render(
      <NumberInput value={10} min={0} max={10} onValueChange={onValueChange} />,
    );
    const up = within(maxView.baseElement).getByLabelText("Increase value");
    expect(up).toBeDisabled();
    await userEvent.click(up);
    expect(onValueChange).not.toHaveBeenCalled();
    maxView.unmount();

    const minView = render(
      <NumberInput value={0} min={0} max={10} onValueChange={onValueChange} />,
    );
    const down = within(minView.baseElement).getByLabelText("Decrease value");
    expect(down).toBeDisabled();
    await userEvent.click(down);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("steps by the configured step", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput value={2} step={0.5} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByLabelText("Increase value"));
    expect(onValueChange).toHaveBeenLastCalledWith(2.5);
  });

  it("accepts typed numbers and clamps on change", async () => {
    const onValueChange = vi.fn();
    render(
      <Controlled initial={0} min={0} max={10} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "7");
    expect(onValueChange).toHaveBeenLastCalledWith(7);
  });

  it("renders a label when provided", () => {
    render(<NumberInput value={1} label="Quantity" />);
    expect(screen.getByText("Quantity")).toBeInTheDocument();
  });

  it("renders a currency prefix and keeps numeric value", async () => {
    const onValueChange = vi.fn();
    render(
      <Controlled initial={25} currency="$" onValueChange={onValueChange} />,
    );
    expect(screen.getByText("$")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("25");
    await userEvent.clear(input);
    await userEvent.type(input, "30");
    expect(onValueChange).toHaveBeenLastCalledWith(30);
  });

  it("clamps negatives to zero when beyondZero is set", async () => {
    const onValueChange = vi.fn();
    render(<Controlled initial={5} beyondZero onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox");
    // Simulate a completed entry of "-3" (single change event, like paste).
    fireEvent.change(input, { target: { value: "-3" } });
    // Clamped to 0.
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("disables the decrement button at zero when beyondZero", () => {
    render(<NumberInput value={0} beyondZero />);
    expect(screen.getByLabelText("Decrease value")).toBeDisabled();
  });

  it("exposes the built-in currency list", () => {
    expect(CURRENCIES.length).toBeGreaterThan(0);
    expect(CURRENCIES.map((c) => c.code)).toContain("USD");
    expect(CURRENCIES.map((c) => c.code)).toContain("NGN");
  });

  it("opens the currency picker and reports the picked currency", async () => {
    const onCurrencyChange = vi.fn();
    render(
      <NumberInput
        value={25}
        currency="$"
        currencyPicker
        onCurrencyChange={onCurrencyChange}
      />,
    );
    await userEvent.click(screen.getByLabelText("Currency: US Dollar"));
    await userEvent.click(screen.getByText("Nigerian Naira"));
    expect(onCurrencyChange).toHaveBeenCalledWith(
      expect.objectContaining<Partial<Currency>>({ code: "NGN", symbol: "₦" }),
    );
  });

  it("pins a custom currency option list", async () => {
    const onCurrencyChange = vi.fn();
    const options: Currency[] = [{ code: "XBT", symbol: "₿", name: "Bitcoin" }];
    render(
      <NumberInput
        value={1}
        currency="₿"
        currencyPicker
        currencyOptions={options}
        onCurrencyChange={onCurrencyChange}
      />,
    );
    await userEvent.click(screen.getByLabelText("Currency: Bitcoin"));
    await userEvent.click(screen.getByText("Bitcoin"));
    expect(onCurrencyChange).toHaveBeenCalledWith(
      expect.objectContaining<Partial<Currency>>({ code: "XBT", symbol: "₿" }),
    );
  });
});
