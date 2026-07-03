import { NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => vi.fn()),
}));

vi.mock('@/i18n/routing', () => ({
  routing: { defaultLocale: 'en', locales: ['en', 'ru'] },
}));

import { mergeSupabaseSessionIntoIntlResponse } from '@/proxy';

describe('mergeSupabaseSessionIntoIntlResponse', () => {
  it('copies Supabase auth cookies and session cache headers into the intl response', () => {
    const supabaseResponse = NextResponse.next();
    supabaseResponse.cookies.set('sb-test-auth-token', 'refreshed', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });
    supabaseResponse.headers.set('cache-control', 'no-store, no-cache');
    supabaseResponse.headers.set('x-supabase-internal', 'ignore-me');
    supabaseResponse.headers.set('location', '/should-not-copy');

    const intlResponse = NextResponse.redirect('http://localhost/en');
    intlResponse.headers.set('location', '/en');

    mergeSupabaseSessionIntoIntlResponse(supabaseResponse, intlResponse);

    const authCookie = intlResponse.cookies.get('sb-test-auth-token');
    expect(authCookie?.value).toBe('refreshed');
    expect(authCookie?.httpOnly).toBe(true);
    expect(authCookie?.path).toBe('/');
    expect(authCookie?.sameSite).toBe('lax');
    expect(intlResponse.headers.get('cache-control')).toBe('no-store, no-cache');
    expect(intlResponse.headers.get('x-supabase-internal')).toBeNull();
    expect(intlResponse.headers.get('location')).toBe('/en');
  });
});
