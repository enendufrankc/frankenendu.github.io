import { $, api, formatDate, formatMonth, initialiseAccess, message, textElement, type DiaryEntry, type DiaryUser } from './diary-client';

export interface ProjectSummary {
  slug: string; title: string; summary: string; area: string; stage: string;
  contributors: string[]; aliases: string[]; evidenceDate: string; updatedAt: string;
  readingMinutes: number; status?: 'draft' | 'published'; guideVisibility?: 'owner' | 'readers';
}
export interface ProjectDetail extends ProjectSummary {
  overviewHtml: string; guideHtml?: string; guideAvailable: boolean; sourceNotes?: string;
  relatedProjects: ProjectSummary[]; entries: DiaryEntry[];
}
export interface EditableProject extends ProjectSummary {
  overviewMarkdown: string; guideMarkdown: string; sourceNotes: string; relatedSlugs: string[]; months: string[];
  status: 'draft' | 'published'; guideVisibility: 'owner' | 'readers';
}
const page = $('[data-project-page]');
const kind = page?.dataset.projectPage;
if (page && page.dataset.mirror !== 'true' && (kind === 'library' || kind === 'detail')) {
  let projects: ProjectSummary[] = [];
  function projectLink(project: ProjectSummary, className = '') {
    const link = document.createElement('a'); link.href = `/diary/projects/${project.slug}/`; link.className = className;
    link.append(textElement('span', project.area, 'eyebrow'), textElement('h3', project.title), textElement('p', project.summary)); return link;
  }
  function renderLibrary() {
    const form = $<HTMLFormElement>('[data-project-filters]')!;
    const values = new FormData(form); const query = String(values.get('q') || '').toLowerCase().trim();
    const visible = projects.filter(project => (!values.get('area') || project.area === values.get('area')) && (!values.get('stage') || project.stage === values.get('stage')) && (!query || [project.title, project.summary, ...project.aliases, ...project.contributors].join(' ').toLowerCase().includes(query)));
    $('[data-project-list]')!.replaceChildren(...visible.map((project, i) => {
      const article = document.createElement('article'); article.className = 'project-library-card';
      const top = document.createElement('div'); top.className = 'project-card-number'; top.append(textElement('span', String(i + 1).padStart(2, '0')), textElement('span', project.status === 'draft' ? 'Owner draft' : 'Project notes', 'diary-badge'));
      article.append(top, projectLink(project));
      const bottom = document.createElement('div'); bottom.className = 'project-card-foot'; bottom.append(textElement('span', project.stage), textElement('span', 'Explore topic ↗')); article.append(bottom); return article;
    }));
    message('[data-project-count]', `${visible.length} of ${projects.length} topics`); $('[data-project-empty]')!.hidden = visible.length !== 0;
  }
  async function library(_user: DiaryUser, isCurrent: () => boolean) {
    const result = await api<{ projects: ProjectSummary[] }>('/projects'); if (!isCurrent()) return;
    projects = result.projects.sort((a, b) => a.title.localeCompare(b.title));
    const programmes = projects.filter(project => project.area === 'Programmes');
    $('[data-programme-section]')!.hidden = !programmes.length;
    $('[data-programme-list]')!.replaceChildren(...programmes.map(project => {
      const link = projectLink(project, 'programme-card');
      link.append(textElement('span', 'Explore the programme ↗', 'text-link'));
      return link;
    }));
    for (const key of ['area', 'stage'] as const) {
      const select = $<HTMLSelectElement>(`#project-${key}`)!;
      select.replaceChildren(new Option(`All ${key === 'area' ? 'areas' : 'stages'}`, ''), ...[...new Set(projects.map(p => p[key]))].sort().map(value => new Option(value, value)));
    }
    renderLibrary();
  }
  async function detail(user: DiaryUser, isCurrent: () => boolean) {
    const slug = location.pathname.match(/^\/diary\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)?.[1];
    if (!slug) { message('[data-page-message]', 'Choose a topic from the project library.'); return; }
    const { project } = await api<{ project: ProjectDetail }>(`/projects/${slug}`); if (!isCurrent()) return;
    const editLink = $<HTMLAnchorElement>('[data-owner-link]');
    if (editLink && user.role === 'owner') { editLink.href = `/diary/admin/projects/?topic=${slug}`; editLink.textContent = 'Edit this topic ↗'; }
    $('[data-project-programmes]')!.replaceChildren(...project.relatedProjects.filter(item => item.area === 'Programmes').map(item => {
      const link = document.createElement('a'); link.href = `/diary/projects/${item.slug}/`; link.textContent = `Part of ${item.title} ↗`; return link;
    }));
    message('[data-project-title]', project.title); message('[data-project-summary]', project.summary);
    message('[data-project-area]', project.area); message('[data-project-stage]', project.stage);
    message('[data-project-evidence]', `Evidence through ${project.evidenceDate}`); message('[data-project-reading]', `${project.readingMinutes} min read`);
    message('[data-project-updated]', `Updated ${formatDate(project.updatedAt)}`);
    message('[data-project-contributors]', project.contributors.length ? `Documented contributors · ${project.contributors.join(', ')}` : 'Individual contribution still to verify.');
    const publication = $('[data-project-publication]')!; publication.hidden = user.role !== 'owner'; publication.textContent = project.status === 'published' ? 'Shared with invited readers' : 'Owner draft';
    $('[data-project-overview]')!.innerHTML = project.overviewHtml;
    $('[data-guide-section]')!.hidden = !project.guideAvailable; $('[data-guide-nav]')!.hidden = !project.guideAvailable;
    $('[data-project-guide]')!.innerHTML = project.guideHtml || '';
    message('[data-guide-visibility]', user.role === 'owner' && project.guideVisibility !== 'readers' ? 'Owner only' : 'Invited readers');
    const outline = $('[data-project-outline]')!; outline.replaceChildren();
    const sections = project.guideAvailable ? ['overview', 'guide'] : ['overview'];
    for (const section of sections) {
      const container = $(`[data-project-${section}]`)!;
      container.querySelectorAll('h2').forEach((heading, i) => {
        heading.id = `topic-${section}-${i + 1}`; const link = document.createElement('a'); link.href = `#${heading.id}`; link.textContent = heading.textContent; outline.append(link);
      });
    }
    const months = $('[data-project-months]')!; months.replaceChildren(...project.entries.map(entry => {
      const link = document.createElement('a'); link.className = 'project-month-link'; link.href = `/diary/${entry.slug}/`; link.append(textElement('span', formatMonth(entry.month), 'eyebrow'), textElement('strong', entry.title), textElement('span', 'Read the update ↗')); return link;
    }));
    if (!project.entries.length) months.append(textElement('p', 'No monthly update has been linked to this topic yet.', 'form-help'));
    $('[data-project-related]')!.replaceChildren(...project.relatedProjects.map(project => projectLink(project, 'project-related-link'))); $('[data-project-related-section]')!.hidden = !project.relatedProjects.length;
    message('[data-project-sources]', project.sourceNotes || ''); $('[data-project-sources-section]')!.hidden = user.role !== 'owner' || !project.sourceNotes;
  }
  $('[data-project-filters]')?.addEventListener('submit', event => event.preventDefault());
  $('[data-project-filters]')?.addEventListener('input', renderLibrary);
  // Native reset restores controls after the event and its microtasks finish.
  $('[data-project-filters]')?.addEventListener('reset', () => setTimeout(renderLibrary, 0));
  void initialiseAccess({ onUser: kind === 'library' ? library : detail, onClear() {
    projects = [];
    const editLink = $<HTMLAnchorElement>('[data-owner-link]');
    if (editLink) { editLink.href = '/diary/admin/projects/'; editLink.textContent = 'Edit project library ↗'; }
    $('[data-programme-list]')?.replaceChildren(); $('[data-project-programmes]')?.replaceChildren();
    if ($('[data-programme-section]')) $('[data-programme-section]')!.hidden = true;
    for (const selector of ['[data-project-list]', '[data-project-count]', '[data-project-title]', '[data-project-summary]', '[data-project-area]', '[data-project-stage]', '[data-project-publication]', '[data-project-evidence]', '[data-project-reading]', '[data-project-updated]', '[data-project-contributors]', '[data-project-overview]', '[data-project-guide]', '[data-project-outline]', '[data-project-months]', '[data-project-related]', '[data-project-sources]']) $(selector)?.replaceChildren();
    $<HTMLFormElement>('[data-project-filters]')?.reset();
    for (const key of ['area', 'stage']) $<HTMLSelectElement>(`#project-${key}`)?.replaceChildren(new Option(`All ${key === 'area' ? 'areas' : 'stages'}`, ''));
    message('[data-page-message]', '');
  } });
} else if (page?.dataset.mirror === 'true') location.replace('https://frankenendu.link/diary/projects/');
