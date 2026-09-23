/**
 * @fusorb/facet-components: InviteTeamForm
 *
 * A ready-to-use team invite form: add multiple email addresses, pick a
 * role, and send. Handles per-email validation and duplicate detection.
 * Controlled via `onInvite` so consumers own the API call.
 *
 * Customization: appearance (className), configuration (roles), slots —
 * `renderInvitee` replaces each pending invitee row so consumers can add
 * custom actions/metadata without forking the validation logic.
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
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select.js";
import { Icon } from "../icon/index.js";
import { Spinner } from "./spinner.js";

export interface Invitee {
  email: string;
  role: string;
}

export interface InviteTeamFormProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Roles available in the role select. Default: ["Member", "Admin", "Owner"]. */
  roles?: string[];
  /** Called with the validated invitees. Return a rejected promise to show an error. */
  onInvite: (invitees: Invitee[]) => Promise<void> | void;
  /** Replace a pending invitee row (e.g. extra actions). `onRemove` drops it. */
  renderInvitee?: (
    invitee: Invitee,
    helpers: { onRemove: () => void },
  ) => React.ReactNode;
  /** Copy overrides. */
  copy?: Partial<{
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    roleLabel: string;
    add: string;
    send: string;
    sending: string;
    added: string;
    invalidEmail: string;
    duplicate: string;
    empty: string;
    remove: string;
    error: string;
  }>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function DefaultInviteeRow({
  inv,
  onRemove,
  copy,
}: {
  inv: Invitee;
  onRemove: () => void;
  copy: InviteTeamFormProps["copy"];
}) {
  return (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{inv.email}</p>
        <p className="text-xs text-muted-foreground">
          Role: {inv.role}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Icon name="trash-2" className="mr-1.5 size-3.5" />
        {copy?.remove ?? "Remove"}
      </Button>
    </>
  );
}

/**
 * A team invite form: type an email, pick a role, add it to the list,
 * then send all pending invites. Invalid or duplicate emails are flagged
 * inline instead of submitting.
 */
export function InviteTeamForm({
  roles = ["Member", "Admin", "Owner"],
  onInvite,
  renderInvitee,
  copy = {},
  className,
  ...props
}: InviteTeamFormProps) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState(roles[0] ?? "Member");
  const [invitees, setInvitees] = React.useState<Invitee[]>([]);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const removeInvitee = (email: string) =>
    setInvitees((prev) => prev.filter((i) => i.email !== email));

  const addEmail = () => {
    const value = email.trim().toLowerCase();
    if (!value) return;
    if (!EMAIL_RE.test(value)) {
      setError(copy.invalidEmail ?? "That doesn't look like a valid email.");
      return;
    }
    if (invitees.some((i) => i.email === value)) {
      setError(copy.duplicate ?? "That email is already in the list.");
      return;
    }
    setError(null);
    setInvitees((prev) => [...prev, { email: value, role }]);
    setEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invitees.length === 0) {
      setError(copy.empty ?? "Add at least one email first.");
      return;
    }
    setSending(true);
    setError(null);
    setSent(false);
    try {
      await onInvite(invitees);
      setSent(true);
      setInvitees([]);
    } catch (err) {
      setError(
        copy.error ??
          (err instanceof Error ? err.message : "Failed to send invites."),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-lg", className)} {...props}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="user-plus" className="size-4 text-primary" />
          {copy.title ?? "Invite your team"}
        </CardTitle>
        <CardDescription>
          {copy.description ??
            "Send email invites. Each person picks their own password on first sign-in."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <Label htmlFor="invite-email">{copy.emailLabel ?? "Email"}</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmail();
                  }
                }}
                placeholder={copy.emailPlaceholder ?? "teammate@company.com"}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invite-role">{copy.roleLabel ?? "Role"}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role" className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addEmail}>
            <Icon name="plus" className="mr-1.5 size-3.5" />
            {copy.add ?? "Add email"}
          </Button>
          {error && (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-sm text-destructive"
            >
              <Icon name="circle-alert" className="size-3.5" />
              {error}
            </p>
          )}
        </div>

        {invitees.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-center">
            <Icon name="mail-plus" className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No invites added yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {invitees.map((inv) => (
              <li
                key={inv.email}
                className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                {renderInvitee
                  ? renderInvitee(inv, { onRemove: () => removeInvitee(inv.email) })
                  : <DefaultInviteeRow inv={inv} onRemove={removeInvitee.bind(null, inv.email)} copy={copy} />}
              </li>
            ))}
          </ul>
        )}

        {sent && (
          <p className="flex items-center gap-1.5 text-sm text-success">
            <Icon name="circle-check" className="size-3.5" />
            {copy.added ?? "Invites sent."}
          </p>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={sending || invitees.length === 0}
        >
          {sending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="size-4" />
              {copy.sending ?? "Sending..."}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="send" className="size-4" />
              {`${copy.send ?? "Send"} ${invitees.length > 0 ? `(${invitees.length})` : ""}`.trim()}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

InviteTeamForm.displayName = "InviteTeamForm";
