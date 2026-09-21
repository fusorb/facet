import { CSSProperties, type ReactNode, useState } from "react";
import { AUTH_MACHINE } from "../data/scratchpad.js";
import type { AuthState } from "../data/scratchpad.js";
import { useLabDomain } from "../lib/lab-domain.js";
import { PageShell } from "../components/PageShell.js";
import {
  LabDomainBar,
  LabPanel,
  LabTag,
  CodeLine,
  CopyButton,
} from "../components/labs";
import { LightIcon } from "@fusorb/facet-components/light";
import { cn } from "@fusorb/facet-components";

export function AuthLabPage() {
  const { domain } = useLabDomain();
  const accent = domain.accent;
  const [authState, setAuthState] = useState("idle");

  const active =
    AUTH_MACHINE.find((s) => s.id === authState) ?? AUTH_MACHINE[0]!;

  return (
    <PageShell
      kicker={<LabTag tone="accent">Auth</LabTag>}
      title="Authentication Lab"
      description="Interactive auth state machine driven by a live domain preset."
    >
      <div
        className="lab"
        style={{ "--domain-accent": accent } as CSSProperties}
      >
        <LabDomainBar />

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ── Live auth surface ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="lab-live h-2 w-2 shrink-0 rounded-full"
                style={{ background: accent }}
                aria-hidden
              />
              <LabTag tone="dim">Live surface</LabTag>
              <span className="text-sm font-medium text-foreground/80">
                {active.label}
              </span>
            </div>

            <LabPanel className="lab-surface relative isolate min-h-[250px]">
              {renderSurface(
                active,
                accent,
                domain.authMethods,
                setAuthState,
                domain.label,
              )}
            </LabPanel>

            <p className="text-xs text-muted-foreground/70">{active.desc}</p>
          </div>

          {/* ── State machine + configuration ── */}
          <div className="space-y-8">
            <div>
              <LabTag tone="dim">State machine</LabTag>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Click a state to inspect its surface.
              </p>
              <div className="mt-3 space-y-1.5">
                {AUTH_MACHINE.map((s) => {
                  const isActive = authState === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setAuthState(s.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm",
                        "hover:bg-secondary",
                        isActive
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                      )}
                      style={
                        isActive
                          ? {
                              boxShadow:
                                "0 0 0 2px var(--background), 0 0 0 4px " +
                                accent,
                            }
                          : undefined
                      }
                    >
                      <span
                        className={cn(
                          s.colorClass,
                          "h-2 w-2 shrink-0 rounded-full bg-current",
                        )}
                        aria-hidden
                      />
                      <span className="flex-1">{s.label}</span>
                      {isActive && (
                        <span style={{ color: accent }}>
                          <LightIcon name="check" size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <LabTag tone="dim">Configuration</LabTag>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary/40 p-3 text-xs">
                {configLines(domain).map((line, i) => (
                  <CodeLine key={i} segments={line} />
                ))}
              </pre>
              <div className="mt-2">
                <CopyButton value={configText(domain)} label="Copy config" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function renderSurface(
  state: AuthState,
  accent: string,
  methods: string[],
  setAuthState: (s: string) => void,
  label: string,
) {
  const accentTint: CSSProperties = {
    background: `color-mix(in srgb, ${accent} 92%, transparent)`,
    borderColor: accent,
  };

  const methodButtons = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {methods.map((m) => (
        <button
          key={m}
          type="button"
          className={cn(
            "rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium",
            "hover:bg-secondary",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );

  const AccentBtn = ({ children }: { children: ReactNode }) => (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
      style={{ background: accent, color: "var(--primary-foreground)" }}
    >
      {children}
    </button>
  );

  const AccentLink = ({ children }: { children: ReactNode }) => (
    <button
      type="button"
      onClick={() => setAuthState("login-form")}
      className="text-sm font-medium"
      style={{ color: accent }}
    >
      {children}
    </button>
  );

  switch (state.id) {
    case "idle":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-5">
          <div className="text-center">
            <h3 className="font-heading text-xl font-semibold">Welcome back</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue
            </p>
          </div>
          {methodButtons}
          <AccentBtn>Sign in</AccentBtn>
        </div>
      );

    case "select-method":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-5">
          <h3 className="font-heading text-xl font-semibold">
            Select an authentication method
          </h3>
          {methodButtons}
          <AccentLink>Try email sign-in</AccentLink>
        </div>
      );

    case "login-form":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h3 className="font-heading text-xl font-semibold">Email sign-in</h3>
          <form className="w-full max-w-xs space-y-3">
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm"
            />
            <AccentBtn>Sign in</AccentBtn>
          </form>
        </div>
      );

    case "magic-link":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h3 className="font-heading text-xl font-semibold">Magic link</h3>
          <form className="w-full max-w-xs space-y-3">
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm"
            />
            <AccentBtn>Send magic link</AccentBtn>
          </form>
        </div>
      );

    case "passkey":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl border"
            style={accentTint}
            aria-hidden
          >
            <LightIcon name="key-round" size={24} />
          </div>
          <h3 className="font-heading text-xl font-semibold">
            Use your passkey
          </h3>
          <p className="text-sm text-muted-foreground">
            Tap to authenticate with your device.
          </p>
          <AccentBtn>Continue with passkey</AccentBtn>
        </div>
      );

    case "mfa-challenge":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h3 className="font-heading text-xl font-semibold">
            Two-factor code
          </h3>
          <form className="flex items-center justify-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="• • • • • •"
              className="w-56 font-mono text-center text-lg tracking-widest rounded-lg border border-border/60 bg-secondary/40 px-3 py-2"
            />
            <AccentBtn>Verify</AccentBtn>
          </form>
        </div>
      );

    case "complete":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full text-green-400">
            <LightIcon name="check" size={26} />
          </span>
          <h3 className="font-heading text-xl font-semibold">
            You're signed in
          </h3>
          <p className="text-sm text-muted-foreground">
            Session established for the {label} domain.
          </p>
        </div>
      );

    case "error":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <LightIcon
            name="alert-circle"
            size={32}
            className="text-destructive"
          />
          <h3 className="font-heading text-xl font-semibold">
            Couldn't sign you in
          </h3>
          <p className="text-sm text-muted-foreground">{state.desc}</p>
          <button
            type="button"
            onClick={() => setAuthState("idle")}
            className="text-sm font-medium"
            style={{ color: accent }}
          >
            Try again
          </button>
        </div>
      );

    default:
      // processing states (check-session, check-mfa, ...)
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-muted"
            style={{ borderTopColor: accent }}
          />
          <p className="text-sm text-muted-foreground">{state.desc}</p>
        </div>
      );
  }
}

function slugMethod(m: string): string {
  return m
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type CodeSeg = { text: string; role?: "keyword" | "string" | "ident" | "dim" };

const I: CodeSeg["role"] = "ident";
const S: CodeSeg["role"] = "string";
const D: CodeSeg["role"] = "dim";

function configLines(domain: {
  id: string;
  authMethods: string[];
  density: string;
}): CodeSeg[][] {
  const methods = domain.authMethods.map((m) => slugMethod(m));
  return [
    [
      { text: "domain", role: I },
      { text: ": ", role: D },
      { text: `"${domain.id}"`, role: S },
      { text: ",", role: D },
    ],
    [
      { text: "auth-methods", role: I },
      { text: ": [", role: D },
    ],
    ...methods.map((m) => [
      { text: "  ", role: D },
      { text: `"${m}"`, role: S },
      { text: ",", role: D },
    ]),
    [
      { text: "]", role: D },
      { text: ",", role: D },
    ],
    [
      { text: "density", role: I },
      { text: ": ", role: D },
      { text: `"${domain.density.toLowerCase()}"`, role: S },
      { text: ",", role: D },
    ],
  ];
}

function configText(domain: {
  id: string;
  authMethods: string[];
  density: string;
}): string {
  const methods = domain.authMethods.map((m) => slugMethod(m));
  return [
    `domain: "${domain.id}",`,
    "auth-methods: [",
    ...methods.map((m) => `  "${m}",`),
    "],",
    `density: "${domain.density.toLowerCase()}",`,
  ].join("\n");
}
