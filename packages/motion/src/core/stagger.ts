/**
 * `stagger()` - orchestration modifier for staggered child animations.
 *
 * The sheet's 10-level stagger-delay-* ladder collapses into a single
 * `stagger(baseDelay, { count, from })` call. It is applied *on top*
 * of any family; it never gets its own registry entries.
 *
 * Returns an array of per-item delay values (ms) for `count` items.
 */

export type StaggerOrigin = "start" | "center" | "end";

export interface StaggerOptions {
  /** Number of items to compute delays for. */
  count: number;
  /** Where the stagger originates. */
  from?: StaggerOrigin;
  /** Extra delay before the stagger begins (ms). */
  startDelay?: number;
}

/**
 * Compute staggered delays for `count` items.
 *
 * @example
 * stagger(50, { count: 3 });            // [0, 50, 100]
 * stagger(50, { count: 3, from: "center" });  // [50, 0, 50]
 */
export function stagger(
  baseDelay: number,
  options?: StaggerOptions,
): number[] {
  const count = Math.max(1, options?.count ?? 1);
  const from = options?.from ?? "start";
  const startDelay = options?.startDelay ?? 0;

  if (count === 1) return [startDelay];

  switch (from) {
    case "start":
      // first item at 0, last at total
      return Array.from(
        { length: count },
        (_, i) => startDelay + i * baseDelay,
      );
    case "center":
      // radiates outward from the center index
      const centerIndex = Math.floor(count / 2);
      return Array.from(
        { length: count },
        (_, i) => startDelay + Math.abs(i - centerIndex) * baseDelay,
      );
    case "end":
      // last item at 0, first at total
      return Array.from(
        { length: count },
        (_, i) => startDelay + (count - 1 - i) * baseDelay,
      );
    default:
      return Array.from(
        { length: count },
        (_, i) => startDelay + i * baseDelay,
      );
  }
}
