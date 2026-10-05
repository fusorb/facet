import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "./button.js";
import { Input } from "./input.js";

/*
 * Verifies Stage 2 of the focus restoration: visible focus rings are wired
 * behind `focus-visible:`, so they appear ONLY for keyboard / programmatic
 * focus. Mouse clicks do not match `:focus-visible`, therefore they produce
 * no ring (and no outline) — no "unnecessary border on click".
 *
 * The ring colour resolves to the `--ring` token (verified in
 * packages/tokens/src/tailwind.css: `--color-ring: var(--ring)` → #38bdf8).
 */
describe("focus-ring (focus-visible, keyboard-only)", () => {
  it("Button exposes a focus-visible ring from the --ring token", () => {
    const { container } = render(<Button>Focus me</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.className).toContain("focus-visible:ring-2");
    expect(btn.className).toContain("focus-visible:ring-[var(--ring)]");
    expect(btn.className).toContain("focus-visible:outline-none");
    expect(btn.className).toContain("focus-visible:ring-offset-2");
  });

  it("Input exposes a focus-visible ring from the --ring token", () => {
    const { container } = render(<Input type="email" />);
    const input = container.firstChild as HTMLElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.className).toContain("focus-visible:ring-2");
    expect(input.className).toContain("focus-visible:ring-[var(--ring)]");
  });
});
