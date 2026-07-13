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

import { Footer } from '@/components/app-shell/footer';

describe('Footer', () => {
  it('uses the shared app container for alignment with the header', async () => {
    const { container } = render(await Footer());

    expect(container.querySelector('footer .app-container')).not.toBeNull();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
    expect(screen.getByText('Navigation.main')).toBeInTheDocument();
    expect(screen.getByText('Navigation.about')).toBeInTheDocument();
  });
});
