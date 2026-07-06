import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSupabaseDevAuthEnv, getSupabaseEnv } from '@/lib/supabase/env';

describe('getSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns configured Supabase environment variables', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');

    expect(getSupabaseEnv()).toEqual({
      supabasePublishableKey: 'sb_publishable_test',
      supabaseUrl: 'https://example.supabase.co',
    });
  });

  it('throws a readable error when variables are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');

    expect(() => getSupabaseEnv()).toThrow(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  });
});

describe('getSupabaseDevAuthEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns configured development auth credentials', () => {
    vi.stubEnv('SUPABASE_DEV_USER_EMAIL', 'dev@example.com');
    vi.stubEnv('SUPABASE_DEV_USER_PASSWORD', 'password');

    expect(getSupabaseDevAuthEnv()).toEqual({
      email: 'dev@example.com',
      password: 'password',
    });
  });

  it('throws a readable error when development auth credentials are missing', () => {
    vi.stubEnv('SUPABASE_DEV_USER_EMAIL', '');
    vi.stubEnv('SUPABASE_DEV_USER_PASSWORD', '');

    expect(() => getSupabaseDevAuthEnv()).toThrow(
      'Missing Supabase dev auth environment variables: SUPABASE_DEV_USER_EMAIL, SUPABASE_DEV_USER_PASSWORD'
    );
  });
});
