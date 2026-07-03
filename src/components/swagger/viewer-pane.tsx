'use client';

import { useTranslations } from 'next-intl';

import type { SwaggerSchemaModel } from '@/hooks/use-swagger-schema';

import { PaneBody, PaneToolbar, ViewerWorkspacePane } from './split-workspace';
import { ViewerContent } from './viewer-content';

type ViewerPaneProps = Readonly<{
  model: SwaggerSchemaModel;
}>;

export function ViewerPane({ model }: ViewerPaneProps) {
  const t = useTranslations('SwaggerEditor');
  const { errors, parsed, status } = model;

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
