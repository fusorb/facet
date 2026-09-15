import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Pill,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { INSTALL_STEPS } from "../../data/features.js";

export function InstallSection() {
  return (
    <section id="install" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name="terminal" size={12} />}
        >
          Install
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Get started in minutes
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Install one command, import what you need, ship your app.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {INSTALL_STEPS.map((step) => (
          <Card
            key={step.num}
            className="transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <CardHeader>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {step.num}
              </span>
              <CardTitle className="text-sm font-semibold">
                {step.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
                {step.code}
              </code>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
