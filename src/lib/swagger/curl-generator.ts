export function generateCurlCommand(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null
): string {
  const parts = ['curl'];

  if (method !== 'GET') parts.push(`-X ${method}`);
  Object.entries(headers).forEach(([k, v]) => parts.push(`-H '${k}: ${v}'`));
  if (body) parts.push(`-d '${body}'`);
  parts.push(`'${url}'`);

  return parts.join(' \\\n  ');
}
