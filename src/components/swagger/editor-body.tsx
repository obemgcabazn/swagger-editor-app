'use client';

import { useTranslations } from 'next-intl';

import { useRestoreSchema } from '@/hooks/use-restore-schema';
import type { SchemaFormat } from '@/lib/swagger/types';

import { PaneBody } from './split-workspace';
import { SwaggerEditor } from './swagger-editor';

type EditorBodyProps = Readonly<{
  content: string;
  format: SchemaFormat;
  isAuthenticated?: boolean;
  onChange: (content: string) => void;
  onLoad: (content: string, format?: SchemaFormat) => void;
}>;

export function EditorBody({
  content,
  format,
  isAuthenticated = false,
  onChange,
  onLoad,
}: EditorBodyProps) {
  const t = useTranslations('SwaggerEditor');
  const { restoreStatus } = useRestoreSchema({ isAuthenticated, onLoad });

  if (restoreStatus.phase === 'restoring') {
    return (
      <PaneBody>
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-muted-foreground text-sm">{t('restoringSchema')}</p>
        </div>
      </PaneBody>
    );
  }

  return (
    <PaneBody>
      {restoreStatus.phase === 'error' && (
        <p
          className="text-destructive border-destructive/20 bg-destructive/5 border-b px-4 py-2 text-xs"
          role="alert"
        >
          {restoreStatus.message}
        </p>
      )}
      <SwaggerEditor format={format} onChange={onChange} value={content} />
    </PaneBody>
  );
}
