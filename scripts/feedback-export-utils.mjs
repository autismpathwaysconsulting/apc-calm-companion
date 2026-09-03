const FORMULA_PREFIX = /^[\t\r ]*[=+\-@]/;

function excelSafe(value) {
  const text = value == null ? "" : String(value);
  return FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

function csvCell(value) {
  const safe = excelSafe(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function extractFeedbackRows(payload) {
  if (!Array.isArray(payload)) throw new Error("Unexpected Cloudflare response.");
  const rows = payload.flatMap((result) => Array.isArray(result?.results) ? result.results : []);
  return rows.filter((row) => row && typeof row === "object");
}

export function feedbackCsv(rows) {
  const columns = [
    ["Reference", "reference"],
    ["Helpful", "helpfulness"],
    ["Improvement category", "category"],
    ["Optional comment", "comment"],
    ["App version", "app_version"],
    ["Submitted at", "created_at"],
    ["Review state", "review_state"],
    ["Reviewed at", "reviewed_at"],
  ];
  const lines = [columns.map(([heading]) => csvCell(heading)).join(",")];
  for (const row of rows) lines.push(columns.map(([, key]) => csvCell(row[key])).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
