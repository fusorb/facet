import { Link } from "react-router-dom";
import { Pill, Button } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { MOTION_FAMILIES } from "../../data/scratchpad.js";
import { MotionFamilyCard } from "../MotionFamilyCard.js";

export function MotionPreviewSection() {
  return (
    <section id="motion" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name="sparkles" size={12} />}
        >
          Motion
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Motion is tokenized
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          15 generative animation families and 5 domain-specific presets, all
          driven by the same CSS custom properties you can override in your own
          product. Each card plays its family live — tap Play, Loop, or Pause
          to feel the motion.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          Generative families
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MOTION_FAMILIES.map((family) => (
            <MotionFamilyCard key={family.id} family={family} />
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-border/40 bg-card p-6">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          Motion tokens
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <MotionToken
            label="duration-fast"
            value="--facet-motion-duration-fast"
            sample="150ms"
          />
          <MotionToken
            label="duration-base"
            value="--facet-motion-duration-base"
            sample="250ms"
          />
          <MotionToken
            label="duration-slow"
            value="--facet-motion-duration-slow"
            sample="500ms"
          />
          <MotionToken
            label="ease-standard"
            value="--motion-ease-standard"
            sample="cubic-bezier(0.2, 0, 0, 1)"
          />
          <MotionToken
            label="ease-spring"
            value="--motion-ease-spring"
            sample="cubic-bezier(0.34, 1.56, 0.64, 1)"
          />
          <MotionToken
            label="ease-emphasized"
            value="--motion-ease-emphasized"
            sample="cubic-bezier(0.2, 0, 0, 1)"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Link to="/lab/motion">
            <Button color="primary" size="sm">
              Explore in Motion Lab
              <LightIcon name="arrow-right" size={12} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function MotionToken({
  label,
  value,
  sample,
}: {
  label: string;
  value: string;
  sample: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground/60">{label}</div>
      <code className="font-mono text-xs text-foreground/80 break-all">
        {value}
      </code>
      <div className="text-xs text-muted-foreground">{sample}</div>
    </div>
  );
}
