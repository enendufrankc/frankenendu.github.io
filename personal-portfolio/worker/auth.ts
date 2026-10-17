import type { Context, Database, InvitationRow, User } from './types';
import { cookie, cookieValue, HttpError, iso, json, normaliseEmail, randomToken, readJson, sha256, textField } from './http';
import { sendMail } from './mail';

const SESSION_COOKIE = 'diary_session';
const BROWSER_COOKIE = 'diary_browser';
const WINDOW = 15 * 60 * 1000;
const invalidCode = () => new HttpError(401, 'INVALID_CODE', 'The code is invalid or expired. Request a new code and try again.');

async function withinLimits(db: Database, request: Request, email: string, action: 'request' | 'verify', now: number): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const [ipKey, emailKey] = await Promise.all([sha256(`ip:${action}:${ip}`), sha256(`email:${action}:${email}`)]);
  const sql = `INSERT INTO diary_rate_limits (key, window_started, count) VALUES (?1, ?2, 1)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN window_started <= ?3 THEN 1 ELSE count + 1 END,
      window_started = CASE WHEN window_started <= ?3 THEN ?2 ELSE window_started END
    RETURNING count`;
  // Gate the IP first: blocked scanners must not allocate a new D1 row for
  // every invented email. Each individual counter increment remains atomic.
  const ipCount = await db.prepare(sql).bind(ipKey, now, now - WINDOW).first<{ count: number }>();
  if (!ipCount || ipCount.count > (action === 'request' ? 30 : 100)) return false;
  const emailCount = await db.prepare(sql).bind(emailKey, now, now - WINDOW).first<{ count: number }>();
  return Boolean(emailCount && emailCount.count <= (action === 'request' ? 5 : 30));
}
function randomCode(): string {
  // Rejection sampling avoids modulo bias over the 100,000,000 possible codes.
  const bound = Math.floor(0x100000000 / 100000000) * 100000000;
  let value: number;
  do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= bound);
  return String(value % 100000000).padStart(8, '0');
}
export async function requestCode(request: Request, { db, env }: Context, execution: ExecutionContext): Promise<Response> {
  const data = await readJson(request);
  const email = normaliseEmail(data.email);
  const now = Date.now(), id = crypto.randomUUID();
  const browserToken = cookieValue(request, BROWSER_COOKIE) ?? randomToken();
  const response = json({ challengeId: id, message: 'If this email has diary access, a sign-in code will arrive shortly.' }, 202);
  response.headers.append('Set-Cookie', cookie(BROWSER_COOKIE, browserToken, 600, env));
  if (!await withinLimits(db, request, email, 'request', now)) return response;
  // Bound maintenance work per accepted request and retain no expired codes,
  // sessions, or throttling identifiers longer than the next cleanup pass.
  await db.batch([
    db.prepare('DELETE FROM diary_challenges WHERE id IN (SELECT id FROM diary_challenges WHERE expires_at <= ? LIMIT 100)').bind(now),
    db.prepare('DELETE FROM diary_sessions WHERE token_hash IN (SELECT token_hash FROM diary_sessions WHERE expires_at <= ? LIMIT 100)').bind(now),
    db.prepare('DELETE FROM diary_rate_limits WHERE key IN (SELECT key FROM diary_rate_limits WHERE window_started <= ? LIMIT 100)').bind(now - WINDOW),
  ]);
  const owner = email === normaliseEmail(env.DIARY_OWNER_EMAIL);
  const invitation = await db.prepare('SELECT * FROM diary_invitations WHERE email = ? AND revoked_at IS NULL AND expires_at > ?').bind(email, now).first<InvitationRow>();
  const code = randomCode();
  const [codeHash, browserHash] = await Promise.all([sha256(`${id}:${email}:${code}`), sha256(browserToken)]);
  await db.prepare(`INSERT INTO diary_challenges (id, email, role, invitation_id, code_hash, browser_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, email, owner ? 'owner' : 'reader', owner ? null : invitation?.id ?? null, codeHash, browserHash, now, now + 600000).run();
  // The public response does not depend on eligibility or mail delivery.
  if (owner || invitation) execution.waitUntil(sendMail(env, email, 'Your private diary sign-in code', `Your sign-in code is ${code}.\n\nIt expires in 10 minutes and only works in the browser that requested it.\n\nIf you did not request this code, ignore this email.`));
  return response;
}

export async function verifyCode(request: Request, { db, env }: Context): Promise<Response> {
  const data = await readJson(request);
  const email = normaliseEmail(data.email);
  const id = textField(data.challengeId, 64, true), code = textField(data.code, 8, true);
  if (!/^[\da-f-]{36}$/.test(id) || !/^\d{8}$/.test(code)) throw invalidCode();
  const now = Date.now();
  if (!await withinLimits(db, request, email, 'verify', now)) throw invalidCode();
  const browserToken = cookieValue(request, BROWSER_COOKIE);
  if (!browserToken) throw invalidCode();
  const token = randomToken();
  const [codeHash, browserHash, tokenHash] = await Promise.all([sha256(`${id}:${email}:${code}`), sha256(browserToken), sha256(token)]);
  const ownerEmail = normaliseEmail(env.DIARY_OWNER_EMAIL);
  // D1 batches are transactions. A conditional UPDATE accounts for attempts and
  // gives the winning request its own marker, so concurrent/replayed codes cannot
  // insert another session. Eligibility is checked inside this transaction.
  const results = await db.batch<SessionRow>([
    db.prepare(`UPDATE diary_challenges SET attempts = attempts + 1,
      consumed_by = CASE WHEN code_hash = ?1 THEN ?2 ELSE NULL END
      WHERE id = ?3 AND email = ?4 AND browser_hash = ?5 AND consumed_by IS NULL AND attempts < 5 AND expires_at > ?6
      AND ((role = 'owner' AND email = ?7) OR (role = 'reader' AND EXISTS (
        SELECT 1 FROM diary_invitations i WHERE i.id = invitation_id AND i.email = diary_challenges.email AND i.revoked_at IS NULL AND i.expires_at > ?6)))
      `).bind(codeHash, tokenHash, id, email, browserHash, now, ownerEmail),
    db.prepare(`INSERT INTO diary_sessions (token_hash, email, role, invitation_id, created_at, expires_at)
      SELECT ?1, c.email, c.role, c.invitation_id, ?2,
        CASE WHEN c.role = 'owner' THEN ?3 ELSE MIN(?4, i.expires_at) END
      FROM diary_challenges c LEFT JOIN diary_invitations i ON i.id = c.invitation_id
      WHERE c.id = ?5 AND c.consumed_by = ?1
      AND ((c.role = 'owner' AND c.email = ?6) OR (c.role = 'reader' AND i.email = c.email AND i.revoked_at IS NULL AND i.expires_at > ?2))
      RETURNING *`).bind(tokenHash, now, now + 8 * 3600000, now + 7 * 86400000, id, ownerEmail),
  ]);
  const session = results[1].results[0];
  if (!session) throw invalidCode();
  const response = json({ user: userFromSession(session) });
  response.headers.append('Set-Cookie', cookie(SESSION_COOKIE, token, (session.expires_at - now) / 1000, env));
  return response;
}
interface SessionRow { token_hash: string; email: string; role: 'owner' | 'reader'; invitation_id: string | null; expires_at: number }
const userFromSession = (session: SessionRow): User => ({ email: session.email, role: session.role, expiresAt: iso(session.expires_at) });
export async function sessionInfo(request: Request, { db, env }: Context): Promise<{ user: User | null; reason?: string }> {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return { user: null };
  const session = await db.prepare(`SELECT s.*, i.id AS current_invitation_id, i.email AS invited_email,
    i.expires_at AS invitation_expires_at, i.revoked_at
    FROM diary_sessions s LEFT JOIN diary_invitations i ON s.invitation_id = i.id WHERE s.token_hash = ?`)
    .bind(await sha256(token)).first<SessionRow & { current_invitation_id: string | null; invited_email: string | null; invitation_expires_at: number | null; revoked_at: number | null }>();
  if (!session) return { user: null, reason: 'signed_out' };
  const now = Date.now();
  if (session.expires_at <= now) return { user: null, reason: 'session_expired' };
  if (session.role === 'owner') return session.email === normaliseEmail(env.DIARY_OWNER_EMAIL)
    ? { user: userFromSession(session) } : { user: null, reason: 'access_revoked' };
  if (!session.current_invitation_id || session.invited_email !== session.email || session.revoked_at !== null) return { user: null, reason: 'access_revoked' };
  if (!session.invitation_expires_at || session.invitation_expires_at <= now) return { user: null, reason: 'access_expired' };
  return { user: userFromSession({ ...session, expires_at: Math.min(session.expires_at, session.invitation_expires_at) }) };
}
export async function requireUser(request: Request, context: Context, owner = false): Promise<User> {
  const { user } = await sessionInfo(request, context);
  if (!user) throw new HttpError(401, 'AUTH_REQUIRED', 'Sign in to view this diary.');
  if (owner && user.role !== 'owner') throw new HttpError(403, 'OWNER_REQUIRED', 'Only the diary owner can make this request.');
  return user;
}
export async function logout(request: Request, { db, env }: Context): Promise<Response> {
  await readJson(request);
  const token = cookieValue(request, SESSION_COOKIE);
  if (token) await db.prepare('DELETE FROM diary_sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  const response = json({ ok: true });
  response.headers.append('Set-Cookie', cookie(SESSION_COOKIE, '', 0, env));
  response.headers.append('Set-Cookie', cookie(BROWSER_COOKIE, '', 0, env));
  return response;
}
