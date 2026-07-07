'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import type { SwaggerSchemaModel } from '@/hooks/use-swagger-schema';

import { FormatToggle } from './format-toggle';
import { EditorWorkspacePane, PaneBody, PaneToolbar } from './split-workspace';
import { SwaggerEditor } from './swagger-editor';

type EditorPaneProps = Readonly<{
  model: SwaggerSchemaModel;
}>;

export function EditorPane({ model }: EditorPaneProps) {
  const t = useTranslations('SwaggerEditor');
  const { content, format, status, toggleFormat, updateContent } = model;

  return (
    <EditorWorkspacePane>
      <PaneToolbar>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[11px] font-medium">{t('editorLabel')}</span>
          <span className="text-muted-foreground/60 text-[11px]">·</span>
          <span className="text-muted-foreground text-[11px] font-medium uppercase">{format}</span>
        </div>
        <div className="flex items-center gap-2">
          {status !== 'idle' && <EditorStatusBadge status={status} />}
          <FormatToggle
            currentFormat={format}
            disabled={status === 'idle'}
            onToggle={toggleFormat}
          />
        </div>
      </PaneToolbar>
      <PaneBody>
        <SwaggerEditor format={format} onChange={updateContent} value={content} />
      </PaneBody>
    </EditorWorkspacePane>
  );
}

function EditorStatusBadge({ status }: Readonly<{ status: SwaggerSchemaModel['status'] }>) {
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
