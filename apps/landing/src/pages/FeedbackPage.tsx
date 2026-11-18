import { useState } from "react";
import { Button, Input, Textarea, Label } from "@fusorb/facet-components";
import { Link } from "react-router-dom";

export function FeedbackPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground"><Link to="/" className="underline-offset-4 hover:underline">← Back</Link></p>
        <h1 className="text-3xl font-semibold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">Share what’s working, what’s missing, or what you need from Facet.</p>
      </header>

      {sent ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-6">
          <p className="font-medium">Thanks for the feedback.</p>
          <p className="mt-1 text-sm text-muted-foreground">This rebuild stub records intent locally in-session only.</p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required rows={6} placeholder="Tell us what you think…" />
          </div>
          <Button type="submit">Send feedback</Button>
        </form>
      )}
    </main>
  );
}
