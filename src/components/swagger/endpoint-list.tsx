'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { resolveBaseUrl } from '@/lib/swagger/resolve-url';
import { RequestExecutor } from './request-executor';

type EndpointListProps = Readonly<{
  schema: Record<string, unknown>;
}>;

const METHOD_COLORS: Record<string, string> = {
  delete: 'text-red-500',
  get: 'text-blue-500',
  head: 'text-gray-500',
  options: 'text-gray-500',
  patch: 'text-yellow-500',
  post: 'text-green-500',
  put: 'text-orange-500',
};

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

export function EndpointList({ schema }: EndpointListProps) {
  const t = useTranslations('SwaggerEditor');
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const baseUrl = resolveBaseUrl(schema);
  const paths = (schema.paths ?? {}) as Record<string, Record<string, unknown>>;

  const endpoints = Object.entries(paths).flatMap(([path, methods]) =>
    Object.keys(methods)
      .filter(
        (m) => m !== 'parameters' && m !== 'servers' && m !== 'description' && m !== 'summary'
      )
      .map((method) => {
        const d = methods[method] as Record<string, unknown>;

        return {
          method: method.toUpperCase(),
          parameters: (d.parameters as Param[]) ?? [],
          path,
          requestBody: d.requestBody as EndpointDef['requestBody'],
          responses: d.responses as EndpointDef['responses'],
          summary: (d.summary as string) ?? '',
        };
      })
  );

  if (!endpoints.length) {
    return <p className="text-muted-foreground text-sm">{t('noEndpoints')}</p>;
  }

  return (
    <div className="w-full space-y-1">
      {!baseUrl && <p className="text-muted-foreground mb-2 text-xs">{t('noBaseUrl')}</p>}
      {endpoints.map((ep) => {
        const key = `${ep.method}-${ep.path}`;
        const open = expandedPath === key;

        return (
          <div key={key}>
            <button
              className="border-border hover:bg-muted/50 flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors"
              onClick={() => setExpandedPath(open ? null : key)}
              type="button"
            >
              <span
                className={cn(
                  'min-w-[3.5rem] text-xs font-bold',
                  METHOD_COLORS[ep.method.toLowerCase()] ?? 'text-muted-foreground'
                )}
              >
                {ep.method}
              </span>
              <span className="text-foreground font-mono text-xs">{ep.path}</span>
              {ep.summary && (
                <span className="text-muted-foreground ml-auto hidden text-xs sm:inline">
                  {ep.summary}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'text-muted-foreground size-3.5 shrink-0 transition-transform',
                  open && 'rotate-180'
                )}
              />
            </button>
            {open && (
              <div className="border-border bg-muted/20 border-x border-b px-4 py-3">
                <RequestExecutor
                  baseUrl={baseUrl}
                  endpoint={{
                    method: ep.method,
                    parameters: ep.parameters,
                    requestBody: ep.requestBody,
                    responses: ep.responses,
                  }}
                  path={ep.path}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
