'use client';

import { useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { generateCurlCommand } from '@/lib/swagger/curl-generator';

type Param = { in: string; name: string; required?: boolean };

type ResponseContent = {
  schema: Record<string, unknown>;
};

type ResponseDef = {
  description: string;
  content?: Record<string, ResponseContent>;
};

type EndpointDef = {
  method: string;
  parameters?: Param[];
  requestBody?: { content?: Record<string, { schema: unknown }> };
  responses?: Record<string, ResponseDef>;
};

type RequestExecutorProps = Readonly<{
  baseUrl: string;
  endpoint: EndpointDef;
  path: string;
}>;

function getDefaultBody(schema: unknown): string {
  if (!schema || typeof schema !== 'object') return '';

  const s = schema as Record<string, unknown>;
  if (s.example !== undefined) return JSON.stringify(s.example, null, 2);

  if (s.type === 'object' && s.properties) {
    const props = s.properties as Record<string, { type: string; example?: unknown }>;
    const example: Record<string, unknown> = {};

    for (const [key, prop] of Object.entries(props)) {
      if (prop.example !== undefined) example[key] = prop.example;
      else if (prop.type === 'string') example[key] = 'string';
      else if (prop.type === 'number' || prop.type === 'integer') example[key] = 0;
      else if (prop.type === 'boolean') example[key] = false;
    }

    return JSON.stringify(example, null, 2);
  }

  return '';
}

function StatusBadge({ code }: { code: string }) {
  const color = code.startsWith('2')
    ? 'text-emerald-500 bg-emerald-500/10'
    : code.startsWith('3')
      ? 'text-blue-500 bg-blue-500/10'
      : code.startsWith('4')
        ? 'text-yellow-500 bg-yellow-500/10'
        : code.startsWith('5')
          ? 'text-red-500 bg-red-500/10'
          : 'text-muted-foreground bg-muted';

  return <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${color}`}>{code}</span>;
}

export function RequestExecutor({ baseUrl, endpoint, path }: RequestExecutorProps) {
  const t = useTranslations('SwaggerEditor');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState(() =>
    getDefaultBody(endpoint.requestBody?.content?.['application/json']?.schema)
  );
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const params = endpoint.parameters ?? [];
  const hasBody = endpoint.method !== 'GET' && endpoint.method !== 'HEAD' && !!endpoint.requestBody;
  const responses = endpoint.responses ?? {};

  const buildUrl = () => {
    let url = `${baseUrl}${path}`;

    for (const [key, value] of Object.entries(pathParams)) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }

    const query = Object.entries(queryParams)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    if (query) url += `?${query}`;

    return url;
  };

  const url = buildUrl();

  const execute = async () => {
    setLoading(true);
    setResponse(null);

    const reqHeaders: Record<string, string> = {};
    for (const { key, value } of headers) {
      if (key.trim()) reqHeaders[key.trim()] = value;
    }
    if (hasBody && body.trim()) reqHeaders['content-type'] = 'application/json';

    try {
      const res = await fetch('/api/requests/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: endpoint.method,
          url,
          headers: reqHeaders,
          body: hasBody ? body : null,
        }),
      });
      setResponse(JSON.stringify(await res.json(), null, 2));
    } catch (err) {
      setResponse(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const curl = generateCurlCommand(
    endpoint.method,
    url,
    Object.fromEntries(headers.filter((h) => h.key.trim()).map((h) => [h.key, h.value])),
    hasBody ? body : null
  );

  return (
    <div className="space-y-4">
      {params.filter((p) => p.in === 'path').length > 0 && (
        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium">{t('pathParams')}</span>
          {params
            .filter((p) => p.in === 'path')
            .map((p) => (
              <div className="flex items-center gap-2" key={p.name}>
                <Label className="min-w-[6rem] text-xs">{p.name}</Label>
                <Input
                  className="h-7 text-xs"
                  value={pathParams[p.name] ?? ''}
                  onChange={(e) => setPathParams((prev) => ({ ...prev, [p.name]: e.target.value }))}
                  placeholder={p.required ? 'required' : 'optional'}
                />
              </div>
            ))}
        </div>
      )}

      {params.filter((p) => p.in === 'query').length > 0 && (
        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium">{t('queryParams')}</span>
          {params
            .filter((p) => p.in === 'query')
            .map((p) => (
              <div className="flex items-center gap-2" key={p.name}>
                <Label className="min-w-[6rem] text-xs">{p.name}</Label>
                <Input
                  className="h-7 text-xs"
                  value={queryParams[p.name] ?? ''}
                  onChange={(e) =>
                    setQueryParams((prev) => ({ ...prev, [p.name]: e.target.value }))
                  }
                  placeholder={p.required ? 'required' : 'optional'}
                />
              </div>
            ))}
        </div>
      )}

      {params.filter((p) => p.in === 'header').length > 0 && (
        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium">{t('headerParams')}</span>
          {params
            .filter((p) => p.in === 'header')
            .map((p) => (
              <div className="flex items-center gap-2" key={p.name}>
                <Label className="min-w-[6rem] text-xs">{p.name}</Label>
                <Input
                  className="h-7 text-xs"
                  value={headers.find((h) => h.key === p.name)?.value ?? ''}
                  onChange={(e) => {
                    const idx = headers.findIndex((h) => h.key === p.name);
                    if (idx >= 0) {
                      const u = [...headers];
                      u[idx] = { ...u[idx], value: e.target.value };
                      setHeaders(u);
                    } else {
                      setHeaders([...headers, { key: p.name, value: e.target.value }]);
                    }
                  }}
                  placeholder={p.required ? 'required' : 'optional'}
                />
              </div>
            ))}
        </div>
      )}

      <div className="space-y-2">
        <span className="text-muted-foreground text-xs font-medium">{t('headers')}</span>
        {headers
          .filter((h) => !params.some((p) => p.in === 'header' && p.name === h.key))
          .map((h, i) => (
            <div className="flex items-center gap-2" key={`custom-${i}`}>
              <Input
                className="h-7 text-xs"
                value={h.key}
                onChange={(e) => {
                  const u = [...headers];
                  u[i] = { ...u[i], key: e.target.value };
                  setHeaders(u);
                }}
                placeholder="Key"
              />
              <Input
                className="h-7 text-xs"
                value={h.value}
                onChange={(e) => {
                  const u = [...headers];
                  u[i] = { ...u[i], value: e.target.value };
                  setHeaders(u);
                }}
                placeholder="Value"
              />
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setHeaders(headers.filter((_, j) => j !== i))}
              >
                ×
              </Button>
            </div>
          ))}
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setHeaders([...headers, { key: '', value: '' }])}
        >
          + {t('addHeader')}
        </Button>
      </div>

      {hasBody && (
        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium">{t('requestBody')}</span>
          <textarea
            className="border-border bg-background text-foreground w-full rounded-md border p-2 font-mono text-xs"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" disabled={loading} onClick={execute}>
          <Play className="size-3.5" />
          <span className="ml-1.5">{loading ? t('sending') : t('execute')}</span>
        </Button>
        <Button size="sm" variant="outline" onClick={() => copy(curl)}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span className="ml-1.5">{copied ? t('copied') : t('copyCurl')}</span>
        </Button>
      </div>

      {Object.keys(responses).length > 0 && (
        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium">{t('responses')}</span>
          <div className="space-y-1">
            {Object.entries(responses).map(([code, res]) => (
              <div className="border-border rounded-md border px-3 py-2" key={code}>
                <div className="flex items-center gap-2">
                  <StatusBadge code={code} />
                  <span className="text-muted-foreground text-xs">{res.description}</span>
                </div>
                {res.content?.['application/json']?.schema && (
                  <pre className="bg-muted mt-2 overflow-auto rounded p-2 text-xs">
                    {JSON.stringify(res.content['application/json'].schema, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {response && (
        <pre className="bg-muted max-h-96 overflow-auto rounded-md p-3 text-xs">{response}</pre>
      )}
    </div>
  );
}
