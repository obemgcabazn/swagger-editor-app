export function buildCookieHeader(cookieParams: Record<string, string>): string | null {
  const cookieValues = Object.entries(cookieParams)
    .filter(([, value]) => value.trim())
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('; ');

  return cookieValues || null;
}

// 1) Header parameters (from spec, in: header) — e.g. Authorization
// 2) Custom headers — user clicks “+ Add header” and types key/value
type BuildRequestHeadersOptions = Readonly<{
  contentType?: string | null;
  cookieParams?: Record<string, string>;
  headers: Array<{ key: string; value: string }>;
}>;

// Merges custom headers, cookies, and content-type into a single headers object.
export function buildRequestHeaders({
  contentType,
  cookieParams = {},
  headers,
}: BuildRequestHeadersOptions): Record<string, string> {
  const reqHeaders: Record<string, string> = {};

  for (const { key, value } of headers) {
    if (key.trim()) reqHeaders[key.trim()] = value;
  }

  const cookie = buildCookieHeader(cookieParams);
  if (cookie) {
    reqHeaders.cookie = cookie;
  }

  if (contentType?.trim()) {
    reqHeaders['content-type'] = contentType;
  }

  return reqHeaders;
}
