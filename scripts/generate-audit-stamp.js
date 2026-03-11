// scripts/generate-audit-stamp.js
// Runs automatically before every build via the "prebuild" script.
// Executes `npm audit --json`, parses the result, and writes a small
// generated module into src/generated/auditStamp.js that the app
// can import at runtime.

import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "../src/generated");
const outputFile = join(outputDir, "auditStamp.js");

// Build date in YYYY-MM-DD format (UTC)
const date = new Date().toISOString().slice(0, 10);

let vulnerabilities = 0;
let severities = { low: 0, moderate: 0, high: 0, critical: 0 };

try {
  // npm audit exits non-zero when vulnerabilities exist — catch that so
  // it never breaks the build, just capture the output.
  const raw = execSync("npm audit --json", { encoding: "utf8" });
  const parsed = JSON.parse(raw);
  vulnerabilities = parsed?.metadata?.vulnerabilities?.total ?? 0;
  severities = {
    low:      parsed?.metadata?.vulnerabilities?.low      ?? 0,
    moderate: parsed?.metadata?.vulnerabilities?.moderate ?? 0,
    high:     parsed?.metadata?.vulnerabilities?.high     ?? 0,
    critical: parsed?.metadata?.vulnerabilities?.critical ?? 0,
  };
} catch (err) {
  // npm audit returns exit code 1 when vulnerabilities exist.
  // The JSON output is still in err.stdout.
  try {
    const parsed = JSON.parse(err.stdout ?? "{}");
    vulnerabilities = parsed?.metadata?.vulnerabilities?.total ?? 0;
    severities = {
      low:      parsed?.metadata?.vulnerabilities?.low      ?? 0,
      moderate: parsed?.metadata?.vulnerabilities?.moderate ?? 0,
      high:     parsed?.metadata?.vulnerabilities?.high     ?? 0,
      critical: parsed?.metadata?.vulnerabilities?.critical ?? 0,
    };
  } catch {
    // If parsing fails entirely, record unknown state rather than crashing.
    vulnerabilities = -1;
  }
}

mkdirSync(outputDir, { recursive: true });

writeFileSync(
  outputFile,
  `// AUTO-GENERATED — do not edit. Rebuilt on every deploy via scripts/generate-audit-stamp.js.
export const auditStamp = {
  date: "${date}",
  vulnerabilities: ${vulnerabilities},
  severities: ${JSON.stringify(severities)},
};
`
);

console.log(`[audit-stamp] ${date} — ${vulnerabilities} vulnerabilities found. Written to src/generated/auditStamp.js`);
