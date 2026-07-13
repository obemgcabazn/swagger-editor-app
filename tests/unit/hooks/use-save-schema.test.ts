import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSaveSchema } from '@/hooks/use-save-schema';

const FULL = JSON.stringify({ openapi: '3.0.0', info: { title: 'T', version: '1' }, paths: {} });

describe('useSaveSchema', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows saved feedback only after a successful save', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    const contentRef = { current: FULL };
    const formatRef = { current: 'json' as const };

    const { result } = renderHook(() =>
      useSaveSchema({
        contentRef,
        formatRef,
        isAuthenticated: true,
      })
    );

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveStatus).toEqual({ phase: 'saved' });
  });

  it('reads the latest content from refs when saving', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const contentRef = { current: '' };
    const formatRef = { current: 'yaml' as const };

    const { result } = renderHook(() =>
      useSaveSchema({
        contentRef,
        formatRef,
        isAuthenticated: true,
      })
    );

    contentRef.current = FULL;
    formatRef.current = 'json';

    await act(async () => {
      await result.current.save();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: FULL, format: 'json' }),
      });
    });
  });

  it('surfaces save errors without showing saved feedback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      })
    );

    const contentRef = { current: FULL };
    const formatRef = { current: 'json' as const };

    const { result } = renderHook(() =>
      useSaveSchema({
        contentRef,
        formatRef,
        isAuthenticated: true,
      })
    );

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveStatus).toEqual({ phase: 'error', message: 'Unauthorized' });
  });

  it('does not save when the user is unauthenticated', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const contentRef = { current: FULL };
    const formatRef = { current: 'json' as const };

    const { result } = renderHook(() =>
      useSaveSchema({
        contentRef,
        formatRef,
        isAuthenticated: false,
      })
    );

    await act(async () => {
      await result.current.save();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.saveStatus).toEqual({ phase: 'idle' });
  });

  it('does not save empty content', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const contentRef = { current: '   ' };
    const formatRef = { current: 'json' as const };

    const { result } = renderHook(() =>
      useSaveSchema({
        contentRef,
        formatRef,
        isAuthenticated: true,
      })
    );

    await act(async () => {
      await result.current.save();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
