'use client';

import { useEffect, useRef, useState } from 'react';

import {
  initialRestoreStatus,
  parseSchemaFormat,
  readApiError,
  type RestoreStatus,
  type SavedSchemaResponse,
} from '@/lib/schemas/persistence';
import type { SchemaFormat } from '@/lib/swagger/types';

type UseRestoreSchemaOptions = Readonly<{
  isAuthenticated: boolean;
  onLoad: (content: string, format?: SchemaFormat) => void;
}>;

export function useRestoreSchema({ isAuthenticated, onLoad }: UseRestoreSchemaOptions) {
  const loadedRef = useRef(false);
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>(() =>
    initialRestoreStatus(isAuthenticated)
  );

  useEffect(() => {
    if (!isAuthenticated || loadedRef.current) {
      return;
    }

    loadedRef.current = true;

    fetch('/api/schemas')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await readApiError(res, 'Failed to load saved schema'));
        }

        return res.json() as Promise<SavedSchemaResponse>;
      })
      .then((data) => {
        if (data.content) {
          onLoad(data.content, parseSchemaFormat(data.format));
        }

        setRestoreStatus({ phase: 'idle' });
      })
      .catch((error: unknown) => {
        setRestoreStatus({
          phase: 'error',
          message: error instanceof Error ? error.message : 'Failed to load saved schema',
        });
      });
  }, [isAuthenticated, onLoad]);

  const effectiveRestoreStatus = isAuthenticated ? restoreStatus : ({ phase: 'idle' } as const);

  return { restoreStatus: effectiveRestoreStatus };
}
