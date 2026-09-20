import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";
import type { IconName } from "../icon/index.js";

export interface SystemNode {
  id: string;
  label: string;
  sub: string;
  desc: string;
  icon?: IconName;
  /** OKLCH color string — tints the card accent, icon, and connector. */
  color?: string;
  /** Package name surfaced in the node's detail panel. */
  pkg?: string;
  children?: SystemNode[];
}

export interface LayerGraphProps {
  /** Layer tree to render. Defaults to the four facet layers. */
  nodes?: SystemNode[];
}

/** One computed connector line between a parent node and its child. */
interface LayerPath {
  /** SVG path data (edge-to-edge cubic bezier). */
  d: string;
  /** Pixel length of the path — used for stroke-dash animations. */
  length: number;
  /** Bottom-center of the parent node (line start). */
  startX: number;
  startY: number;
  /** Top-center of the child node (line end). */
  endX: number;
  endY: number;
  /** Tree depth (0 = top level) — drives animation stagger. */
  depth: number;
}

/** Vertical curve depth for the bezier control points (pixels). */
const CURVE_OFFSET = 28;
/** Radius of the connection dots at path endpoints. */
const DOT_RADIUS = 3.5;

/**
 * Composable architecture graph. Renders a relational hierarchy as an
 * always-vertical tree (root at the top, children below).
 *
 * Every node is a rectangular card with an icon, label, and sub-label.
 * Clicking a card toggles a detail widecard with its description (single-open
 * accordion). Nodes with children render those children in a horizontal row
 * below, connected by perfect SVG guide-lines:
 *
 *   • Edge-to-edge: every line starts at the **bottom-center** of the parent
 *     card and ends at the **top-center** of the child card — never through
 *     the middle of a node.
 *   • Connection dots: a small dot sits at both junction points so the line
 *     always lands exactly on the node edge.
 *   • Depth-staggered draw: lines and dots animate in from top to bottom,
 *     giving a clear visual hierarchy.
 *   • Live re-measure: opening or closing a widecard re-computes every path,
 *     so the guide-lines never drift out of alignment.
 *
 * Accepts arbitrary `SystemNode` trees, so it can visualise any relational
 * hierarchy, not just the facet layers.
 *
 * Optional `color` per node tints the card border, icon container, and
 * connector so each layer stands out — never a dull monochrome stack.
 */
export function LayerGraph({ nodes = [] }: LayerGraphProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const nodeRefs = React.useRef(new Map<string, HTMLElement>());
  const [paths, setPaths] = React.useState<LayerPath[]>([]);
  const [open, setOpen] = React.useState<string | null>(null);

  const toggleNode = (id: string) => setOpen(open === id ? null : id);

  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const next: LayerPath[] = [];

    const walk = (node: SystemNode, depth: number) => {
      const parentEl = nodeRefs.current.get(node.id);
      if (!parentEl) return;
      const pr = parentEl.getBoundingClientRect();

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const childEl = nodeRefs.current.get(child.id);
          if (!childEl) continue;
          const cc = childEl.getBoundingClientRect();

          // Edge-to-edge: parent bottom-center → child top-center
          const startX = pr.left + pr.width / 2 - cr.left;
          const startY = pr.top + pr.height - cr.top; // bottom edge of parent
          const endX = cc.left + cc.width / 2 - cr.left;
          const endY = cc.top - cr.top; // top edge of child

          const offset = CURVE_OFFSET;
          const d =
            `M ${startX} ${startY}` +
            ` C ${startX} ${startY + offset},` +
            ` ${endX} ${endY - offset},` +
            ` ${endX} ${endY}`;

          // Compute path length for stroke-dash draw animation
          const pathEl = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          pathEl.setAttribute("d", d);
          const length = pathEl.getTotalLength();

          next.push({ d, length, startX, startY, endX, endY, depth });
          walk(child, depth + 1);
        }
      }
    };

    for (const node of nodes ?? []) walk(node, 0);
    setPaths(next);
  }, [nodes]);

  // Re-measure on mount, on container resize, and critically — whenever a
  // node expands or collapses. Without `open` in the deps the widecards
  // shift the children but the SVG paths stay frozen, causing drift.
  React.useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measure, open]);

  const renderNode = (node: SystemNode) => {
    const isOpen = open === node.id;
    const hasChildren = !!node.children?.length;
    const accent = node.color ?? "var(--primary)";

    return (
      <div key={node.id} className="relative z-10 w-full max-w-sm">
        <button
          type="button"
          ref={(el) => {
            if (el) nodeRefs.current.set(node.id, el);
            else nodeRefs.current.delete(node.id);
          }}
          onClick={() => toggleNode(node.id)}
          aria-expanded={isOpen}
          aria-label={`Toggle ${node.label} details`}
          className={cn(
            "flex w-full flex-col items-center gap-3 rounded-xl border bg-card p-6 text-left transition-all hover:shadow-lg",
            "border-l-2",
            isOpen
              ? "ring-2 ring-primary/20"
              : "border-border/60",
          )}
          style={{
            borderLeftColor: accent,
          }}
        >
          <div
            className="flex h-12 w-36 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${accent}15`,
            }}
          >
            <Icon
              name={node.icon ?? "layers"}
              className="h-6 w-6"
              style={{ color: accent }}
            />
          </div>
          <div className="flex-1 text-center">
            <div className="font-heading text-sm font-semibold text-foreground">
              {node.label}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {node.sub}
            </div>
          </div>
          {/* Chevron on every node — leaf or branch — so the affordance is
              consistent.  The icon name stays static; rotation alone
              signals expanded/collapsed state (avoids double-toggle bug). */}
          <Icon
            name="chevron-down"
            className="text-muted-foreground/60 transition-transform duration-200"
            style={{
              color: isOpen ? accent : undefined,
              transform: isOpen ? "rotate(180deg)" : undefined,
            }}
            size={14}
            aria-hidden="true"
          />
        </button>

        {isOpen && node.desc && (
          <div
            className={cn(
              "mt-4 w-full rounded-lg border bg-card p-5 text-left",
              "border-t-2",
            )}
            style={{
              borderTopColor: accent,
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: `${accent}15` }}
              >
                <Icon
                  name={node.icon ?? "layers"}
                  className="h-3 w-3"
                  style={{ color: accent }}
                />
              </span>
              <span className="font-heading text-xs font-semibold text-muted-foreground uppercase">
                {node.label}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {node.desc}
            </p>
            {node.pkg && (
              <code className="mt-3 block text-xs text-foreground/60">
                {node.pkg}
              </code>
            )}
          </div>
        )}

        {hasChildren && (
          <div className="mt-6 flex w-full flex-row flex-wrap justify-center gap-12">
            {node.children!.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col items-center gap-10"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ color: "var(--border)" }}
        aria-hidden="true"
      >
        {paths.map((p, i) => (
          <g key={i}>
            <path
              d={p.d}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 4"
              fill="none"
              style={{
                animationDelay: `${p.depth * 80}ms`,
              }}
              className="facet-layer-line"
            />
            {/* Connection dots at both endpoints — the "dots" of "dot line". */}
            <circle
              cx={p.startX}
              cy={p.startY}
              r={DOT_RADIUS}
              fill="currentColor"
              style={{ animationDelay: `${p.depth * 80}ms` }}
              className="facet-layer-dot"
            />
            <circle
              cx={p.endX}
              cy={p.endY}
              r={DOT_RADIUS}
              fill="currentColor"
              style={{
                animationDelay: `${p.depth * 80 + 40}ms`,
              }}
              className="facet-layer-dot"
            />
          </g>
        ))}
      </svg>

      <div className="flex w-full flex-row flex-wrap justify-center gap-12">
        {(nodes ?? []).map((node) => renderNode(node))}
      </div>

      <style>{`
        .facet-layer-line {
          opacity: 0;
          animation: facet-layer-draw 0.5s ease-out forwards;
          animation-fill-mode: both;
        }

        .facet-layer-dot {
          opacity: 0;
          animation: facet-layer-dot-appear 0.35s ease-out forwards;
          animation-fill-mode: both;
        }

        @keyframes facet-layer-draw {
          0% {
            opacity: 0;
            stroke-dashoffset: 20;
          }
          100% {
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }

        @keyframes facet-layer-dot-appear {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          60% {
            transform: scale(1.15);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

LayerGraph.displayName = "LayerGraph";
