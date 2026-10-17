import type { DiaryEnv } from './types';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export const json = (value: unknown, status = 200) => Response.json(value, { status });
export const notFound = () => new HttpError(404, 'NOT_FOUND', 'Not found.');
export const invalid = (message = 'Check the supplied details.') => new HttpError(400, 'INVALID_INPUT', message);
export const iso = (timestamp: number) => new Date(timestamp).toISOString();

export function privateResponse(response: Response, shell = false): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Vary', headers.get('Vary') ? `${headers.get('Vary')}, Cookie` : 'Cookie');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Content-Security-Policy', shell
    ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'"
    : "default-src 'none'; frame-ancestors 'none'; sandbox");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function requireConfiguration(env: DiaryEnv): void {
  let origin: URL;
  try { origin = new URL(env.DIARY_ORIGIN); } catch { throw unavailable(); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
  if (!env.DIARY_DB || !env.DIARY_FILES || !env.RESEND_API_KEY ||
      !env.DIARY_FROM_EMAIL || !env.DIARY_OWNER_EMAIL ||
      origin.origin !== env.DIARY_ORIGIN || (origin.protocol !== 'https:' && !(local && origin.protocol === 'http:'))) throw unavailable();
  try { normaliseEmail(env.DIARY_OWNER_EMAIL); } catch { throw unavailable(); }
}
export const unavailable = () => new HttpError(503, 'UNAVAILABLE', 'The diary is temporarily unavailable. Please try again later.');

export function requireMutationHeaders(request: Request, env: DiaryEnv): void {
  if (request.headers.get('Origin') !== env.DIARY_ORIGIN || request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    throw new HttpError(403, 'ORIGIN_REJECTED', 'This request is not permitted.');
  }
  if (!/^\/api\/diary\/admin\/entries\/\d{4}-\d{2}\/attachments$/.test(new URL(request.url).pathname) &&
      request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new HttpError(415, 'CONTENT_TYPE', 'Use application/json.');
  }
}

export async function boundedBody(request: Request, limit: number): Promise<Uint8Array> {
  const declared = Number(request.headers.get('Content-Length'));
  if (declared > limit) throw new HttpError(413, 'TOO_LARGE', 'The supplied content is too large.');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, 'TOO_LARGE', 'The supplied content is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await boundedBody(request, 256 * 1024);
  let result: unknown;
  try { result = JSON.parse(new TextDecoder().decode(body)); } catch { throw invalid('Supply a valid JSON object.'); }
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw invalid();
  return result as Record<string, unknown>;
}
export function textField(value: unknown, max: number, required = false): string {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw invalid();
  return value;
}
export function normaliseEmail(value: unknown): string {
  const email = textField(value, 254, true).trim().toLowerCase();
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/.test(email) || email.includes('..')) throw invalid('Enter a valid email address.');
  return email;
}
export function expiry(value: unknown, now: number): number {
  if (value === undefined) return now + 7 * 86400000;
  if (typeof value !== 'string' || value.length > 40 || !/^\d{4}-\d{2}-\d{2}T/.test(value)) throw invalid('Choose a future expiry time.');
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp <= now) throw invalid('Choose a future expiry time.');
  return timestamp;
}
export function cookieValue(request: Request, name: string): string | null {
  const matching = (request.headers.get('Cookie') ?? '').split(';').map(value => value.trim()).filter(value => value.startsWith(`${name}=`));
  if (matching.length !== 1) return null;
  const value = matching[0].slice(name.length + 1);
  return /^[a-f0-9]{64}$/.test(value) ? value : null;
}
export function cookie(name: string, value: string, seconds: number, env: DiaryEnv): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0, Math.floor(seconds))}${env.DIARY_ORIGIN.startsWith('https:') ? '; Secure' : ''}`;
}
export function randomToken(): string { return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''); }
export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
