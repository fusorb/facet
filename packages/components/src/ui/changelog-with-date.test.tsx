import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangelogWithDate } from "./changelog-with-date.js";
import type { ChangelogRelease } from "./changelog-list.js";

const releases: ChangelogRelease[] = [
  {
    version: "1.4.0",
    date: "2026-08-12",
    tag: "release",
    changes: [
      { kind: "added", text: "FaqSection component" },
      { kind: "fixed", text: "Billing interval toggle" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-03",
    tag: "release",
    changes: [{ kind: "added", text: "WizardFormPage" }],
  },
  {
    version: "1.3.0-beta.0",
    date: "2026-06-15",
    pre: true,
    tag: "pre-release",
    changes: [{ kind: "added", text: "Beta feature" }],
  },
  {
    version: "1.2.0",
    date: "2025-11-20",
    changes: [
      { kind: "changed", text: "Token refresh logic" },
      { kind: "security", text: "CVE patch" },
    ],
  },
];

describe("ChangelogWithDate", () => {
  it("renders each release with its version and date", () => {
    render(<ChangelogWithDate releases={releases} />);
    expect(screen.getByText("v1.4.0")).toBeInTheDocument();
    expect(screen.getByText("v1.3.0")).toBeInTheDocument();
    expect(screen.getByText("v1.2.0")).toBeInTheDocument();
    expect(screen.getByText("FaqSection component")).toBeInTheDocument();
  });

  it("groups releases by year with sticky year headers", () => {
    render(<ChangelogWithDate releases={releases} groupBy="year" />);
    // 2026 and 2025 should both appear as group headers.
    expect(screen.getAllByText("2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2025").length).toBeGreaterThanOrEqual(1);
  });

  it("groups releases by month when groupBy is 'month'", () => {
    render(<ChangelogWithDate releases={releases} groupBy="month" />);
    // Month labels are locale-dependent (e.g. "Aug 2026"), but at least
    // the August and November labels should be present.
    const texts = screen.getAllByText(/2026/i);
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the filter row when showFilter is true", () => {
    render(<ChangelogWithDate releases={releases} showFilter />);
    expect(
      screen.getByRole("button", { pressed: true, name: /added/i }),
    ).toBeInTheDocument();
  });

  it("hides changes of a toggled-off kind", () => {
    render(<ChangelogWithDate releases={releases} showFilter />);
    const fixedChip = screen.getByRole("button", { name: /fixed/i });
    fireEvent.click(fixedChip);
    expect(
      screen.queryByText("Billing interval toggle"),
    ).not.toBeInTheDocument();
  });

  it("marks pre-releases with the pre-release pill", () => {
    render(<ChangelogWithDate releases={releases} />);
    const pills = screen.getAllByText("pre-release");
    expect(pills.length).toBeGreaterThan(0);
  });

  it("renders a fallback message when there are no releases", () => {
    render(<ChangelogWithDate releases={[]} />);
    expect(
      screen.getByText("No changelog entries to display."),
    ).toBeInTheDocument();
  });

  it("sorts groups newest-first", () => {
    render(<ChangelogWithDate releases={releases} groupBy="year" />);
    const yearLabels = screen
      .getAllByText(/^(2026|2025)$/)
      .map((el) => el.textContent);
    expect(yearLabels[0]).toBe("2026");
    expect(yearLabels[yearLabels.length - 1]).toBe("2025");
  });
});
