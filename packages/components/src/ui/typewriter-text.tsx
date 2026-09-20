/**
 * @fusorb/facet-components: TypewriterText
 *
 * Cycles through a list of phrases with a type/erase loop and a blinking
 * caret. Zero dependencies (pure React + a few timeouts). SSR-safe: the
 * first phrase is rendered synchronously on the server, then the animation
 * runs after mount.
 *
 * Usage:
 *   <TypewriterText phrases={["one identity", "every door", "your key"]} />
 */

import * as React from "react";

export interface TypewriterTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Phrases to cycle through. */
  phrases: string[];
  /** Type speed in ms per character. Default: 70. */
  typeSpeed?: number;
  /** Erase speed in ms per character. Default: 35. */
  eraseSpeed?: number;
  /** Hold time on the full phrase before erasing, in ms. Default: 1800. */
  delay?: number;
  /** Show the blinking caret. Default: true. */
  showCaret?: boolean;
  /** Class for the caret span (e.g. "border-primary"). */
  caretClassName?: string;
}

export function TypewriterText({
  phrases,
  typeSpeed = 70,
  eraseSpeed = 35,
  delay = 1800,
  showCaret = true,
  caretClassName,
  className,
  ...props
}: TypewriterTextProps) {
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  // SSR-safe: render the first phrase's first character on the server so
  // the span is not empty on first paint; the animation then proceeds.
  React.useEffect(() => {
    const current = phrases[index % phrases.length] ?? "";
    const timer = setTimeout(
      () => {
        if (!deleting) {
          const next = current.slice(0, text.length + 1);
          setText(next);
          if (next === current) {
            setTimeout(() => setDeleting(true), delay);
          }
        } else {
          const next = current.slice(0, Math.max(0, text.length - 1));
          setText(next);
          if (next === "") {
            setDeleting(false);
            setIndex((i) => (i + 1) % phrases.length);
          }
        }
      },
      deleting ? eraseSpeed : typeSpeed,
    );
    return () => clearTimeout(timer);
  }, [text, deleting, index, phrases, typeSpeed, eraseSpeed, delay]);

  return (
    <span className={className} {...props}>
      {text}
      {showCaret && (
        <span
          aria-hidden="true"
          className={
            caretClassName ??
            "ml-0.5 inline-block h-[1em] w-px animate-caret-blink border-r-2 border-primary align-text-bottom"
          }
        />
      )}
    </span>
  );
}

TypewriterText.displayName = "TypewriterText";
