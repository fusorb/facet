import { describe, expect, it } from "vitest";
import {
  renderEmail,
  renderEmailText,
  createElement,
  emailLayout,
  emailButton,
  emailText,
  emailCodeBlock,
  emailDivider,
  emailSecurityNotice,
  emailList,
  emailSection,
  emailRow,
  emailColumn,
  type TemplateNode,
} from "./index.js";

describe("renderEmail (framework-agnostic core)", () => {
  it("renders a tree to a full HTML document", () => {
    const tree: TemplateNode = createElement(
      "div",
      { style: { backgroundColor: "#fff" } },
      createElement("h1", {}, "Hello"),
      createElement("p", {}, "World"),
    );
    const html = renderEmail(tree);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<p>World</p>");
    expect(html).toContain('style="background-color:#fff"');
  });

  it("escapes text content and attributes", () => {
    const tree = createElement(
      "div",
      {},
      createElement("p", {}, "<script>alert(1)</script> & more"),
    );
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert");
  });

  it("does not leak undefined values", () => {
    const tree = createElement(
      "div",
      {},
      createElement("p", {}, "a", undefined, "b"),
    );
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).not.toContain("undefined");
    expect(html).toContain("ab");
  });

  it("handles void tags and boolean attributes", () => {
    const tree = createElement("input", {
      type: "email",
      required: true,
      disabled: false,
      placeholder: "you@example.com",
    });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain(
      '<input type="email" required placeholder="you@example.com">',
    );
    expect(html).not.toContain("disabled");
  });

  it("renders className as class and htmlFor as for", () => {
    const tree = createElement(
      "label",
      { htmlFor: "email", className: "label" },
      "Email",
    );
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain('<label for="email" class="label">Email</label>');
  });

  it("injects brand tokens into a style block", () => {
    const tree = createElement("p", {}, "Hi");
    const html = renderEmail(tree, {
      brand: { primary: "#ff0000", brandName: "Test Brand" },
    });
    // brand.primary themes links; the title carries the brand name.
    expect(html).toContain("color:#ff0000");
    expect(html).toContain("<title>Test Brand</title>");
  });
});

describe("renderEmailText", () => {
  it("extracts plain text with links and spacing", () => {
    const tree = emailLayout(
      { previewText: "Preview", heading: "Welcome", brandName: "Acme" },
      emailText({ children: "Hello there" }),
      emailButton({ href: "https://example.com", children: "Go now" }),
      emailText({ children: "Goodbye", variant: "muted" }),
    );
    const text = renderEmailText(tree);
    expect(text).toContain("Welcome");
    expect(text).toContain("Hello there");
    expect(text).toContain("[Go now](https://example.com)");
    expect(text).toContain("Goodbye");
  });

  it("keeps list items", () => {
    const tree = emailList({ items: ["One", "Two"] });
    const text = renderEmailText(tree);
    expect(text).toContain("One");
    expect(text).toContain("Two");
  });
});

describe("primitives (tree form)", () => {
  it("emailButton renders an anchor with the href and label", () => {
    const tree = emailButton({
      href: "https://acme.dev/go",
      children: "Get started",
    });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain('href="https://acme.dev/go"');
    expect(html).toContain(">Get started</a>");
  });

  it("emailButton variants change background color", () => {
    const primary = renderEmail(emailButton({ href: "#", children: "x" }), {
      fullDocument: false,
    });
    expect(primary).toContain("background-color:var(--primary");
    const danger = renderEmail(
      emailButton({ href: "#", children: "x", variant: "danger" }),
      { fullDocument: false },
    );
    expect(danger).toContain("background-color:var(--danger");
    const outline = renderEmail(
      emailButton({ href: "#", children: "x", variant: "outline" }),
      { fullDocument: false },
    );
    expect(outline).toContain("border:1px solid var(--primary");
  });

  it("emailCodeBlock renders the code", () => {
    const tree = emailCodeBlock({ code: "847 291", label: "MFA code" });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("847 291");
    expect(html).toContain("MFA code");
  });

  it("emailSecurityNotice renders IP/device rows", () => {
    const tree = emailSecurityNotice({
      ip: "102.89.3.1",
      userAgent: "Chrome",
      location: "Lagos",
    });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("102.89.3.1");
    expect(html).toContain("Chrome");
    expect(html).toContain("Lagos");
  });

  it("emailLayout composes a full email", () => {
    const tree = emailLayout(
      { previewText: "Preview text", heading: "Welcome", brandName: "Acme" },
      emailButton({ href: "https://acme.dev", children: "Go" }),
      emailDivider(),
      emailText({ children: "Regards", variant: "muted" }),
    );
    const html = renderEmail(tree);
    expect(html).toContain("Acme");
    expect(html).toContain("Welcome");
    expect(html).toContain('href="https://acme.dev"');
    expect(html).toContain("Regards");
    expect(html).toContain("<!DOCTYPE html>");
  });
});

describe("Section / Row / Column", () => {
  it("emailSection renders a table container", () => {
    const tree = emailSection({}, emailText({ children: "Grouped" }));
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("<table");
    expect(html).toContain("<td");
    expect(html).toContain("Grouped");
  });

  it("emailRow and emailColumn compose a grid", () => {
    const tree = emailRow(
      {},
      emailColumn({ style: { width: "50%" } }, "A"),
      emailColumn({ style: { width: "50%" } }, "B"),
    );
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("<tr");
    expect(html).toContain('style="width:50%"');
    expect(html).toContain("A");
    expect(html).toContain("B");
  });
});

describe("security notice variants", () => {
  it("renders a warning callout with children", () => {
    const tree = emailSecurityNotice({
      variant: "warning",
      children: "Be careful",
    });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("Be careful");
    expect(html).toContain("#fffbeb");
  });

  it("renders a danger callout", () => {
    const tree = emailSecurityNotice({
      variant: "danger",
      children: "Critical",
    });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("Critical");
    expect(html).toContain("#fef2f2");
  });

  it("renders an IP/device table when no children", () => {
    const tree = emailSecurityNotice({ ip: "1.2.3.4", userAgent: "Firefox" });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("1.2.3.4");
    expect(html).toContain("Firefox");
  });
});

describe("emailCodeBlock with codes grid", () => {
  it("renders a single code as a dark block", () => {
    const tree = emailCodeBlock({ code: "847 291" });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("847 291");
  });

  it("renders multiple codes in a 2-column grid", () => {
    const tree = emailCodeBlock({
      codes: ["AAAA-1111", "BBBB-2222", "CCCC-3333", "DDDD-4444"],
      label: "Recovery codes",
    });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("AAAA-1111");
    expect(html).toContain("BBBB-2222");
    expect(html).toContain("CCCC-3333");
    expect(html).toContain("DDDD-4444");
    expect(html).toContain("Recovery codes");
  });

  it("renders a 1-column grid when requested", () => {
    const tree = emailCodeBlock({ codes: ["A", "B"], columns: 1 });
    const html = renderEmail(tree, { fullDocument: false });
    expect(html).toContain("A");
    expect(html).toContain("B");
  });
});
