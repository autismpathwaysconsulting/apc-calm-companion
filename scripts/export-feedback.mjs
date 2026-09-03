import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractFeedbackRows, feedbackCsv } from "./feedback-export-utils.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = resolve(scriptDirectory, "..");
const outputDirectory = resolve(appDirectory, "..", "Feedback_Exports");
const query = `SELECT reference, helpfulness, category, comment, app_version, created_at, review_state, reviewed_at
  FROM feedback
  ORDER BY datetime(created_at) DESC`;

let raw;
try {
  raw = execFileSync("npx", [
    "--yes",
    "wrangler@4.128.0",
    "d1",
    "execute",
    "apc-calm-feedback-production",
    "--remote",
    "--command",
    query,
    "--json",
  ], { cwd: appDirectory, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
} catch {
  console.error("Could not read the production feedback database. Sign in to Cloudflare, confirm you are using the APC account, and try again.");
  process.exit(1);
}

let rows;
try {
  rows = extractFeedbackRows(JSON.parse(raw));
} catch {
  console.error("Cloudflare returned an unexpected response. No feedback file was created.");
  process.exit(1);
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const outputPath = resolve(outputDirectory, `APC_Calm_Companion_Feedback_${timestamp}.csv`);
await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, feedbackCsv(rows), { encoding: "utf8", mode: 0o600 });

console.log(`Created Excel-readable feedback export with ${rows.length} row${rows.length === 1 ? "" : "s"}:`);
console.log(outputPath);
