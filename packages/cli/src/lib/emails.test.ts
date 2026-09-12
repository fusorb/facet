import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  detectMailSetup,
  planEmailsInit,
  mailPackageRole,
  formatDetection,
  emailSuggestionProvider,
} from "./emails.js";
import { buildRepoContext, generalRepoProvider, suggestRepoSteps } from "./suggest.js";
import { generateEmailsScaffold, emailsPackageJsonAdditions } from "./emails-generators.js";

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "facet-emails-cli-"));
}

function writeFile(dir: string, rel: string, content: string) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

describe("detectMailSetup", () => {
  it("detects react-email in the consumer manifest", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { "@react-email/components": "^1.0.0" },
      }));
      const d = detectMailSetup(dir);
      expect(d.hasExisting).toBe(true);
      expect(d.renderer).toBe("react-email");
      expect(d.mailPackages).toContain("@react-email/components");
      expect(d.facetEmailsInstalled).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects resend as a provider (renderer null, hasExisting true)", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { resend: "^6.0.0" },
      }));
      const d = detectMailSetup(dir);
      expect(d.hasExisting).toBe(true);
      expect(d.renderer).toBe("resend");
      expect(d.mailPackages).toContain("resend");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports a fresh repo with no mail packages", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      const d = detectMailSetup(dir);
      expect(d.hasExisting).toBe(false);
      expect(d.renderer).toBeNull();
      expect(d.facetEmailsInstalled).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects facet-emails already installed", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { "@fusorb/facet-emails": "1.0.0" },
      }));
      const d = detectMailSetup(dir);
      expect(d.facetEmailsInstalled).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects the package manager from lockfiles", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      writeFile(dir, "pnpm-lock.yaml", "");
      const d = detectMailSetup(dir);
      expect(d.pm).toBe("pnpm");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("planEmailsInit", () => {
  it("plans a fresh scaffold when nothing exists", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      const detection = detectMailSetup(dir);
      const answers = planEmailsInit(detection, {});
      expect(answers.mode).toBe("fresh");
      expect(answers.provider).toBe("resend");
      expect(answers.location).toBe("emails");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("plans migration when react-email exists", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { "@react-email/components": "^1.0.0" },
      }));
      const detection = detectMailSetup(dir);
      const answers = planEmailsInit(detection, {});
      expect(answers.mode).toBe("migrate");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("honors --fresh override", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { "@react-email/components": "^1.0.0" },
      }));
      const detection = detectMailSetup(dir);
      const answers = planEmailsInit(detection, { fresh: true });
      expect(answers.mode).toBe("fresh");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("defaults provider to resend and detects nodemailer", () => {
    expect(mailPackageRole("resend")).toBe("resend");
    expect(mailPackageRole("@react-email/components")).toBe("react-email");
    expect(mailPackageRole("nodemailer")).toBe("nodemailer");
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { nodemailer: "^6.9.0" },
      }));
      const detection = detectMailSetup(dir);
      const answers = planEmailsInit(detection, {});
      expect(answers.provider).toBe("nodemailer");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("generateEmailsScaffold", () => {
  it("writes layout, registry, preview server, and send module", () => {
    const dir = tmp();
    try {
      const files = generateEmailsScaffold(dir, {
        mode: "fresh",
        provider: "resend",
        location: "emails",
        isReact: true,
        brandName: "Acme",
        facetEmailsRange: "latest",
      });
      const rels = files.map((f) => path.relative(dir, f.path));
      expect(rels).toContain(path.join("emails", "brand.ts"));
      expect(rels).toContain(path.join("emails", "layout.tsx"));
      expect(rels).toContain(path.join("emails", "template-registry.tsx"));
      expect(rels).toContain(path.join("emails", "preview-server.ts"));
      expect(rels).toContain(path.join("emails", "send.ts"));
      expect(rels).toContain(path.join("emails", ".env.example"));
      const send = files.find((f) => f.path.endsWith("send.ts"))!.content;
      expect(send).toContain("resend");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes a nodemailer send module when provider is nodemailer", () => {
    const dir = tmp();
    try {
      const files = generateEmailsScaffold(dir, {
        mode: "fresh",
        provider: "nodemailer",
        location: "emails",
        isReact: true,
        brandName: "Acme",
        facetEmailsRange: "latest",
      });
      const send = files.find((f) => f.path.endsWith("send.ts"))!.content;
      expect(send).toContain("nodemailer");
      expect(send).toContain("SMTP_HOST");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("adds the right deps and script to package.json additions", () => {
    const add = emailsPackageJsonAdditions({
      mode: "fresh",
      provider: "resend",
      location: "emails",
      isReact: true,
      brandName: "Acme",
      facetEmailsRange: "latest",
    });
    expect(add.deps["@fusorb/facet-emails"]).toBe("latest");
    expect(add.deps.resend).toBeDefined();
    expect(add.scripts["mail:preview"]).toContain("emails/preview-server.ts");
  });
});

describe("formatDetection", () => {
  it("produces human-readable lines", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { resend: "^6.0.0" },
      }));
      const lines = formatDetection(detectMailSetup(dir));
      expect(lines.some((l) => l.includes("Package manager"))).toBe(true);
      expect(lines.some((l) => l.includes("resend"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("suggestion providers", () => {
  it("email provider suggests migration guidance when react-email is present", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { "@react-email/components": "^1.0.0" },
      }));
      const d = detectMailSetup(dir);
      const answers = planEmailsInit(d, {});
      const ctx = buildRepoContext(dir);
      const steps = suggestRepoSteps(ctx, [emailSuggestionProvider(d, answers)]);
      expect(steps.some((s) => s.includes("react-email"))).toBe(true);
      expect(steps.some((s) => s.includes("mail:preview"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("email provider suggests framework integration for Next.js", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        dependencies: { next: "^15" },
      }));
      const d = detectMailSetup(dir);
      const answers = planEmailsInit(d, {});
      const ctx = buildRepoContext(dir);
      const steps = suggestRepoSteps(ctx, [emailSuggestionProvider(d, answers)]);
      expect(steps.some((s) => s.includes("Next.js"))).toBe(true);
      expect(steps.some((s) => s.includes("app/api"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("general provider mentions the monorepo when workspace globs exist", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({
        name: "app",
        private: true,
        workspaces: ["packages/*"],
      }));
      writeFile(dir, "pnpm-workspace.yaml", "packages:\n  - \"packages/*\"\n");
      const ctx = buildRepoContext(dir);
      const steps = suggestRepoSteps(ctx, [generalRepoProvider]);
      expect(steps.some((s) => s.includes("Monorepo"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("dedupes overlapping suggestions across providers", () => {
    const dir = tmp();
    try {
      writeFile(dir, "package.json", JSON.stringify({ name: "app" }));
      const ctx = buildRepoContext(dir);
      const dup = (c: { framework: string }) => [`Same step ${c.framework}`];
      const steps = suggestRepoSteps(ctx, [dup as never, dup as never]);
      expect(steps.filter((s) => s === "Same step plain-js").length).toBe(1);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
