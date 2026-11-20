import { useState } from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import { Motion, get, generativeFamilies, authoredRegistry } from "@fusorb/facet-motion";
import { Button } from "@fusorb/facet-components";

const DIRECTIONS = [
  "in",
  "out",
  "up",
  "down",
  "left",
  "right",
  "x",
  "y",
  "tracking",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "clockwise",
  "counterclockwise",
] as const;
const INTENSITIES = ["subtle", "soft", "medium", "strong", "dramatic"] as const;
const DURATIONS = ["instant", "fast", "base", "slow", "cinematic"] as const;
const EASINGS = ["linear", "standard", "smooth", "emphasized", "spring", "elastic"] as const;

type AnyExample = Example<Record<string, unknown>>;

function MotionPlayer(props: {
  effect: string;
  direction?: string;
  intensity?: string;
  duration?: string;
  ease?: string;
}) {
  const [nonce, setNonce] = useState(0);
  const { effect, direction, intensity, duration, ease } = props;
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Effect: <span className="font-medium text-foreground">{effect}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setNonce((n) => n + 1)}>
          Replay
        </Button>
      </div>
      <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/20 p-8">
        <Motion
          key={`${effect}-${direction}-${intensity}-${duration}-${ease}-${nonce}`}
          effect={effect}
          direction={direction as any}
          intensity={intensity as any}
          duration={duration as any}
          ease={ease as any}
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm">
            Motion
          </div>
        </Motion>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Config-driven motion preview. Adjust controls to explore direction, intensity, duration, and easing.
      </p>
    </div>
  );
}

function makeMotionExample(effect: string): AnyExample {
  const def = get(effect);
  const directions = (def?.directions?.length ? def.directions : ["in"]) as string[];
  const dir = directions[0] ?? "in";
  return {
    id: `${effect}-preview`,
    title: effect,
    description: `Interactive "${effect}" motion preview with configurable controls.`,
    artifact: effect,
    tags: ["motion", effect],
    defaults: { effect, direction: dir, intensity: "medium", duration: "base", ease: "standard" },
    controls: {
      effect: { options: [effect], label: "Effect" },
      direction: { options: directions.length ? directions : [...DIRECTIONS], label: "Direction" },
      intensity: { options: [...INTENSITIES], label: "Intensity" },
      duration: { options: [...DURATIONS], label: "Duration" },
      ease: { options: [...EASINGS], label: "Easing" },
    },
    render: (p) => (
      <MotionPlayer
        effect={String(p.effect ?? effect)}
        direction={String(p.direction ?? dir)}
        intensity={String(p.intensity ?? "medium")}
        duration={String(p.duration ?? "base")}
        ease={String(p.ease ?? "standard")}
      />
    ),
    code: (p) =>
      `<Motion effect="${String(p.effect ?? effect)}" direction="${String(p.direction ?? dir)}" intensity="${String(
        p.intensity ?? "medium",
      )}" duration="${String(p.duration ?? "base")}" ease="${String(p.ease ?? "standard")}">\n  <div>Content</div>\n</Motion>`,
  };
}

const generativeIds = Object.keys(generativeFamilies ?? {});
const authoredIds = Object.keys(authoredRegistry ?? {}).filter((id) => Boolean(get(id)?.resolve));

export const motionExamples: Record<string, AnyExample[]> = {};
export const motionItemMeta: Array<{ id: string; name: string; category: string; summary: string }> = [];

for (const id of generativeIds) {
  motionExamples[id] = [makeMotionExample(id)];
  motionItemMeta.push({
    id,
    name: id,
    category: "Generative families",
    summary: `Generative motion family "${id}" with configurable direction, intensity, duration, and easing.`,
  });
}

for (const id of authoredIds) {
  motionExamples[id] = [makeMotionExample(id)];
  motionItemMeta.push({
    id,
    name: id,
    category: "Authored effects",
    summary: `Authored motion effect "${id}" (resolvable) with configurable controls.`,
  });
}

const allPlayable = [...generativeIds, ...authoredIds];
if (allPlayable.length > 0) {
  const labId = "motion-lab";
  motionExamples[labId] = [
    {
      id: "motion-lab-playground",
      title: "Motion lab",
      description: "Try any resolvable motion effect with dynamic controls.",
      artifact: labId,
      tags: ["motion", "lab"],
      defaults: { effect: allPlayable[0], direction: "in", intensity: "medium", duration: "base", ease: "standard" },
      controls: {
        effect: { options: allPlayable, label: "Effect" },
        direction: { options: [...DIRECTIONS], label: "Direction" },
        intensity: { options: [...INTENSITIES], label: "Intensity" },
        duration: { options: [...DURATIONS], label: "Duration" },
        ease: { options: [...EASINGS], label: "Easing" },
      },
      render: (p) => (
        <MotionPlayer
          effect={String(p.effect ?? allPlayable[0])}
          direction={String(p.direction ?? "in")}
          intensity={String(p.intensity ?? "medium")}
          duration={String(p.duration ?? "base")}
          ease={String(p.ease ?? "standard")}
        />
      ),
      code: (p) =>
        `<Motion effect="${String(p.effect ?? allPlayable[0])}" direction="${String(p.direction ?? "in")}" intensity="${String(
          p.intensity ?? "medium",
        )}" duration="${String(p.duration ?? "base")}" ease="${String(p.ease ?? "standard")}">\n  <div>Content</div>\n</Motion>`,
    },
  ];
  motionItemMeta.unshift({
    id: labId,
    name: "Motion lab",
    category: "Lab",
    summary: "Dynamic playground for all resolvable motion effects and controls.",
  });
}
