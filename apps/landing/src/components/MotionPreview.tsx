import { useState, type CSSProperties } from "react";
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
 * Animated preview for a single motion effect.
 *
 * Covers both the 11 scratchpad-style authored effects (aurora, beams,
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

  /** Append controllable play-state + iteration-count to an animation style. */
  const ac = (s: CSSProperties = {}): CSSProperties => ({
    ...s,
    animationPlayState: playing ? "running" : "paused",
    animationIterationCount: loop ? "infinite" : 1,
  });

  const renderPreview = () => {
    switch (effect) {
      /* ── Generative families ── */

      case "fade":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: accent,
                animation: `facet-fade 2s ease-in-out infinite`,
                opacity: 0.85,
              })}
            />
          </div>
        );

      case "zoom":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: accent,
                animation: `facet-zoom 2.5s ease-in-out infinite`,
                opacity: 0.85,
              })}
            />
          </div>
        );

      case "pop":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: accent,
                animation: `facet-pop 1.5s ease-out infinite`,
              })}
            />
          </div>
        );

      case "slide":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 48,
                height: 10,
                borderRadius: "var(--radius-sm)",
                background: accent,
                animation: `facet-slide 2.5s ease-in-out infinite`,
                opacity: 0.85,
              })}
            />
          </div>
        );

      case "reveal":
        return (
          <div style={base}>
            <div style={{ overflow: "hidden", lineHeight: 1 }}>
              <p
                style={ac({
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: accent,
                  animation: `facet-reveal 3s ease-in-out infinite`,
                  letterSpacing: "-0.02em",
                })}
              >
                Reveal
              </p>
            </div>
          </div>
        );

      case "blur":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: accent,
                animation: `facet-blur 3s ease-in-out infinite`,
                opacity: 0.85,
              })}
            />
          </div>
        );

      case "flip":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 40,
                height: 50,
                borderRadius: 6,
                background: accent,
                animation: `facet-flip 3s ease-in-out infinite`,
                transformStyle: "preserve-3d",
              })}
            />
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
              <div
                style={ac({
                  width: 8,
                  height: 32,
                  borderRadius: 2,
                  background: accent,
                  animation: `facet-spin 3s linear infinite`,
                })}
              />
            </div>
          </div>
        );

      case "panel":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 44,
                height: 44,
                borderRadius: 6,
                background: accent,
                animation: `facet-panel 2s ease-out infinite`,
              })}
            />
          </div>
        );

      case "lift":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 44,
                height: 44,
                borderRadius: 6,
                background: accent,
                animation: `facet-lift 2.5s ease-in-out infinite`,
                boxShadow: "0 0 0 0px rgba(0,0,0,0)",
              })}
            />
          </div>
        );

      case "press":
        return (
          <div style={base}>
            <button
              type="button"
              style={ac({
                padding: "10px 22px",
                borderRadius: 6,
                border: `1px solid ${BORDER}`,
                background: accent,
                color: "var(--primary-foreground)",
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                animation: `facet-press 1.5s ease-in-out infinite`,
              })}
            >
              Press
            </button>
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
                <div
                  key={i}
                  style={ac({
                    position: "absolute",
                    inset: 0,
                    margin: "auto",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `1px solid ${accent}`,
                    animation: `facet-ring 2s ease-out ${i * 0.7}s infinite`,
                    opacity: 0.6,
                  })}
                />
              ))}
            </div>
          </div>
        );

      case "glow":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: accent,
                animation: `facet-glow 2s ease-in-out infinite alternate`,
                opacity: 0.85,
              })}
            />
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
              <div
                style={ac({
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.35) 50%, transparent 100%)`,
                  animation: `facet-shimmer 1.5s ease-in-out infinite`,
                })}
              />
            </div>
          </div>
        );

      case "text-reveal":
        return (
          <div style={base}>
            <div
              style={ac({
                fontFamily: "var(--font-heading)",
                fontSize: 22,
                fontWeight: 700,
                backgroundImage: `linear-gradient(90deg, ${accent}, ${accent} 50%, transparent 50%)`,
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                animation: `facet-text-reveal 3s ease-in-out infinite`,
                letterSpacing: "-0.02em",
              })}
            >
              Facet
            </div>
          </div>
        );

      /* ── Scratchpad-style authored effects (used in Motion Lab) ── */

      case "aurora":
        return (
          <div style={base}>
            <div
              style={ac({
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `conic-gradient(45deg, ${accent}, transparent 60%)`,
                animation: `facet-aurora 3s ease-in-out infinite alternate`,
                opacity: 0.8,
                filter: "blur(4px)",
              })}
            />
          </div>
        );

      case "ripple":
        return (
          <div style={base}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={ac({
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `1px solid ${accent}`,
                  animation: `facet-ripple 2s ease-out ${i * 0.65}s infinite`,
                  opacity: 0,
                })}
              />
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
              <div
                key={i}
                style={ac({
                  position: "absolute",
                  width: 1.5,
                  height: "100%",
                  left: `${12 + i * 20}%`,
                  background: `linear-gradient(to bottom, transparent 0%, ${accent}30 50%, transparent 100%)`,
                  animation: `facet-beams 2.5s ease-in-out ${i * 0.35}s infinite alternate`,
                })}
              />
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
            <div
              style={ac({
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
                animation: `facet-spotlight 8s linear infinite`,
              })}
            />
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
            <div
              style={ac({
                width: 44,
                height: 44,
                background: accent,
                borderRadius: 6,
                animation: `facet-grid 3s ease-in-out infinite alternate`,
                boxShadow: `0 0 24px ${accent}60`,
              })}
            />
          </div>
        );

      case "tilt":
        return (
          <div style={base}>
            <div
              style={ac({
                padding: "12px 20px",
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: SURFACE,
                animation: `facet-tilt 4s ease-in-out infinite`,
              })}
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
          </div>
        );

      case "shine":
        return (
          <div style={base}>
            <div
              style={ac({
                padding: "10px 20px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-heading)",
                color: TEXT,
                backgroundImage: `linear-gradient(90deg, ${CARD} 0%, ${SURFACE} 30%, rgba(255,255,255,0.08) 50%, ${SURFACE} 70%, ${CARD} 100%)`,
                backgroundSize: "200% 100%",
                animation: `facet-shine 2.5s ease-in-out infinite`,
                border: `1px solid ${BORDER}`,
              })}
            >
              Shine effect
            </div>
          </div>
        );

      default: {
        // magnetic
        return <MagneticPreview base={base} accent={accent} playing={playing} loop={loop} />;
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
