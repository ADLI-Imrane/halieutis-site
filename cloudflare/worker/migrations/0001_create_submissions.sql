-- Contact form submissions (src/components/ContactForm.tsx).
-- Columns follow the fields the form sends (name, email, subject, message)
-- and the ones the dashboard reads (id, created_at).
CREATE TABLE submissions (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  email      TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  subject    TEXT CHECK (subject IS NULL OR length(subject) <= 200),
  message    TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 5000),
  -- ISO 8601 UTC, e.g. 2026-09-29T16:40:20.576Z
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- HMAC of the sender's IP, used only for rate limiting. Never the raw IP.
  ip_hash    TEXT
);

CREATE INDEX idx_submissions_created_at ON submissions (created_at DESC);
CREATE INDEX idx_submissions_ip_hash_created_at ON submissions (ip_hash, created_at);
