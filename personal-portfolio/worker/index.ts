import type { Context, DiaryEnv } from './types';
import { HttpError, json, notFound, privateResponse, requireConfiguration, requireMutationHeaders, unavailable } from './http';
import { logout, requestCode, requireUser, sessionInfo, verifyCode } from './auth';
import { createInvitation, listInvitations, updateInvitation } from './invitations';
import { entryDetail, listEntries, preview, publicEntries, saveEntry, validMonth } from './content';
import { downloadAttachment, uploadAttachment } from './attachments';

async function api(request: Request, context: Context, execution: ExecutionContext): Promise<Response> {
  const path = new URL(request.url).pathname.slice('/api/diary'.length), method = request.method;
  if (method !== 'GET' && method !== 'HEAD') requireMutationHeaders(request, context.env);
  if (path === '/session' && method === 'GET') return json(await sessionInfo(request, context));
  if (path === '/public' && method === 'GET') return publicEntries(context);
  if (path === '/auth/request' && method === 'POST') return requestCode(request, context, execution);
  if (path === '/auth/verify' && method === 'POST') return verifyCode(request, context);
  if (path === '/auth/logout' && method === 'POST') return logout(request, context);
  const user = await requireUser(request, context, path.startsWith('/admin/'));
  if (path === '/entries' && method === 'GET') return listEntries(context, user);
  if (path === '/admin/entries') {
    if (method === 'GET') return listEntries(context, user, true);
    if (method === 'POST') return saveEntry(request, context);
  }
  if (path === '/admin/preview' && method === 'POST') return preview(request);
  if (path === '/admin/invitations') {
    if (method === 'GET') return listInvitations(context);
    if (method === 'POST') return createInvitation(request, context);
  }
  const invitation = /^\/admin\/invitations\/([\da-f-]{36})$/.exec(path);
  if (invitation && method === 'PATCH') return updateInvitation(request, context, invitation[1]);
  const entry = /^\/(admin\/)?entries\/(\d{4}-(?:0[1-9]|1[0-2]))(\/attachments)?$/.exec(path);
  if (entry) {
    if (entry[1] && entry[3] && method === 'POST') return uploadAttachment(request, context, entry[2]);
    if (!entry[3] && !entry[1] && method === 'GET') return entryDetail(context, user, entry[2]);
    if (!entry[3] && entry[1] && method === 'PUT') return saveEntry(request, context, entry[2]);
  }
  const attachment = /^\/attachments\/([\da-f-]{36})$/.exec(path);
  if (attachment && method === 'GET') return downloadAttachment(context, user, attachment[1]);
  throw notFound();
}

export default {
  async fetch(request: Request, env: DiaryEnv, execution: ExecutionContext): Promise<Response> {
    const url = new URL(request.url), path = url.pathname;
    const isApi = path === '/api/diary' || path.startsWith('/api/diary/');
    const isDiary = path === '/diary' || path.startsWith('/diary/');
    if (!isApi && !isDiary) return env.ASSETS.fetch(request);
    try {
      if (isDiary) {
        if (request.method !== 'GET' && request.method !== 'HEAD') throw notFound();
        const shellPath = path.endsWith('/') ? path : `${path}/`;
        const month = /^\/diary\/(\d{4}-\d{2})\/$/.exec(shellPath)?.[1];
        if (!['/diary/', '/diary/admin/', '/diary/entry/'].includes(shellPath) && !(month && validMonth(month))) throw notFound();
        url.pathname = month ? '/diary/entry/' : shellPath;
        // Shells contain no private content and remain usable for setup/errors.
        return privateResponse(await env.ASSETS.fetch(new Request(url.toString(), request)), true);
      }
      requireConfiguration(env);
      // Every request starts at the primary. Revocation checks must never use a
      // stale read replica, even if D1 replication is enabled later.
      const context: Context = { env, db: env.DIARY_DB.withSession('first-primary') };
      return privateResponse(await api(request, context, execution));
    } catch (error) {
      const failure = error instanceof HttpError ? error : unavailable();
      return privateResponse(json({ error: failure.message, code: failure.code }, failure.status));
    }
  },
} satisfies ExportedHandler<DiaryEnv>;
