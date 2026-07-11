import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

const mockPathname = vi.fn(() => '/about');
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    locale,
    ...props
  }: ComponentProps<'a'> & { href: string; locale?: string }) => (
    <a data-locale={locale} href={locale ? `/${locale}${href}` : href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => mockPathname(),
}));

import { LanguageSwitcher } from '@/components/app-shell/language-switcher';

describe('LanguageSwitcher', () => {
  it('renders a locale link for each supported locale on the current pathname', () => {
    render(<LanguageSwitcher label="Language" />);

    expect(screen.getByRole('navigation', { name: 'Language' })).toBeInTheDocument();

    const enLink = screen.getByRole('link', { name: 'en' });
    const ruLink = screen.getByRole('link', { name: 'ru' });

    expect(enLink).toHaveAttribute('href', '/en/about');
    expect(ruLink).toHaveAttribute('href', '/ru/about');
    expect(enLink).toHaveAttribute('data-locale', 'en');
    expect(ruLink).toHaveAttribute('data-locale', 'ru');
  });

  it('marks the active locale with aria-current', () => {
    render(<LanguageSwitcher label="Language" />);

    expect(screen.getByRole('link', { name: 'en' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'ru' })).not.toHaveAttribute('aria-current');
  });
});
