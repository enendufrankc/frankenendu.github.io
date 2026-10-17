import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateMentalModel } from '../shared/mental-model.mjs';

const node = (state = 'documented') => ({ title: 'Example component', detail: 'Fictional explanatory detail.', state });
const model = () => ({
  kind: 'mixed', caption: 'A fictional model.',
  stages: ['Input', 'Process', 'Output'].map((label, index) => ({ label, nodes: [node(['documented', 'proposed', 'unverified'][index])] })),
  feedback: 'Review the result.',
});

test('missing mental models remain compatible and all supported model kinds round-trip', () => {
  assert.equal(validateMentalModel(undefined), null);
  assert.equal(validateMentalModel(null), null);
  for (const kind of ['documented', 'conceptual', 'mixed']) {
    const value = { ...model(), kind };
    assert.deepEqual(validateMentalModel(value), value);
  }
  const withoutFeedback = model(); delete withoutFeedback.feedback;
  assert.deepEqual(validateMentalModel(withoutFeedback), withoutFeedback);
  assert.equal(validateMentalModel({ ...model(), feedback: '   ' }).feedback, '');
});

test('validation trims text and returns only allowlisted fields without mutating input', () => {
  const input = model();
  input.caption = '  A fictional model.  '; input.feedback = '  Review the result.  ';
  input.extra = { private: 'discard this' }; input.stages[0].extra = true; input.stages[0].label = ' Input ';
  input.stages[0].nodes[0] = { ...node(), title: ' Example component ', detail: ' Fictional explanatory detail. ', unexpected: 'drop' };
  const original = structuredClone(input), result = validateMentalModel(input);
  assert.deepEqual(result, model()); assert.deepEqual(input, original);
  assert.notEqual(result.stages, input.stages);
});

test('mental models enforce required fields, supported states, and plain serializable objects', () => {
  const circular = model(); circular.extra = circular;
  for (const value of [false, 7, '', 'null', [], {}, new Date(), circular, { ...model(), extra: 1n }, { ...model(), extra: () => {} },
    { ...model(), extra: NaN }, { ...model(), caption: null }, { ...model(), caption: '   ' }, { ...model(), kind: 'proposal' },
    { ...model(), feedback: null }, { ...model(), stages: {} },
  ]) assert.throws(() => validateMentalModel(value), Error);
  for (const override of [{ label: '' }, { label: 2 }, { nodes: [] }, { nodes: {} }, { nodes: [null] },
    { nodes: [{ ...node(), state: 'verified' }] }, { nodes: [{ ...node(), title: '' }] },
    { nodes: [{ ...node(), detail: ' ' }] }, { nodes: [{ title: 'Missing detail', state: 'documented' }] },
  ]) {
    const value = model(); Object.assign(value.stages[0], override);
    assert.throws(() => validateMentalModel(value), Error);
  }
  const controlCharacter = model(); controlCharacter.stages[0].nodes[0].detail = 'bad\u0000detail';
  assert.throws(() => validateMentalModel(controlCharacter), Error);
});

test('stage and node limits include their boundaries and cap the model at twelve nodes', () => {
  for (const count of [2, 6]) assert.throws(() => validateMentalModel({ ...model(), stages: Array.from({ length: count }, () => ({ label: 'Stage', nodes: [node()] })) }));
  for (const count of [3, 4, 5]) assert.equal(validateMentalModel({ ...model(), stages: Array.from({ length: count }, () => ({ label: 'Stage', nodes: [node()] })) }).stages.length, count);
  const value = model(); value.stages[0].nodes = Array.from({ length: 4 }, () => node());
  assert.throws(() => validateMentalModel(value));
  value.stages = Array.from({ length: 4 }, () => ({ label: 'Stage', nodes: Array.from({ length: 3 }, () => node()) }));
  assert.equal(validateMentalModel(value).stages.flatMap(stage => stage.nodes).length, 12);
  value.stages.push({ label: 'Extra stage', nodes: [node()] });
  assert.throws(() => validateMentalModel(value));
});

test('text limits accept exact boundaries and reject excessive text without exposing input', () => {
  for (const [path, limit] of [[['caption'], 500], [['feedback'], 300], [['stages', 0, 'label'], 60], [['stages', 0, 'nodes', 0, 'title'], 90], [['stages', 0, 'nodes', 0, 'detail'], 240]]) {
    const value = model(), parent = path.slice(0, -1).reduce((object, key) => object[key], value), key = path.at(-1);
    parent[key] = 'x'.repeat(limit); assert.deepEqual(validateMentalModel(value), value);
    parent[key] = `  ${'x'.repeat(limit)}  `;
    assert.equal(path.reduce((object, key) => object[key], validateMentalModel(value)), 'x'.repeat(limit));
    parent[key] = 'x'.repeat(limit + 1); assert.throws(() => validateMentalModel(value), error => !error.message.includes(parent[key]));
  }
});
