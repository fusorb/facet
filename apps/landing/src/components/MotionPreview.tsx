import { useState, type CSSProperties, type ReactElement } from "react";
import { Motion } from "@fusorb/facet-motion";
import { MOTION_EFFECTS, MOTION_FAMILIES } from "../data/scratchpad.js";
import type { MotionFamily } from "../data/scratchpad.js";

import "../styles/motion-previews.css";

const CARD = "var(--card)";
const BORDER = "var(--border)";
const SURFACE = "var(--secondary)";
const MUTED = "var(--muted-foreground)";
const TEXT = "var(--foreground)";

const previewBox: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "120px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderRadius: "var(--radius-lg)",
  background: CARD,
};

interface MotionPreviewProps {
  effect: string;
  size?: "sm" | "md" | "lg";
  /** Accent color for the preview element (OKLCH string). Defaults to --primary. */
  color?: string;
  /** Whether animations are currently playing. */
  playing?: boolean;
  /** Whether animations loop infinitely. */
  loop?: boolean;
}

/** Resolve a family by id from the centralized data table. */
function familyOf(id: string): MotionFamily | undefined {
  return MOTION_FAMILIES.find((f) => f.id === id);
}

/**
 * Generative Motion: drives a generative family through @fusorb/facet-motion.
 *
 * - `repeat`: "infinite" when looping, 1 for a single play-through.
 * - `repeatType`: "reverse" (alternate) for smooth breathing on loop,
 *   except "spin" which needs continuous rotation (registry default "loop").
 * - `duration`: 2000 ms gives a visible cycle for every family.
 * - `delay`: staggered start offset (used by ring's expanding rings).
 */
function Gm({
  effect,
  playing,
  loop,
  delay,
  children,
}: {
  effect: string;
  playing: boolean;
  loop: boolean;
  delay?: number;
  children: ReactElement;
}) {
  return (
    <Motion
      asChild
      effect={effect}
      repeat={loop ? "infinite" : 1}
      repeatType={loop && effect !== "spin" ? "reverse" : undefined}
      playing={playing}
      duration={2000}
      delay={delay ?? 0}
    >
      {children}
    </Motion>
  );
}

/**
 * Authored Motion: drives a registry-authored effect (aurora, beams, …)
 * through @fusorb/facet-motion. No duration or repeatType override is
 * passed — the registry is authoritative for the cycle timing and repeat
 * strategy (continuous "loop" for sweeps such as spotlight/shine/ripple/
 * tilt, and alternating breathing for aurora/beams/grid).
 */
function Am({
  effect,
  playing,
  loop,
  delay,
  children,
}: {
  effect: string;
  playing: boolean;
  loop: boolean;
  delay?: number;
  children: ReactElement;
}) {
  return (
    <Motion
      asChild
      effect={effect}
      repeat={loop ? "infinite" : 1}
      playing={playing}
      delay={delay ?? 0}
    >
      {children}
    </Motion>
  );
}

/**
 * Animated preview for a single motion effect.
 *
 * Covers both the scratchpad-style authored effects (aurora, beams,
 * spotlight, …) and the 15 generative families (fade, zoom, pop, …).
 *
 * The `playing` and `loop` props make every preview controllable: a
 * parent control bar (e.g. MotionFamilyCard) can pause, toggle
 * looping, or restart via React's key prop.
 */
export function MotionPreview({
  effect,
  size = "md",
  color: colorProp,
  playing = true,
  loop = true,
}: MotionPreviewProps) {
  const h = size === "sm" ? 80 : size === "lg" ? 160 : 120;
  const base: CSSProperties = { ...previewBox, height: h };
  const accent = colorProp ?? "var(--primary)";

  const renderPreview = () => {
    switch (effect) {
      /* ── Generative families (driven by @fusorb/facet-motion) ── */

      case "fade":
        return (
          <div style={base}>
            <Gm effect="fade" playing={playing} loop={loop}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: accent }} />
            </Gm>
          </div>
        );

      case "zoom":
        return (
          <div style={base}>
            <Gm effect="zoom" playing={playing} loop={loop}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: accent }} />
            </Gm>
          </div>
        );

      case "pop":
        return (
          <div style={base}>
            <Gm effect="pop" playing={playing} loop={loop}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: accent }} />
            </Gm>
          </div>
        );

      case "slide":
        return (
          <div style={base}>
            <Gm effect="slide" playing={playing} loop={loop}>
              <div style={{ width: 48, height: 10, borderRadius: "var(--radius-sm)", background: accent }} />
            </Gm>
          </div>
        );

      case "reveal":
        return (
          <div style={base}>
            <div style={{ overflow: "hidden", lineHeight: 1 }}>
              <Gm effect="reveal" playing={playing} loop={loop}>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: accent,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Reveal
                </p>
              </Gm>
            </div>
          </div>
        );

      case "blur":
        return (
          <div style={base}>
            <Gm effect="blur" playing={playing} loop={loop}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: accent }} />
            </Gm>
          </div>
        );

      case "flip":
        return (
          <div style={base}>
            <Gm effect="flip" playing={playing} loop={loop}>
              <div
                style={{
                  width: 40,
                  height: 50,
                  borderRadius: 6,
                  background: accent,
                  transformStyle: "preserve-3d",
                }}
              />
            </Gm>
          </div>
        );

      case "spin":
        return (
          <div style={base}>
            <div
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Gm effect="spin" playing={playing} loop={loop}>
                <div style={{ width: 8, height: 32, borderRadius: 2, background: accent }} />
              </Gm>
            </div>
          </div>
        );

      case "panel":
        return (
          <div style={base}>
            <Gm effect="panel" playing={playing} loop={loop}>
              <div style={{ width: 44, height: 44, borderRadius: 6, background: accent }} />
            </Gm>
          </div>
        );

      case "lift":
        return (
          <div style={base}>
            <Gm effect="lift" playing={playing} loop={loop}>
              <div style={{ width: 44, height: 44, borderRadius: 6, background: accent }} />
            </Gm>
          </div>
        );

      case "press":
        return (
          <div style={base}>
            <Gm effect="press" playing={playing} loop={loop}>
              <button
                type="button"
                style={{
                  padding: "10px 22px",
                  borderRadius: 6,
                  border: `1px solid ${BORDER}`,
                  background: accent,
                  color: "var(--primary-foreground)",
                  fontFamily: "var(--font-heading)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Press
              </button>
            </Gm>
          </div>
        );

      case "ring":
        return (
          <div style={base}>
            <div
              style={{
                position: "relative",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: accent,
                  zIndex: 2,
                }}
              />
              {[0, 1].map((i) => (
                <Gm
                  key={i}
                  effect="ring"
                  playing={playing}
                  loop={loop}
                  delay={i * 700}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      margin: "auto",
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: `1px solid ${accent}`,
                    }}
                  />
                </Gm>
              ))}
            </div>
          </div>
        );

      case "glow":
        return (
          <div style={base}>
            <Gm effect="glow" playing={playing} loop={loop}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: accent }} />
            </Gm>
          </div>
        );

      case "shimmer":
        return (
          <div style={base}>
            <div
              style={{
                position: "relative",
                width: 56,
                height: 16,
                borderRadius: 4,
                background: accent,
                overflow: "hidden",
              }}
            >
              <Gm effect="shimmer" playing={playing} loop={loop}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.35) 50%, transparent 100%)`,
                  }}
                />
              </Gm>
            </div>
          </div>
        );

      case "text-reveal":
        return (
          <div style={base}>
            <Gm effect="text-reveal" playing={playing} loop={loop}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 22,
                  fontWeight: 700,
                  backgroundImage: `linear-gradient(90deg, ${accent}, ${accent} 50%, transparent 50%)`,
                  backgroundSize: "200% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                Facet
              </div>
            </Gm>
          </div>
        );

      /* ── Authored effects (driven by @fusorb/facet-motion registry) ── */

      case "aurora":
        return (
          <div style={base}>
            <Am effect="aurora" playing={playing} loop={loop}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `conic-gradient(45deg, ${accent}, transparent 60%)`,
                  filter: "blur(4px)",
                }}
              />
            </Am>
          </div>
        );

      case "ripple":
        return (
          <div style={base}>
            {[0, 1, 2].map((i) => (
              <Am
                key={i}
                effect="ripple"
                playing={playing}
                loop={loop}
                delay={i * 650}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `1px solid ${accent}`,
                  }}
                />
              </Am>
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: accent,
                opacity: 0.85,
              }}
            />
          </div>
        );

      case "beams":
        return (
          <div style={base}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Am
                key={i}
                effect="beams"
                playing={playing}
                loop={loop}
                delay={i * 350}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 1.5,
                    height: "100%",
                    left: `${12 + i * 20}%`,
                    background: `linear-gradient(to bottom, transparent 0%, ${accent}30 50%, transparent 100%)`,
                  }}
                />
              </Am>
            ))}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: MUTED,
              }}
            >
              Beams
            </span>
          </div>
        );

      case "spotlight":
        return (
          <div style={base}>
            <Am effect="spotlight" playing={playing} loop={loop}>
              <div
                style={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
                }}
              />
            </Am>
            <span
              style={{
                position: "relative",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: MUTED,
              }}
            >
              Spotlight
            </span>
          </div>
        );

      case "typewriter":
        return (
          <div style={base}>
            <TypewriterText accent={accent} playing={playing} loop={loop} />
          </div>
        );

      case "grid":
        return (
          <div
            style={{
              ...base,
              backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          >
            <Am effect="grid" playing={playing} loop={loop}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: accent,
                  borderRadius: 6,
                  boxShadow: `0 0 24px ${accent}60`,
                }}
              />
            </Am>
          </div>
        );

      case "tilt":
        return (
          <div style={base}>
            <Am effect="tilt" playing={playing} loop={loop}>
              <div
                style={{
                  padding: "12px 20px",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  background: SURFACE,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: TEXT,
                  }}
                >
                  Tilt
                </span>
              </div>
            </Am>
          </div>
        );

      case "shine":
        return (
          <div style={base}>
            <Am effect="shine" playing={playing} loop={loop}>
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-heading)",
                  color: TEXT,
                  backgroundImage: `linear-gradient(90deg, ${CARD} 0%, ${SURFACE} 30%, rgba(255,255,255,0.08) 50%, ${SURFACE} 70%, ${CARD} 100%)`,
                  backgroundSize: "200% 100%",
                  border: `1px solid ${BORDER}`,
                }}
              >
                Shine effect
              </div>
            </Am>
          </div>
        );

      default: {
        // magnetic
        return (
          <MagneticPreview
            base={base}
            accent={accent}
            playing={playing}
            loop={loop}
          />
        );
      }
    }
  };

  return (
    <div
      className={size === "sm" ? "w-28" : "w-full"}
      title={
        MOTION_EFFECTS.find((e) => e.id === effect)?.desc ??
        familyOf(effect)?.desc ??
        ""
      }
    >
      {renderPreview()}
      <div className="mt-1 text-center">
        <span className="font-heading text-xs font-semibold text-foreground">
          {MOTION_EFFECTS.find((e) => e.id === effect)?.label ??
            familyOf(effect)?.label ??
            effect}
        </span>
      </div>
    </div>
  );
}

function TypewriterText({
  accent,
  playing,
  loop,
}: {
  accent: string;
  playing: boolean;
  loop: boolean;
}) {
  const ctrl: CSSProperties = {
    animationPlayState: playing ? "running" : "paused",
    animationIterationCount: loop ? "infinite" : 1,
  };
  return (
    <p
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: 16,
        fontWeight: 600,
        color: "var(--foreground)",
        letterSpacing: "-0.02em",
        display: "flex",
        alignItems: "center",
      }}
    >
      Build with Facet.
      <span
        style={{
          borderRight: `2px solid ${accent}`,
          marginLeft: 2,
          animation: "facet-typewriter-blink 0.8s infinite",
          ...ctrl,
        }}
      />
    </p>
  );
}

function MagneticPreview({
  base,
  accent,
  playing,
  loop,
}: {
  base: CSSProperties;
  accent: string;
  playing: boolean;
  loop: boolean;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ctrl: CSSProperties = {
    animationPlayState: playing ? "running" : "paused",
    animationIterationCount: loop ? "infinite" : 1,
  };
  return (
    <div
      style={base}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({
          x: (e.clientX - r.left - r.width / 2) * 0.18,
          y: (e.clientY - r.top - r.height / 2) * 0.18,
        });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
    >
      <div
        style={{
          padding: "10px 20px",
          border: `1px solid var(--border)`,
          borderRadius: 6,
          background: "var(--secondary)",
          fontFamily: "var(--font-heading)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--foreground)",
          boxShadow: `0 0 0 1px ${accent}`,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: "transform 0.15s ease-out",
          cursor: "pointer",
          ...ctrl,
        }}
      >
        Magnetic
      </div>
    </div>
  );
}
