import { micromark } from 'micromark';
import type { AttachmentRow, Context, EntryRow, ProjectRow, User } from './types';
import { HttpError, invalid, iso, json, notFound, readJson, textField } from './http';
import { projectSummary } from './project-summary';

export const validMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
export const attachmentMetadata = (row: AttachmentRow) => ({ id: row.id, name: row.name, type: row.type, size: row.size, url: `/api/diary/attachments/${row.id}` });
export const entrySummary = (row: EntryRow) => ({
  slug: row.slug, month: row.month, title: row.title, summary: row.summary,
  tags: JSON.parse(row.tags) as string[], publishedAt: row.published_at === null ? null : iso(row.published_at),
  updatedAt: iso(row.updated_at), readingMinutes: Math.max(1, Math.ceil(row.markdown.trim().split(/\s+/).length / 220)),
});
const authorEntry = (row: EntryRow) => ({ ...entrySummary(row), markdown: row.markdown, status: row.status, publicTeaser: Boolean(row.public_teaser), teaser: row.teaser });
export async function renderMarkdown(markdown: string): Promise<string> {
  const html = micromark(markdown, { allowDangerousHtml: false, allowDangerousProtocol: false });
  // Only authenticated attachment URLs can become image requests. Exact
  // relative paths exclude external trackers, data URLs, queries and fragments.
  return new HTMLRewriter()
    .on('img', { element(element) {
      const src = element.getAttribute('src') ?? '';
      if (!/^\/api\/diary\/attachments\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(src)) { element.remove(); return; }
      element.setAttribute('loading', 'lazy');
      element.setAttribute('decoding', 'async');
      element.setAttribute('referrerpolicy', 'no-referrer');
    } })
    .on('a', { element(element) { element.setAttribute('rel', 'noreferrer noopener'); } })
    .transform(new Response(html, { headers: { 'Content-Type': 'text/html' } })).text();
}
export async function publicEntries({ db }: Context): Promise<Response> {
  const { results } = await db.prepare("SELECT slug, month, title, teaser FROM diary_entries WHERE status = 'published' AND public_teaser = 1 ORDER BY month DESC").all();
  return json({ entries: results });
}
export async function listEntries({ db }: Context, user: User, admin = false): Promise<Response> {
  const { results } = await db.prepare(user.role === 'owner'
    ? 'SELECT * FROM diary_entries ORDER BY month DESC'
    : "SELECT * FROM diary_entries WHERE status = 'published' ORDER BY month DESC").all<EntryRow>();
  return json({ entries: results.map(admin ? authorEntry : entrySummary) });
}
export async function entryDetail({ db }: Context, user: User, slug: string): Promise<Response> {
  const row = await db.prepare('SELECT * FROM diary_entries WHERE slug = ?').bind(slug).first<EntryRow>();
  if (!row || (user.role !== 'owner' && row.status !== 'published')) throw notFound();
  const [{ results }, html, projects] = await Promise.all([
    db.prepare('SELECT * FROM diary_attachments WHERE entry_slug = ? ORDER BY created_at').bind(slug).all<AttachmentRow>(),
    renderMarkdown(row.markdown),
    db.prepare(`SELECT p.* FROM diary_projects p JOIN diary_project_entries l ON p.slug = l.project_slug
      WHERE l.entry_slug = ? ${user.role === 'owner' ? '' : "AND p.status = 'published'"} ORDER BY p.title COLLATE NOCASE, p.slug`).bind(slug).all<ProjectRow>(),
  ]);
  return json({ entry: { ...entrySummary(row), html, attachments: results.map(attachmentMetadata), projects: projects.results.map(project => projectSummary(project, user)) } });
}
function validateEntry(data: Record<string, unknown>, current?: EntryRow): Omit<EntryRow, 'updated_at' | 'published_at'> {
  const merged = { ...(current ? authorEntry(current) : {}), ...data };
  const slug = textField(merged.slug, 7, true), month = textField(merged.month, 7, true);
  if (!validMonth(slug) || month !== slug || (current && current.slug !== slug)) throw invalid('Use a matching month and slug in YYYY-MM format.');
  const title = textField(merged.title, 160, true).trim();
  const description = textField(merged.summary ?? '', 600), markdown = textField(merged.markdown ?? '', 120000);
  const tags = merged.tags ?? [];
  if (!Array.isArray(tags) || tags.length > 10) throw invalid('Use at most 10 tags.');
  const validatedTags = [...new Set(tags.map(tag => textField(tag, 40, true).trim()))];
  const status = merged.status ?? 'draft';
  if (status !== 'draft' && status !== 'published') throw invalid();
  const publicTeaser = merged.publicTeaser ?? false;
  if (typeof publicTeaser !== 'boolean') throw invalid();
  const teaser = textField(merged.teaser ?? '', 280, publicTeaser);
  return { slug, month, title, summary: description, tags: JSON.stringify(validatedTags), markdown, status, public_teaser: publicTeaser ? 1 : 0, teaser };
}
export async function saveEntry(request: Request, { db }: Context, slug?: string): Promise<Response> {
  const data = await readJson(request);
  const current = slug ? await db.prepare('SELECT * FROM diary_entries WHERE slug = ?').bind(slug).first<EntryRow>() : null;
  if (slug && !current) throw notFound();
  const row = validateEntry(data, current ?? undefined), now = Date.now();
  const publishedAt = row.status === 'published' ? current?.published_at ?? now : current?.published_at ?? null;
  const values = [row.month, row.title, row.summary, row.tags, row.markdown, row.status, row.public_teaser, row.teaser, publishedAt, now, row.slug];
  let saved: EntryRow | null;
  if (current) {
    saved = await db.prepare(`UPDATE diary_entries SET month = ?, title = ?, summary = ?, tags = ?, markdown = ?, status = ?,
      public_teaser = ?, teaser = ?, published_at = ?, updated_at = ? WHERE slug = ? RETURNING *`).bind(...values).first<EntryRow>();
  } else {
    saved = await db.prepare(`INSERT INTO diary_entries (month, title, summary, tags, markdown, status, public_teaser, teaser, published_at, updated_at, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO NOTHING RETURNING *`).bind(...values).first<EntryRow>();
    if (!saved) throw new HttpError(409, 'ENTRY_EXISTS', 'An entry already exists for this month.');
  }
  return json({ entry: authorEntry(saved!) }, current ? 200 : 201);
}
export async function preview(request: Request): Promise<Response> {
  const data = await readJson(request);
  return json({ html: await renderMarkdown(textField(data.markdown, 120000)) });
}
