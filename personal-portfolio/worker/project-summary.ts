import type { ProjectRow, User } from './types';
import { iso } from './http';

export const validProjectSlug = (value: string) => value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export const canReadGuide = (row: ProjectRow, user: User) => user.role === 'owner' || row.guide_visibility === 'readers';
export function projectSummary(row: ProjectRow, user: User) {
  // A restricted guide must not reveal its length through list cards, backlinks,
  // related projects, or the detail page's estimated reading time.
  const readableText = `${row.overview_markdown}\n${canReadGuide(row, user) ? row.guide_markdown : ''}`.trim();
  return {
    slug: row.slug, title: row.title, summary: row.summary, area: row.area, stage: row.stage,
    contributors: JSON.parse(row.contributors) as string[], aliases: JSON.parse(row.aliases) as string[],
    evidenceDate: row.evidence_date, updatedAt: iso(row.updated_at),
    readingMinutes: Math.max(1, Math.ceil(readableText.split(/\s+/).length / 220)),
    ...(user.role === 'owner' ? { status: row.status, guideVisibility: row.guide_visibility } : {}),
  };
}
