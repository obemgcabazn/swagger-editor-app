export function resolveBaseUrl(schema: Record<string, unknown>): string {
  const servers = schema.servers as Array<{ url: string }> | undefined;

  if (servers?.length) return servers[0].url;

  if (!schema.host) return '';

  const host = schema.host as string;
  const basePath = (schema.basePath as string) ?? '';
  const schemes = (schema.schemes as string[]) ?? ['https'];

  return `${schemes[0]}://${host}${basePath}`;
}
