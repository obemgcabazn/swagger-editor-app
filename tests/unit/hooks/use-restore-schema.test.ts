import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useRestoreSchema } from '@/hooks/use-restore-schema';

const FULL = JSON.stringify({ openapi: '3.0.0', info: { title: 'T', version: '1' }, paths: {} });

describe('useRestoreSchema', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restores saved schema with format on mount', async () => {
    const onLoad = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: FULL, format: 'json' }),
      })
    );

    const { result } = renderHook(() =>
      useRestoreSchema({
        isAuthenticated: true,
        onLoad,
      })
    );

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith(FULL, 'json');
      expect(result.current.restoreStatus).toEqual({ phase: 'idle' });
    });
  });

  it('surfaces restore errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      })
    );

    const { result } = renderHook(() =>
      useRestoreSchema({
        isAuthenticated: true,
        onLoad: vi.fn(),
      })
    );

    await waitFor(() => {
      expect(result.current.restoreStatus).toEqual({ phase: 'error', message: 'Unauthorized' });
    });
  });

  it('does not fetch when the user is unauthenticated', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderHook(() =>
      useRestoreSchema({
        isAuthenticated: false,
        onLoad: vi.fn(),
      })
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips onLoad when the saved schema is empty', async () => {
    const onLoad = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: '', format: 'yaml' }),
      })
    );

    renderHook(() =>
      useRestoreSchema({
        isAuthenticated: true,
        onLoad,
      })
    );

    await waitFor(() => {
      expect(onLoad).not.toHaveBeenCalled();
    });
  });
});
