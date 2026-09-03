const FORMULA_PREFIX = /^[\t\r ]*[=+\-@]/;

export const FEEDBACK_EXPORT_QUERY = `SELECT id AS reference, helpfulness, category, comment, app_version, created_at, review_status
  FROM feedback
  ORDER BY datetime(created_at) DESC`;

const EXPORT_TARGETS = {
  production: {
    database: "apc-calm-feedback-production",
    filenamePrefix: "APC_Calm_Companion_Feedback",
    label: "production",
  },
  preview: {
    database: "apc-calm-feedback-preview",
    filenamePrefix: "APC_Calm_Companion_Beta_Feedback",
    label: "controlled-beta preview",
  },
};

export function feedbackExportTarget(args = []) {
  if (!Array.isArray(args)) throw new Error("Export arguments must be an array.");
  if (args.length === 0) return EXPORT_TARGETS.production;
  if (args.length === 1 && args[0] === "--preview") return EXPORT_TARGETS.preview;
  throw new Error("Use no option for production or --preview for the controlled beta database.");
}

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
    ["Review status", "review_status"],
  ];
  const lines = [columns.map(([heading]) => csvCell(heading)).join(",")];
  for (const row of rows) lines.push(columns.map(([, key]) => csvCell(row[key])).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
