'use client';

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { readApiError, type SaveStatus } from '@/lib/schemas/persistence';
import type { SchemaFormat } from '@/lib/swagger/types';

type UseSaveSchemaOptions = Readonly<{
  contentRef: RefObject<string>;
  formatRef: RefObject<SchemaFormat>;
  isAuthenticated: boolean;
}>;

export function useSaveSchema({ contentRef, formatRef, isAuthenticated }: UseSaveSchemaOptions) {
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ phase: 'idle' });

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const save = useCallback(async () => {
    const content = contentRef.current;
    const format = formatRef.current;

    if (!isAuthenticated || !content.trim() || saveStatus.phase === 'saving') {
      return;
    }

    setSaveStatus({ phase: 'saving' });

    try {
      const res = await fetch('/api/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to save schema'));
      }

      setSaveStatus({ phase: 'saved' });
      savedTimeoutRef.current = setTimeout(() => setSaveStatus({ phase: 'idle' }), 2000);
    } catch (error: unknown) {
      setSaveStatus({
        phase: 'error',
        message: error instanceof Error ? error.message : 'Failed to save schema',
      });
    }
  }, [contentRef, formatRef, isAuthenticated, saveStatus.phase]);

  const effectiveSaveStatus = isAuthenticated ? saveStatus : { phase: 'idle' as const };

  return { save, saveStatus: effectiveSaveStatus };
}
