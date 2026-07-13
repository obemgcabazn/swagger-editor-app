'use client';

import { useTranslations } from 'next-intl';

import type { SchemaStatus } from '@/lib/swagger/schema-status';

import { PaneBody, PaneToolbar, ViewerWorkspacePane } from './split-workspace';
import { ViewerContent } from './viewer-content';

type ViewerPaneProps = Readonly<{
  errors: string[];
  parsed: Record<string, unknown> | null;
  status: SchemaStatus;
}>;

export function ViewerPane({ errors, parsed, status }: ViewerPaneProps) {
  const t = useTranslations('SwaggerEditor');

  return (
    <ViewerWorkspacePane>
      <PaneToolbar>
        <span className="text-muted-foreground text-[11px] font-medium">{t('viewerLabel')}</span>
      </PaneToolbar>
      <PaneBody className="overflow-auto">
        <ViewerContent errors={errors} parsed={parsed} status={status} />
      </PaneBody>
    </ViewerWorkspacePane>
  );
}
