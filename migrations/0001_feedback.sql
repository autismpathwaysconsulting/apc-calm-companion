CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version = 1),
  helpfulness TEXT NOT NULL CHECK (helpfulness IN ('yes', 'a-little', 'not-yet')),
  category TEXT CHECK (category IS NULL OR category IN ('wording', 'too-many-choices', 'could-not-find-tool', 'tool-did-not-work', 'accessibility', 'something-else')),
  comment TEXT CHECK (comment IS NULL OR length(comment) <= 300),
  app_version TEXT NOT NULL CHECK (length(app_version) BETWEEN 1 AND 40),
  created_at TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'new' CHECK (review_status IN ('new', 'reviewed', 'removed'))
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback (created_at);
