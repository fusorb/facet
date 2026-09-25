import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangelogFeed } from "./changelog-feed.js";
import type { ChangelogItem } from "./changelog-card.js";

const items: ChangelogItem[] = [
  {
    id: "1",
    version: "v2.5.0",
    date: "August 2026",
    status: "Current",
    category: "FEATURE",
    title: "Console surface",
    description: "Rebuilt the hero.",
    highlights: ["Auth preview"],
  },
  {
    id: "2",
    version: "v2.4.1",
    date: "July 2026",
    status: null,
    category: "FIX",
    title: "Bug fix release",
    description: "Fixed a regression.",
    highlights: ["Patched X"],
    codeDiff: { language: "ts", code: "fix: X" },
  },
];

describe("ChangelogFeed", () => {
  it("renders a card for each release", () => {
    render(<ChangelogFeed items={items} />);
    expect(screen.getByText("v2.5.0")).toBeInTheDocument();
    expect(screen.getByText("v2.4.1")).toBeInTheDocument();
  });

  it("filters releases by search term", () => {
    render(<ChangelogFeed items={items} />);
    const search = screen.getByRole("searchbox", { name: /search releases/i });
    fireEvent.change(search, { target: { value: "Console" } });
    expect(screen.getByText("v2.5.0")).toBeInTheDocument();
    expect(screen.queryByText("v2.4.1")).not.toBeInTheDocument();
  });

  it("filters releases by category", () => {
    render(<ChangelogFeed items={items} />);
    fireEvent.click(screen.getByRole("button", { name: /features/i }));
    expect(screen.getByText("v2.5.0")).toBeInTheDocument();
    expect(screen.queryByText("v2.4.1")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    render(<ChangelogFeed items={items} defaultSearch="no match" />);
    expect(screen.getByText("No matching releases.")).toBeInTheDocument();
  });
});
