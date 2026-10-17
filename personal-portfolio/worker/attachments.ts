import type { AttachmentRow, Context, EntryRow, User } from './types';
import { boundedBody, HttpError, invalid, json, notFound, textField } from './http';
import { attachmentMetadata } from './content';

const imageTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const allowedTypes = new Set([...imageTypes, 'application/pdf']);
function matchesType(bytes: Uint8Array, type: string): boolean {
  const start = (...signature: number[]) => signature.every((value, index) => bytes[index] === value);
  switch (type) {
    case 'image/png': return start(137, 80, 78, 71, 13, 10, 26, 10);
    case 'image/jpeg': return start(255, 216, 255);
    case 'application/pdf': return start(37, 80, 68, 70, 45);
    case 'image/webp': return start(82, 73, 70, 70) && [87, 69, 66, 80].every((value, index) => bytes[index + 8] === value);
    default: return false;
  }
}
export async function uploadAttachment(request: Request, { db, env }: Context, slug: string): Promise<Response> {
  const entry = await db.prepare('SELECT slug FROM diary_entries WHERE slug = ?').bind(slug).first();
  if (!entry) throw notFound();
  const type = request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() ?? '';
  if (!allowedTypes.has(type)) throw new HttpError(415, 'FILE_TYPE', 'Upload a PNG, JPEG, WebP, or PDF file.');
  let encodedName = request.headers.get('X-File-Name') ?? '';
  try { encodedName = decodeURIComponent(encodedName); } catch { throw invalid('Use a valid file name.'); }
  const name = textField(encodedName, 180, true).replace(/[\\/]/g, '_');
  if (/[\r\n]/.test(name)) throw invalid('Use a valid file name.');
  const bytes = await boundedBody(request, 10 * 1024 * 1024);
  if (!matchesType(bytes, type)) throw new HttpError(415, 'FILE_TYPE', 'The file contents do not match the selected file type.');
  const id = crypto.randomUUID(), objectKey = `diary/${slug}/${id}`;
  await env.DIARY_FILES.put(objectKey, bytes, { httpMetadata: { contentType: type } });
  let row: AttachmentRow | null;
  try {
    row = await db.prepare(`INSERT INTO diary_attachments (id, entry_slug, object_key, name, type, size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`).bind(id, slug, objectKey, name, type, bytes.byteLength, Date.now()).first<AttachmentRow>();
  } catch (error) {
    await env.DIARY_FILES.delete(objectKey);
    throw error;
  }
  return json({ attachment: attachmentMetadata(row!) }, 201);
}
export async function downloadAttachment({ db, env }: Context, user: User, id: string): Promise<Response> {
  const row = await db.prepare(`SELECT a.*, e.status FROM diary_attachments a JOIN diary_entries e ON a.entry_slug = e.slug WHERE a.id = ?`)
    .bind(id).first<AttachmentRow & Pick<EntryRow, 'status'>>();
  if (!row || (user.role !== 'owner' && row.status !== 'published')) throw notFound();
  const object = await env.DIARY_FILES.get(row.object_key);
  if (!object) throw notFound();
  // Only verified raster image types may render inline. PDFs remain downloads,
  // and every image request still checks authentication and entry publication.
  const disposition = imageTypes.has(row.type) ? 'inline' : 'attachment';
  const asciiName = row.name.replace(/[^\x20-\x7e]|["\\]/g, '_');
  return new Response(object.body, { headers: {
    'Content-Type': row.type, 'Content-Length': String(object.size),
    'Content-Disposition': `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(row.name).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)}`,
  } });
}
