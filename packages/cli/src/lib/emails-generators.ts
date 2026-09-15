/**
 * Email scaffold generators for `facet emails init`.
 *
 * Produces a consumer-owned `emails/` directory wired to
 * @fusorb/facet-emails: thin brand wrappers over the package primitives, a
 * template registry with sample data, a dev preview server, a provider
 * send module (resend / nodemailer), and the package.json merge (deps +
 * mail:preview script).
 */

import path from "node:path";
import type { GeneratedFile } from "./types.js";
import type { EmailsInitAnswers } from "./emails.js";

export interface EmailsScaffoldInput extends EmailsInitAnswers {
  /** Brand name for the layout header. */
  brandName: string;
  /** Resolved facet-emails version (or "latest"). */
  facetEmailsRange: string;
}

/** Files the emails scaffold writes. Always includes a welcome template. */
export function generateEmailsScaffold(
  cwd: string,
  input: EmailsScaffoldInput,
): GeneratedFile[] {
  const dir = path.join(cwd, input.location);
  const files: GeneratedFile[] = [];

  files.push({
    path: path.join(dir, "brand.ts"),
    content: `// Brand tokens for the facet-emails renderer. Edit these to theme
// every email in this project (colors, fonts, radius).
import type { EmailBrand } from "@fusorb/facet-emails";

export const emailBrand: EmailBrand = {
  primary: "#334155",
  background: "#f6f6f6",
  surface: "#ffffff",
  text: "#1f2937",
  muted: "#6b7280",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  radius: 8,
  brandName: "${input.brandName}",
};
`,
  });

  files.push({
    path: path.join(dir, "layout.tsx"),
    content: `// Consumer-owned layout wrapper over the facet-emails EmailLayout.
import * as React from "react";
import { EmailLayout } from "@fusorb/facet-emails";

export interface AppEmailLayoutProps {
  previewText: string;
  heading?: string;
  footerNote?: string;
  children?: React.ReactNode;
}

export function AppEmailLayout({
  previewText,
  heading,
  footerNote,
  children,
}: AppEmailLayoutProps) {
  return (
    <EmailLayout
      previewText={previewText}
      heading={heading}
      brandName={brandName}
      footerNote={footerNote}
    >
      {children}
    </EmailLayout>
  );
}

import { emailBrand } from "./brand";
const brandName = emailBrand.brandName ?? "App";
`,
  });

  files.push({
    path: path.join(dir, "template-registry.tsx"),
    content: `// Template registry: name -> sample element. The preview server renders
// these; swap the sample props for real data at send time.
import * as React from "react";
import { AppEmailLayout } from "./layout";
import { EmailButton, EmailText } from "@fusorb/facet-emails";

export const TEMPLATE_REGISTRY: Record<string, React.ReactElement> = {
  welcome: React.createElement(
    AppEmailLayout,
    { previewText: "Welcome to ${input.brandName}", heading: "Welcome!" },
    React.createElement(EmailText, null, "Your account is ready."),
    React.createElement(EmailButton, { href: "https://example.com/dashboard" }, "Go to Dashboard"),
  ),
};

export const TEMPLATE_NAMES = Object.keys(TEMPLATE_REGISTRY);
`,
  });

  files.push({
    path: path.join(dir, "preview-server.ts"),
    content: `// Dev preview server for your email templates.
// Start with:  pnpm mail:preview   (or the package manager you use)
import { startEmailPreviewServer } from "@fusorb/facet-emails/server";
import { TEMPLATE_REGISTRY, TEMPLATE_NAMES } from "./template-registry";
import { emailBrand } from "./brand";

const templates = Object.fromEntries(
  TEMPLATE_NAMES.map((name) => [
    name,
    { title: name, tree: TEMPLATE_REGISTRY[name] },
  ]),
);

startEmailPreviewServer({ templates, brand: emailBrand, port: 3888, onReady: (port) => {
  console.log(\`Email preview: http://127.0.0.1:\${port}\`);
  console.log(\`Templates: \${TEMPLATE_NAMES.join(", ")}\`);
}});
`,
  });

  // Provider send module.
  if (input.provider === "resend") {
    files.push({
      path: path.join(dir, "send.ts"),
      content: `// Send emails via Resend.
// 1. Set RESEND_API_KEY in your environment (.env).
// 2. Import sendEmail from "./emails/send".
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, text, from }: SendEmailInput) {
  return resend.emails.send({
    from: from ?? \`${input.brandName} <onboarding@resend.dev>\`,
    to,
    subject,
    html,
    text: text ?? "",
  });
}
`,
    });
  } else if (input.provider === "nodemailer") {
    files.push({
      path: path.join(dir, "send.ts"),
      content: `// Send emails via nodemailer.
// 1. Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in your environment.
// 2. Import sendEmail from "./emails/send".
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
    : undefined,
});

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, text, from }: SendEmailInput) {
  return transport.sendMail({
    from: from ?? \`${input.brandName} <no-reply@example.com>\`,
    to,
    subject,
    html,
    text: text ?? "",
  });
}
`,
    });
  } else {
    files.push({
      path: path.join(dir, "send.ts"),
      content: `// No provider wired yet. Pick one and fill this in, e.g. with Resend:
//   import { Resend } from "resend";
//   const resend = new Resend(process.env.RESEND_API_KEY);
//   await resend.emails.send({ from, to, subject, html, text });
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(_input: SendEmailInput): Promise<void> {
  throw new Error("sendEmail is not wired up. See the guide in facet emails init output.");
}
`,
    });
  }

  files.push({
    path: path.join(dir, ".env.example"),
    content:
      input.provider === "resend"
        ? `# Email provider (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
`
        : input.provider === "nodemailer"
          ? `# Email provider (SMTP / nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
`
          : `# Email provider (add your provider keys here once wired)
`,
  });

  return files;
}

/** package.json additions for the emails scaffold (deps + script). */
export function emailsPackageJsonAdditions(input: EmailsScaffoldInput): {
  deps: Record<string, string>;
  scripts: Record<string, string>;
} {
  const deps: Record<string, string> = {
    "@fusorb/facet-emails": input.facetEmailsRange,
  };
  if (input.provider === "resend") deps.resend = "^6.0.0";
  if (input.provider === "nodemailer") deps.nodemailer = "^6.9.0";

  return {
    deps,
    scripts: {
      "mail:preview": `tsx ${input.location}/preview-server.ts`,
    },
  };
}
