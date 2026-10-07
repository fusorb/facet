import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OtpInput } from "./otp-input.js";

describe("OtpInput", () => {
  it("renders one box per digit at on-grid spacing (no near-merge)", () => {
    const { container } = render(
      <OtpInput maxLength={6} value="" onChange={() => {}} ariaLabel="Code" />,
    );
    const group = container.querySelector('[role="group"]')!;
    // gap-2 (8px) sits on the 4/8 grid and exceeds the box border-radius, so
    // adjacent rounded corners no longer near-merge.
    expect(group).toHaveClass("gap-2");
    // Exactly one input per digit.
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
  });
});
