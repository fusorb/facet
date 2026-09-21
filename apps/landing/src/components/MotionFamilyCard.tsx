import { useState, type CSSProperties } from "react";
import { cn } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { MotionPreview } from "./MotionPreview.js";
import type { MotionFamily } from "../data/scratchpad.js";

interface MotionFamilyCardProps {
  family: MotionFamily;
}

/**
 * Equal-height card that previews a single generative motion family.
 * Renders the animated preview with a family-specific accent color and
 * exposes play / loop / pause controls so visitors can interact with
 * the motion before diving into the Motion Lab.
 */
export function MotionFamilyCard({ family }: MotionFamilyCardProps) {
  const [playing, setPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [replayKey, setReplayKey] = useState(0);

  const handlePlay = () => {
    setPlaying(true);
    if (!loop) setReplayKey((k) => k + 1);
  };
  const handlePause = () => setPlaying(false);
  const handleLoop = () => {
    const next = !loop;
    setLoop(next);
    setReplayKey((k) => k + 1);
  };

  const accent: CSSProperties = {
    borderLeftColor: family.color,
  } as CSSProperties;

  const iconColor: CSSProperties = { color: family.color };

  return (
    <div
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border/60 bg-card p-5",
        "transition-all duration-200 hover:shadow-xl border-l-2",
      )}
      style={accent}
    >
      {/* Animated preview */}
      <div className="flex-1">
        <MotionPreview
          key={replayKey}
          effect={family.id}
          color={family.color}
          playing={playing}
          loop={loop}
          size="md"
        />
      </div>

      {/* Label + description */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            className="font-heading text-sm font-semibold text-foreground"
            style={iconColor}
          >
            {family.label}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-2">
            {family.desc}
          </p>
        </div>

        {/* Interactive controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play ${family.label}`}
            className={cn(
              "rounded-md p-1.5 text-muted-foreground/60 transition-all",
              "hover:bg-secondary hover:text-foreground",
              !playing && "text-muted-foreground/40",
            )}
            style={playing ? iconColor : undefined}
            title="Play"
          >
            <LightIcon name="play" size={13} />
          </button>

          <button
            type="button"
            onClick={handleLoop}
            aria-label={
              loop ? `Unloop ${family.label}` : `Loop ${family.label}`
            }
            className={cn(
              "rounded-md p-1.5 text-muted-foreground/60 transition-all",
              "hover:bg-secondary hover:text-foreground",
              loop && "bg-secondary text-foreground",
            )}
            style={loop ? iconColor : undefined}
            title={loop ? "Looping" : "Loop"}
          >
            <LightIcon name="repeat" size={13} />
          </button>

          <button
            type="button"
            onClick={handlePause}
            aria-label={`Pause ${family.label}`}
            className={cn(
              "rounded-md p-1.5 text-muted-foreground/60 transition-all",
              "hover:bg-secondary hover:text-foreground",
              playing && "text-muted-foreground/40",
            )}
            title="Pause"
          >
            <LightIcon name="pause" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
