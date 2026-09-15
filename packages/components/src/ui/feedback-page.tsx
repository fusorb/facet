/**
 * @fusorb/facet-components: FeedbackPage
 *
 * A ready-to-use, fully customizable feedback/contact page. The email
 * form opens a prefilled mailto (no backend needed); contact channels
 * (email, WhatsApp, socials) are config-driven. Use it in place of
 * ad-hoc feedback pages in landing apps, docs, or consumer apps.
 *
 * Usage:
 *   <FeedbackPage
 *     title="Feedback & contact"
 *     description="Found a bug? Want a feature? We read everything."
 *     email="hello@fusorb.com"
 *     channels={[
 *       { label: "WhatsApp", href: "https://wa.me/...", icon: "message-circle", description: "Chat with us" },
 *     ]}
 *     onBack={() => navigate("/")}
 *   />
 */

import * as React from "react";
import { cn } from "../utils.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card.js";
import {
  AnimatedButton,
  type AnimatedButtonRenderProps,
  type AnimatedButtonVariant,
} from "./animated-button.js";
import { Label } from "./label.js";
import { Input } from "./input.js";
import { Textarea } from "./textarea.js";
import { Separator } from "./separator.js";
import { Icon, type IconName } from "../icon/index.js";

export interface FeedbackChannel {
  label: string;
  href: string;
  /** Semantic icon name resolved through the Icon registry. */
  icon: IconName;
  /** Short description shown under the label. */
  description?: string;
}

export interface FeedbackPageCopy {
  /** Card title above the email form. */
  formTitle: string;
  /** Card description (use {email} placeholder). */
  formDescription: string;
  /** Label for the sender email input. */
  emailLabel: string;
  /** Placeholder for the sender email input. */
  emailPlaceholder: string;
  /** Label for the subject input. */
  subjectLabel: string;
  /** Label for the message textarea. */
  messageLabel: string;
  /** Placeholder for the message textarea. */
  messagePlaceholder: string;
  /** Text on the submit button. */
  submitLabel: string;
  /** Label shown for the email channel card. */
  emailChannelLabel: string;
  /** Fallback when no email is entered. */
  anonymous: string;
}

export interface FeedbackPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title. Default: "Feedback & contact". */
  title?: string;
  /** Intro description under the title. */
  description?: string;
  /** Email the form opens a mailto to. */
  email: string;
  /** Subject prefix for the mailto. Default: "feedback". */
  subjectPrefix?: string;
  /** Optional back link (label + onClick). */
  back?: { label?: string; onClick: () => void };
  /** Extra contact channels (WhatsApp, socials, ...). */
  channels?: FeedbackChannel[];
  /** Render a channel card for the email address itself. Default: true. */
  showEmailChannel?: boolean;
  /** Replace the default form entirely (e.g. a real API submit). */
  form?: React.ReactNode;
  /** Animated submit button options. Default animation: "sparkle". */
  submitButton?: {
    animation?: AnimatedButtonVariant;
    renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
  };
  /** Extra content below the channels. */
  children?: React.ReactNode;
  /** Override user-visible strings. */
  copy?: Partial<FeedbackPageCopy>;
}

const defaultFeedbackCopy: FeedbackPageCopy = {
  formTitle: "Send feedback by email",
  formDescription:
    "Opens your mail client addressed to {email}. We reply to every message.",
  emailLabel: "Your email",
  emailPlaceholder: "you@company.com",
  subjectLabel: "Subject",
  messageLabel: "Message",
  messagePlaceholder: "Tell us what you think...",
  submitLabel: "Send feedback",
  emailChannelLabel: "Email",
  anonymous: "anonymous",
};

export function FeedbackPage({
  title = "Feedback & contact",
  description,
  email,
  subjectPrefix = "feedback",
  back,
  channels = [],
  showEmailChannel = true,
  form,
  submitButton,
  children,
  className,
  copy,
  ...props
}: FeedbackPageProps) {
  const c = { ...defaultFeedbackCopy, ...copy };
  const [emailValue, setEmailValue] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `${message}\n\n(from ${emailValue || c.anonymous})`,
    );
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject || `${subjectPrefix} ${title.toLowerCase()}`)}&body=${body}`;
    window.location.href = mailto;
  };

  return (
    <div
      className={cn("mx-auto w-full max-w-3xl px-6 py-16", className)}
      {...props}
    >
      <div className="mb-8">
        {back && (
          <button
            type="button"
            onClick={back.onClick}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon name="arrow-left" className="size-4" />
            {back.label ?? "Back"}
          </button>
        )}
        <h1 className="mt-4 font-heading text-4xl font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Email form */}
      {form ?? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="mail" className="size-[18px] text-primary" />
              {c.formTitle}
            </CardTitle>
            <CardDescription>
              {c.formDescription.replace("{email}", email)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="feedback-email">{c.emailLabel}</Label>
                  <Input
                    id="feedback-email"
                    type="email"
                    placeholder={c.emailPlaceholder}
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="feedback-subject">{c.subjectLabel}</Label>
                  <Input
                    id="feedback-subject"
                    placeholder={subjectPrefix}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="feedback-message">{c.messageLabel}</Label>
                <Textarea
                  id="feedback-message"
                  rows={5}
                  placeholder={c.messagePlaceholder}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <AnimatedButton
                type="submit"
                animation={submitButton?.animation ?? "sparkle"}
                renderButton={submitButton?.renderButton}
              >
                {c.submitLabel}
              </AnimatedButton>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Other channels */}
      {(showEmailChannel || channels.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {showEmailChannel && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
            >
              <Icon name="mail" className="size-5 text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {c.emailChannelLabel}
                </div>
                <div className="text-xs text-muted-foreground">{email}</div>
              </div>
            </a>
          )}
          {channels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
            >
              <Icon name={channel.icon} className="size-5 text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {channel.label}
                </div>
                {channel.description && (
                  <div className="text-xs text-muted-foreground">
                    {channel.description}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
