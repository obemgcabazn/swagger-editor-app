import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === 'listSummary' && values && typeof values.count === 'number') {
      return `HistoryPage.listSummary:${values.count}`;
    }
    return `HistoryPage.${key}`;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { HistoryContent } from '@/app/[locale]/history/history-content';
import type { RequestHistoryRow } from '@/lib/requests/request-history';

function makeRow(partial: Partial<RequestHistoryRow> = {}): RequestHistoryRow {
  return {
    created_at: '2026-07-01T10:00:00.000Z',
    duration_ms: 42,
    endpoint_url: 'https://api.example.com/users',
    error_details: null,
    id: 'entry-1',
    method: 'GET',
    request_headers: { accept: 'application/json' },
    request_size_bytes: 0,
    request_timestamp: '2026-07-01T10:00:00.000Z',
    response_headers: { 'content-type': 'application/json' },
    response_size_bytes: 128,
    status_code: 200,
    user_id: 'user-1',
    ...partial,
  };
}

describe('HistoryContent', () => {
  it('renders the empty state message and links when there are no entries', () => {
    render(<HistoryContent entries={[]} />);

    expect(screen.getByText('HistoryPage.emptyMessage')).toBeInTheDocument();
    expect(screen.getByText('HistoryPage.emptyHint')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'HistoryPage.editorLink' })).toHaveAttribute(
      'href',
      '/#editor'
    );
    expect(screen.getByRole('link', { name: 'HistoryPage.viewerLink' })).toHaveAttribute(
      'href',
      '/#viewer'
    );
  });

  it('renders a list of entries with links to detail pages', () => {
    const entries = [
      makeRow({ id: 'entry-2', endpoint_url: 'https://api.example.com/teams', method: 'POST' }),
      makeRow({ id: 'entry-1', endpoint_url: 'https://api.example.com/users', method: 'GET' }),
    ];

    const { container } = render(<HistoryContent entries={entries} />);

    expect(screen.getByText('HistoryPage.listSummary:2')).toBeInTheDocument();

    const links = container.querySelectorAll('a[href^="/history/"]');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/history/entry-2');
    expect(links[1]).toHaveAttribute('href', '/history/entry-1');

    expect(screen.getByText('https://api.example.com/teams')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument();
    expect(screen.getByText('POST', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('GET', { exact: true })).toBeInTheDocument();
  });

  it('renders placeholders when duration and status are missing', () => {
    render(
      <HistoryContent
        entries={[
          makeRow({
            duration_ms: null,
            id: 'entry-1',
            status_code: null,
          }),
        ]}
      />
    );

    // `formatStatusCode(null)` renders the badge label as '—'
    expect(screen.getByText('—')).toBeInTheDocument();

    // `formatDurationMs(null)` is rendered next to the timestamp ("... · —")
    expect(
      screen.getByText((_, node) => {
        if (!node || node.nodeName !== 'P') return false;
        const text = node.textContent ?? '';
        return text.includes('·') && text.trim().endsWith('—');
      })
    ).toBeInTheDocument();
  });
});
