import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Presence, usePresence } from "./presence.js";

describe("Presence", () => {
  it("renders children", () => {
    render(<Presence>I am present</Presence>);
    expect(screen.getByText("I am present")).toBeInTheDocument();
  });

  it("provides isPresent = true by default", () => {
    let value: boolean | undefined;
    function Probe() {
      const ctx = usePresence();
      value = ctx?.isPresent;
      return null;
    }
    render(
      <Presence>
        <Probe />
      </Presence>,
    );
    expect(value).toBe(true);
  });

  it("provides isPresent = false when present={false}", () => {
    let value: boolean | undefined;
    function Probe() {
      const ctx = usePresence();
      value = ctx?.isPresent;
      return null;
    }
    render(
      <Presence present={false}>
        <Probe />
      </Presence>,
    );
    expect(value).toBe(false);
  });

  it("returns null context outside Presence", () => {
    let value: unknown;
    function Probe() {
      const ctx = usePresence();
      value = ctx;
      return null;
    }
    render(<Probe />);
    expect(value).toEqual({ isPresent: true });
  });
});
