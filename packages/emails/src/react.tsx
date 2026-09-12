/**
 * @fusorb/facet-emails: optional React bridge
 *
 * Converts React elements into `TemplateNode` trees so React users get JSX
 * ergonomics on top of the framework-agnostic core renderer. React is an
 * optional peer dependency: the core (`render.ts`) never imports it.
 *
 *   import { renderEmailFromReact } from "@fusorb/facet-emails";
 *   import { EmailButton } from "@fusorb/facet-emails";
 *
 *   const html = renderEmailFromReact(<EmailButton href="...">Go</EmailButton>);
 */

import type * as React from "react";
import type { TemplateNode } from "./render.js";

type ReactChild = React.ReactNode;

function toNode(child: ReactChild, key: string): TemplateNode | string | null {
  // Strings / numbers become text.
  if (typeof child === "string" || typeof child === "number") return String(child);
  if (child == null || typeof child === "boolean") return null;

  if (Array.isArray(child)) {
    return { tag: "fragment", props: {}, children: flatten(child) };
  }

  // React elements: <div>, <EmailButton>, <SomeComponent>.
  const element = child as React.ReactElement<Record<string, unknown>>;
  const { type, props } = element;

  // Function/class components: call with props to get their output.
  if (typeof type === "function") {
    // Hooks won't work here (this is a static renderer), but email
    // primitives are pure, so calling with props is safe.
    const output = (type as (p: Record<string, unknown>) => ReactChild)(props);
    return toNode(output, key);
  }

  if (typeof type === "string") {
    const children = flatten((props as { children?: ReactChild }).children);
    const own: Record<string, unknown> = { ...props };
    delete own.children;
    return { tag: type, props: own, children };
  }

  return null;
}

function flatten(children: ReactChild | undefined): (TemplateNode | string)[] {
  if (children == null) return [];
  const list = Array.isArray(children) ? children : [children];
  const out: (TemplateNode | string)[] = [];
  let i = 0;
  for (const c of list) {
    const n = toNode(c, String(i++));
    if (n == null) continue;
    if (typeof n === "string") {
      out.push(n);
    } else if (n.tag === "fragment") {
      out.push(...(n.children ?? []));
    } else {
      out.push(n);
    }
  }
  return out;
}

/** Convert a React element (or fragment of them) to a template tree. */
export function toTemplateTree(element: ReactChild): TemplateNode {
  const children = flatten(element);
  // If it's a single node, unwrap the synthetic fragment.
  if (children.length === 1 && typeof children[0] !== "string" && children[0]) {
    return children[0];
  }
  return { tag: "div", props: {}, children };
}

/** Convert a single React child to a template node (exported so the
 *  React wrappers can round-trip React-element children). */
export function toNodeValue(child: ReactChild): TemplateNode | string | null {
  return toNode(child, "0");
}
