import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockCreateSupabaseServerClient,
  mockGetLocale,
  mockRedirect,
} = vi.hoisted(() => {
  const mockSignInWithPassword = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignOut = vi.fn();
  return {
    mockSignInWithPassword,
    mockSignUp,
    mockSignOut,
    mockCreateSupabaseServerClient: vi.fn(() => ({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signUp: mockSignUp,
        signOut: mockSignOut,
      },
    })),
    mockGetLocale: vi.fn(),
    mockRedirect: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({ redirect: mockRedirect }));
vi.mock('next-intl/server', () => ({ getLocale: mockGetLocale }));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient,
}));

import { signInAction, signOutAction, signUpAction } from '@/app/[locale]/(auth)/actions';

const VALID_SIGN_IN = { email: 'ada@example.com', password: 'anypassword' };
const VALID_SIGN_UP = {
  name: 'Ada',
  email: 'ada@example.com',
  password: 'Password1!',
  passwordConfirm: 'Password1!',
};

describe('signInAction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns validation_error and never calls Supabase for an invalid payload', async () => {
    const result = await signInAction({ email: 'not-an-email', password: '' });

    expect(result).toEqual({ error: 'validation_error' });
    expect(mockCreateSupabaseServerClient).not.toHaveBeenCalled();
  });

  it('returns invalid_credentials when Supabase signIn fails, without redirecting', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    });

    const result = await signInAction(VALID_SIGN_IN);

    expect(result).toEqual({ error: 'invalid_credentials' });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('signs in and redirects to the current locale on success', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetLocale.mockResolvedValue('en');

    await signInAction(VALID_SIGN_IN);

    expect(mockSignInWithPassword).toHaveBeenCalledWith(VALID_SIGN_IN);
    expect(mockRedirect).toHaveBeenCalledWith('/en');
  });
});

describe('signUpAction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns validation_error and never calls Supabase for an invalid payload', async () => {
    const result = await signUpAction({ ...VALID_SIGN_UP, passwordConfirm: 'Different1!' });

    expect(result).toEqual({ error: 'validation_error' });
    expect(mockCreateSupabaseServerClient).not.toHaveBeenCalled();
  });

  it('maps user_already_exists Supabase error code', async () => {
    mockSignUp.mockResolvedValue({ error: { code: 'user_already_exists', message: 'exists' } });

    const result = await signUpAction(VALID_SIGN_UP);

    expect(result).toEqual({ error: 'user_already_exists' });
  });

  it('maps over_email_send_rate_limit Supabase error code to email_rate_limit', async () => {
    mockSignUp.mockResolvedValue({
      error: { code: 'over_email_send_rate_limit', message: 'rate limited' },
    });

    const result = await signUpAction(VALID_SIGN_UP);

    expect(result).toEqual({ error: 'email_rate_limit' });
  });

  it('falls back to sign_up_error for any other Supabase error code', async () => {
    mockSignUp.mockResolvedValue({ error: { code: 'unexpected_failure', message: 'boom' } });

    const result = await signUpAction(VALID_SIGN_UP);

    expect(result).toEqual({ error: 'sign_up_error' });
  });

  it('signs up with the parsed name in user metadata and redirects on success', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    mockGetLocale.mockResolvedValue('ru');

    await signUpAction(VALID_SIGN_UP);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: VALID_SIGN_UP.email,
      password: VALID_SIGN_UP.password,
      options: { data: { name: VALID_SIGN_UP.name } },
    });
    expect(mockRedirect).toHaveBeenCalledWith('/ru');
  });
});

describe('signOutAction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('signs out and redirects to the current locale', async () => {
    mockGetLocale.mockResolvedValue('en');

    await signOutAction();

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockRedirect).toHaveBeenCalledWith('/en');
  });
});
