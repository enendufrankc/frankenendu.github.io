import { $, api, busy, formatMonth, initialiseAccess, message, textElement, type DiaryEntry } from './diary-client';
import type { EditableProject } from './diary-projects';

const page = $('[data-project-page="admin"]');
const OVERVIEW = '## Core idea\n\n## Who it helps and why\n\n## What exists today\n\n## My contribution and team context\n\n## How it connects\n';
const GUIDE = '> A proposed fresh-start plan. Distinguish documented behaviour from design choices still to verify.\n\n## Before starting\n\n## Inputs and data contracts\n\n## Architecture and boundaries\n\n## Build it from scratch\n\n## Evaluation and acceptance\n\n## Deployment and operation\n\n## Open questions\n';
if (page && page.dataset.mirror !== 'true') {
  const editor = $<HTMLFormElement>('[data-project-editor]')!;
  const field = <T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(name: string) => editor.elements.namedItem(name) as T;
  let projects: EditableProject[] = [], months: DiaryEntry[] = [], selected: EditableProject | null = null;
  let live = false, dirty = false, slugEdited = false, generation = 0, view = 0;
  const currentView = () => { const session = generation, revision = view; return () => live && session === generation && revision === view; };
  function renderList() {
    const query = $<HTMLInputElement>('#author-project-search')!.value.trim().toLowerCase();
    const visible = projects.filter(p => [p.title, ...p.aliases].join(' ').toLowerCase().includes(query));
    message('[data-author-project-count]', `${visible.length} of ${projects.length} topics`);
    $('[data-author-project-list]')!.replaceChildren(...visible.map(project => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'diary-draft-item'; button.classList.toggle('is-active', selected?.slug === project.slug);
      button.append(textElement('span', project.area, 'eyebrow'), textElement('strong', project.title), textElement('span', project.status === 'published' ? 'Published overview' : 'Owner draft', 'diary-badge'));
      button.addEventListener('click', () => open(project)); return button;
    }));
  }
  function open(project: EditableProject | null) {
    if (editor.getAttribute('aria-busy') === 'true' || (dirty && !confirm('Discard unsaved changes to this project?'))) return;
    selected = project; dirty = false; slugEdited = false; view++; editor.reset();
    for (const key of ['slug', 'title', 'summary', 'area', 'stage', 'sourceNotes']) field(key).value = String(project?.[key as keyof EditableProject] || '');
    field<HTMLInputElement>('slug').readOnly = !!project;
    field('contributors').value = project?.contributors.join('\n') || ''; field('aliases').value = project?.aliases.join('\n') || '';
    field('evidenceDate').value = project?.evidenceDate || new Date().toISOString().slice(0, 10);
    field('overviewMarkdown').value = project?.overviewMarkdown || OVERVIEW; field('guideMarkdown').value = project?.guideMarkdown || GUIDE;
    field('guideVisibility').value = project?.guideVisibility || 'owner';
    const relationSelect = field<HTMLSelectElement>('relatedSlugs'); relationSelect.replaceChildren(...projects.filter(p => p.slug !== project?.slug).map(p => new Option(p.title, p.slug, false, project?.relatedSlugs.includes(p.slug))));
    field<HTMLSelectElement>('months').replaceChildren(...months.map(entry => new Option(`${formatMonth(entry.month)} — ${entry.title}`, entry.slug, false, project?.months.includes(entry.slug))));
    message('[data-project-editor-heading]', project?.title || 'New project topic'); message('[data-project-editor-status]', project?.status === 'published' ? 'Published overview' : 'Owner draft');
    message('[data-project-save]', project?.status === 'published' ? 'Save changes' : 'Save draft');
    $('[data-project-publish]')!.hidden = project?.status === 'published'; $('[data-project-unpublish]')!.hidden = project?.status !== 'published';
    const readLink = $<HTMLAnchorElement>('[data-project-read-link]')!; readLink.hidden = !project; if (project) readLink.href = `/diary/projects/${project.slug}/`;
    $('[data-project-preview]')!.hidden = true; $('[data-project-preview-body]')!.replaceChildren(); message('[data-project-editor-message]', ''); renderList();
  }
  async function save(status: 'draft' | 'published') {
    if (!editor.reportValidity()) return;
    const valid = currentView(); let saved: EditableProject | null = null;
    await busy(editor, async () => {
      const lines = (name: string) => field(name).value.split('\n').map(v => v.trim()).filter(Boolean);
      const payload = { slug: field('slug').value, title: field('title').value.trim(), summary: field('summary').value.trim(), area: field('area').value.trim(), stage: field('stage').value.trim(), contributors: lines('contributors'), aliases: lines('aliases'), evidenceDate: field('evidenceDate').value, overviewMarkdown: field('overviewMarkdown').value, guideMarkdown: field('guideMarkdown').value, sourceNotes: field('sourceNotes').value, relatedSlugs: Array.from(field<HTMLSelectElement>('relatedSlugs').selectedOptions, option => option.value), months: Array.from(field<HTMLSelectElement>('months').selectedOptions, option => option.value), status, guideVisibility: field('guideVisibility').value };
      message('[data-project-editor-message]', 'Saving…');
      try {
        const response = await api<{ project: EditableProject }>(selected ? `/admin/projects/${selected.slug}` : '/admin/projects', { method: selected ? 'PUT' : 'POST', body: JSON.stringify(payload) });
        if (!valid()) return;
        saved = response.project; projects = [...projects.filter(p => p.slug !== saved!.slug), saved].sort((a, b) => a.title.localeCompare(b.title)); dirty = false;
      } catch (error) { if (valid()) message('[data-project-editor-message]', (error as Error).message, true); }
    }, true);
    if (saved && valid()) { open(saved); message('[data-project-editor-message]', status === 'published' ? 'Overview published. The build guide follows its separate access setting.' : 'Draft saved. This project is visible only to you.'); }
  }
  async function preview(name: 'overviewMarkdown' | 'guideMarkdown') {
    const valid = currentView();
    await busy(editor, async () => {
      try {
        const response = await api<{ html: string }>('/admin/preview', { method: 'POST', body: JSON.stringify({ markdown: field(name).value }) });
        if (!valid()) return;
        message('[data-project-preview-title]', name === 'overviewMarkdown' ? 'Overview preview' : 'Build guide preview'); $('[data-project-preview-body]')!.innerHTML = response.html; $('[data-project-preview]')!.hidden = false;
        $('[data-project-preview]')!.scrollIntoView({ block: 'start', behavior: 'instant' });
      } catch (error) { if (valid()) message('[data-project-editor-message]', (error as Error).message, true); }
    }, true);
  }
  editor.addEventListener('input', () => { dirty = true; });
  field('slug').addEventListener('input', () => { slugEdited = true; });
  field('title').addEventListener('input', () => { if (!selected && !slugEdited) field('slug').value = field('title').value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, ''); });
  editor.addEventListener('submit', event => { event.preventDefault(); void save(selected?.status || 'draft'); });
  $('[data-project-publish]')!.addEventListener('click', () => { void save('published'); });
  $('[data-project-unpublish]')!.addEventListener('click', () => { void save('draft'); });
  $('[data-new-project]')!.addEventListener('click', () => open(null));
  $('[data-preview-overview]')!.addEventListener('click', () => { void preview('overviewMarkdown'); });
  $('[data-preview-guide]')!.addEventListener('click', () => { void preview('guideMarkdown'); });
  $('[data-project-close-preview]')!.addEventListener('click', () => { $('[data-project-preview]')!.hidden = true; });
  $('#author-project-search')!.addEventListener('input', renderList);
  window.addEventListener('beforeunload', event => { if (dirty && live) { event.preventDefault(); event.returnValue = ''; } });
  void initialiseAccess({ ownerOnly: true, async onUser(_user, isCurrent) {
    generation++; live = true;
    const [library, entries] = await Promise.all([api<{ projects: EditableProject[] }>('/admin/projects'), api<{ entries: DiaryEntry[] }>('/admin/entries')]);
    if (!isCurrent()) return;
    projects = library.projects.sort((a, b) => a.title.localeCompare(b.title)); months = entries.entries;
    const requested = new URLSearchParams(location.search).get('topic');
    open(projects.find(project => project.slug === requested) || projects[0] || null);
  }, onClear() {
    generation++; view++; live = false; dirty = false; selected = null; projects = []; months = []; editor.reset();
    field<HTMLSelectElement>('relatedSlugs').replaceChildren(); field<HTMLSelectElement>('months').replaceChildren();
    for (const selector of ['[data-author-project-list]', '[data-project-editor-heading]', '[data-project-editor-status]', '[data-project-preview-body]', '[data-project-editor-message]', '[data-author-project-count]']) $(selector)?.replaceChildren();
    const link = $<HTMLAnchorElement>('[data-project-read-link]')!; link.removeAttribute('href'); link.hidden = true;
    $<HTMLInputElement>('#author-project-search')!.value = ''; message('[data-page-message]', '');
  } });
} else if (page) location.replace('https://frankenendu.link/diary/admin/projects/');
