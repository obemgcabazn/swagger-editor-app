function escapeShellSingleQuoted(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function formatCurlBody(body: string, contentType: string | null): string {
  let payload = body;

  if (contentType === 'application/json') {
    try {
      payload = JSON.stringify(JSON.parse(body));
    } catch {
      // Keep the raw body when it is not valid JSON.
    }
  }

  return escapeShellSingleQuoted(payload);
}

export function generateCurlCommand(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null
): string {
  const parts = ['curl'];
  const contentType = headers['content-type'] ?? headers['Content-Type'] ?? null;

  if (method !== 'GET') parts.push(`-X ${method}`);
  Object.entries(headers).forEach(([k, v]) =>
    parts.push(`-H ${escapeShellSingleQuoted(`${k}: ${v}`)}`)
  );
  if (body) parts.push(`-d ${formatCurlBody(body, contentType)}`);
  parts.push(escapeShellSingleQuoted(url));

  return parts.join(' \\\n  ');
}
