import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/app-shell/language-switcher', () => ({
  LanguageSwitcher: () => null,
}));

vi.mock('@/lib/auth/actions', () => ({
  signOutAction: vi.fn(),
}));

const mockGetAuthClaims = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  getAuthClaims: () => mockGetAuthClaims(),
}));

import { Header } from '@/components/app-shell/header';

describe('Header', () => {
  it('shows Sign In / Sign Up links and no name when signed out', async () => {
    mockGetAuthClaims.mockResolvedValue(null);

    render(await Header());

    expect(screen.getByText('Auth.signIn')).toBeInTheDocument();
    expect(screen.getByText('Auth.signUp')).toBeInTheDocument();
    expect(screen.queryByText('Auth.signOut')).not.toBeInTheDocument();
  });

  it('shows the user name, History link, and Sign Out when signed in', async () => {
    mockGetAuthClaims.mockResolvedValue({
      sub: 'user-1',
      email: 'ada@example.com',
      user_metadata: { name: 'Ada' },
    });

    render(await Header());

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Auth.history')).toBeInTheDocument();
    expect(screen.getByText('Auth.signOut')).toBeInTheDocument();
    expect(screen.queryByText('Auth.signIn')).not.toBeInTheDocument();
  });

  it('falls back to email when user_metadata has no name', async () => {
    mockGetAuthClaims.mockResolvedValue({
      sub: 'user-2',
      email: 'ada@example.com',
      user_metadata: {},
    });

    render(await Header());

    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
  });

  it('renders no name element when both name and email are absent', async () => {
    mockGetAuthClaims.mockResolvedValue({
      sub: 'user-3',
      user_metadata: {},
    });

    const { container } = render(await Header());

    expect(screen.getByText('Auth.signOut')).toBeInTheDocument();
    expect(container.querySelector('span')).not.toBeInTheDocument();
  });
});
