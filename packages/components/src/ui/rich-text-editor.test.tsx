import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { RichTextEditor } from "./rich-text-editor.js";

afterEach(cleanup);

// jsdom doesn't implement document.execCommand - mock it so the link dialog tests can spy on it
if (!("execCommand" in document)) {
  Object.defineProperty(document, "execCommand", {
    value: vi.fn(() => true),
    writable: true,
    configurable: true,
  });
}

describe("RichTextEditor sanitization", () => {
  it("strips <script> tags from the value before rendering", async () => {
    render(
      <RichTextEditor
        value="<p>Hello</p><script>alert('xss')</script>"
        onChange={vi.fn()}
      />,
    );
    const editor = screen.getByRole("textbox") as HTMLDivElement;
    await waitFor(() => {
      expect(editor.innerHTML).not.toContain("<script");
    });
  });

  it("strips event-handler attributes (onclick, onload, etc.) from the value", async () => {
    render(
      <RichTextEditor
        value='<p onclick="alert(1)">click me</p>'
        onChange={vi.fn()}
      />,
    );
    const editor = screen.getByRole("textbox") as HTMLDivElement;
    await waitFor(() => {
      expect(editor.innerHTML).not.toMatch(/onclick/i);
    });
  });

  it("strips javascript: URLs from anchor hrefs in the value", async () => {
    render(
      <RichTextEditor
        value='<a href="javascript:alert(1)">evil link</a>'
        onChange={vi.fn()}
      />,
    );
    const editor = screen.getByRole("textbox") as HTMLDivElement;
    await waitFor(() => {
      // DOMPurify removes the entire anchor (or at minimum the javascript: scheme)
      // - either way, no javascript: URL should survive into the DOM
      expect(editor.innerHTML).not.toContain("javascript:");
    });
  });

  it("preserves safe content (paragraphs, bold, links to https)", async () => {
    render(
      <RichTextEditor
        value='<p>Visit <a href="https://example.com">Example</a></p>'
        onChange={vi.fn()}
      />,
    );
    const editor = screen.getByRole("textbox") as HTMLDivElement;
    await waitFor(() => {
      expect(editor.innerHTML).toContain("Example");
    });
    const anchor = editor.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://example.com");
  });

  it("rejects javascript: URL in the link dialog", async () => {
    const onChange = vi.fn();
    const execSpy = vi.spyOn(document, "execCommand").mockImplementation(() => true);
    render(<RichTextEditor value="" onChange={onChange} />);

    // Open the link dialog
    fireEvent.click(screen.getByLabelText("Link"));

    const urlInput = screen.getByPlaceholderText("https://") as HTMLInputElement;
    fireEvent.change(urlInput, { target: { value: "javascript:alert(1)" } });

    fireEvent.click(screen.getByRole("button", { name: "Insert" }));

    await waitFor(() => {
      expect(execSpy.mock.calls).toHaveLength(0);
    });

    execSpy.mockRestore();
  });

  it("accepts https:// URL in the link dialog", async () => {
    const onChange = vi.fn();
    const execSpy = vi.spyOn(document, "execCommand").mockImplementation(() => true);
    render(<RichTextEditor value="" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Link"));

    const urlInput = screen.getByPlaceholderText("https://") as HTMLInputElement;
    fireEvent.change(urlInput, { target: { value: "https://example.com" } });

    fireEvent.click(screen.getByRole("button", { name: "Insert" }));

    await waitFor(() => {
      expect(execSpy).toHaveBeenCalledWith("createLink", false, "https://example.com");
    });

    execSpy.mockRestore();
  });

  it("rejects data: URL in the link dialog", async () => {
    const onChange = vi.fn();
    const execSpy = vi.spyOn(document, "execCommand").mockImplementation(() => true);
    render(<RichTextEditor value="" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Link"));

    const urlInput = screen.getByPlaceholderText("https://") as HTMLInputElement;
    fireEvent.change(urlInput, { target: { value: "data:text/html,<script>alert(1)</script>" } });

    fireEvent.click(screen.getByRole("button", { name: "Insert" }));

    await waitFor(() => {
      expect(execSpy.mock.calls).toHaveLength(0);
    });

    execSpy.mockRestore();
  });
});
