import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Marquee,
} from "@fusorb/facet-components";
import { INSTALL_STEPS } from "../data/features.js";

export function InstallSection() {
  return (
    <section id="install" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Get started in 5 minutes
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Install one command, import what you need, ship your app.
        </p>
      </div>

      <Marquee
        duration={28}
        gap="1.25rem"
        items={INSTALL_STEPS.map((step) => (
          <Card key={step.num} className="w-64 shrink-0">
            <CardHeader>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {step.num}
              </span>
              <CardTitle className="text-sm font-semibold">{step.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
                {step.code}
              </code>
            </CardContent>
          </Card>
        ))}
      />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Hover the strip to pause the scroll.
      </p>
    </section>
  );
}
