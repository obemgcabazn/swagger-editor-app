import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import { EndpointList } from '@/components/swagger/endpoint-list';
import { RequestExecutor } from '@/components/swagger/request-executor';

describe('Swagger viewer details', () => {
  it('merges path-level and operation-level parameters with operation precedence', async () => {
    const user = userEvent.setup();

    render(
      <EndpointList
        schema={{
          openapi: '3.0.0',
          paths: {
            '/users/{id}': {
              parameters: [
                { in: 'path', name: 'id', required: false },
                { in: 'query', name: 'lang' },
              ],
              get: {
                parameters: [
                  { in: 'path', name: 'id', required: true },
                  { in: 'header', name: 'x-token' },
                ],
                responses: {
                  '200': { description: 'OK' },
                },
              },
            },
          },
          servers: [{ url: 'https://api.example.com' }],
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: /GET/i }));
    expect(screen.getByText('pathParams')).toBeInTheDocument();
    expect(screen.getByText('queryParams')).toBeInTheDocument();
    expect(screen.getByText('headerParams')).toBeInTheDocument();
    expect(screen.getByText('lang')).toBeInTheDocument();
    expect(screen.getByText('x-token')).toBeInTheDocument();
    expect(screen.getAllByText('id')).toHaveLength(1);
    expect(screen.getByPlaceholderText('required')).toBeInTheDocument();
  });

  it('shows documented status codes even when schema/example are absent', async () => {
    const user = userEvent.setup();

    render(
      <RequestExecutor
        baseUrl="https://api.example.com"
        endpoint={{
          method: 'GET',
          responses: {
            '204': { description: 'No content' },
          },
        }}
        path="/users/{id}"
      />
    );

    expect(screen.getByText('204')).toBeInTheDocument();
    expect(screen.getByText('No content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /No content/i }));

    expect(screen.getByText('responseDetailsUnavailable')).toBeInTheDocument();
  });
});
