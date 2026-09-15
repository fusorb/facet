/**
 * @fusorb/facet-emails: framework-agnostic email templates
 *
 * Render React elements OR plain template trees to email-safe HTML and
 * text, with template primitives (layout, button, text, code block,
 * security notice, list) and a dev preview server. Zero runtime deps in
 * the core.
 *
 * React usage:
 *   import { renderEmailFromReact, EmailLayout, EmailButton } from "@fusorb/facet-emails";
 *   const html = renderEmailFromReact(<EmailLayout previewText="Hi"><EmailButton href="#">Go</EmailButton></EmailLayout>);
 *
 * Framework-agnostic usage:
 *   import { renderEmail, emailLayout, emailButton } from "@fusorb/facet-emails";
 *   const html = renderEmail(emailLayout({ previewText: "Hi", heading: "Welcome" }, emailButton({ href: "#", children: "Go" })));
 */

import type { ReactNode } from "react";
import { toTemplateTree } from "./react.js";
import { renderEmail } from "./render.js";
import type { RenderOptions } from "./render.js";

export {
  renderEmail,
  renderEmailText,
  createElement,
  type TemplateNode,
  type RenderOptions,
  type EmailBrand,
} from "./render.js";

export { toTemplateTree } from "./react.js";

export {
  emailLayout,
  emailButton,
  emailText,
  emailCodeBlock,
  emailDivider,
  emailLink,
  emailSecurityNotice,
  emailList,
  emailSection,
  emailRow,
  emailColumn,
  EmailLayout,
  EmailButton,
  EmailText,
  EmailCodeBlock,
  EmailDivider,
  EmailLink,
  EmailSecurityNotice,
  EmailList,
  EmailSection,
  EmailRow,
  EmailColumn,
  type EmailLayoutProps,
  type EmailButtonProps,
  type EmailButtonVariant,
  type EmailTextProps,
  type EmailTextVariant,
  type EmailCodeBlockProps,
  type EmailLinkProps,
  type EmailSecurityNoticeProps,
  type EmailSecurityNoticeVariant,
  type EmailListProps,
  type EmailSectionProps,
  type EmailRowProps,
  type EmailColumnProps,
} from "./components.js";

/**
 * React convenience: render a React element (JSX email) to email-safe HTML.
 * Requires the optional `react` peer.
 */
export function renderEmailFromReact(
  element: ReactNode,
  options: RenderOptions = {},
): string {
  const tree = toTemplateTree(element);
  return renderEmail(tree, options);
}
