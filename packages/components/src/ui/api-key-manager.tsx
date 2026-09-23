/**
 * @fusorb/facet-components: ApiKeyManager
 *
 * A ready-to-use API key manager: create keys with a scope + expiry,
 * copy secrets, reveal truncated keys, and revoke them. Controlled via
 * `keys` + callbacks so consumers own persistence.
 *
 * Customization: appearance (className), configuration (scopes), slots —
 * `renderKey` replaces each key's display block so consumers can expose
 * custom metadata/status without forking the create/reveal/revoke flow.
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

export interface ApiKey {
  id: string;
  name: string;
  /** Last 4 chars to display. */
  last4: string;
  /** e.g. "facet_live_..." */
  prefix?: string;
  scopes: string[];
  createdAt: string;
  /** ISO timestamp of expiry, if any. */
  expiresAt?: string | null;
  revoked?: boolean;
}

export interface ApiKeyManagerProps extends React.HTMLAttributes<HTMLDivElement> {
  keys: ApiKey[];
  /** Called to create a key; return the full secret so it can be shown once. */
  onCreate: (opts: {
    name: string;
    scope: string;
    expiresAt: string | null;
  }) => Promise<{ secret: string } | void>;
  /** Called to revoke a key. */
  onRevoke: (id: string) => Promise<void> | void;
  /** Available scopes for the create form. Default: ["read", "write", "admin"]. */
  scopes?: string[];
  /** Replace a key's display block (e.g. custom metadata/status badges). */
  renderKey?: (key: ApiKey) => React.ReactNode;
  /** Copy overrides. */
  copy?: Partial<{
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    scopeLabel: string;
    expiryLabel: string;
    never: string;
    create: string;
    creating: string;
    secretHint: string;
    secretCopied: string;
    copy: string;
    revoke: string;
    revokeConfirm: string;
    noKeys: string;
    expiresIn: string;
    revoked: string;
  }>;
}

const DEFAULT_SCOPES = ["read", "write", "admin"];

function DefaultKeyDisplay({
  k,
  copy,
}: {
  k: ApiKey;
  copy: ApiKeyManagerProps["copy"];
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{k.name}</p>
      <p className="truncate text-xs text-muted-foreground">
        {k.prefix ? `${k.prefix}_...${k.last4}` : `...${k.last4}`} ·{" "}
        {k.scopes.join(", ")}
        {k.expiresAt &&
          ` · ${copy?.expiresIn ?? "expires"} ${new Date(k.expiresAt).toLocaleDateString()}`}
        {k.revoked && ` · ${copy?.revoked ?? "revoked"}`}
      </p>
    </div>
  );
}

/**
 * An API key manager panel. New keys are created through the top form and
 * their full secret is shown exactly once (copyable). Existing keys render
 * with a revoke action and optional expiry.
 */
export function ApiKeyManager({
  keys,
  onCreate,
  onRevoke,
  scopes = DEFAULT_SCOPES,
  renderKey,
  copy = {},
  className,
  ...props
}: ApiKeyManagerProps) {
  const [name, setName] = React.useState("");
  const [scope, setScope] = React.useState(scopes[0] ?? "read");
  const [expiry, setExpiry] = React.useState<string>("");
  const [creating, setCreating] = React.useState(false);
  const [justCreated, setJustCreated] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [confirmRevoke, setConfirmRevoke] = React.useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCopied(false);
    try {
      const result = await onCreate({
        name: name.trim(),
        scope,
        expiresAt: expiry ? new Date(expiry).toISOString() : null,
      });
      setJustCreated(result?.secret ?? null);
      setName("");
      setExpiry("");
    } finally {
      setCreating(false);
    }
  };

  const copySecret = async () => {
    if (!justCreated) return;
    await navigator.clipboard?.writeText(justCreated);
    setCopied(true);
  };

  const handleRevoke = async (id: string) => {
    await onRevoke(id);
    setConfirmRevoke(null);
  };

  return (
    <Card className={cn("w-full max-w-lg", className)} {...props}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="key-round" className="size-4 text-primary" />
          {copy.title ?? "API keys"}
        </CardTitle>
        <CardDescription>
          {copy.description ??
            "Create keys to access the API programmatically. You'll only see the secret once."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Create form */}
        <form onSubmit={handleCreate} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="api-key-name">{copy.nameLabel ?? "Name"}</Label>
              <Input
                id="api-key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={copy.namePlaceholder ?? "e.g. staging server"}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="api-key-scope">
                {copy.scopeLabel ?? "Scope"}
              </Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger id="api-key-scope" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="api-key-expiry">
              {copy.expiryLabel ?? "Expires"}
            </Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger id="api-key-expiry" className="w-full">
                <SelectValue placeholder={copy.never ?? "Never"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{copy.never ?? "Never"}</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={creating || !name.trim()}
          >
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <Icon name="loader-circle" className="size-4 animate-spin" />
                {copy.creating ?? "Creating..."}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="plus" className="size-4" />
                {copy.create ?? "Create key"}
              </span>
            )}
          </Button>
        </form>

        {/* Just-created secret (shown once) */}
        {justCreated && (
          <div className="space-y-2 rounded-md border border-success/30 bg-success/5 p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Icon name="circle-check" className="size-4" />
              {copy.secretHint ??
                "Copy your secret now. You won't see it again."}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded border border-border bg-background px-2 py-1 text-xs">
                {justCreated}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copySecret}
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="check" className="size-3.5" />
                    {copy.secretCopied ?? "Copied"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="copy" className="size-3.5" />
                    {copy.copy ?? "Copy"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Key list */}
        {keys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-center">
            <Icon name="key-round" className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {copy.noKeys ?? "No keys yet. Create one above."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li
                key={k.id}
                className={cn(
                  "flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                  k.revoked && "opacity-60",
                )}
              >
                {renderKey ? renderKey(k) : <DefaultKeyDisplay k={k} copy={copy} />}
                {confirmRevoke === k.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-destructive">
                      {copy.revokeConfirm ?? "Revoke?"}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRevoke(k.id)}
                    >
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmRevoke(null)}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive"
                    onClick={() => setConfirmRevoke(k.id)}
                    disabled={k.revoked}
                  >
                    {copy.revoke ?? "Revoke"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

ApiKeyManager.displayName = "ApiKeyManager";
