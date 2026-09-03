import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { extractFeedbackRows, feedbackCsv, FEEDBACK_EXPORT_QUERY } from "../scripts/feedback-export-utils.mjs";

test("feedback export extracts D1 rows and creates an Excel-readable table", () => {
  const rows = extractFeedbackRows([{ results: [{ reference: "APC-123", helpfulness: "yes", category: "wording", comment: "Clear, thank you", app_version: "1.0.0-beta.1", created_at: "2026-09-03T05:00:00.000Z", review_status: "new" }] }]);
  const csv = feedbackCsv(rows);
  assert.equal(rows.length, 1);
  assert.ok(csv.startsWith("\uFEFF\"Reference\""));
  assert.ok(csv.includes('"APC-123","yes","wording","Clear, thank you"'));
});

test("feedback export query runs against the production database schema", () => {
  const database = new DatabaseSync(":memory:");
  const migration = readFileSync(new URL("../migrations/0001_feedback.sql", import.meta.url), "utf8");
  database.exec(migration);
  database.prepare(`INSERT INTO feedback
    (id, helpfulness, category, comment, app_version, created_at, review_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run("APC-123", "yes", "wording", "Clear, thank you", "1.0.0-beta.1", "2026-09-03T05:00:00.000Z", "new");

  const rows = database.prepare(FEEDBACK_EXPORT_QUERY).all();
  assert.deepEqual(rows.map((row) => ({ ...row })), [{
    reference: "APC-123",
    helpfulness: "yes",
    category: "wording",
    comment: "Clear, thank you",
    app_version: "1.0.0-beta.1",
    created_at: "2026-09-03T05:00:00.000Z",
    review_status: "new",
  }]);
  database.close();
});

test("feedback export prevents spreadsheet formulas from running", () => {
  const csv = feedbackCsv([{ reference: "APC-456", comment: '=HYPERLINK("https://example.invalid")' }]);
  assert.ok(csv.includes('"\'=HYPERLINK(""https://example.invalid"")"'));
});

test("feedback export rejects an unexpected Cloudflare response", () => {
  assert.throws(() => extractFeedbackRows({ results: [] }), /Unexpected Cloudflare response/);
});
