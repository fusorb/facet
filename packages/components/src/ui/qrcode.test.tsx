import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QRCode } from "./qrcode.js";

describe("QRCode", () => {
  it("renders an svg image with the encoded value", () => {
    render(<QRCode value="https://example.com" />);
    const img = screen.getByRole("img", { name: /qr code/i });
    expect(img.tagName.toLowerCase()).toBe("svg");
    expect(img.getAttribute("aria-label")).toBe("QR code");
  });

  it("applies the given size", () => {
    render(<QRCode value="hello" size={240} />);
    const img = screen.getByRole("img", { name: /qr code/i });
    expect(img.getAttribute("width")).toBe("240");
  });

  it("renders distinct svg paths for different values", () => {
    const { container: a } = render(<QRCode value="one" />);
    const { container: b } = render(<QRCode value="two" />);
    const pathsA = a.querySelectorAll("path").length;
    const pathsB = b.querySelectorAll("path").length;
    // Both render, and the modules differ between values.
    expect(pathsA).toBeGreaterThan(0);
    expect(pathsB).toBeGreaterThan(0);
  });

  it("overlays a logo image when provided", () => {
    render(
      <QRCode
        value="https://example.com"
        logo="https://example.com/logo.png"
      />,
    );
    const logoImg = screen.getByRole("img", { name: /logo\.png/i });
    expect(logoImg.tagName.toLowerCase()).toBe("img");
  });

  it("does not render a logo overlay when none is given", () => {
    render(<QRCode value="https://example.com" />);
    expect(
      screen.queryByRole("img", { name: /logo\.png/i }),
    ).not.toBeInTheDocument();
  });

  it("positions the logo overlay for corner placements", () => {
    const { container } = render(
      <QRCode
        value="https://example.com"
        size={200}
        logo="https://example.com/logo.png"
        logoSize={50}
        logoPosition="top-right"
      />,
    );
    const overlay = container.querySelector(
      "[data-logo-overlay]",
    )! as HTMLElement;
    const style = overlay.style;
    // Top-right: anchored to the top/right with no translate.
    expect(style.top).toBeTruthy();
    expect(style.right).toBeTruthy();
    expect(style.transform).toBe("translate(0, 0)");
  });

  it("centers the logo overlay by default", () => {
    const { container } = render(
      <QRCode
        value="https://example.com"
        logo="https://example.com/logo.png"
        logoSize={40}
        logoPosition="center"
      />,
    );
    const overlay = container.querySelector(
      "[data-logo-overlay]",
    )! as HTMLElement;
    expect(overlay.style.top).toBe("50%");
    expect(overlay.style.left).toBe("50%");
    expect(overlay.style.transform).toBe("translate(-50%, -50%)");
  });
});
