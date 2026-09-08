import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  PasswordStrengthMeter,
  PasswordInput,
  OtpVerificationCard,
  Input,
  Label,
} from "@arcevo/facet-components";
import { LightIcon } from "@arcevo/facet-components/light";

/**
 * Live auth surfaces from @arcevo/facet-auth and the ready-to-use
 * auth components from @arcevo/facet-components. Switches between the
 * PasswordStrengthMeter (signup moment) and the OtpVerificationCard
 * (MFA moment) so the landing shows the two halves of every auth flow.
 */
export function AuthShowcaseSection() {
  const [tab, setTab] = React.useState("password");
  const [password, setPassword] = React.useState("");

  return (
    <section id="auth" className="mx-auto max-w-5xl px-8 py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Auth flows you can show, not describe
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Live surfaces from <code className="rounded bg-secondary/50 px-2 py-1 text-xs">@arcevo/facet-auth</code>:
          password strength, MFA verification, and the rest of the state
          machine.
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightIcon name="shield-check" size={18} className="text-primary" />
            Sign-up moment
          </CardTitle>
          <CardDescription>
            Switch between tabs to preview the password and OTP moments.
            Both wired through the facet-auth state machine in real apps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="password" className="flex-1">
                Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="flex-1">
                OTP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input id="auth-email" type="email" placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-password">Password</Label>
                  <PasswordInput
                    id="auth-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                  />
                  <PasswordStrengthMeter value={password} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="otp" className="flex justify-center">
              <OtpVerificationCard
                onVerify={async () => {
                  // demo: always reject so the error state is observable
                  throw new Error("demo");
                }}
                onResend={async () => {
                  /* demo */
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}