// Wrangler owns binding types; only secrets extend its generated environment.
export type DiaryEnv = Env & { RESEND_API_KEY: string };
export type Database = Pick<D1Database, 'prepare' | 'batch'>;
export interface Context { env: DiaryEnv; db: Database }
export interface User { email: string; role: 'owner' | 'reader'; expiresAt: string }
export interface InvitationRow {
  id: string; email: string; name: string; expires_at: number; created_at: number; revoked_at: number | null;
}
export interface EntryRow {
  slug: string; month: string; title: string; summary: string; tags: string; markdown: string;
  status: 'draft' | 'published'; public_teaser: number; teaser: string; published_at: number | null; updated_at: number;
}
export interface AttachmentRow {
  id: string; entry_slug: string; object_key: string; name: string; type: string; size: number; created_at: number;
}
export interface ProjectRow {
  slug: string; title: string; summary: string; area: string; stage: string;
  contributors: string; aliases: string; evidence_date: string;
  overview_markdown: string; guide_markdown: string; source_notes: string; related_slugs: string; mental_model: string | null;
  status: 'draft' | 'published'; guide_visibility: 'owner' | 'readers';
  published_at: number | null; updated_at: number;
}
