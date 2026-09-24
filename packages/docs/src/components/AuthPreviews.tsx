import * as React from "react";
import { ArcProvider, SignIn, SignUp, Guard } from "@fusorb/facet-auth";
import { LoginForm, MfaVerifyForm } from "@fusorb/facet-auth";
import { ArcIdClient } from "@fusorb/facet-sdk";
import { CodeBlock } from "./CodeBlock.js";

/** No network: bootstrap stays signed out because no token is stored. */
const DEMO_CLIENT = new ArcIdClient({ baseUrl: "https://demo.invalid" });

function PreviewShell({
  title,
  description,
  code,
  children,
}: {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}) {
  const [showCode, setShowCode] = React.useState(false);
  return (
    <section className="not-prose mt-8">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 overflow-visible rounded-lg border border-border">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">
            Live preview
          </span>
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            aria-expanded={showCode}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-foreground/5"
          >
            {showCode ? "Hide code" : "View code"}
          </button>
        </div>
        <div className="w-full bg-background p-6">{children}</div>
        {showCode && (
          <div className="border-t border-border">
            <CodeBlock code={code} />
          </div>
        )}
      </div>
    </section>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ArcProvider client={DEMO_CLIENT}>{children}</ArcProvider>;
}

/** Auth preview blocks for the /auth/* docs pages. */
export function AuthPreviews() {
  return (
    <div className="space-y-2">
      <PreviewShell
        title="SignUp"
        description="Account creation with appearance / config / slots customization."
        code={`import { SignUp } from "@fusorb/facet-auth";

<SignUp
  config={eduPreset}
  onSuccess={(result) => router.push("/dashboard")}
/>`}
      >
        <AuthProvider>
          <div className="w-full max-w-md">
            <SignUp config={{ allowPasskey: true, allowMagicLink: true }} />
          </div>
        </AuthProvider>
      </PreviewShell>

      <PreviewShell
        title="MfaDialog"
        description="The MFA challenge in a dialog, with verify / setup / recovery phases."
        code={`import { MfaDialog } from "@fusorb/facet-auth";

<MfaDialog
  open={open}
  onOpenChange={setOpen}
  client={client}
  sessionId={sessionId}
  onComplete={(result) => console.log(result)}
/>`}
      >
        <AuthProvider>
          <div className="flex flex-col items-center gap-3">
            <MfaVerifyForm
              onVerify={async () => {}}
              onRecovery={() => {}}
              onCancel={() => {}}
            />
          </div>
        </AuthProvider>
      </PreviewShell>

      <PreviewShell
        title="Guard"
        description="Renders its children only when a session is present; falls back otherwise."
        code={`<Guard fallback={<SignIn />}>
  <ProtectedPage />
</Guard>`}
      >
        <AuthProvider>
          <div className="w-full max-w-md">
            <Guard fallback={<SignIn />}>
              <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                Signed in content would render here.
              </div>
            </Guard>
          </div>
        </AuthProvider>
      </PreviewShell>

      <PreviewShell
        title="Standalone forms"
        description="Independently importable forms: LoginForm, MagicLinkForm, ForgotPasswordForm, MfaVerifyForm."
        code={`import { LoginForm } from "@fusorb/facet-auth";

<LoginForm
  onSubmit={async (email, password) => {
    const res = await login({ email, password });
    return res.error?.message ?? null;
  }}
/>`}
      >
        <AuthProvider>
          <div className="w-full max-w-md">
            <LoginForm onSubmit={async () => null} validate />
          </div>
        </AuthProvider>
      </PreviewShell>
    </div>
  );
}
