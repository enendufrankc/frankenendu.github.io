/** Shared validation and insert-only SQL plans for private, unpublished imports. */
export const MAX_PRIVATE_JSON_BYTES = 32 * 1024 * 1024;
export class DraftValidationError extends Error {}
const fail = message => { throw new DraftValidationError(message); };
const validSlug = value => typeof value === 'string' && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const validMonth = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
function decode(input) {
  if (typeof input !== 'string') return input;
  if (Buffer.byteLength(input, 'utf8') > MAX_PRIVATE_JSON_BYTES) fail('Private JSON exceeds the 32 MiB import limit.');
  try { return JSON.parse(input); } catch { fail('Private input must be valid JSON.'); }
}
function record(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Each private draft must be an object.');
  return value;
}
function text(value, field, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) fail(`Invalid ${field}.`);
  return value;
}
function list(value, field, count, length) {
  if (!Array.isArray(value) || value.length > count) fail(`Invalid ${field} list.`);
  return value.map(item => text(item, field, length, true).trim());
}
function references(value, field, count, length, valid) {
  const items = list(value, field, count, length);
  if (new Set(items).size !== items.length || items.some(item => !valid(item))) fail(`Use unique, valid ${field} identifiers.`);
  return items;
}
function date(value) {
  const result = text(value, 'evidenceDate', 10, true), parsed = Date.parse(`${result}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== result) fail('Use a real evidenceDate in YYYY-MM-DD format.');
  return result;
}
export function parseProjectDrafts(input) {
  const values = decode(input);
  if (!Array.isArray(values) || values.length > 1000) fail('Use a JSON array containing at most 1000 project drafts.');
  const projects = values.map(value => {
    const item = record(value), slug = text(item.slug, 'slug', 80, true);
    if (!validSlug(slug)) fail('Use lowercase project slugs with letters, numbers, and single hyphens.');
    if (item.status !== undefined && !['draft', 'published'].includes(item.status)) fail('Invalid status.');
    if (item.guideVisibility !== undefined && !['owner', 'readers'].includes(item.guideVisibility)) fail('Invalid guideVisibility.');
    const relatedSlugs = references(item.relatedSlugs ?? [], 'relatedSlugs', 80, 80, validSlug);
    if (relatedSlugs.includes(slug)) fail('A project cannot relate to itself.');
    return {
      slug, title: text(item.title, 'title', 160, true).trim(), summary: text(item.summary ?? '', 'summary', 600),
      area: text(item.area ?? '', 'area', 80), stage: text(item.stage ?? '', 'stage', 120),
      contributors: list(item.contributors ?? [], 'contributors', 15, 120), aliases: list(item.aliases ?? [], 'aliases', 20, 120),
      evidenceDate: date(item.evidenceDate), overviewMarkdown: text(item.overviewMarkdown ?? '', 'overviewMarkdown', 120000),
      guideMarkdown: text(item.guideMarkdown ?? '', 'guideMarkdown', 120000), sourceNotes: text(item.sourceNotes ?? '', 'sourceNotes', 16000),
      relatedSlugs, months: references(item.months ?? [], 'months', 120, 7, validMonth), status: 'draft', guideVisibility: 'owner',
    };
  });
  if (new Set(projects.map(project => project.slug)).size !== projects.length) fail('Project slugs must be unique within the import.');
  return projects;
}
export function parseMonthlyDraft(input) {
  const item = record(decode(input));
  if (!validMonth(item.month) || (item.slug !== undefined && item.slug !== item.month)) fail('Use matching YYYY-MM month and slug.');
  return {
    slug: item.month, month: item.month, title: text(item.title, 'monthly title', 160, true).trim(),
    summary: text(item.summary ?? '', 'monthly summary', 600), markdown: text(item.markdown ?? '', 'monthly markdown', 120000),
    tags: list(item.tags ?? [], 'monthly tags', 10, 40), status: 'draft', publicTeaser: false, teaser: '',
  };
}
export function sqlQuote(value) {
  if (typeof value !== 'string' || value.includes('\u0000')) fail('SQL text must be a string without NUL characters.');
  // Wrangler's SQL importer looks for this phrase even inside quoted text.
  // Split the SQL literal so a build guide mentioning transactions is preserved.
  return `'${value.replaceAll("'", "''").replaceAll('BEGIN TRANSACTION', "BEGIN ' || 'TRANSACTION")}'`;
}
function timestamp(now) {
  if (!Number.isSafeInteger(now) || now < 0) fail('Use a valid import timestamp.');
  return now;
}
function metadata(values, valid, name) {
  if (!Array.isArray(values) || values.some(value => !valid(value))) fail(`Invalid existing ${name} metadata.`);
  return new Set(values);
}
const finish = (statements, counts) => ({ statements, sql: statements.map(statement => `${statement};`).join('\n\n'), ...counts });
export function projectImportPlan(input, { existingProjectSlugs = [], existingMonths = [], now = Date.now() } = {}) {
  const projects = parseProjectDrafts(input), time = timestamp(now);
  const existing = metadata(existingProjectSlugs, validSlug, 'project'), months = metadata(existingMonths, validMonth, 'month');
  const available = new Set([...existing, ...projects.map(project => project.slug)]);
  for (const project of projects) {
    if (project.relatedSlugs.some(slug => !available.has(slug))) fail('A related project is missing from this import and the database.');
    if (project.months.some(month => !months.has(month))) fail('A linked month does not exist in the database or monthly seed.');
  }
  const additions = projects.filter(project => !existing.has(project.slug)), statements = [];
  for (const project of additions) {
    const values = [project.slug, project.title, project.summary, project.area, project.stage, JSON.stringify(project.contributors),
      JSON.stringify(project.aliases), project.evidenceDate, project.overviewMarkdown, project.guideMarkdown, project.sourceNotes,
      JSON.stringify(project.relatedSlugs), 'draft', 'owner'];
    statements.push(`INSERT INTO diary_projects (slug, title, summary, area, stage, contributors, aliases, evidence_date,
      overview_markdown, guide_markdown, source_notes, related_slugs, status, guide_visibility, published_at, updated_at)
      VALUES (${values.map(sqlQuote).join(', ')}, NULL, ${time}) ON CONFLICT(slug) DO NOTHING`);
    // Must directly follow its INSERT in the same transaction. changes() = 0
    // means an existing/racing project won: its junction links stay untouched.
    statements.push(`INSERT INTO diary_project_entries (project_slug, entry_slug)
      SELECT ${sqlQuote(project.slug)}, value FROM json_each(${sqlQuote(JSON.stringify(project.months))}) WHERE changes() > 0`);
  }
  return finish(statements, { inputCount: projects.length, createdCount: additions.length, skippedCount: projects.length - additions.length });
}
export function monthlyImportPlan(input, { existingMonths = [], now = Date.now() } = {}) {
  const entry = parseMonthlyDraft(input), time = timestamp(now), existing = metadata(existingMonths, validMonth, 'month');
  if (existing.has(entry.month)) return finish([], { createdCount: 0, skippedCount: 1 });
  const values = [entry.slug, entry.month, entry.title, entry.summary, JSON.stringify(entry.tags), entry.markdown, 'draft'];
  return finish([`INSERT INTO diary_entries (slug, month, title, summary, tags, markdown, status, public_teaser, teaser, updated_at)
    VALUES (${values.map(sqlQuote).join(', ')}, 0, '', ${time}) ON CONFLICT(slug) DO NOTHING`], { createdCount: 1, skippedCount: 0 });
}
export function parseImportArguments(args) {
  const targets = args.filter(arg => arg === '--local' || arg === '--remote');
  const files = args.filter(arg => !arg.startsWith('--'));
  if (targets.length !== 1 || files.length !== 1 || args.length !== 2) fail('Usage: node scripts/import-projects.mjs /path/to/private-projects.json --local|--remote');
  return { file: files[0], target: targets[0] };
}
