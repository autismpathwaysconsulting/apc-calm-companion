import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { basename } from "node:path";
import { inspect } from "node:util";
import { fileURLToPath } from "node:url";

const [, , beforePath, afterPath, ...referenceArgs] = process.argv;
const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");

function usage(message) {
  if (message) {
    console.error(message);
  }
  console.error("Usage: node scripts/verify-beta-gate.mjs <before-export.csv> <after-export.csv> <P1-ref> <P2-ref> <P3-ref> <P4-ref> <P5-ref>");
  console.error("Paths can be absolute, relative to the app folder, or file names located in Feedback_Exports/.");
  process.exit(2);
}

if (!beforePath || !afterPath || referenceArgs.length !== 5) {
  usage("Expected before path, after path, and five participant references.");
}

const uniqueRefs = new Set(referenceArgs);
if (uniqueRefs.size !== 5) {
  usage("All five participant references must be unique.");
}

async function resolveCsvPath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return null;
  const candidates = [];
  const base = rawPath.trim();
  candidates.push(base);
  candidates.push(resolve(projectRoot, base));
  candidates.push(resolve(projectRoot, "..", base));
  candidates.push(resolve(projectRoot, "..", "Feedback_Exports", basename(base)));
  candidates.push(resolve(projectRoot, "..", "outputs", basename(base)));
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Keep looking.
    }
  }
  return null;
}

function parseCsvRows(raw) {
  const text = String(raw).replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let token = "";
  let inQuotes = false;
  for (let lineIndex = 0; lineIndex < text.length; lineIndex += 1) {
    const ch = text[lineIndex];
    const next = text[lineIndex + 1];
    if (inQuotes) {
      if (ch === "\"") {
        if (next === "\"") {
          token += "\"";
          lineIndex += 1;
        } else {
          inQuotes = false;
        }
      } else {
        token += ch;
      }
      continue;
    }

    if (ch === "\"") {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(token);
      token = "";
      continue;
    }

    if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && next === "\n") {
        lineIndex += 1;
      }
      if (token.length > 0 || row.length > 0) {
        row.push(token);
        rows.push(row);
      }
      row = [];
      token = "";
      continue;
    }

    token += ch;
  }
  if (token.length > 0 || row.length > 0) rows.push(row);
  return rows;
}

async function collectRows(path) {
  const raw = await readFile(path, "utf8");
  const rows = parseCsvRows(raw);
  const [header, ...rest] = rows;
  if (!header || header.length < 7 || header[0] !== "Reference") {
    throw new Error(`Invalid export format in ${basename(path)}.`);
  }
  return { rawRows: rest, rowCount: rest.length };
}

function indexReferences(rawRows) {
  const index = new Map();
  for (const row of rawRows) {
    const ref = row[0];
    if (!ref) continue;
    index.set(ref, (index.get(ref) || 0) + 1);
  }
  return index;
}

let before;
let after;
try {
  const resolvedBefore = await resolveCsvPath(beforePath);
  const resolvedAfter = await resolveCsvPath(afterPath);
  if (!resolvedBefore || !resolvedAfter) {
    console.error(`Could not find both CSV exports.`);
    process.exit(1);
  }
  [before, after] = await Promise.all([collectRows(resolvedBefore), collectRows(resolvedAfter)]);
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

const beforeRefs = indexReferences(before.rawRows);
const afterRefs = indexReferences(after.rawRows);
const afterRowsByRef = new Map();
for (const row of after.rawRows) {
  const ref = row[0];
  if (!ref) continue;
  const existing = afterRowsByRef.get(ref);
  if (!existing) afterRowsByRef.set(ref, []);
  afterRowsByRef.get(ref).push(row);
}
const expected = [...referenceArgs];

const failures = [];
const observedIncrease = after.rowCount - before.rowCount;
if (observedIncrease !== 5) {
  failures.push(`Expected row count increase of 5, observed ${observedIncrease}.`);
}

for (const ref of expected) {
  if (beforeRefs.has(ref)) {
    failures.push(`Reference ${ref} was already present before P1 run.`);
  }
  const count = afterRefs.get(ref) || 0;
  if (count !== 1) {
    failures.push(`Reference ${ref} expected exactly once in after export, observed ${count}.`);
    continue;
  }
  const rows = afterRowsByRef.get(ref) || [];
  const version = rows[0]?.[4];
  if (version && version !== "1.0.0-beta.1") {
    failures.push(`Reference ${ref} has unexpected app version ${version}.`);
  }
}

if (new Set(expected).size !== expected.length) {
  failures.push("Participant references are not unique.");
}

if (failures.length) {
  console.error("Beta gate verification failed:");
  for (const item of failures) {
    console.error(`- ${item}`);
  }
  console.error(`Before rows: ${before.rowCount}, after rows: ${after.rowCount}, increase: ${observedIncrease}`);
  process.exit(1);
}

console.log("Beta gate reference verification passed.");
console.log(`Before rows: ${before.rowCount}, after rows: ${after.rowCount}, increase: ${observedIncrease}`);
console.log(`Verified references: ${inspect(expected)}`);
console.log(`CSV sources: ${beforePath} -> ${afterPath}`);
process.exit(0);
