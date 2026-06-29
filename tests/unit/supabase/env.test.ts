import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSupabaseEnv } from '@/lib/supabase/env';

describe('getSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns configured Supabase environment variables', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    expect(getSupabaseEnv()).toEqual({
      supabaseAnonKey: 'anon-key',
      supabaseUrl: 'https://example.supabase.co',
    });
  });

  it('throws a readable error when variables are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    expect(() => getSupabaseEnv()).toThrow(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  });
});
