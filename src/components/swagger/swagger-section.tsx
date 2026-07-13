'use client';

import { useSwaggerSchema } from '@/hooks/use-swagger-schema';

import { EditorPane } from './editor-pane';
import { SplitWorkspace } from './split-workspace';
import { ViewerPane } from './viewer-pane';

type SwaggerSectionProps = Readonly<{
  initialContent?: string;
  isAuthenticated?: boolean;
}>;

export function SwaggerSection({ initialContent, isAuthenticated = false }: SwaggerSectionProps) {
  const { content, errors, format, loadContent, parsed, status, toggleFormat, updateContent } =
    useSwaggerSchema({ initialContent });

  return (
    <main className="bg-background flex min-h-0 flex-1 flex-col">
      <div className="app-container flex min-h-0 flex-1 flex-col">
        <div className="border-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
          <SplitWorkspace>
            <EditorPane
              content={content}
              format={format}
              isAuthenticated={isAuthenticated}
              onChange={updateContent}
              onLoad={loadContent}
              onToggleFormat={toggleFormat}
              schemaStatus={status}
            />
            <ViewerPane errors={errors} parsed={parsed} status={status} />
          </SplitWorkspace>
        </div>
      </div>
    </main>
  );
}
