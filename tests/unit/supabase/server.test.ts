import { afterEach, describe, expect, it, vi } from 'vitest';

const mockGetClaims = vi.fn();
const mockGetUser = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: vi.fn() }));
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: mockGetClaims,
      getUser: mockGetUser,
    },
  })),
}));
vi.mock('@/lib/supabase/env', () => ({
  getSupabaseEnv: () => ({
    supabasePublishableKey: 'sb_test_key',
    supabaseUrl: 'https://test.supabase.co',
  }),
}));

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAuthClaims, getAuthenticatedUser } from '@/lib/supabase/server';

function setupCookieStore() {
  vi.mocked(cookies).mockResolvedValue({ getAll: vi.fn(() => []), set: vi.fn() } as never);
}

describe('getAuthClaims', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates an internal client and returns claims when no client is provided', async () => {
    setupCookieStore();
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1', email: 'u@e.com' } },
      error: null,
    });

    const result = await getAuthClaims();

    expect(result).toEqual({ sub: 'user-1', email: 'u@e.com' });
    expect(createServerClient).toHaveBeenCalledOnce();
  });

  it('uses the provided client and skips internal client creation', async () => {
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-2' } }, error: null }),
      },
    } as never;

    const result = await getAuthClaims(mockClient);

    expect(result).toEqual({ sub: 'user-2' });
    expect(createServerClient).not.toHaveBeenCalled();
    expect(cookies).not.toHaveBeenCalled();
  });

  it('returns null when getClaims resolves with an error', async () => {
    setupCookieStore();
    mockGetClaims.mockResolvedValue({ data: null, error: { message: 'JWT invalid' } });

    expect(await getAuthClaims()).toBeNull();
  });

  it('returns null when getClaims resolves with null data and no error', async () => {
    setupCookieStore();
    mockGetClaims.mockResolvedValue({ data: null, error: null });

    expect(await getAuthClaims()).toBeNull();
  });
});

describe('getAuthenticatedUser', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the user when authentication succeeds', async () => {
    setupCookieStore();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'u@e.com' } },
      error: null,
    });

    expect(await getAuthenticatedUser()).toEqual({ id: 'user-1', email: 'u@e.com' });
  });

  it('returns null when getUser resolves with an error', async () => {
    setupCookieStore();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'token expired' } });

    expect(await getAuthenticatedUser()).toBeNull();
  });

  it('returns null when getUser resolves with a null user', async () => {
    setupCookieStore();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    expect(await getAuthenticatedUser()).toBeNull();
  });
});
