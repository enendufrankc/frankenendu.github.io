import type { Context, Database, EntryRow, ProjectRow, User } from './types';
import { HttpError, invalid, json, notFound, readJson, textField } from './http';
import { entrySummary, renderMarkdown, validMonth } from './content';
import { canReadGuide, projectSummary, validProjectSlug } from './project-summary';

function editableProject(row: ProjectRow, months: string[], user: User) {
  return {
    ...projectSummary(row, user), overviewMarkdown: row.overview_markdown, guideMarkdown: row.guide_markdown,
    sourceNotes: row.source_notes, relatedSlugs: JSON.parse(row.related_slugs) as string[], months,
  };
}
export async function listProjects({ db }: Context, user: User, admin = false): Promise<Response> {
  const { results } = await db.prepare(`SELECT * FROM diary_projects ${user.role === 'owner' ? '' : "WHERE status = 'published'"} ORDER BY title COLLATE NOCASE, slug`).all<ProjectRow>();
  if (!admin) return json({ projects: results.map(row => projectSummary(row, user)) });
  const links = await db.prepare('SELECT project_slug, entry_slug FROM diary_project_entries ORDER BY entry_slug DESC').all<{ project_slug: string; entry_slug: string }>();
  const months = new Map<string, string[]>();
  for (const link of links.results) months.set(link.project_slug, [...(months.get(link.project_slug) ?? []), link.entry_slug]);
  return json({ projects: results.map(row => editableProject(row, months.get(row.slug) ?? [], user)) });
}
export async function projectDetail({ db }: Context, user: User, slug: string): Promise<Response> {
  const row = await db.prepare('SELECT * FROM diary_projects WHERE slug = ?').bind(slug).first<ProjectRow>();
  if (!row || (user.role !== 'owner' && row.status !== 'published')) throw notFound();
  const relatedSlugs = JSON.parse(row.related_slugs) as string[];
  const [related, entries, overviewHtml, guideHtml] = await Promise.all([
    db.prepare(`SELECT * FROM diary_projects WHERE slug IN (SELECT value FROM json_each(?)) ${user.role === 'owner' ? '' : "AND status = 'published'"}`).bind(row.related_slugs).all<ProjectRow>(),
    db.prepare(`SELECT e.* FROM diary_entries e JOIN diary_project_entries l ON e.slug = l.entry_slug
      WHERE l.project_slug = ? ${user.role === 'owner' ? '' : "AND e.status = 'published'"} ORDER BY e.month DESC`).bind(slug).all<EntryRow>(),
    renderMarkdown(row.overview_markdown),
    canReadGuide(row, user) ? renderMarkdown(row.guide_markdown) : Promise.resolve(undefined),
  ]);
  const relatedBySlug = new Map(related.results.map(project => [project.slug, project]));
  return json({ project: {
    ...projectSummary(row, user), overviewHtml,
    ...(canReadGuide(row, user) ? { guideHtml } : {}),
    guideAvailable: canReadGuide(row, user) && Boolean(row.guide_markdown.trim()),
    relatedProjects: relatedSlugs.flatMap(relatedSlug => {
      const project = relatedBySlug.get(relatedSlug);
      return project ? [projectSummary(project, user)] : [];
    }),
    entries: entries.results.map(entrySummary),
    ...(user.role === 'owner' ? { sourceNotes: row.source_notes } : {}),
  } });
}
function stringList(value: unknown, count: number, length: number): string[] {
  if (!Array.isArray(value) || value.length > count) throw invalid('Check the list length and values.');
  return value.map(item => textField(item, length, true).trim());
}
function uniqueList(value: unknown, count: number, length: number, valid: (item: string) => boolean): string[] {
  const items = stringList(value, count, length);
  if (new Set(items).size !== items.length || items.some(item => !valid(item))) throw invalid('Use unique, valid relation identifiers.');
  return items;
}
function evidenceDate(value: unknown): string {
  const date = textField(value, 10, true);
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== date) throw invalid('Use a real evidence date in YYYY-MM-DD format.');
  return date;
}
function validateProject(data: Record<string, unknown>, current: ProjectRow | null, months: string[], user: User) {
  const merged = { ...(current ? editableProject(current, months, user) : {}), ...data };
  const slug = textField(merged.slug, 80, true);
  if (!validProjectSlug(slug) || (current && slug !== current.slug)) throw invalid('Use an immutable lowercase slug with letters, numbers, and single hyphens.');
  const status = merged.status ?? 'draft', guideVisibility = merged.guideVisibility ?? 'owner';
  if (status !== 'draft' && status !== 'published') throw invalid('Choose draft or published.');
  if (guideVisibility !== 'owner' && guideVisibility !== 'readers') throw invalid('Choose owner or readers for guide visibility.');
  const relatedSlugs = uniqueList(merged.relatedSlugs ?? [], 80, 80, validProjectSlug);
  if (relatedSlugs.includes(slug)) throw invalid('A project cannot relate to itself.');
  return {
    slug, title: textField(merged.title, 160, true).trim(), summary: textField(merged.summary ?? '', 600),
    area: textField(merged.area ?? '', 80), stage: textField(merged.stage ?? '', 120),
    contributors: stringList(merged.contributors ?? [], 15, 120), aliases: stringList(merged.aliases ?? [], 20, 120),
    evidenceDate: evidenceDate(merged.evidenceDate), overviewMarkdown: textField(merged.overviewMarkdown ?? '', 120000),
    guideMarkdown: textField(merged.guideMarkdown ?? '', 120000), sourceNotes: textField(merged.sourceNotes ?? '', 16000),
    relatedSlugs, months: uniqueList(merged.months ?? [], 120, 7, validMonth), status, guideVisibility,
  };
}
async function validateRelations(db: Database, projects: string[], months: string[]): Promise<void> {
  const [projectRows, monthRows] = await Promise.all([
    db.prepare('SELECT slug FROM diary_projects WHERE slug IN (SELECT value FROM json_each(?))').bind(JSON.stringify(projects)).all(),
    db.prepare('SELECT slug FROM diary_entries WHERE slug IN (SELECT value FROM json_each(?))').bind(JSON.stringify(months)).all(),
  ]);
  if (projectRows.results.length !== projects.length || monthRows.results.length !== months.length) throw invalid('Create related projects and monthly entries before linking them.');
}
export async function saveProject(request: Request, { db }: Context, user: User, slug?: string): Promise<Response> {
  const data = await readJson(request);
  const current = slug ? await db.prepare('SELECT * FROM diary_projects WHERE slug = ?').bind(slug).first<ProjectRow>() : null;
  if (slug && !current) throw notFound();
  const currentLinks = current ? await db.prepare('SELECT entry_slug FROM diary_project_entries WHERE project_slug = ? ORDER BY entry_slug DESC').bind(current.slug).all<{ entry_slug: string }>() : null;
  const row = validateProject(data, current, currentLinks?.results.map(link => link.entry_slug) ?? [], user);
  await validateRelations(db, row.relatedSlugs, row.months);
  const now = Date.now(), publishedAt = row.status === 'published' ? current?.published_at ?? now : current?.published_at ?? null;
  const values = [row.title, row.summary, row.area, row.stage, JSON.stringify(row.contributors), JSON.stringify(row.aliases), row.evidenceDate,
    row.overviewMarkdown, row.guideMarkdown, row.sourceNotes, JSON.stringify(row.relatedSlugs), row.status, row.guideVisibility, publishedAt, now, row.slug];
  const save = current
    ? db.prepare(`UPDATE diary_projects SET title = ?, summary = ?, area = ?, stage = ?, contributors = ?, aliases = ?, evidence_date = ?,
      overview_markdown = ?, guide_markdown = ?, source_notes = ?, related_slugs = ?, status = ?, guide_visibility = ?, published_at = ?, updated_at = ?
      WHERE slug = ? RETURNING *`).bind(...values)
    : db.prepare(`INSERT INTO diary_projects (title, summary, area, stage, contributors, aliases, evidence_date, overview_markdown, guide_markdown,
      source_notes, related_slugs, status, guide_visibility, published_at, updated_at, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`).bind(...values);
  let results: D1Result<ProjectRow>[];
  try {
    // All writes commit together. A uniqueness or FK/trigger failure rolls back
    // the project update and previous junction links, including duplicate races.
    results = await db.batch<ProjectRow>([
      save,
      db.prepare('DELETE FROM diary_project_entries WHERE project_slug = ?').bind(row.slug),
      db.prepare('INSERT INTO diary_project_entries (project_slug, entry_slug) SELECT ?1, value FROM json_each(?2)').bind(row.slug, JSON.stringify(row.months)),
    ]);
  } catch (error) {
    if (!current && error instanceof Error && error.message.includes('UNIQUE constraint failed: diary_projects.slug')) throw new HttpError(409, 'PROJECT_EXISTS', 'A project already exists with this slug.');
    throw error;
  }
  const saved = results[0].results[0];
  if (!saved) throw notFound();
  return json({ project: editableProject(saved, [...row.months].sort().reverse(), user) }, current ? 200 : 201);
}
