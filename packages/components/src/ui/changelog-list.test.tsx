import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangelogList, type ChangelogRelease } from "./changelog-list.js";

const releases: ChangelogRelease[] = [
  {
    version: "1.0.0",
    date: "2026-01-15",
    changes: [
      { kind: "added", text: "Initial release" },
      { kind: "fixed", text: "Bug fix" },
    ],
  },
  {
    version: "0.9.0",
    date: "2025-12-01",
    tag: "pre-release",
    pre: true,
    changes: [{ kind: "added", text: "Beta feature" }],
  },
];

describe("ChangelogList", () => {
  it("renders each release with its version and date", () => {
    render(<ChangelogList releases={releases} />);
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
    expect(screen.getByText("v0.9.0")).toBeInTheDocument();
    expect(screen.getByText("Initial release")).toBeInTheDocument();
    expect(screen.getByText("Beta feature")).toBeInTheDocument();
  });

  it("groups changes by kind with the right pills", () => {
    render(<ChangelogList releases={releases} />);
    expect(screen.getAllByText("Added").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Fixed").length).toBeGreaterThan(0);
  });

  it("shows the filter row when showFilter is true", () => {
    render(<ChangelogList releases={releases} showFilter />);
    // The filter chips include a count badge per kind.
    expect(
      screen.getByRole("button", { pressed: true, name: /added/i }),
    ).toBeInTheDocument();
  });

  it("hides a kind's group when its filter is toggled off", () => {
    render(<ChangelogList releases={releases} showFilter />);
    const fixedChip = screen.getByRole("button", { name: /fixed/i });
    fireEvent.click(fixedChip);
    expect(screen.queryByText("Bug fix")).not.toBeInTheDocument();
  });
});
