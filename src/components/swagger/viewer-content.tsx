'use client';

import { FileJson } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { SchemaStatus } from '@/lib/swagger/schema-status';

import { EndpointList } from './endpoint-list';
import { ValidationErrors } from './validation-errors';

type ViewerContentProps = Readonly<{
  errors: string[];
  parsed: Record<string, unknown> | null;
  status: SchemaStatus;
}>;

export function ViewerContent({ errors, parsed, status }: ViewerContentProps) {
  const t = useTranslations('SwaggerEditor');

  switch (status) {
    case 'idle':
      return (
        <div className="flex min-h-[200px] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <FileJson className="text-muted-foreground/30 size-10" />
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              {t('emptyDescription')}
            </p>
          </div>
        </div>
      );

    case 'pending':
      return (
        <div className="flex min-h-[200px] items-center justify-center p-8">
          <p className="text-muted-foreground text-sm">{t('statusParsing')}</p>
        </div>
      );

    case 'invalid':
      return (
        <div className="p-4 sm:p-6">
          <p className="text-foreground mb-3 text-sm font-medium">{t('errorsTitle')}</p>
          <ValidationErrors errors={errors} />
        </div>
      );

    case 'valid':
      if (!parsed) return null;

      return (
        <div className="p-4 sm:p-6">
          <p className="text-foreground mb-3 text-sm font-medium">{t('endpointsTitle')}</p>
          <EndpointList schema={parsed} />
        </div>
      );
  }
}
