'use client';

import { useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { SchemaToggle } from '@/components/swagger/schema-toggle';
import { generateCurlCommand } from '@/lib/swagger/curl-generator';
import { formatExecutionResult } from '@/lib/swagger/format-execution-result';
import { getDefaultBody } from '@/lib/swagger/default-body';
import {
  formatSchemaDocument,
  getRequestExample,
  getRequestJsonContent,
  getRequestSchema,
  getResponseExample,
  getResponseSchema,
} from '@/lib/swagger/schema-documentation';
import { buildRequestHeaders } from '@/lib/swagger/request-headers';
import { getJsonBodyValidationError } from '@/lib/swagger/validate-json-body';

type Param = { in: string; name: string; required?: boolean };

type ResponseContent = {
  example?: unknown;
  examples?: Record<string, { value?: unknown }>;
  schema: Record<string, unknown>;
};

type ResponseDef = {
  description: string;
  content?: Record<string, ResponseContent>;
};

type EndpointDef = {
  method: string;
  parameters?: Param[];
  requestBody?: {
    content?: Record<
      string,
      { example?: unknown; examples?: Record<string, { value?: unknown }>; schema: unknown }
    >;
  };
  responses?: Record<string, ResponseDef>;
};

type RequestExecutorProps = Readonly<{
  baseUrl: string;
  components?: { schemas?: Record<string, unknown> };
  endpoint: EndpointDef;
  path: string;
}>;

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

export function RequestExecutor({ baseUrl, components, endpoint, path }: RequestExecutorProps) {
  const t = useTranslations('SwaggerEditor');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [cookieParams, setCookieParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState(() =>
    getDefaultBody(endpoint.requestBody?.content?.['application/json'], components)
  );
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const params = endpoint.parameters ?? [];
  const hasBody = endpoint.method !== 'GET' && endpoint.method !== 'HEAD' && !!endpoint.requestBody;
  const responses = endpoint.responses ?? {};
  const bodyValidationError = hasBody ? getJsonBodyValidationError(body) : null;
  const requestJsonContent = getRequestJsonContent(endpoint.requestBody);
  const requestSchemaDoc = formatSchemaDocument(getRequestSchema(requestJsonContent, components));
  const requestExampleDoc = formatSchemaDocument(getRequestExample(requestJsonContent, components));

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

  const requestHeaders = buildRequestHeaders({
    contentType: hasBody && body.trim() ? 'application/json' : null,
    cookieParams,
    headers,
  });

  const execute = async () => {
    if (bodyValidationError) {
      setResponse(t('invalidJsonBody'));
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/requests/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: endpoint.method,
          url,
          headers: requestHeaders,
          body: hasBody ? body : null,
        }),
      });
      setResponse(formatExecutionResult(await res.json()));
    } catch (err) {
      setResponse(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const curl = generateCurlCommand(endpoint.method, url, requestHeaders, hasBody ? body : null);

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

      {params.filter((p) => p.in === 'cookie').length > 0 && (
        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium">{t('cookieParams')}</span>
          {params
            .filter((p) => p.in === 'cookie')
            .map((p) => (
              <div className="flex items-center gap-2" key={p.name}>
                <Label className="min-w-[6rem] text-xs">{p.name}</Label>
                <Input
                  className="h-7 text-xs"
                  value={cookieParams[p.name] ?? ''}
                  onChange={(e) =>
                    setCookieParams((prev) => ({ ...prev, [p.name]: e.target.value }))
                  }
                  placeholder={p.required ? 'required' : 'optional'}
                />
              </div>
            ))}
        </div>
      )}

      <div className="space-y-2">
        <span className="text-muted-foreground text-xs font-medium">{t('headers')}</span>
        {headers
          .filter(
            (h) => !params.some((p) => (p.in === 'header' || p.in === 'cookie') && p.name === h.key)
          )
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
          {requestSchemaDoc && (
            <SchemaToggle content={requestSchemaDoc} label={t('requestSchema')} />
          )}
          {requestExampleDoc && (
            <SchemaToggle content={requestExampleDoc} label={t('requestExample')} />
          )}
          <span className="text-muted-foreground text-xs font-medium">{t('requestBody')}</span>
          <textarea
            className="border-border bg-background text-foreground w-full rounded-md border p-2 font-mono text-xs"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {bodyValidationError && (
            <p className="text-destructive text-xs">{t('invalidJsonBody')}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" disabled={loading || !!bodyValidationError} onClick={execute}>
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
          <span className="text-muted-foreground text-xs font-medium">
            {t('documentedResponses')}
          </span>
          <div className="space-y-2">
            {Object.entries(responses).map(([code, res]) => {
              const responseSchemaDoc = formatSchemaDocument(getResponseSchema(res, components));
              const responseExampleDoc = formatSchemaDocument(getResponseExample(res, components));

              return (
                <SchemaToggle
                  key={code}
                  label={
                    <>
                      <StatusBadge code={code} />
                      <span className="text-muted-foreground">{res.description}</span>
                    </>
                  }
                >
                  <div className="space-y-3">
                    {responseSchemaDoc && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">
                          {t('responseSchema')}
                        </span>
                        <pre className="overflow-auto whitespace-pre-wrap">{responseSchemaDoc}</pre>
                      </div>
                    )}
                    {responseExampleDoc && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">
                          {t('responseExample')}
                        </span>
                        <pre className="overflow-auto whitespace-pre-wrap">
                          {responseExampleDoc}
                        </pre>
                      </div>
                    )}
                    {!responseSchemaDoc && !responseExampleDoc && (
                      <span className="text-muted-foreground">
                        {t('responseDetailsUnavailable')}
                      </span>
                    )}
                  </div>
                </SchemaToggle>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-muted-foreground text-xs font-medium">{t('executionResult')}</span>
        <pre
          className={`bg-muted max-h-96 min-h-24 overflow-auto rounded-md p-3 text-xs ${
            !loading && !response ? 'text-muted-foreground' : ''
          }`}
        >
          {loading ? t('sending') : (response ?? t('executionResultEmpty'))}
        </pre>
      </div>
    </div>
  );
}
