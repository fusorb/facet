import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "./dropzone.js";

function makeFiles(): File[] {
  const file = new File(["hello"], "hello.txt", { type: "text/plain" });
  return [file];
}

describe("Dropzone", () => {
  it("renders label and hint", () => {
    render(<Dropzone label="Upload invoice" hint="PDF up to 5MB" />);
    expect(
      screen.getByRole("button", { name: /upload invoice/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("PDF up to 5MB")).toBeInTheDocument();
  });

  it("fires onFiles on a drop event", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} />);
    const zone = screen.getByRole("button", { name: /drag files here/i });

    fireEvent.dragOver(zone);
    expect(zone).toHaveClass("border-primary");

    fireEvent.drop(zone, { dataTransfer: { files: makeFiles() } });
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles).toHaveBeenCalledWith(makeFiles());
    expect(zone).not.toHaveClass("border-primary");
  });

  it("opens the file input on click", async () => {
    render(<Dropzone />);
    const zone = screen.getByRole("button", { name: /drag files here/i });
    const input = zone.querySelector<HTMLInputElement>("input[type=file]");
    const clickSpy = vi.spyOn(input!, "click").mockImplementation(() => {});
    await userEvent.click(zone);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("opens the file input on Enter key", async () => {
    render(<Dropzone />);
    const zone = screen.getByRole("button", { name: /drag files here/i });
    const input = zone.querySelector<HTMLInputElement>("input[type=file]");
    const clickSpy = vi.spyOn(input!, "click").mockImplementation(() => {});
    zone.focus();
    await userEvent.keyboard("{Enter}");
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("does not fire onFiles when disabled", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} disabled />);
    const zone = screen.getByRole("button", { name: /drag files here/i });
    fireEvent.drop(zone, { dataTransfer: { files: makeFiles() } });
    expect(onFiles).not.toHaveBeenCalled();
  });
});
