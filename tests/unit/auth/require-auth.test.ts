import { afterEach, describe, expect, it, vi } from 'vitest';

const { mockGetAuthClaims, mockGetLocale, mockRedirect } = vi.hoisted(() => ({
  mockGetAuthClaims: vi.fn(),
  mockGetLocale: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({ redirect: mockRedirect }));
vi.mock('next-intl/server', () => ({ getLocale: mockGetLocale }));
vi.mock('@/lib/supabase/server', () => ({
  getAuthClaims: mockGetAuthClaims,
}));

import { requireAuth, redirectIfAuthenticated } from '@/lib/auth/require-auth';

describe('requireAuth', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns claims when the user is authenticated', async () => {
    const claims = { sub: 'user-1', email: 'ada@example.com' };
    mockGetAuthClaims.mockResolvedValue(claims);

    const result = await requireAuth();

    expect(result).toBe(claims);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to sign-in when there are no claims', async () => {
    mockGetAuthClaims.mockResolvedValue(null);
    mockGetLocale.mockResolvedValue('en');

    await requireAuth();

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/sign-in', locale: 'en' });
  });
});

describe('redirectIfAuthenticated', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when the user is not authenticated', async () => {
    mockGetAuthClaims.mockResolvedValue(null);

    await redirectIfAuthenticated();

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects home when the user is authenticated', async () => {
    mockGetAuthClaims.mockResolvedValue({ sub: 'user-1', email: 'ada@example.com' });
    mockGetLocale.mockResolvedValue('en');

    await redirectIfAuthenticated();

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/', locale: 'en' });
  });
});
