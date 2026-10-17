export interface DiaryUser { email: string; role: 'owner' | 'reader'; expiresAt: string; }
export interface Attachment { id: string; name: string; type: string; size: number; url: string; }
export interface DiaryEntry {
  slug: string; month: string; title: string; summary: string; tags: string[];
  publishedAt: string | null; updatedAt: string; readingMinutes: number;
  html?: string; markdown?: string; status?: 'draft' | 'published';
  publicTeaser?: boolean; teaser?: string; attachments?: Attachment[];
}
export class DiaryError extends Error {
  constructor(message: string, public status: number, public code: string) { super(message); }
}
export const $ = <T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
export function message(selector: string, text: string, error = false) {
  const element = $(selector); if (!element) return;
  element.textContent = text; element.classList.toggle('is-error', error);
}
export function textElement(tag: string, text: string, className = '') {
  const element = document.createElement(tag); element.textContent = text; element.className = className; return element;
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}
export function formatMonth(month: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
}
export async function api<T>(route: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json');
  let response: Response;
  try { response = await fetch(`/api/diary${route}`, { ...options, headers, credentials: 'same-origin', cache: 'no-store' }); }
  catch { throw new DiaryError('Couldn’t connect. Check your connection and try again.', 0, 'NETWORK'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if ([401, 403].includes(response.status) && !route.startsWith('/auth/')) {
      document.dispatchEvent(new CustomEvent('diary:unauthorised', { detail: data.code }));
    }
    throw new DiaryError(data.error || 'The diary is temporarily unavailable. Please try again.', response.status, data.code || 'UNAVAILABLE');
  }
  return data as T;
}
export async function busy(form: HTMLElement, action: () => Promise<void>, lockFields = false) {
  const buttons = Array.from(form.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>(lockFields ? 'button, input, textarea, select' : 'button'));
  const previous = buttons.map(button => button.disabled);
  buttons.forEach(button => { button.disabled = true; }); form.setAttribute('aria-busy', 'true');
  try { await action(); }
  finally { buttons.forEach((button, i) => { button.disabled = previous[i]; }); form.removeAttribute('aria-busy'); }
}
export function attachmentLink(file: Attachment) {
  const link = document.createElement('a'); link.href = file.url; link.textContent = `${file.name} ↗`;
  link.target = '_blank'; link.rel = 'noopener noreferrer'; return link;
}

interface AccessOptions { onUser(user: DiaryUser, isCurrent: () => boolean): Promise<void>; onClear(): void; ownerOnly?: boolean; }
export async function initialiseAccess(options: AccessOptions) {
  let user: DiaryUser | null = null;
  let challengeId = ''; let email = ''; let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  const requestForm = $<HTMLFormElement>('[data-request-code]')!;
  const verifyForm = $<HTMLFormElement>('[data-verify-code]')!;
  const login = $('[data-diary-login]');
  function clear(reason = '') {
    generation++; user = null; clearTimeout(expiryTimer); options.onClear();
    message('[data-session-description]', '');
    const privateArea = $('[data-private-area]'); if (privateArea) privateArea.hidden = true;
    const bar = $('[data-session-bar]'); if (bar) bar.hidden = true;
    const publicArea = $('[data-public-area]'); if (publicArea) publicArea.hidden = false;
    if (login) login.hidden = false;
    if (reason) message('[data-login-message]', reason, true);
  }
  async function accept(next: DiaryUser) {
    if (options.ownerOnly && next.role !== 'owner') {
      clear('This workspace is only available to Frank. You can read the diary from the journal page.'); return;
    }
    const previous = user;
    user = next;
    message('[data-login-message]', '');
    const publicArea = $('[data-public-area]'); if (publicArea) publicArea.hidden = true;
    const bar = $('[data-session-bar]'); if (bar) bar.hidden = false;
    const privateArea = $('[data-private-area]'); if (privateArea) privateArea.hidden = false;
    const ownerLink = $('[data-owner-link]'); if (ownerLink) ownerLink.hidden = next.role !== 'owner';
    message('[data-session-description]', `${next.email} · ${next.role === 'owner' ? 'Session' : 'Access'} until ${formatDate(next.expiresAt)}`);
    clearTimeout(expiryTimer);
    expiryTimer = setTimeout(() => clear('Your access window has ended. Contact Frank if you’d like more time.'), Math.max(0, Math.min(new Date(next.expiresAt).getTime() - Date.now(), 2_147_000_000)));
    if (!previous || previous.email !== next.email) {
      const current = ++generation;
      const isCurrent = () => current === generation && user !== null;
      try { await options.onUser(next, isCurrent); }
      catch (error) { if (current === generation) message('[data-page-message]', (error as Error).message, true); }
    }
  }
  async function refresh() {
    const current = generation;
    try {
      const session = await api<{ user: DiaryUser | null; reason?: string }>('/session');
      if (current !== generation) return;
      if (session.user) await accept(session.user);
      else clear(session.reason ? 'Your invitation has expired or is no longer active. Contact Frank to request access.' : '');
    } catch (error) {
      if (current !== generation) return;
      clear(); message('[data-login-message]', (error as Error).message, true);
    }
  }
  requestForm?.addEventListener('submit', event => {
    event.preventDefault();
    void busy(requestForm, async () => {
      message('[data-login-message]', 'Requesting your code…');
      email = String(new FormData(requestForm).get('email')).trim().toLowerCase();
      try {
        const result = await api<{ challengeId: string; message: string }>('/auth/request', { method: 'POST', body: JSON.stringify({ email }) });
        challengeId = result.challengeId; requestForm.hidden = true; verifyForm.hidden = false; verifyForm.reset();
        message('[data-login-message]', result.message || 'If this email has an active invitation, a code is on its way. Check your inbox and spam folder.');
        $<HTMLInputElement>('[name="code"]', verifyForm)?.focus();
      } catch (error) { message('[data-login-message]', (error as Error).message, true); }
    });
  });
  verifyForm?.addEventListener('submit', event => {
    event.preventDefault();
    void busy(verifyForm, async () => {
      try {
        const code = String(new FormData(verifyForm).get('code')).trim();
        const result = await api<{ user: DiaryUser }>('/auth/verify', { method: 'POST', body: JSON.stringify({ email, challengeId, code }) });
        verifyForm.reset(); verifyForm.hidden = true; requestForm.hidden = false;
        await accept(result.user);
      } catch (error) { message('[data-login-message]', (error as Error).message, true); }
    });
  });
  $('[data-change-email]')?.addEventListener('click', () => {
    challengeId = ''; verifyForm.reset(); verifyForm.hidden = true; requestForm.hidden = false;
    message('[data-login-message]', ''); $<HTMLInputElement>('[name="email"]', requestForm)?.focus();
  });
  $('[data-logout]')?.addEventListener('click', async () => {
    clear();
    try { await api('/auth/logout', { method: 'POST', body: '{}' }); message('[data-login-message]', 'You’re signed out.'); }
    catch { message('[data-login-message]', 'The page is cleared. Sign-out could not reach the server; close this browser session if you’re on a shared device.', true); }
  });
  document.addEventListener('diary:unauthorised', () => clear('Your access is no longer active. Sign in again or contact Frank for an extension.'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && user) void refresh(); });
  window.addEventListener('pagehide', () => clear());
  window.addEventListener('pageshow', event => { if (event.persisted) void refresh(); });
  setInterval(() => { if (user && document.visibilityState === 'visible') void refresh(); }, 60_000);
  await refresh();
}
