import type { SchemaFormat } from '@/lib/swagger/types';

export type SavedSchemaResponse = Readonly<{
  content: string;
  format: string;
}>;

export type RestoreStatus =
  | { phase: 'idle' }
  | { phase: 'restoring' }
  | { phase: 'error'; message: string };

export type SaveStatus =
  | { phase: 'idle' }
  | { phase: 'saving' }
  | { phase: 'saved' }
  | { phase: 'error'; message: string };

export function initialRestoreStatus(isAuthenticated: boolean): RestoreStatus {
  return isAuthenticated ? { phase: 'restoring' } : { phase: 'idle' };
}

export function parseSchemaFormat(format: string): SchemaFormat | undefined {
  return format === 'json' || format === 'yaml' ? format : undefined;
}

export async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}
