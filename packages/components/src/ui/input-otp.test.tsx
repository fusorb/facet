import { describe, expect, it, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp.js";

// The input-otp paste handler schedules a timer that calls
// document.elementFromPoint, which jsdom doesn't implement. Stub it so
// those deferred tasks don't surface as unhandled errors after each test.
beforeAll(() => {
  if (typeof document.elementFromPoint !== "function") {
    document.elementFromPoint = () => null;
  }
});

function OTP({
  maxLength = 6,
  slots = 6,
  separated = false,
}: {
  maxLength?: number;
  slots?: number;
  separated?: boolean;
}) {
  return (
    <InputOTP maxLength={maxLength} aria-label="One-time code">
      <InputOTPGroup>
        {Array.from({ length: separated ? 3 : slots }, (_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
        {separated && (
          <>
            <InputOTPSeparator />
            {Array.from({ length: slots - 3 }, (_, i) => (
              <InputOTPSlot key={i + 3} index={i + 3} />
            ))}
          </>
        )}
      </InputOTPGroup>
    </InputOTP>
  );
}

describe("InputOTP", () => {
  it("spreads a pasted code across all slots", async () => {
    const user = userEvent.setup();
    render(<OTP slots={6} />);
    const input = screen.getByLabelText("One-time code");
    await user.click(input);
    await user.paste("123456");
    expect(input).toHaveValue("123456");
  });

  it("respects an 8-digit maxLength", async () => {
    const user = userEvent.setup();
    render(<OTP maxLength={8} slots={8} />);
    const input = screen.getByLabelText("One-time code");
    await user.click(input);
    await user.paste("12345678");
    expect(input).toHaveValue("12345678");
  });

  it("caps paste at maxLength even when more is pasted", async () => {
    const user = userEvent.setup();
    render(<OTP maxLength={4} slots={4} />);
    const input = screen.getByLabelText("One-time code");
    await user.click(input);
    await user.paste("12345678");
    expect(input).toHaveValue("1234");
  });

  it("renders a separated layout with the separator glyph", () => {
    render(<OTP slots={6} separated />);
    const input = screen.getByLabelText("One-time code");
    expect(input).toBeInTheDocument();
    expect(document.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("supports an 8-digit 3-2-3 separated layout", async () => {
    const user = userEvent.setup();
    render(
      <InputOTP maxLength={8} aria-label="One-time code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={5} />
          <InputOTPSlot index={6} />
          <InputOTPSlot index={7} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByLabelText("One-time code");
    await user.click(input);
    await user.paste("12345678");
    expect(input).toHaveValue("12345678");
    // 3-2-3 grouping has two separators.
    expect(document.querySelectorAll('[role="separator"]').length).toBe(2);
  });
});
