import type { Context, InvitationRow } from './types';
import { expiry, invalid, iso, json, normaliseEmail, notFound, readJson, textField } from './http';
import { sendMail } from './mail';

const publicInvitation = (row: InvitationRow) => ({ id: row.id, email: row.email, name: row.name, expiresAt: iso(row.expires_at), createdAt: iso(row.created_at), revokedAt: row.revoked_at === null ? null : iso(row.revoked_at) });
export async function listInvitations({ db }: Context): Promise<Response> {
  const { results } = await db.prepare('SELECT * FROM diary_invitations ORDER BY created_at DESC').all<InvitationRow>();
  return json({ invitations: results.map(publicInvitation) });
}
export async function createInvitation(request: Request, { db, env }: Context): Promise<Response> {
  const data = await readJson(request), now = Date.now();
  const email = normaliseEmail(data.email), name = textField(data.name ?? '', 120);
  const expiresAt = expiry(data.expiresAt, now), id = crypto.randomUUID();
  const row = await db.prepare(`INSERT INTO diary_invitations (id, email, name, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET id = excluded.id,
      name = excluded.name, expires_at = excluded.expires_at, created_at = excluded.created_at, revoked_at = NULL
    RETURNING *`).bind(id, email, name, expiresAt, now).first<InvitationRow>();
  const mailSent = await sendMail(env, email, 'An invitation to Frank’s private diary',
    `You have been invited to read Frank’s private professional diary until ${iso(expiresAt)}.\n\nOpen ${env.DIARY_ORIGIN}/diary/ and request a sign-in code using this email address.\n\nAccess can be withdrawn at any time. This email contains no sign-in token.`);
  return json({ invitation: publicInvitation(row!), mailSent }, 201);
}
export async function updateInvitation(request: Request, { db }: Context, id: string): Promise<Response> {
  const data = await readJson(request), now = Date.now();
  const revoke = data.revoke === true;
  if ((revoke && data.expiresAt !== undefined) || (!revoke && data.expiresAt === undefined)) throw invalid();
  // Extending never clears revoked_at. Explicit re-invitation creates a new ID.
  const row = revoke
    ? await db.prepare('UPDATE diary_invitations SET revoked_at = COALESCE(revoked_at, ?) WHERE id = ? RETURNING *').bind(now, id).first<InvitationRow>()
    : await db.prepare('UPDATE diary_invitations SET expires_at = ? WHERE id = ? RETURNING *').bind(expiry(data.expiresAt, now), id).first<InvitationRow>();
  if (!row) throw notFound();
  return json({ invitation: publicInvitation(row) });
}
