import { type HTMLAttributes, type ReactNode, useState } from "react";
import { cn } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";

/** Technical mono tag, scratchpad grammar: uppercase + letter-tracked. */
export function LabTag({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "dim";
  className?: string;
}) {
  const style =
    tone === "accent" ? { color: "var(--domain-accent)" } : undefined;
  return (
    <span
      className={cn(
        "text-[10px] font-mono uppercase tracking-widest text-muted-foreground/55",
        tone === "dim" && "text-muted-foreground/45",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

/** A raised surface panel - the scratchpad `.panel` surface. */
export function LabPanel({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-secondary/30 p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeSeg = {
  text: string;
  role?: "keyword" | "string" | "ident" | "dim";
};

const CODE_COLOR: Record<NonNullable<CodeSeg["role"]>, string> = {
  keyword: "#a78bfa",
  string: "var(--success)",
  ident: "var(--domain-accent)",
  dim: "var(--muted-foreground)",
};

/** A syntax-colored line of code (purple imports, green strings, accent ids). */
export function CodeLine({ segments }: { segments: CodeSeg[] }) {
  return (
    <span className="font-mono text-xs text-muted-foreground">
      {segments.map((s, i) => (
        <span
          key={i}
          style={s.role ? { color: CODE_COLOR[s.role] } : undefined}
        >
          {s.text}
        </span>
      ))}
    </span>
  );
}

/** Inline copy-to-clipboard button with a "Copied" confirmation. */
export function CopyButton({
  value,
  label = "Copy",
  size = "sm",
}: {
  value: string;
  label?: string;
  size?: "sm" | "xs";
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono transition-colors",
        "text-muted-foreground/60 hover:text-foreground",
        copied && "text-green-400",
        size === "xs" ? "text-[10px]" : "text-xs",
      )}
    >
      {copied ? (
        <LightIcon name="check" size={size === "xs" ? 10 : 12} />
      ) : (
        <LightIcon name="copy" size={size === "xs" ? 10 : 12} />
      )}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
