'use client';

import { useSwaggerSchema } from '@/hooks/use-swagger-schema';

import { EditorPane } from './editor-pane';
import { SplitWorkspace } from './split-workspace';
import { ViewerPane } from './viewer-pane';

type SwaggerSectionProps = Readonly<{
  initialContent?: string;
}>;

export function SwaggerSection({ initialContent }: SwaggerSectionProps) {
  const model = useSwaggerSchema({ initialContent });

  return (
    <main className="bg-background flex flex-1 flex-col">
      <SplitWorkspace>
        <EditorPane model={model} />
        <ViewerPane model={model} />
      </SplitWorkspace>
    </main>
  );
}
