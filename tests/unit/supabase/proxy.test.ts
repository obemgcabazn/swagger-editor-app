import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const getClaims = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _key: string,
      options: {
        cookies: {
          setAll: (
            cookiesToSet: {
              name: string;
              options?: { httpOnly?: boolean; path?: string };
              value: string;
            }[],
            cacheHeaders: Record<string, string>
          ) => void;
        };
      }
    ) => ({
      auth: {
        getClaims: async () => {
          options.cookies.setAll(
            [
              {
                name: 'sb-test-auth-token',
                options: { httpOnly: true, path: '/' },
                value: 'refreshed',
              },
            ],
            { 'cache-control': 'no-store, no-cache' }
          );
          return getClaims();
        },
      },
    })
  ),
}));

vi.mock('@/lib/supabase/env', () => ({
  getSupabaseEnv: () => ({
    supabasePublishableKey: 'sb_publishable_test',
    supabaseUrl: 'https://example.supabase.co',
  }),
}));

import { updateSession } from '@/lib/supabase/proxy';

describe('updateSession', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a per-request client and validates the session with getClaims', async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: 'user-1' } }, error: null });

    const request = new NextRequest('http://localhost/en');
    const response = await updateSession(request);

    expect(getClaims).toHaveBeenCalledOnce();
    expect(response.cookies.get('sb-test-auth-token')?.value).toBe('refreshed');
    expect(response.headers.get('cache-control')).toBe('no-store, no-cache');
  });
});
