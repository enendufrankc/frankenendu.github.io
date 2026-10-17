import { $, api, attachmentLink, busy, formatDate, formatMonth, initialiseAccess, message, textElement, type Attachment, type DiaryEntry } from './diary-client';

interface Invitation { id: string; email: string; name: string; expiresAt: string; createdAt: string; revokedAt: string | null; }
const page = $('[data-diary-page="admin"]');
const TEMPLATE = `## The month in a paragraph\n\nWhat changed, and why did it matter?\n\n## My contribution\n\nWhat did I personally build, decide or improve? Credit the people involved.\n\n## Across R&D\n\nWhich team developments connect to this work?\n\n## One decision worth exploring\n\nThe problem, options, trade-offs and decision.\n\n## What the evidence says\n\nDated observations, results and their limitations.\n\n## What I learned\n\nWhat will I carry forward or do differently?\n\n## Looking ahead\n\nQuestions and intentions for next month.\n`;

function localDate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
if (page && page.dataset.mirror !== 'true') {
  let entries: DiaryEntry[] = []; let invitations: Invitation[] = [];
  let selected: DiaryEntry | null = null; let dirty = false; let live = false; let viewGeneration = 0; let sessionGeneration = 0;
  const editor = $<HTMLFormElement>('[data-editor-form]')!;
  const inviteForm = $<HTMLFormElement>('[data-invitation-form]')!;
  const field = <T extends HTMLInputElement | HTMLTextAreaElement>(name: string) => editor.elements.namedItem(name) as T;
  function setExpiryDefault() {
    const input = $<HTMLInputElement>('#reader-expiry')!;
    input.value = localDate(new Date(Date.now() + 7 * 86_400_000)); input.min = localDate(new Date(Date.now() + 60_000));
  }
  function acceptDiscard() { return !dirty || window.confirm('Discard the unsaved changes to this entry?'); }
  function openEntry(entry: DiaryEntry | null) {
    if (!acceptDiscard()) return;
    selected = entry; dirty = false; viewGeneration++;
    editor.reset();
    field('month').value = entry?.month || new Date().toISOString().slice(0, 7);
    field<HTMLInputElement>('month').readOnly = !!entry;
    field('title').value = entry?.title || '';
    field('summary').value = entry?.summary || '';
    field('tags').value = entry?.tags.join(', ') || '';
    field('markdown').value = entry?.markdown || TEMPLATE;
    field<HTMLInputElement>('publicTeaser').checked = !!entry?.publicTeaser;
    field('teaser').value = entry?.teaser || '';
    message('[data-editor-heading]', entry ? formatMonth(entry.month) : 'Start the next chapter.');
    message('[data-editor-status]', entry?.status === 'published' ? 'Published' : 'Draft');
    $('[data-unpublish-entry]')!.hidden = entry?.status !== 'published';
    $('[data-publish-entry]')!.hidden = entry?.status === 'published';
    message('[data-save-draft]', entry?.status === 'published' ? 'Save changes' : 'Save draft');
    $('[data-upload-area]')!.hidden = !entry;
    $('[data-editor-preview]')!.hidden = true; $('[data-preview-body]')!.replaceChildren();
    $('[data-upload-list]')!.replaceChildren();
    message('[data-editor-message]', ''); message('[data-upload-message]', '');
    if (entry) void loadAttachments(entry.slug);
    renderDrafts();
  }
  function renderDrafts() {
    const list = $('[data-drafts-list]')!;
    list.replaceChildren(...entries.map(entry => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'diary-draft-item';
      button.classList.toggle('is-active', selected?.slug === entry.slug);
      button.append(textElement('span', formatMonth(entry.month), 'eyebrow'), textElement('strong', entry.title), textElement('span', entry.status === 'published' ? 'Published' : 'Draft', 'diary-badge'));
      button.addEventListener('click', () => openEntry(entry)); return button;
    }));
    if (!entries.length) list.append(textElement('p', 'Your first entry starts here.', 'diary-empty'));
  }
  async function loadEntries() {
    const current = sessionGeneration;
    const result = await api<{ entries: DiaryEntry[] }>('/admin/entries');
    if (!live || current !== sessionGeneration) return; entries = result.entries; renderDrafts();
  }
  async function save(status: 'draft' | 'published') {
    if (!editor.reportValidity()) return;
    const publicTeaser = field<HTMLInputElement>('publicTeaser').checked;
    if (publicTeaser && !field('teaser').value.trim()) { message('[data-editor-message]', 'Write a public teaser, or leave the public preview switched off.', true); return; }
    const current = viewGeneration;
    await busy(editor, async () => {
      message('[data-editor-message]', 'Saving…');
      const month = field('month').value;
      const payload = { slug: selected?.slug || month, month, title: field('title').value.trim(), summary: field('summary').value.trim(), tags: field('tags').value.split(',').map(tag => tag.trim()).filter(Boolean), markdown: field('markdown').value, status, publicTeaser, teaser: field('teaser').value.trim() };
      try {
        const result = await api<{ entry: DiaryEntry }>(selected ? `/admin/entries/${selected.slug}` : '/admin/entries', { method: selected ? 'PUT' : 'POST', body: JSON.stringify(payload) });
        if (!live || current !== viewGeneration) return; dirty = false;
        const saved = { ...payload, ...result.entry };
        await loadEntries(); if (!live || current !== viewGeneration) return; openEntry(saved);
        message('[data-editor-message]', status === 'published' ? 'Saved and available to invited readers.' : 'Draft saved. Only you can see it.');
      } catch (error) { if (live) message('[data-editor-message]', (error as Error).message, true); }
    }, true);
  }
  async function loadAttachments(slug: string) {
    const current = viewGeneration;
    try {
      const { entry } = await api<{ entry: DiaryEntry }>(`/entries/${slug}`);
      if (!live || current !== viewGeneration) return;
      $('[data-upload-list]')!.replaceChildren(...(entry.attachments || []).map(file => {
        const item = document.createElement('li'); item.append(attachmentLink(file));
        const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'diary-text-button'; copy.textContent = 'Insert in entry';
        copy.addEventListener('click', () => {
          if (editor.getAttribute('aria-busy') === 'true') return;
          const input = field<HTMLTextAreaElement>('markdown');
          const safeName = file.name.replace(/[\[\]\\]/g, '');
          const markdown = `${file.type.startsWith('image/') ? '!' : ''}[${safeName}](${file.url})`;
          input.setRangeText(`\n${markdown}\n`, input.selectionStart, input.selectionEnd, 'end'); dirty = true; input.focus();
          message('[data-upload-message]', 'Added to the entry. Save your changes to keep it.');
        }); item.append(copy); return item;
      }));
    } catch (error) { if (live) message('[data-upload-message]', (error as Error).message, true); }
  }
  function renderInvitations() {
    message('[data-reader-count]', `${invitations.length} ${invitations.length === 1 ? 'invitation' : 'invitations'}`);
    $('[data-invitations-list]')!.replaceChildren(...invitations.map(invitation => {
      const expired = new Date(invitation.expiresAt).getTime() <= Date.now();
      const article = document.createElement('article'); article.className = 'diary-invitation';
      const who = document.createElement('div'); who.append(textElement('h3', invitation.name || invitation.email));
      if (invitation.name) who.append(textElement('p', invitation.email));
      who.append(textElement('span', invitation.revokedAt ? 'Revoked' : expired ? 'Expired' : 'Active', 'diary-badge'));
      const dates = document.createElement('div'); dates.append(textElement('span', 'Access ends', 'eyebrow'), textElement('p', formatDate(invitation.expiresAt)));
      article.append(who, dates);
      if (!invitation.revokedAt) {
        const form = document.createElement('form'); form.className = 'diary-extend-form';
        const label = document.createElement('label'); label.htmlFor = `expiry-${invitation.id}`; label.textContent = 'New expiry';
        const input = document.createElement('input'); input.type = 'datetime-local'; input.id = label.htmlFor; input.name = 'expiresAt'; input.required = true;
        input.min = localDate(new Date(Date.now() + 60_000)); input.value = localDate(new Date(Math.max(new Date(invitation.expiresAt).getTime(), Date.now()) + 7 * 86_400_000));
        const saveButton = document.createElement('button'); saveButton.type = 'submit'; saveButton.className = 'button button-ghost'; saveButton.textContent = 'Update expiry';
        const revoke = document.createElement('button'); revoke.type = 'button'; revoke.className = 'diary-text-button diary-danger'; revoke.textContent = 'Revoke access';
        const feedback = textElement('p', '', 'diary-message'); feedback.setAttribute('role', 'status');
        const update = (payload: object) => busy(form, async () => {
          feedback.textContent = 'Updating…';
          try { await api(`/admin/invitations/${invitation.id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await loadInvitations(); }
          catch (error) { if (live) { feedback.textContent = (error as Error).message; feedback.classList.add('is-error'); } }
        });
        form.addEventListener('submit', event => { event.preventDefault(); void update({ expiresAt: new Date(input.value).toISOString() }); });
        revoke.addEventListener('click', () => { void update({ revoke: true }); });
        form.append(label, input, saveButton, revoke, feedback); article.append(form);
      } else article.append(textElement('p', 'Send a new invitation to grant access again.', 'form-help'));
      return article;
    }));
    if (!invitations.length) $('[data-invitations-list]')!.append(textElement('p', 'No invitations yet. Start with someone you’d like to share the work with.', 'diary-empty'));
  }
  async function loadInvitations() {
    const current = sessionGeneration;
    const result = await api<{ invitations: Invitation[] }>('/admin/invitations');
    if (!live || current !== sessionGeneration) return; invitations = result.invitations; renderInvitations();
  }
  editor.addEventListener('input', () => { dirty = true; });
  editor.addEventListener('submit', event => { event.preventDefault(); void save(selected?.status === 'published' ? 'published' : 'draft'); });
  $('[data-new-entry]')!.addEventListener('click', () => openEntry(null));
  $('[data-publish-entry]')!.addEventListener('click', () => { void save('published'); });
  $('[data-unpublish-entry]')!.addEventListener('click', () => { void save('draft'); });
  $('[data-preview-entry]')!.addEventListener('click', () => {
    const current = viewGeneration;
    void busy(editor, async () => {
      try {
        const result = await api<{ html: string }>('/admin/preview', { method: 'POST', body: JSON.stringify({ markdown: field('markdown').value }) });
        if (!live || current !== viewGeneration) return;
        $('[data-preview-body]')!.innerHTML = result.html; $('[data-editor-preview]')!.hidden = false;
        $('[data-editor-preview]')!.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      } catch (error) { if (live) message('[data-editor-message]', (error as Error).message, true); }
    });
  });
  $('[data-close-preview]')!.addEventListener('click', () => { $('[data-editor-preview]')!.hidden = true; });
  const uploadForm = $<HTMLFormElement>('[data-upload-form]')!;
  uploadForm.addEventListener('submit', event => {
    event.preventDefault(); const file = $<HTMLInputElement>('#entry-attachment')!.files?.[0]; const slug = selected?.slug;
    if (!file || !slug) return;
    if (file.size > 10 * 1024 * 1024) { message('[data-upload-message]', 'Choose a file smaller than 10 MB.', true); return; }
    const current = viewGeneration;
    void busy(uploadForm, async () => {
      message('[data-upload-message]', 'Uploading…');
      try {
        await api<{ attachment: Attachment }>(`/admin/entries/${slug}/attachments`, { method: 'POST', headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) }, body: file });
        if (!live || current !== viewGeneration) return; uploadForm.reset(); await loadAttachments(slug); if (!live || current !== viewGeneration) return; message('[data-upload-message]', 'Attachment uploaded. It is available only to authorised readers of this entry.');
      } catch (error) { if (live) message('[data-upload-message]', (error as Error).message, true); }
    });
  });
  inviteForm.addEventListener('submit', event => {
    event.preventDefault(); const values = new FormData(inviteForm); const current = sessionGeneration;
    void busy(inviteForm, async () => {
      message('[data-invitation-message]', 'Creating the invitation…');
      try {
        const result = await api<{ invitation: Invitation; mailSent: boolean }>('/admin/invitations', { method: 'POST', body: JSON.stringify({ email: String(values.get('email')).trim(), name: String(values.get('name')).trim(), expiresAt: new Date(String(values.get('expiresAt'))).toISOString() }) });
        if (!live || current !== sessionGeneration) return; inviteForm.reset(); setExpiryDefault(); await loadInvitations(); if (!live || current !== sessionGeneration) return;
        message('[data-invitation-message]', result.mailSent ? 'Invitation sent. They can verify their email and start reading.' : 'Access was granted, but the invitation email could not be sent. Share the diary URL with this reader.', !result.mailSent);
      } catch (error) { if (live) message('[data-invitation-message]', (error as Error).message, true); }
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-admin-tab]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll<HTMLElement>('[data-admin-panel]').forEach(panel => { panel.hidden = panel.dataset.adminPanel !== button.dataset.adminTab; });
      document.querySelectorAll<HTMLButtonElement>('[data-admin-tab]').forEach(tab => { tab.classList.toggle('is-active', tab === button); tab.setAttribute('aria-pressed', String(tab === button)); });
    });
  });
  window.addEventListener('beforeunload', event => { if (dirty && live) { event.preventDefault(); event.returnValue = ''; } });
  void initialiseAccess({ ownerOnly: true, async onUser(_user, isCurrent) {
    sessionGeneration++; live = true; await Promise.all([loadEntries(), loadInvitations()]);
    if (isCurrent()) { openEntry(entries[0] || null); setExpiryDefault(); }
  }, onClear() {
    sessionGeneration++; live = false; dirty = false; viewGeneration++; entries = []; invitations = []; selected = null; editor.reset(); inviteForm.reset(); uploadForm.reset();
    for (const selector of ['[data-drafts-list]', '[data-invitations-list]', '[data-preview-body]', '[data-upload-list]']) $(selector)?.replaceChildren();
    for (const selector of ['[data-editor-message]', '[data-upload-message]', '[data-invitation-message]', '[data-editor-heading]', '[data-editor-status]', '[data-reader-count]']) message(selector, '');
  } });
} else if (page) location.replace('https://frankenendu.link/diary/admin/');
