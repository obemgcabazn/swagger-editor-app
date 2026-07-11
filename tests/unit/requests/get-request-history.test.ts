import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  mockGetAuthClaims,
  mockCreateSupabaseServerClient,
  mockSelect,
  mockEq,
  mockMaybeSingle,
  mockOrder,
  mockFrom,
} = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockOrder = vi.fn();
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockGetAuthClaims = vi.fn();
  const mockCreateSupabaseServerClient = vi.fn(() => ({ from: mockFrom }));

  return {
    mockCreateSupabaseServerClient,
    mockEq,
    mockFrom,
    mockGetAuthClaims,
    mockMaybeSingle,
    mockOrder,
    mockSelect,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient,
  getAuthClaims: mockGetAuthClaims,
}));

import {
  getRequestHistory,
  getRequestHistoryEntry,
  type RequestHistoryRow,
} from '@/lib/requests/request-history';

const SAMPLE_ROW: RequestHistoryRow = {
  created_at: '2026-07-01T10:00:00.000Z',
  duration_ms: 42,
  endpoint_url: 'https://api.example.com/users',
  error_details: null,
  id: 'entry-1',
  method: 'GET',
  request_headers: { accept: 'application/json' },
  request_size_bytes: 0,
  request_timestamp: '2026-07-01T10:00:00.000Z',
  response_headers: { 'content-type': 'application/json' },
  response_size_bytes: 128,
  status_code: 200,
  user_id: 'user-1',
};

describe('getRequestHistory', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when the user is unauthenticated', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue(null);

    const result = await getRequestHistory();

    expect(result).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns rows ordered by request_timestamp descending', async () => {
    const supabase = { from: mockFrom };
    const rows = [SAMPLE_ROW, { ...SAMPLE_ROW, id: 'entry-2' }];
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockOrder.mockResolvedValue({ data: rows, error: null });

    const result = await getRequestHistory();

    expect(result).toEqual(rows);
    expect(mockFrom).toHaveBeenCalledWith('request_history');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('request_timestamp', { ascending: false });
    expect(mockGetAuthClaims).toHaveBeenCalledWith(supabase);
  });

  it('returns an empty array when Supabase returns null data', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockOrder.mockResolvedValue({ data: null, error: null });

    const result = await getRequestHistory();

    expect(result).toEqual([]);
  });

  it('throws when the Supabase query fails', async () => {
    const supabase = { from: mockFrom };
    const queryError = new Error('query failed');
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockOrder.mockResolvedValue({ data: null, error: queryError });

    await expect(getRequestHistory()).rejects.toThrow('query failed');
  });
});

describe('getRequestHistoryEntry', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when the user is unauthenticated', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue(null);

    const result = await getRequestHistoryEntry('entry-1');

    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns a single row when found', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockMaybeSingle.mockResolvedValue({ data: SAMPLE_ROW, error: null });

    const result = await getRequestHistoryEntry('entry-1');

    expect(result).toEqual(SAMPLE_ROW);
    expect(mockFrom).toHaveBeenCalledWith('request_history');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('id', 'entry-1');
    expect(mockMaybeSingle).toHaveBeenCalled();
  });

  it('returns null when the row does not exist', async () => {
    const supabase = { from: mockFrom };
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await getRequestHistoryEntry('missing-entry');

    expect(result).toBeNull();
  });

  it('throws when the Supabase query fails', async () => {
    const supabase = { from: mockFrom };
    const queryError = new Error('query failed');
    mockCreateSupabaseServerClient.mockResolvedValue(supabase);
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
    mockMaybeSingle.mockResolvedValue({ data: null, error: queryError });

    await expect(getRequestHistoryEntry('entry-1')).rejects.toThrow('query failed');
  });
});
