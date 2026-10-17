/** Data-only diagrams, shared by the protected API, owner editor and importer. */
const fail = message => { throw new Error(`Mental model: ${message}`); };
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));
function jsonValue(value, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return;
  if ((!Array.isArray(value) && !plainObject(value)) || ancestors.has(value)) fail('use a JSON-serializable object.');
  ancestors.add(value);
  for (const item of Array.isArray(value) ? value : Object.values(value)) jsonValue(item, ancestors);
  ancestors.delete(value);
}
function text(value, field, max, required = true) {
  if (typeof value !== 'string' || (required && !value.trim()) || value.trim().length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) fail(`provide ${field} as ${required ? 'nonempty ' : ''}text of at most ${max} characters.`);
  return value.trim();
}
/** Return a detached canonical object; unexpected JSON fields are discarded. */
export function validateMentalModel(value) {
  if (value === undefined || value === null) return null;
  if (!plainObject(value)) fail('use an object or null.');
  jsonValue(value);
  if (!['documented', 'conceptual', 'mixed'].includes(value.kind)) fail('choose documented, conceptual or mixed for kind.');
  if (!Array.isArray(value.stages) || value.stages.length < 3 || value.stages.length > 5) fail('provide three to five stages.');
  let count = 0;
  const stages = value.stages.map(stage => {
    if (!plainObject(stage)) fail('each stage must be an object.');
    if (!Array.isArray(stage.nodes) || stage.nodes.length < 1 || stage.nodes.length > 3) fail('provide one to three nodes per stage.');
    count += stage.nodes.length;
    return {
      label: text(stage.label, 'a stage label', 60),
      nodes: stage.nodes.map(node => {
        if (!plainObject(node)) fail('each node must be an object.');
        if (!['documented', 'proposed', 'unverified'].includes(node.state)) fail('choose documented, proposed or unverified for node state.');
        return { title: text(node.title, 'a node title', 90), detail: text(node.detail, 'node detail', 240), state: node.state };
      }),
    };
  });
  if (count > 12) fail('provide at most twelve nodes in total.');
  return {
    kind: value.kind, caption: text(value.caption, 'a caption', 500), stages,
    ...(value.feedback === undefined ? {} : { feedback: text(value.feedback, 'feedback', 300, false) }),
  };
}
