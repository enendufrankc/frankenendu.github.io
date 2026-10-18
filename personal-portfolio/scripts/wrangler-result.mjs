export function parseWranglerResult(output) {
  // Wrangler 4.137's remote file uploader prints progress even with --json.
  // Strip only its leading progress lines; never echo captured SQL on failure.
  const lines = output.split('\n');
  while (lines.length && /^(?:[│├└].*|\s*)$/u.test(lines[0])) lines.shift();
  try { return JSON.parse(lines.join('\n')); }
  catch { throw new Error('The database returned an unreadable import result.'); }
}
