import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ExecuteRequestResult } from '@/lib/requests/execute-request';

const { mockInsert, mockFrom, mockGetAuthClaims, mockCreateSupabaseServerClient } = vi.hoisted(
  () => {
    const mockInsert = vi.fn();
    const mockFrom = vi.fn(() => ({ insert: mockInsert }));
    const mockGetAuthClaims = vi.fn();
    const mockCreateSupabaseServerClient = vi.fn(() => ({ from: mockFrom }));
    return { mockInsert, mockFrom, mockGetAuthClaims, mockCreateSupabaseServerClient };
  }
);

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient,
  getAuthClaims: mockGetAuthClaims,
}));

import { recordRequestHistory } from '@/lib/requests/request-history';

const SAMPLE_RESULT: ExecuteRequestResult = {
  error: null,
  request: {
    bodySizeBytes: 14,
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    url: 'https://api.example.com/users',
  },
  response: {
    body: '{"ok":true}',
    bodySizeBytes: 11,
    durationMs: 42,
    headers: { 'content-type': 'application/json' },
    status: 201,
    statusText: 'Created',
  },
};

describe('recordRequestHistory', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns unauthenticated when claims have no sub', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue(null);

    const result = await recordRequestHistory(SAMPLE_RESULT);

    expect(result).toEqual({ reason: 'unauthenticated', recorded: false });
    expect(mockGetAuthClaims).toHaveBeenCalledWith(supabase);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('inserts a history row and returns recorded: true on success', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockInsert.mockResolvedValue({ error: null });

    const result = await recordRequestHistory(SAMPLE_RESULT);

    expect(result).toEqual({ recorded: true });
    expect(mockFrom).toHaveBeenCalledWith('request_history');
    expect(mockInsert).toHaveBeenCalledWith({
      duration_ms: 42,
      endpoint_url: 'https://api.example.com/users',
      error_details: null,
      method: 'POST',
      request_headers: { 'content-type': 'application/json' },
      request_size_bytes: 14,
      response_headers: { 'content-type': 'application/json' },
      response_size_bytes: 11,
      status_code: 201,
      user_id: 'user-1',
    });
  });

  it('stores request error details when the external call failed', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockInsert.mockResolvedValue({ error: null });

    const failedResult: ExecuteRequestResult = {
      ...SAMPLE_RESULT,
      error: { message: 'Network unavailable' },
      response: null,
    };

    await recordRequestHistory(failedResult);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        error_details: 'Network unavailable',
        response_headers: null,
        response_size_bytes: null,
        status_code: null,
        duration_ms: null,
      })
    );
  });

  it('returns insert_failed without Supabase error details outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockInsert.mockResolvedValue({
      error: {
        code: '23505',
        details: 'duplicate key',
        hint: 'try again',
        message: 'insert failed',
      },
    });

    const result = await recordRequestHistory(SAMPLE_RESULT);

    expect(result).toEqual({ reason: 'insert_failed', recorded: false });
  });

  it('includes Supabase error details in development when insert fails', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockInsert.mockResolvedValue({
      error: {
        code: '23505',
        details: 'duplicate key',
        hint: 'try again',
        message: 'insert failed',
      },
    });

    const result = await recordRequestHistory(SAMPLE_RESULT);

    expect(result).toEqual({
      error: {
        code: '23505',
        details: 'duplicate key',
        hint: 'try again',
        message: 'insert failed',
      },
      reason: 'insert_failed',
      recorded: false,
    });
  });
});
