import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Separator,
  Label,
  Input,
  Textarea,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { PageShell } from "../components/PageShell.js";
import { site } from "../site.config.js";

/**
 * Feedback + contact page. The professional standard is email. The form
 * opens a prefilled mailto so feedback lands in the inbox without a
 * backend.
 */
export function FeedbackPage() {
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `${message}\n\n(from ${email || "anonymous"})`,
    );
    const mailto = `mailto:${site.feedbackEmail}?subject=${encodeURIComponent(
      subject || `${site.brand.name} feedback`,
    )}&body=${body}`;
    window.location.href = mailto;
  };

  return (
    <PageShell
      kicker={
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LightIcon name="arrow-left" size={16} />
          Back
        </button>
      }
      title="Feedback & contact"
      description="Found a bug, want a feature, or just want to say hi? We read everything. The professional channel is email, but pick whatever works for you."
    >
      <div className="mx-auto max-w-2xl px-8 py-12">
        {/* Email form (professional standard) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LightIcon name="mail" size={18} className="text-primary" />
              Send feedback by email
            </CardTitle>
            <CardDescription>
              Opens your mail client addressed to {site.feedbackEmail}. We reply
              to every message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Your email</Label>
                  <Input
                    id="feedback-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-subject">Subject</Label>
                  <Input
                    id="feedback-subject"
                    placeholder={`Feedback on ${site.brand.name}`}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-message">Message</Label>
                <Textarea
                  id="feedback-message"
                  rows={5}
                  placeholder="Tell us what you think..."
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit">Send feedback</Button>
            </form>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Other channels */}
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href={site.links.github}
            target="_blank"
            rel="noreferrer"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
          >
            <LightIcon name="github" size={20} className="text-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">GitHub</div>
              <div className="text-xs text-muted-foreground">
                Open an issue or discussion
              </div>
            </div>
          </a>
          <a
            href={`mailto:${site.feedbackEmail}`}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
          >
            <LightIcon name="mail" size={20} className="text-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">Email</div>
              <div className="text-xs text-muted-foreground">
                {site.feedbackEmail}
              </div>
            </div>
          </a>
        </div>
      </div>
    </PageShell>
  );
}
