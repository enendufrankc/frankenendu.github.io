import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseWranglerResult } from '../scripts/wrangler-result.mjs';

const result = [{ results: [{ 'Total queries executed': 1 }], success: true }];

test('remote file import accepts Wrangler progress before its JSON result', () => {
  const output = '├ Checking if file needs uploading\n│\n├ 🌀 Uploading example.sql\n│ 🌀 Uploading complete.\n│\n' + JSON.stringify(result, null, 2) + '\n';
  assert.deepEqual(parseWranglerResult(output), result);
  assert.deepEqual(parseWranglerResult(JSON.stringify(result)), result);
});

test('import diagnostics reject malformed results without disclosing captured content', () => {
  for (const output of ['PRIVATE_SOURCE_TEXT', '[]\nPRIVATE_SOURCE_TEXT', 'PRIVATE_SOURCE_TEXT\n[{bad}]']) {
    assert.throws(() => parseWranglerResult(output), error => !error.message.includes('PRIVATE_SOURCE_TEXT'));
  }
});
