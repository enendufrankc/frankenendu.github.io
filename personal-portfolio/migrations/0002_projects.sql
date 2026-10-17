-- Permanent project records stay in D1, never in generated public assets.
CREATE TABLE diary_projects (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT '',
  contributors TEXT NOT NULL DEFAULT '[]',
  aliases TEXT NOT NULL DEFAULT '[]',
  evidence_date TEXT NOT NULL,
  overview_markdown TEXT NOT NULL DEFAULT '',
  guide_markdown TEXT NOT NULL DEFAULT '',
  source_notes TEXT NOT NULL DEFAULT '',
  related_slugs TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  guide_visibility TEXT NOT NULL DEFAULT 'owner' CHECK (guide_visibility IN ('owner', 'readers')),
  published_at INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE INDEX diary_projects_publication ON diary_projects (status, title);
CREATE TABLE diary_project_entries (
  project_slug TEXT NOT NULL REFERENCES diary_projects (slug) ON DELETE CASCADE,
  entry_slug TEXT NOT NULL REFERENCES diary_entries (slug) ON DELETE CASCADE,
  PRIMARY KEY (project_slug, entry_slug)
);
CREATE INDEX diary_project_entries_month ON diary_project_entries (entry_slug, project_slug);
