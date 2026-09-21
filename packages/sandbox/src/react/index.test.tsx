import * as React from "react";
import { describe, it, expect } from "vitest";

import { isSafeUrl, sanitizeUrlProps } from "../index.js";
import { reactAdapter, renderFromCode } from "./index.js";

const Button = () => null;
const Item = () => null;

describe("url safety helpers", () => {
  it("accepts http/https/mailto/tel/relative/anchor/empty", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
    expect(isSafeUrl("mailto:a@b.com")).toBe(true);
    expect(isSafeUrl("tel:+12025550100")).toBe(true);
    expect(isSafeUrl("/relative/path")).toBe(true);
    expect(isSafeUrl("#anchor")).toBe(true);
    expect(isSafeUrl("?q=1")).toBe(true);
    expect(isSafeUrl("")).toBe(true);
  });

  it("blocks executable schemes", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeUrl("file:///etc/passwd")).toBe(false);
  });

  it("non-string props are treated as inert (safe)", () => {
    expect(isSafeUrl(42)).toBe(true);
    expect(isSafeUrl(null)).toBe(true);
    expect(isSafeUrl(undefined)).toBe(true);
  });

  it("sanitizes unsafe href while passing safe ones through", () => {
    expect(sanitizeUrlProps({ href: "javascript:alert(1)" })).toEqual({
      href: "#",
    });
    expect(sanitizeUrlProps({ src: "/safe.png" })).toEqual({
      src: "/safe.png",
    });
    expect(
      sanitizeUrlProps({ href: "https://example.com", target: "_blank" }),
    ).toEqual({
      href: "https://example.com",
      target: "_blank",
    });
  });
});

describe("playground parser", () => {
  it("renders an element with string props and children", () => {
    const el = renderFromCode('<Button size="sm">Hi</Button>', { Button });
    expect(React.isValidElement(el)).toBe(true);
    expect((el as React.ReactElement<any>).props.size).toBe("sm");
    expect((el as React.ReactElement<any>).props.children).toBe("Hi");
  });

  it("renders a self-closing element with no children", () => {
    const el = renderFromCode("<Button />", { Button });
    expect(React.isValidElement(el)).toBe(true);
    expect((el as React.ReactElement<any>).props.children).toBeUndefined();
  });

  it("strips imports before parsing", () => {
    const el = renderFromCode(
      'import { X } from "x";\nreturn <Button>Go</Button>;',
      { Button },
    );
    expect(React.isValidElement(el)).toBe(true);
    expect((el as React.ReactElement<any>).props.children).toBe("Go");
  });

  it("groups multiple roots into a fragment", () => {
    const el = renderFromCode("<Button>A</Button>\n<Item>B</Item>", {
      Button,
      Item,
    });
    expect(React.isValidElement(el)).toBe(true);
    expect((el as React.ReactElement<any>).type).toBe(React.Fragment);
    const kids = React.Children.toArray(
      (el as React.ReactElement<any>).props.children,
    );
    expect(kids).toHaveLength(2);
  });

  it("parses JSX nested in a prop value", () => {
    const el = renderFromCode(
      '<Item icon={<Button size="sm" />}>Title</Item>',
      {
        Button,
        Item,
      },
    );
    expect(React.isValidElement(el)).toBe(true);
    const icon = (el as React.ReactElement<any>).props.icon;
    expect(React.isValidElement(icon)).toBe(true);
    expect((icon as React.ReactElement<any>).props.size).toBe("sm");
  });

  it("renders HTML elements directly", () => {
    const el = renderFromCode('<span className="x">hello</span>', {});
    expect(React.isValidElement(el)).toBe(true);
    expect((el as React.ReactElement<any>).props.className).toBe("x");
    expect((el as React.ReactElement<any>).props.children).toBe("hello");
  });

  it("falls back to a placeholder for empty code", () => {
    const el = renderFromCode("", { Button });
    expect(React.isValidElement(el)).toBe(true);
  });
});

describe("react adapter", () => {
  it("exposes itself as the react adapter", () => {
    expect(reactAdapter.name).toBe("react");
  });

  it("renders preview content for valid JSX", () => {
    const out = reactAdapter.renderPreview('<Button size="sm">Hi</Button>', {
      Button,
    });
    expect(out.kind).toBe("node");
    if (out.kind === "node") {
      expect(React.isValidElement(out.node)).toBe(true);
      expect((out.node as React.ReactElement<any>).props.size).toBe("sm");
    }
  });

  it("never throws on malformed input - surfaces an error node", () => {
    const out = reactAdapter.renderPreview("<not even valid", { Button });
    expect(out.kind).toBe("node");
    if (out.kind === "node") {
      expect(React.isValidElement(out.node)).toBe(true);
    }
  });
});
