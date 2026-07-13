import { describe, expect, it } from 'vitest';

import { initialRestoreStatus, parseSchemaFormat, readApiError } from '@/lib/schemas/persistence';

describe('initialRestoreStatus', () => {
  it('starts restoring for authenticated users', () => {
    expect(initialRestoreStatus(true)).toEqual({ phase: 'restoring' });
  });

  it('starts idle for unauthenticated users', () => {
    expect(initialRestoreStatus(false)).toEqual({ phase: 'idle' });
  });
});

describe('parseSchemaFormat', () => {
  it('accepts json and yaml', () => {
    expect(parseSchemaFormat('json')).toBe('json');
    expect(parseSchemaFormat('yaml')).toBe('yaml');
  });

  it('returns undefined for unsupported formats', () => {
    expect(parseSchemaFormat('xml')).toBeUndefined();
    expect(parseSchemaFormat('')).toBeUndefined();
  });
});

describe('readApiError', () => {
  it('returns the API error message when present', async () => {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    await expect(readApiError(response, 'Fallback')).resolves.toBe('Unauthorized');
  });

  it('falls back when the response body is not JSON', async () => {
    const response = new Response('not json', { status: 500 });

    await expect(readApiError(response, 'Fallback')).resolves.toBe('Fallback');
  });

  it('falls back when the JSON body has no error field', async () => {
    const response = new Response(JSON.stringify({ message: 'oops' }), { status: 500 });

    await expect(readApiError(response, 'Fallback')).resolves.toBe('Fallback');
  });
});
