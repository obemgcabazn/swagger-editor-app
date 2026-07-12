'use client';

import { useSwaggerSchema } from '@/hooks/use-swagger-schema';
import { useSchemaPersistence } from '@/hooks/use-schema-persistence';

import { EditorPane } from './editor-pane';
import { SplitWorkspace } from './split-workspace';
import { ViewerPane } from './viewer-pane';

type SwaggerSectionProps = Readonly<{
  initialContent?: string;
  isAuthenticated?: boolean;
}>;

export function SwaggerSection({ initialContent, isAuthenticated = false }: SwaggerSectionProps) {
  const model = useSwaggerSchema({ initialContent });

  const { saved, save } = useSchemaPersistence({
    content: model.content,
    format: model.format,
    isAuthenticated,
    onLoad: model.updateContent,
  });

  return (
    <main className="bg-background flex flex-1 flex-col">
      <SplitWorkspace>
        <EditorPane isAuthenticated={isAuthenticated} model={model} onSave={save} saved={saved} />
        <ViewerPane model={model} />
      </SplitWorkspace>
    </main>
  );
}
