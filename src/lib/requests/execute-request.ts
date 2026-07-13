const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

// Transport level headers usually controlled by browser itself, not us
const BLOCKED_REQUEST_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export type RequestMethod = (typeof ALLOWED_METHODS)[number];

export type ExecuteRequestInput = {
  body?: string | null;
  headers: Record<string, string>;
  method: RequestMethod;
  url: string;
};

export type ExecuteRequestResult = {
  error: { message: string } | null;
  request: {
    bodySizeBytes: number | null;
    headers: Record<string, string>;
    method: RequestMethod;
    url: string;
  };
  response: {
    body: string;
    bodySizeBytes: number;
    durationMs: number;
    headers: Record<string, string>;
    status: number;
    statusText: string;
  } | null;
};

type ParseResult =
  | {
      data: ExecuteRequestInput;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

type FetchLike = typeof fetch;

export function parseExecuteRequestPayload(payload: unknown): ParseResult {
  if (!payload || typeof payload !== 'object') {
    return { data: null, error: 'Request payload must be an object.' };
  }

  const record = payload as Record<string, unknown>;
  const method = parseMethod(record.method);

  if (!method) {
    return {
      data: null,
      error: `Method must be one of: ${ALLOWED_METHODS.join(', ')}.`,
    };
  }

  const url = parseUrl(record.url);

  if (!url) {
    return { data: null, error: 'URL must be a valid http or https URL.' };
  }

  const headers = parseHeaders(record.headers);

  if (!headers) {
    return { data: null, error: 'Headers must be an object with string values.' };
  }

  const body = parseBody(record.body);

  if (body === undefined) {
    return { data: null, error: 'Body must be a string, null, or omitted.' };
  }

  if ((method === 'GET' || method === 'HEAD') && body) {
    return { data: null, error: `${method} requests cannot include a body.` };
  }

  return {
    data: {
      body,
      headers,
      method,
      url,
    },
    error: null,
  };
}

export async function executeExternalRequest(
  input: ExecuteRequestInput,
  fetchImpl: FetchLike = fetch // we pass fetchIml via DI for easines of mocking fetch in Unit tests
): Promise<ExecuteRequestResult> {
  const startedAt = performance.now();
  const requestBody = input.body || undefined;
  const requestHeaders = sanitizeRequestHeaders(input.headers);

  try {
    const response = await fetchImpl(input.url, {
      body: requestBody,
      headers: requestHeaders,
      method: input.method,
      signal: AbortSignal.timeout(30_000),
    });
    const body = await response.text();
    const durationMs = Math.round(performance.now() - startedAt);

    return {
      error: null,
      request: {
        bodySizeBytes: getBodySize(input.body),
        headers: requestHeaders,
        method: input.method,
        url: input.url,
      },
      response: {
        body,
        bodySizeBytes: getBodySize(body) ?? 0,
        durationMs,
        headers: headersToRecord(response.headers),
        status: response.status,
        statusText: response.statusText,
      },
    };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Request execution failed.',
      },
      request: {
        bodySizeBytes: getBodySize(input.body),
        headers: requestHeaders,
        method: input.method,
        url: input.url,
      },
      response: null,
    };
  }
}

export function sanitizeRequestHeaders(headers: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !BLOCKED_REQUEST_HEADERS.has(name.toLowerCase()))
  );
}

function parseMethod(value: unknown): RequestMethod | null {
  const method = typeof value === 'string' ? value.toUpperCase() : 'GET';

  if (!ALLOWED_METHODS.includes(method as RequestMethod)) {
    return null;
  }

  return method as RequestMethod;
}

function parseUrl(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function parseHeaders(value: unknown) {
  if (value === undefined) {
    return {};
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const headers = value as Record<string, unknown>;

  if (Object.values(headers).some((headerValue) => typeof headerValue !== 'string')) {
    return null;
  }

  try {
    return sanitizeRequestHeaders(
      Object.fromEntries(new Headers(headers as Record<string, string>))
    );
  } catch {
    return null;
  }
}

function parseBody(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  return value;
}

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

function getBodySize(body: string | null | undefined) {
  if (!body) {
    return null;
  }

  return new TextEncoder().encode(body).byteLength;
}
