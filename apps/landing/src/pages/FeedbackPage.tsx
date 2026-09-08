import * as React from "react";
import { useNavigate } from "react-router-dom";
import { LandingLayout } from "@arcevo/facet-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Separator, Label, Input, Textarea } from "@arcevo/facet-components";
import { LightIcon } from "@arcevo/facet-components/light";
import { CONTACT } from "../lib/socials.js";
import { Nav } from "../components/Nav.js";
import { Footer } from "../components/Footer.js";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TikTokIcon,
} from "../components/BrandIcons.js";

/**
 * Feedback + contact page. The professional standard is email; WhatsApp and
 * socials are secondary channels. The form opens a prefilled mailto so
 * feedback lands in the inbox without a backend.
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
    const body = encodeURIComponent(`${message}\n\n(from ${email || "anonymous"})`);
    const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject || "facet feedback")}&body=${body}`;
    window.location.href = mailto;
  };

  return (
    <LandingLayout
      nav={<Nav />}
      footer={<Footer />}
      hero={
        <div className="mx-auto max-w-2xl text-center">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LightIcon name="arrow-left" size={16} />
            Back
          </button>
          <h1 className="mt-4 font-heading text-4xl font-bold text-foreground sm:text-5xl">
            Feedback &amp; contact
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Found a bug, want a feature, or just want to say hi? We read everything. The
            professional channel is email, but pick whatever works for you.
          </p>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="mx-auto max-w-2xl">
        {/* Email form (professional standard) */}
        <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightIcon name="mail" size={18} className="text-primary" />
            Send feedback by email
          </CardTitle>
          <CardDescription>
            Opens your mail client addressed to {CONTACT.email}. We reply to every message.
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
                  placeholder="Feedback on facet"
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
            <Button type="submit">
              Send feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Other channels */}
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
        >
          <LightIcon name="message-circle" size={20} className="text-primary" />
          <div>
            <div className="text-sm font-medium text-foreground">WhatsApp</div>
            <div className="text-xs text-muted-foreground">Chat with us directly</div>
          </div>
        </a>
        <a
          href={CONTACT.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
        >
          <LinkedinIcon size={20} className="text-primary" />
          <div>
            <div className="text-sm font-medium text-foreground">LinkedIn</div>
            <div className="text-xs text-muted-foreground">Company page: @arcevocirqle</div>
          </div>
        </a>
        <a
          href={CONTACT.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
        >
          <InstagramIcon size={20} className="text-primary" />
          <div>
            <div className="text-sm font-medium text-foreground">Instagram</div>
            <div className="text-xs text-muted-foreground">@kenny.gr8</div>
          </div>
        </a>
        <a
          href={CONTACT.facebook}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
        >
          <FacebookIcon size={20} className="text-primary" />
          <div>
            <div className="text-sm font-medium text-foreground">Facebook</div>
            <div className="text-xs text-muted-foreground">@kenny.gr8</div>
          </div>
        </a>
        <a
          href={CONTACT.tiktok}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50"
        >
          <TikTokIcon size={20} className="text-primary" />
          <div>
            <div className="text-sm font-medium text-foreground">TikTok</div>
            <div className="text-xs text-muted-foreground">@kenny.gr8</div>
          </div>
        </a>
      </div>
      </div>
      </div>
    </LandingLayout>
  );
}
