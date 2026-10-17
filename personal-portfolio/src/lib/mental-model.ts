import type { MentalModel } from '../../shared/mental-model.mjs';

const STATE = { documented: 'Documented', proposed: 'Proposed', unverified: 'To verify' } as const;
const KIND = { documented: 'Documented flow', conceptual: 'Conceptual model', mixed: 'Current work + next steps' } as const;
function element<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = '') {
  const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
}

/** All model text is private data, rendered as text rather than executable markup. */
export function renderMentalModel(model: MentalModel): HTMLElement {
  const figure = element('figure', '', 'mental-model');
  const caption = element('figcaption', '', 'mental-model-caption');
  caption.append(element('span', KIND[model.kind], 'mental-model-kind'), element('p', model.caption));
  figure.append(caption);
  const stages = element('ol', '', 'mental-model-stages');
  stages.style.setProperty('--model-stages', String(model.stages.length));
  for (const [index, stage] of model.stages.entries()) {
    const item = element('li', '', 'mental-model-stage');
    item.append(element('h3', `${String(index + 1).padStart(2, '0')} / ${stage.label}`, 'mental-model-stage-label'));
    const nodes = element('ul', '', 'mental-model-nodes');
    for (const node of stage.nodes) {
      const card = element('li', '', `mental-model-node mental-model-${node.state}`);
      card.append(element('span', STATE[node.state], 'mental-model-state'), element('h4', node.title), element('p', node.detail));
      nodes.append(card);
    }
    item.append(nodes); stages.append(item);
  }
  figure.append(stages);
  if (model.feedback) {
    const feedback = element('div', '', 'mental-model-feedback');
    const arrow = element('span', '↶', 'mental-model-return'); arrow.setAttribute('aria-hidden', 'true');
    feedback.append(arrow, element('p', model.feedback)); figure.append(feedback);
  }
  return figure;
}
