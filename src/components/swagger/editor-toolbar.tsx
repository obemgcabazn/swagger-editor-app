'use client';

import { memo, type RefObject } from 'react';
import { Check, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSaveSchema } from '@/hooks/use-save-schema';
import type { SchemaStatus } from '@/lib/swagger/schema-status';
import type { SchemaFormat } from '@/lib/swagger/types';

import { FormatToggle } from './format-toggle';
import { PaneToolbar } from './split-workspace';

type EditorToolbarProps = Readonly<{
  contentRef: RefObject<string>;
  format: SchemaFormat;
  formatRef: RefObject<SchemaFormat>;
  isAuthenticated?: boolean;
  onToggleFormat: () => void;
  schemaStatus: SchemaStatus;
}>;

export const EditorToolbar = memo(function EditorToolbar({
  contentRef,
  format,
  formatRef,
  isAuthenticated = false,
  onToggleFormat,
  schemaStatus,
}: EditorToolbarProps) {
  const t = useTranslations('SwaggerEditor');
  const { save, saveStatus } = useSaveSchema({ contentRef, formatRef, isAuthenticated });

  const isSaving = saveStatus.phase === 'saving';
  const saved = saveStatus.phase === 'saved';
  const saveError = saveStatus.phase === 'error' ? saveStatus.message : null;

  return (
    <PaneToolbar>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[11px] font-medium">{t('editorLabel')}</span>
        <span className="text-muted-foreground/60 text-[11px]">·</span>
        <span className="text-muted-foreground text-[11px] font-medium uppercase">{format}</span>
      </div>
      <div className="flex items-center gap-2">
        {schemaStatus !== 'idle' && <EditorStatusBadge status={schemaStatus} />}
        {isAuthenticated && schemaStatus === 'valid' && (
          <div className="flex items-center gap-1">
            {saveError && (
              <span className="text-destructive max-w-40 truncate text-[11px]" role="alert">
                {saveError}
              </span>
            )}
            <Button disabled={isSaving} size="xs" variant="ghost" onClick={save}>
              {saved ? (
                <>
                  <Check className="size-3" />
                  <span className="ml-1 hidden sm:inline">{t('saved')}</span>
                </>
              ) : isSaving ? (
                <>
                  <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="ml-1 hidden sm:inline">{t('saving')}</span>
                </>
              ) : (
                <>
                  <Save className="size-3" />
                  <span className="ml-1 hidden sm:inline">{t('save')}</span>
                </>
              )}
            </Button>
          </div>
        )}
        <FormatToggle
          currentFormat={format}
          disabled={schemaStatus === 'idle'}
          onToggle={onToggleFormat}
        />
      </div>
    </PaneToolbar>
  );
}, toolbarPropsAreEqual);

function toolbarPropsAreEqual(prev: EditorToolbarProps, next: EditorToolbarProps) {
  return (
    prev.isAuthenticated === next.isAuthenticated &&
    prev.schemaStatus === next.schemaStatus &&
    prev.format === next.format &&
    prev.onToggleFormat === next.onToggleFormat &&
    prev.contentRef === next.contentRef &&
    prev.formatRef === next.formatRef
  );
}

function EditorStatusBadge({ status }: Readonly<{ status: SchemaStatus }>) {
  const t = useTranslations('SwaggerEditor');

  const label =
    status === 'valid'
      ? t('statusValid')
      : status === 'invalid'
        ? t('statusErrors')
        : t('statusParsing');

  return (
    <span
      className={cn(
        'rounded-md px-2 py-0.5 text-xs font-medium',
        status === 'valid' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        status === 'invalid' && 'bg-destructive/10 text-destructive',
        status === 'pending' && 'bg-muted text-muted-foreground'
      )}
    >
      {label}
    </span>
  );
}
