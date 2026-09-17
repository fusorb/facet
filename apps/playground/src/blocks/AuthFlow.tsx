import { useEffect, useState } from "react";

/**
 * Simulated auth flow demo.
 *
 * This does NOT call a real OAuth provider — it stubs the token exchange so the
 * playground can illustrate a multi-step fullstack flow inside the sandbox:
 *   sign-in → access token → 401 (expired) → auto-refresh → session
 *   restored → tenant switch → re-authenticate.
 *
 * In a real deployment this plugs onto `@fusorb/facet-auth` (ArcProvider / useAuth),
 * whose 401→refresh→tenant wiring mirrors what is animated here.
 */
const STEPS = [
  "idle",
  "loading",
  "authed",
  "unauthorized",
  "refreshing",
] as const;

type Step = (typeof STEPS)[number];

export function AuthFlow() {
  const [step, setStep] = useState<Step>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["waiting to sign in…"]);

  const add = (msg: string) => setLog((l) => [...l, msg]);

  const signIn = () => {
    setStep("loading");
    add("POST /oauth/token — signing in…");
    setTimeout(() => {
      setToken("access-token (stub)");
      setStep("authed");
      add("→ 200 OK · token issued");
    }, 800);
  };

  useEffect(() => {
    if (step === "authed") {
      const t = setTimeout(() => {
        setToken(null);
        setStep("unauthorized");
        add("→ 401 Unauthorized · token expired");
      }, 2400);
      return () => clearTimeout(t);
    }
    if (step === "unauthorized") {
      setStep("refreshing");
      add("→ refresh_token in flight…");
      const t = setTimeout(() => {
        setToken("access-token (renewed)");
        setStep("authed");
        add("→ 200 OK · session restored");
      }, 900);
      return () => clearTimeout(t);
    }
  }, [step]);

  const switchTenant = () => {
    setStep("idle");
    setToken(null);
    add("tenant switch — clearing session");
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={signIn}
          disabled={step !== "idle" && step !== "authed"}
          className="rounded-md border px-3 py-1 text-sm"
        >
          {step === "authed" ? "Re-sign-in" : "Sign in"}
        </button>
        <button
          onClick={switchTenant}
          disabled={step !== "authed"}
          className="rounded-md border px-3 py-1 text-sm text-muted-foreground"
        >
          Switch tenant
        </button>
        <span className="text-xs text-muted-foreground">
          step: {step} · token: {token ? "present" : "none"}
        </span>
      </div>
      <pre className="overflow-auto rounded-md bg-muted px-3 py-2 text-xs">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </pre>
      <p className="text-xs text-muted-foreground">
        Simulated. Swap the stub for <code>@fusorb/facet-auth</code> (ArcProvider
        + useAuth) to drive a real OAuth/SovGrant backend — the 401→refresh→tenant
        path is identical.
      </p>
    </div>
  );
}
