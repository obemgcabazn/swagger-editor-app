import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TeamMember } from '@/content/team';

vi.mock('next/image', () => ({
  default: ({ alt, src }: ComponentProps<'img'>) => (
    <span aria-label={alt} data-src={src} role="img" />
  ),
}));

import { TeamMemberCard } from '@/components/about/team-member-card';

const baseMember: TeamMember = {
  id: 'test-member',
  name: 'Ada Lovelace',
  roleKey: 'developer',
  image: '/team/ada.jpg',
};

describe('TeamMemberCard', () => {
  it('renders name and role', () => {
    render(<TeamMemberCard githubLabel="GitHub" member={baseMember} roleLabel="Developer" />);

    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
      'data-src',
      '/team/ada.jpg'
    );
  });

  it('renders a GitHub link when github is provided', () => {
    render(
      <TeamMemberCard
        githubLabel="GitHub"
        member={{ ...baseMember, github: 'https://github.com/ada' }}
        roleLabel="Developer"
      />
    );

    const githubLink = screen.getByRole('link', { name: 'GitHub' });

    expect(githubLink).toHaveAttribute('href', 'https://github.com/ada');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('omits GitHub link when github is not provided', () => {
    render(<TeamMemberCard githubLabel="GitHub" member={baseMember} roleLabel="Developer" />);

    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument();
  });

  it('renders an email link when email is provided', () => {
    render(
      <TeamMemberCard
        githubLabel="GitHub"
        member={{ ...baseMember, email: 'ada@example.com' }}
        roleLabel="Developer"
      />
    );

    const emailLink = screen.getByRole('link', { name: 'ada@example.com' });

    expect(emailLink).toHaveAttribute('href', 'mailto:ada@example.com');
  });
});
