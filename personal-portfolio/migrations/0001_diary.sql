-- All timestamps are Unix milliseconds. Invitation IDs change on re-invite,
-- so an older session or outstanding code can never regain access.
CREATE TABLE diary_invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  revoked_at INTEGER
);
CREATE TABLE diary_challenges (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'reader')),
  invitation_id TEXT,
  code_hash TEXT NOT NULL,
  browser_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  consumed_by TEXT
);
CREATE INDEX diary_challenges_expiry ON diary_challenges (expires_at);
CREATE TABLE diary_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'reader')),
  invitation_id TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX diary_sessions_expiry ON diary_sessions (expires_at);
CREATE TABLE diary_rate_limits (
  key TEXT PRIMARY KEY,
  window_started INTEGER NOT NULL,
  count INTEGER NOT NULL
);
CREATE INDEX diary_rate_limits_window ON diary_rate_limits (window_started);
CREATE TABLE diary_entries (
  slug TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  markdown TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  public_teaser INTEGER NOT NULL DEFAULT 0 CHECK (public_teaser IN (0, 1)),
  teaser TEXT NOT NULL DEFAULT '',
  published_at INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE INDEX diary_entries_publication ON diary_entries (status, month DESC);
CREATE TABLE diary_attachments (
  id TEXT PRIMARY KEY,
  entry_slug TEXT NOT NULL REFERENCES diary_entries (slug),
  object_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size > 0 AND size <= 10485760),
  created_at INTEGER NOT NULL
);
CREATE INDEX diary_attachments_entry ON diary_attachments (entry_slug);
