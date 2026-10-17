import { $, api, attachmentLink, formatDate, formatMonth, initialiseAccess, message, textElement, type DiaryEntry, type DiaryUser } from './diary-client';

const page = $('[data-diary-page]');
const kind = page?.dataset.diaryPage;
if (page && page.dataset.mirror !== 'true' && (kind === 'archive' || kind === 'entry')) {
  function card(entry: Pick<DiaryEntry, 'slug' | 'month' | 'title' | 'summary' | 'tags'>, privateCard = true) {
    const article = document.createElement('article'); article.className = 'diary-entry-card';
    article.append(textElement('p', formatMonth(entry.month), 'diary-entry-date'));
    const content = document.createElement('div');
    const heading = textElement('h3', entry.title);
    if (privateCard) {
      const link = document.createElement('a'); link.href = `/diary/${entry.slug}/`; link.append(heading); content.append(link);
    } else content.append(heading);
    content.append(textElement('p', entry.summary));
    const tags = document.createElement('div'); tags.className = 'diary-tags';
    entry.tags.forEach(tag => tags.append(textElement('span', tag))); content.append(tags); article.append(content);
    if (privateCard) {
      const link = document.createElement('a'); link.className = 'diary-read-link'; link.href = `/diary/${entry.slug}/`; link.textContent = 'Read entry ↗';
      link.setAttribute('aria-label', `Read ${entry.title}`); article.append(link);
    } else article.append(textElement('span', 'By invitation', 'diary-badge'));
    return article;
  }
  async function showArchive(_user: DiaryUser, isCurrent: () => boolean) {
    const { entries } = await api<{ entries: DiaryEntry[] }>('/entries');
    if (!isCurrent()) return;
    const list = $('[data-entry-list]')!; list.replaceChildren(...entries.map(entry => card(entry)));
    message('[data-entry-count]', `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`);
    $('[data-empty-archive]')!.hidden = entries.length !== 0;
    $('[data-public-previews]')!.hidden = true;
  }
  async function showEntry(_user: DiaryUser, isCurrent: () => boolean) {
    const slug = location.pathname.match(/^\/diary\/(\d{4}-(?:0[1-9]|1[0-2]))\/?$/)?.[1];
    if (!slug) { message('[data-page-message]', 'Choose an entry from the monthly archive.'); $('[data-private-area]')!.hidden = true; return; }
    const { entry } = await api<{ entry: DiaryEntry }>(`/entries/${slug}`);
    if (!isCurrent()) return;
    message('[data-entry-month]', formatMonth(entry.month)); message('[data-entry-title]', entry.title);
    message('[data-entry-summary]', entry.summary); message('[data-entry-reading]', `${entry.readingMinutes} min read`);
    message('[data-entry-updated]', `Updated ${formatDate(entry.updatedAt)}`);
    $('[data-entry-tags]')!.replaceChildren(...entry.tags.map(tag => textElement('span', tag)));
    // The authenticated server renders Markdown with raw HTML/protocols disabled.
    $('[data-entry-body]')!.innerHTML = entry.html || '';
    const files = entry.attachments || [];
    $('[data-attachments-area]')!.hidden = files.length === 0;
    $('[data-attachments-list]')!.replaceChildren(...files.map(file => {
      const item = document.createElement('li'); item.append(attachmentLink(file), textElement('span', `${Math.ceil(file.size / 1024)} KB`)); return item;
    }));
    const { entries } = await api<{ entries: DiaryEntry[] }>('/entries');
    if (!isCurrent()) return;
    const index = entries.findIndex(item => item.slug === slug); const neighbours = $('[data-entry-neighbours]')!;
    neighbours.replaceChildren();
    for (const [offset, label] of [[1, '← Earlier entry'], [-1, 'Later entry →']] as const) {
      const next = entries[index + offset]; if (!next) continue;
      const link = document.createElement('a'); link.href = `/diary/${next.slug}/`;
      link.append(textElement('span', label, 'eyebrow'), textElement('strong', next.title)); neighbours.append(link);
    }
  }
  function clear() {
    for (const selector of ['[data-entry-list]', '[data-entry-body]', '[data-entry-title]', '[data-entry-summary]', '[data-entry-month]', '[data-entry-tags]', '[data-entry-reading]', '[data-entry-updated]', '[data-attachments-list]', '[data-entry-neighbours]']) $(selector)?.replaceChildren();
    message('[data-page-message]', ''); message('[data-entry-count]', '');
  }
  void initialiseAccess({ onUser: kind === 'archive' ? showArchive : showEntry, onClear: clear });
  if (kind === 'archive') {
    void api<{ entries: { slug: string; month: string; title: string; teaser: string }[] }>('/public').then(({ entries }) => {
      const list = $('[data-preview-list]')!;
      list.replaceChildren(...entries.map(entry => card({ ...entry, summary: entry.teaser, tags: [] }, false)));
      $('[data-public-previews]')!.hidden = !entries.length || !$('[data-private-area]')!.hidden;
    }).catch(() => { /* Public introduction remains useful while the service is unavailable. */ });
  }
} else if (page?.dataset.mirror === 'true' && kind === 'entry') location.replace('https://frankenendu.link/diary/');
