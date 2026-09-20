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
  Pill,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useDomain } from "../../lib/domain-context.js";

/**
 * Live auth surfaces from the ready-to-use auth components. Switches
 * between the PasswordStrengthMeter (signup moment) and the
 * OtpVerificationCard (MFA moment) so the landing shows the two halves
 * of every auth flow. Both are the same components the facet-auth
 * package composes in real apps.
 */
export function AuthShowcaseSection() {
  const [tab, setTab] = React.useState("password");
  const [password, setPassword] = React.useState("");
  const { domain } = useDomain();

  return (
    <section id="auth" className="mx-auto max-w-5xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name={domain.authSection.labelIcon} size={12} />}
        >
          {domain.authSection.label}
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {domain.authSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {domain.authSection.subtitle}
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightIcon name="shield-check" size={18} className="text-primary" />
            Sign-up moment
          </CardTitle>
          <CardDescription>
            Switch between tabs to preview the password and OTP moments. Both
            wired through the facet-auth state machine in real apps.
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
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@company.com"
                  />
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
                  // Working demo: any code verifies after a short simulated
                  // round trip, so the success state is observable.
                  await new Promise((resolve) => setTimeout(resolve, 600));
                }}
                onResend={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
