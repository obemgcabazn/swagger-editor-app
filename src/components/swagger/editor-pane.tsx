'use client';

import { useEffect, useRef } from 'react';

import type { SchemaFormat } from '@/lib/swagger/types';
import type { SchemaStatus } from '@/lib/swagger/schema-status';

import { EditorBody } from './editor-body';
import { EditorToolbar } from './editor-toolbar';
import { EditorWorkspacePane } from './split-workspace';

type EditorPaneProps = Readonly<{
  content: string;
  format: SchemaFormat;
  isAuthenticated?: boolean;
  onChange: (content: string) => void;
  onLoad: (content: string, format?: SchemaFormat) => void;
  onToggleFormat: () => void;
  schemaStatus: SchemaStatus;
}>;

export function EditorPane({
  content,
  format,
  isAuthenticated = false,
  onChange,
  onLoad,
  onToggleFormat,
  schemaStatus,
}: EditorPaneProps) {
  const contentRef = useRef(content);
  const formatRef = useRef(format);

  useEffect(() => {
    contentRef.current = content;
    formatRef.current = format;
  }, [content, format]);

  return (
    <EditorWorkspacePane>
      <EditorToolbar
        contentRef={contentRef}
        format={format}
        formatRef={formatRef}
        isAuthenticated={isAuthenticated}
        onToggleFormat={onToggleFormat}
        schemaStatus={schemaStatus}
      />
      <EditorBody
        content={content}
        format={format}
        isAuthenticated={isAuthenticated}
        onChange={onChange}
        onLoad={onLoad}
      />
    </EditorWorkspacePane>
  );
}
