'use client';

import { FileJson } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { parseSchemaContent } from '@/lib/swagger/parser';
import { useSwaggerSchema } from '@/hooks/use-swagger-schema';

import { EndpointList } from './endpoint-list';
import { FormatToggle } from './format-toggle';
import { SwaggerEditor } from './swagger-editor';
import { ValidationErrors } from './validation-errors';

export function SwaggerSection() {
  const t = useTranslations('SwaggerEditor');
  const { content, error, format, hasValidSchema, toggleFormat, updateContent, validationErrors } =
    useSwaggerSchema();

  const allErrors = [...(error ? [error] : []), ...validationErrors];
  const hasContent = content.trim().length > 0;
  const hasErrors = allErrors.length > 0;

  let parsedSchema: Record<string, unknown> | null = null;

  if (hasContent && hasValidSchema) {
    const result = parseSchemaContent(content);
    if (result.data) {
      parsedSchema = result.data as Record<string, unknown>;
    }
  }

  return (
    <main className="bg-background flex flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:divide-x">
        <div className="flex h-[50vh] min-h-0 flex-col lg:h-auto lg:flex-1">
          <div className="border-border bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[11px] font-medium">
                {t('editorLabel')}
              </span>
              <span className="text-muted-foreground/60 text-[11px]">·</span>
              <span className="text-muted-foreground text-[11px] font-medium uppercase">
                {format}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasContent && (
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium',
                    hasValidSchema
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : hasErrors
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {hasValidSchema
                    ? t('statusValid')
                    : hasErrors
                      ? t('statusErrors')
                      : t('statusParsing')}
                </span>
              )}
              <FormatToggle currentFormat={format} disabled={!hasContent} onToggle={toggleFormat} />
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <SwaggerEditor format={format} onChange={updateContent} value={content} />
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-auto border-t lg:flex-1 lg:border-t-0">
          <div className="border-border bg-muted/30 shrink-0 border-b px-4 py-1.5">
            <span className="text-muted-foreground text-[11px] font-medium">
              {t('viewerLabel')}
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            {!hasContent && (
              <div className="flex min-h-[200px] items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3 text-center">
                  <FileJson className="text-muted-foreground/30 size-10" />
                  <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                    {t('emptyDescription')}
                  </p>
                </div>
              </div>
            )}

            {hasContent && hasErrors && (
              <div className="p-4 sm:p-6">
                <p className="text-foreground mb-3 text-sm font-medium">{t('errorsTitle')}</p>
                <ValidationErrors errors={allErrors} />
              </div>
            )}

            {hasContent && hasValidSchema && parsedSchema && (
              <div className="p-4 sm:p-6">
                <p className="text-foreground mb-3 text-sm font-medium">{t('endpointsTitle')}</p>
                <EndpointList schema={parsedSchema} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
