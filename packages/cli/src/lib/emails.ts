/**
 * Email setup detection + migration planning for the facet CLI.
 *
 * `facet emails init` reads the consumer's repo and figures out what mail
 * stack they already have (react-email, mjml, nodemailer, resend, ...),
 * then either plans a migration to @fusorb/facet-emails or a fresh
 * scaffold. Everything is non-destructive: this module only reports and
 * plans; the command writes files after confirmation.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  detectPackageManager,
  detectFramework,
  detectMonorepo,
  type PackageManager,
  type Framework,
} from "./types.js";
import { buildRepoContext, type RepoContext } from "./suggest.js";

/** Mail/messaging packages we recognize in a consumer's manifests. */
export const MAIL_PACKAGES = [
  "@react-email/components",
  "react-email",
  "mjml",
  "nodemailer",
  "resend",
  "@sendgrid/mail",
  "@aws-sdk/client-ses",
  "postmark",
  "@mailchimp/mailchimp_transactional",
  "@plunk/node",
  "mailgun.js",
  "postalsys",
] as const;

export type MailRenderer =
  | "react-email"
  | "mjml"
  | "nodemailer"
  | "resend"
  | "sendgrid"
  | "ses"
  | "postmark"
  | "other";

export interface MailDetection {
  /** The consumer's package manager (pnpm/npm/yarn/bun). */
  pm: PackageManager;
  /** The consumer's frontend framework. */
  framework: Framework;
  /** Recognized mail packages found in the manifests. */
  mailPackages: string[];
  /** The primary mail renderer, if any (for the migration guide). */
  renderer: MailRenderer | null;
  /** Whether @fusorb/facet-emails is already a dependency. */
  facetEmailsInstalled: boolean;
  /** Whether @fusorb/facet-components is already a dependency. */
  facetComponentsInstalled: boolean;
  /** Whether a mail setup already exists (renderer or provider). */
  hasExisting: boolean;
  /** Monorepo workspace globs, if any. */
  monorepo: string[] | null;
}

/** Map a recognized package name to its role. */
export function mailPackageRole(name: string): MailRenderer {
  if (name === "@react-email/components" || name === "react-email") return "react-email";
  if (name === "mjml") return "mjml";
  if (name === "nodemailer") return "nodemailer";
  if (name === "resend") return "resend";
  if (name === "@sendgrid/mail") return "sendgrid";
  if (name === "@aws-sdk/client-ses") return "ses";
  if (name === "postmark") return "postmark";
  return "other";
}

/** Read all dependency manifests (root + workspace members) into one map. */
export function readAllDeps(cwd: string): Record<string, string> {
  const merged: Record<string, string> = {};
  const read = (p: string): Record<string, any> | null => {
    try {
      return JSON.parse(readFileSync(p, "utf8")) as Record<string, any>;
    } catch {
      return null;
    }
  };
  const pkg = read(path.join(cwd, "package.json"));
  if (pkg) {
    for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
      const deps = (pkg[section] ?? {}) as Record<string, string>;
      for (const [name, range] of Object.entries(deps)) {
        merged[name] = range;
      }
    }
  }
  // Workspace members (best effort).
  const globs = detectMonorepo(cwd) ?? [];
  const memberDirs = new Set<string>();
  for (const glob of globs) {
    const base = glob.replace(/\/\*+$/, "");
    if (glob.includes("*")) {
      for (const d of readdirSafe(path.join(cwd, base))) {
        memberDirs.add(path.join(cwd, base, d));
      }
    } else {
      memberDirs.add(path.join(cwd, base));
    }
  }
  for (const member of memberDirs) {
    const mpkg = read(path.join(member, "package.json"));
    if (!mpkg) continue;
    for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
      const deps = (mpkg[section] ?? {}) as Record<string, string>;
      for (const [name, range] of Object.entries(deps)) {
        merged[name] = range;
      }
    }
  }
  return merged;
}

/**
 * Detect the consumer's mail setup from `cwd`.
 */
export function detectMailSetup(cwd: string): MailDetection {
  const pm = detectPackageManager(cwd);
  const framework = detectFramework(cwd);
  const monorepo = detectMonorepo(cwd);
  const deps = readAllDeps(cwd);

  const mailPackages = Object.keys(deps).filter((name) =>
    (MAIL_PACKAGES as readonly string[]).includes(name),
  );

  // Pick the primary renderer: react-email/mjml are renderers; the rest are
  // providers. Prefer the renderer when present, else the provider.
  let renderer: MailRenderer | null = null;
  for (const name of mailPackages) {
    const role = mailPackageRole(name);
    if (role === "react-email" || role === "mjml" || role === "nodemailer") {
      renderer = role;
      break;
    }
  }
  if (!renderer) {
    for (const name of mailPackages) {
      const role = mailPackageRole(name);
      if (role !== "other") {
        renderer = role;
        break;
      }
    }
  }

  return {
    pm,
    framework,
    mailPackages,
    renderer,
    facetEmailsInstalled: Boolean(deps["@fusorb/facet-emails"]),
    facetComponentsInstalled: Boolean(deps["@fusorb/facet-components"]),
    hasExisting: mailPackages.length > 0,
    monorepo,
  };
}

export interface EmailsInitAnswers {
  /** "migrate" when an existing renderer is present and chosen, else "fresh". */
  mode: "migrate" | "fresh";
  /** The mail provider to wire (resend | nodemailer | none). */
  provider: "resend" | "nodemailer" | "none";
  /** Where the emails dir lands. Default: "emails". */
  location: string;
  /** Whether the consumer's framework is React. */
  isReact: boolean;
}

/**
 * Build the answers for the emails scaffold from detection + user flags.
 */
export function planEmailsInit(
  detection: MailDetection,
  opts: {
    migrate?: boolean;
    fresh?: boolean;
    provider?: "resend" | "nodemailer" | "none";
    location?: string;
  } = {},
): EmailsInitAnswers {
  const canMigrate = detection.renderer !== null || detection.hasExisting;
  const mode: "migrate" | "fresh" =
    opts.migrate || (canMigrate && !opts.fresh) ? "migrate" : "fresh";

  // Provider: explicit flag wins, else detected provider, else resend default.
  let provider: "resend" | "nodemailer" | "none" = opts.provider ?? "resend";
  if (!opts.provider) {
    if (detection.mailPackages.includes("resend")) provider = "resend";
    else if (detection.mailPackages.includes("nodemailer")) provider = "nodemailer";
  }

  return {
    mode,
    provider,
    location: opts.location ?? "emails",
    isReact:
      detection.framework === "next" ||
      detection.framework === "remix" ||
      detection.framework === "react-vite",
  };
}

/** Human-readable summary of a detection, for the command's console output. */
export function formatDetection(d: MailDetection): string[] {
  const lines = [
    `Package manager: ${d.pm}`,
    `Framework:       ${d.framework}`,
    `Mail packages:   ${d.mailPackages.length ? d.mailPackages.join(", ") : "none"}`,
    `Renderer:        ${d.renderer ?? "none (fresh scaffold)"}`,
    `facet-emails:    ${d.facetEmailsInstalled ? "installed" : "not installed"}`,
  ];
  return lines;
}

/**
 * Email-specific suggestion provider for the repo-aware suggestion engine
 * (suggest.ts). Returns migration + provider wiring guidance; framework
 * and monorepo guidance comes from the general provider.
 */
export function emailSuggestionProvider(
  detection: MailDetection,
  answers: EmailsInitAnswers,
) {
  return (_ctx: RepoContext): string[] => {
    const s: string[] = [];

    // Existing renderer migration guidance.
    if (detection.renderer === "react-email") {
      s.push(
        `Migrate: replace @react-email/components imports in your templates with the facet-emails primitives (EmailLayout, EmailButton, EmailText, ...). The generated ${answers.location}/layout.tsx is your AppEmailLayout shell.`,
      );
      s.push(
        `Remove @react-email/components from your dependencies once the imports are swapped, then re-run \`facet emails init\` to confirm the detection is clean.`,
      );
    } else if (detection.renderer === "mjml") {
      s.push(
        `Migrate: your MJML templates are markup, not React. Port each .mjml into a React template under ${answers.location}/ using the facet-emails primitives, then render with renderEmailFromReact.`,
      );
    } else if (detection.renderer === "nodemailer") {
      s.push(
        `Migrate: keep nodemailer as the transport, but build templates with facet-emails primitives and pass the rendered html/text into nodemailer.sendMail instead of string templates.`,
      );
    }

    // Provider wiring.
    if (answers.provider === "resend") {
      s.push(
        `Set RESEND_API_KEY in your environment (see ${answers.location}/.env.example), then import { sendEmail } from "./${answers.location}/send".`,
      );
    } else if (answers.provider === "nodemailer") {
      s.push(
        `Set the SMTP_* variables from ${answers.location}/.env.example, then import { sendEmail } from "./${answers.location}/send".`,
      );
    } else {
      s.push(
        `Pick a provider (resend/nodemailer/sendgrid/...), wire it into ${answers.location}/send.ts, and add its keys to your environment.`,
      );
    }

    // Framework-specific integration for the mail renderer.
    if (detection.framework === "next") {
      s.push(
        `Next.js: call compileMailTemplate in an API route (app/api/send/route.ts) or a server action; the renderer is server-safe (no client hooks).`,
      );
    } else if (detection.framework === "remix") {
      s.push(
        `Remix: call the renderer in a loader/action (app/routes/*.ts) and pass the html to your provider.`,
      );
    } else if (detection.framework === "react-vite") {
      s.push(
        `Vite: the renderer is isomorphic. For client-only apps, generate the HTML at build time or in a serverless function, then send via the provider.`,
      );
    } else {
      s.push(
        `Plain Node/backend: the core renderer has zero React dependency; call renderEmail/renderEmailText directly on template trees from your service layer.`,
      );
    }

    // Preview.
    s.push(
      `Preview your templates: run \`${detection.pm} run mail:preview\` and open http://127.0.0.1:3888 (HTML/text toggle per template).`,
    );

    return s;
  };
}

/**
 * Legacy name kept for callers of the earlier single-function API.
 * Prefer the suggestion-engine providers (suggest.ts).
 */
export function suggestNextSteps(
  detection: MailDetection,
  answers: EmailsInitAnswers,
): string[] {
  return emailSuggestionProvider(detection, answers)(buildRepoContext(process.cwd()));
}

function readdirSafe(p: string): string[] {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}
