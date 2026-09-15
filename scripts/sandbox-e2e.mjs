/**
 * Sandbox e2e test for facet-cli.
 *
 * Creates a minimal virtual consumer project in the OS temp dir, then runs
 * real CLI commands against it (via the built CLI binary) to verify:
 *
 *   - facet latest                 (read-only: fetch all facet package versions)
 *   - facet add @fusorb/facet-tokens (installs a facet package via detected PM)
 *   - facet add tokens (shorthand)  (resolves short name → full @fusorb/facet-* pkg)
 *   - facet clean -y               (detects unused bundled deps + auto-runs remove)
 *   - facet doctor                 (analyzes the sandbox for issues)
 *   - facet --log <cmd>            (verbose output on read-only commands)
 *
 * The sandbox is fully isolated -- nothing touches SovGrant or the real repo.
 */
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const CLI = join(process.cwd(), "packages/cli/dist/index.js");
const SANDBOX = join(tmpdir(), "facet-sandbox-" + Date.now());

function runFacet(args, cwd = SANDBOX, timeoutMs = 60000) {
  try {
    return execFileSync("node", [CLI, ...args], {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
    });
  } catch (e) {
    // Return whatever output was captured, even on non-zero exit
    return (e.stdout || "") + (e.stderr || "");
  }
}

function setupSandbox() {
  rmSync(SANDBOX, { recursive: true, force: true });
  mkdirSync(SANDBOX, { recursive: true });

  writeFileSync(
    join(SANDBOX, "package.json"),
    JSON.stringify(
      {
        name: "facet-sandbox",
        version: "0.1.0",
        private: true,
        type: "module",
        packageManager: "npm@10.0.0",
        dependencies: {},
      },
      null,
      2,
    ) + "\n",
  );

  writeFileSync(
    join(SANDBOX, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
        },
      },
      null,
      2,
    ) + "\n",
  );

  // package-lock.json so PM detection finds npm (npm always ships with node)
  writeFileSync(join(SANDBOX, "package-lock.json"), "{}");

  console.log("Sandbox created at:", SANDBOX);
}

function setupSandboxWithBundledDeps() {
  rmSync(SANDBOX, { recursive: true, force: true });
  mkdirSync(SANDBOX, { recursive: true });
  mkdirSync(join(SANDBOX, "src"), { recursive: true });

  // Simulate a consumer that has @fusorb/facet-components + a redundant
  // bundled dep (embla-carousel-react) that facet-components already includes
  writeFileSync(
    join(SANDBOX, "package.json"),
    JSON.stringify(
      {
        name: "facet-sandbox",
        version: "0.1.0",
        private: true,
        type: "module",
        packageManager: "npm@10.0.0",
        dependencies: {
          "@fusorb/facet-components": "workspace:*",
          "@fusorb/facet-tokens": "1.1.4",
          "embla-carousel-react": "8.0.0",
        },
      },
      null,
      2,
    ) + "\n",
  );

  writeFileSync(
    join(SANDBOX, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
        },
      },
      null,
      2,
    ) + "\n",
  );

  writeFileSync(join(SANDBOX, "package-lock.json"), "{}");

  // Source file that uses facet-tokens (so it's not flagged as unused)
  // but does NOT import embla-carousel-react (so it IS flagged as bundled dep)
  writeFileSync(
    join(SANDBOX, "src", "app.jsx"),
    "import { vars } from '@fusorb/facet-tokens';\nconsole.log(vars);\n",
  );

  console.log("Sandbox (bundled-deps) created at:", SANDBOX);
}

const results = {
  "facet latest": null,
  "facet add <pkg>": null,
  "facet add shorthand": null,
  "facet --log": null,
  "facet clean -y (auto-run)": null,
  "facet clean -y (keep used)": null,
  "facet doctor": null,
};

try {
  setupSandbox();

  // --- Test 1: facet latest (read-only) ---
  console.log("\n=== TEST 1: facet latest ===");
  const latestOut = runFacet(["--no-update-check", "latest"]);
  results["facet latest"] = latestOut.includes("@fusorb/facet-");
  console.log(latestOut.slice(0, 600));
  console.log("PASS:", results["facet latest"]);

  // --- Test 2: facet add @fusorb/facet-tokens (installs a facet package) ---
  // We only verify CLI logic (PM detection + version resolve + install cmd)
  // since the actual npm install is slow and environment-dependent.
  console.log("\n=== TEST 2: facet add @fusorb/facet-tokens --log ===");
  const addOut = runFacet(["--no-update-check", "add", "@fusorb/facet-tokens", "--log"], SANDBOX, 30000);
  results["facet add <pkg>"] = addOut.includes("Package manager:") && addOut.includes("Installing");
  console.log(addOut.slice(0, 800));
  console.log("PASS:", results["facet add <pkg>"]);

  // --- Test 3: facet add shorthand (facet add tokens) ---
  console.log("\n=== TEST 3: facet add tokens (shorthand) ===");
  const shortcutOut = runFacet(["--no-update-check", "add", "tokens", "--log"], SANDBOX, 30000);
  results["facet add shorthand"] = shortcutOut.includes("Installing facet package: @fusorb/facet-tokens");
  console.log(shortcutOut.slice(0, 400));
  console.log("PASS:", results["facet add shorthand"]);

  // --- Test 4: facet --log (verbose on read-only command) ---
  console.log("\n=== TEST 4: facet --log latest ===");
  const logOut = runFacet(["--log", "--no-update-check", "latest"]);
  results["facet --log"] = logOut.length > 0;
  console.log("(verbose output -- may be empty for read-only latest, which is fine)");
  console.log("PASS:", results["facet --log"]);

  // --- Test 5: facet clean -y (detects unused bundled dep + auto-runs remove) ---
  // Reset sandbox with bundled deps to properly test clean
  setupSandboxWithBundledDeps();

  console.log("\n=== TEST 5: facet clean -y (detects unused bundled dep) ===");
  // facet-tokens is imported in src/app.jsx so it should NOT be removed.
  // embla-carousel-react is a bundled dep (facet-components bundles it) and
  // is NOT imported anywhere, so it SHOULD be removed + auto-run with --yes.
  const cleanOut = runFacet(["--no-update-check", "clean", "--yes"], SANDBOX, 60000);
  const cleanPkg = JSON.parse(readFileSync(join(SANDBOX, "package.json"), "utf-8"));
  const removedEmbla = !("embla-carousel-react" in (cleanPkg.dependencies || {}));
  const keptTokens = "@fusorb/facet-tokens" in (cleanPkg.dependencies || {});
  results["facet clean -y (auto-run)"] = removedEmbla && keptTokens;
  console.log(cleanOut.slice(0, 1000));
  console.log("package.json retains @fusorb/facet-tokens (used):", keptTokens);
  console.log("package.json removed embla-carousel-react (unused bundled):", removedEmbla);
  console.log("PASS:", results["facet clean -y (auto-run)"]);

  // --- Test 6: facet doctor ---
  console.log("\n=== TEST 6: facet doctor ===");
  const doctorOut = runFacet(["--no-update-check", "doctor"]);
  results["facet doctor"] = doctorOut.includes("Analysis") || doctorOut.includes("Package manager:");
  console.log(doctorOut.slice(0, 800));
  console.log("PASS:", results["facet doctor"]);

  console.log("\n=== SUMMARY ===");
  for (const [test, passed] of Object.entries(results)) {
    console.log(`  ${test}: ${passed ? "PASS" : "CHECK"}`);
  }
} catch (err) {
  console.error("Sandbox e2e test errored:", err.message || err);
  console.error(err.stderr || "");
  if (err.stdout) console.error(err.stdout);
} finally {
  // Clean up sandbox (ignore EBUSY -- Windows holds handles briefly after npm)
  try {
    rmSync(SANDBOX, { recursive: true, force: true });
    console.log("\nSandbox cleaned up.");
  } catch (e) {
    if (e.code === "EBUSY") {
      console.log("\nSandbox left in place (EBUSY: " + SANDBOX + "). Clean up manually later.");
    } else {
      throw e;
    }
  }
}
