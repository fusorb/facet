import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DatePicker,
  toIsoDate,
  parseIsoDate,
  isSameDay,
  addMonths,
  startOfMonth,
  formatDate,
} from "./date-picker.js";

describe("date helpers", () => {
  it("isSameDay compares year/month/date", () => {
    expect(isSameDay(new Date(2026, 0, 15), new Date(2026, 0, 15))).toBe(true);
    expect(isSameDay(new Date(2026, 0, 15), new Date(2026, 0, 16))).toBe(false);
  });

  it("toIsoDate zero-pads", () => {
    expect(toIsoDate(new Date(2026, 2, 5))).toBe("2026-03-05");
  });

  it("parseIsoDate round-trips", () => {
    expect(toIsoDate(parseIsoDate("2026-03-05")!)).toBe("2026-03-05");
    expect(parseIsoDate("garbage")).toBeNull();
  });

  it("addMonths rolls over year boundaries", () => {
    expect(toIsoDate(startOfMonth(addMonths(new Date(2026, 11, 20), 2)))).toBe(
      "2027-02-01",
    );
  });

  it("formatDate renders a readable string", () => {
    expect(formatDate(new Date(2026, 2, 5))).toContain("2026");
  });
});

describe("DatePicker", () => {
  it("renders the trigger with the placeholder", () => {
    render(<DatePicker label="Due date" />);
    expect(screen.getByLabelText("Due date")).toBeInTheDocument();
  });

  it("renders the selected date in the trigger", () => {
    render(<DatePicker value={new Date(2026, 2, 5)} label="Due date" />);
    expect(screen.getByText(/Mar/)).toBeInTheDocument();
  });

  it("opens the calendar and selects a day", async () => {
    const onValueChange = vi.fn();
    render(<DatePicker label="Due date" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByLabelText("Due date"));
    // Current month grid renders day numbers; pick the 15th.
    const day = screen.getByRole("button", { name: /15/ });
    await userEvent.click(day);
    expect(onValueChange).toHaveBeenCalled();
    const picked = onValueChange.mock.calls[0]![0] as Date;
    expect(picked.getDate()).toBe(15);
  });

  it("navigates months with prev/next buttons", async () => {
    render(<DatePicker label="Due date" value={new Date(2026, 0, 10)} />);
    await userEvent.click(screen.getByLabelText("Due date"));
    expect(screen.getByText(/January 2026/)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByText(/February 2026/)).toBeInTheDocument();
  });

  it("renders horizontal scroll mode with day strip", async () => {
    render(
      <DatePicker
        label="Due date"
        scrollMode="horizontal"
        horizontalDays={14}
      />,
    );
    await userEvent.click(screen.getByLabelText("Due date"));
    const today = new Date();
    const label = formatDate(today);
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  });

  it("disables all interactions when disabledAll is set", async () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker label="Due date" onValueChange={onValueChange} disabledAll />,
    );
    const trigger = screen.getByLabelText("Due date");
    expect(trigger).toBeDisabled();
    // Trigger should not open the popover when disabled.
    fireEvent.click(trigger);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders a year picker when showYearPicker is set", async () => {
    render(<DatePicker label="Due date" value={new Date(2026, 2, 5)} />);
    await userEvent.click(screen.getByLabelText("Due date"));
    expect(screen.getByLabelText("Select year")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous year")).toBeInTheDocument();
    expect(screen.getByLabelText("Next year")).toBeInTheDocument();
  });

  it("jumps to a different year via the year select", async () => {
    render(<DatePicker label="Due date" value={new Date(2026, 2, 5)} />);
    await userEvent.click(screen.getByLabelText("Due date"));
    const yearSelect = screen.getByLabelText("Select year");
    fireEvent.change(yearSelect, { target: { value: "2028" } });
    // The calendar header reflects the new month+year (the year select
    // also shows 2028, so match the header span specifically).
    expect(screen.getByText(/March 2028/)).toBeInTheDocument();
  });

  it("clamps to minYear and maxYear", async () => {
    render(
      <DatePicker
        label="Due date"
        value={new Date(2026, 2, 5)}
        minYear={2020}
        maxYear={2030}
      />,
    );
    await userEvent.click(screen.getByLabelText("Due date"));
    const yearSelect = screen.getByLabelText("Select year");
    const options = Array.from(yearSelect.querySelectorAll("option")).map((o) =>
      Number(o.value),
    );
    expect(Math.min(...options)).toBe(2020);
    expect(Math.max(...options)).toBe(2030);
  });
});
