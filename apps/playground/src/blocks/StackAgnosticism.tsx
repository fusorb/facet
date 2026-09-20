/**
 * Per-framework certification is verified in CI, not in a hosted playground:
 * `facet docs init` / `facet emails init` / `facet motion preview` emit stacks
 * for react-vite, next, remix, plain-js, plain-css, python - each snapshotted
 * by the verify-first workflow. See .github/workflows/ci-cd.yml.
 *
 * The sandbox host itself is framework-agnostic (block registry + adapter
 * seam + iframe-safe serialization); only the live-JSX parser is shipped as a
 * React adapter today. A Vue/Svelte adapter implements the same
 * `SandboxAdapter` contract.
 */
const STACKS = [
  { name: "react-vite", status: "init scaffolded" },
  { name: "next", status: "init scaffolded" },
  { name: "remix", status: "init scaffolded" },
  { name: "plain-js", status: "init scaffolded" },
  { name: "plain-css", status: "init scaffolded" },
  { name: "python", status: "init scaffolded" },
];

export function StackAgnosticism() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-medium">Framework agnosticism</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The sandbox host is framework-agnostic; only the parser is shipped as a
          React adapter today (v1). Certification across frameworks happens via
          CI snapshots, not a multi-framework playground.
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b px-3 py-2">Stack</th>
            <th className="border-b px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {STACKS.map((s) => (
            <tr key={s.name}>
              <td className="px-3 py-1.5 font-mono">{s.name}</td>
              <td className="px-3 py-1.5">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">
        Run <code>facet init</code> in any folder - the wizard auto-detects the
        framework and writes facet config. CI diffs the output per stack.
      </p>
    </div>
  );
}
