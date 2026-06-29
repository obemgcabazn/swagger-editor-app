import { describe, expect, it, vi } from 'vitest';

import {
  executeExternalRequest,
  parseExecuteRequestPayload,
  sanitizeRequestHeaders,
} from '@/lib/requests/execute-request';

describe('parseExecuteRequestPayload', () => {
  it('normalizes a valid payload', () => {
    expect(
      parseExecuteRequestPayload({
        body: '{"ok":true}',
        headers: {
          authorization: 'Bearer token',
          host: 'malicious.example',
        },
        method: 'post',
        url: 'https://api.example.com/users',
      })
    ).toEqual({
      data: {
        body: '{"ok":true}',
        headers: {
          authorization: 'Bearer token',
        },
        method: 'POST',
        url: 'https://api.example.com/users',
      },
      error: null,
    });
  });

  it('rejects invalid URLs and unsupported methods', () => {
    expect(parseExecuteRequestPayload({ method: 'GET', url: 'ftp://example.com' }).error).toBe(
      'URL must be a valid http or https URL.'
    );
    expect(
      parseExecuteRequestPayload({ method: 'CONNECT', url: 'https://example.com' }).error
    ).toBe('Method must be one of: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.');
  });

  it('rejects request bodies for GET and HEAD requests', () => {
    expect(
      parseExecuteRequestPayload({
        body: 'not allowed',
        method: 'GET',
        url: 'https://example.com',
      }).error
    ).toBe('GET requests cannot include a body.');
  });
});

describe('sanitizeRequestHeaders', () => {
  it('removes hop-by-hop and host-controlled headers', () => {
    expect(
      sanitizeRequestHeaders({
        authorization: 'Bearer token',
        connection: 'keep-alive',
        'content-length': '100',
        host: 'example.com',
      })
    ).toEqual({
      authorization: 'Bearer token',
    });
  });
});

describe('executeExternalRequest', () => {
  it('returns a structured external response', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response('{"ok":true}', {
        headers: {
          'content-type': 'application/json',
        },
        status: 201,
        statusText: 'Created',
      });
    }) as typeof fetch;

    const result = await executeExternalRequest(
      {
        body: '{"name":"Ada"}',
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
        url: 'https://api.example.com/users',
      },
      fetchImpl
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        body: '{"name":"Ada"}',
        method: 'POST',
      })
    );
    expect(result.error).toBeNull();
    expect(result.request.bodySizeBytes).toBe(14);
    expect(result.response).toEqual(
      expect.objectContaining({
        body: '{"ok":true}',
        bodySizeBytes: 11,
        headers: {
          'content-type': 'application/json',
        },
        status: 201,
        statusText: 'Created',
      })
    );
  });

  it('returns network failures as response payload errors', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('Network unavailable');
    }) as typeof fetch;

    const result = await executeExternalRequest(
      {
        body: null,
        headers: {},
        method: 'GET',
        url: 'https://api.example.com/users',
      },
      fetchImpl
    );

    expect(result.response).toBeNull();
    expect(result.error).toEqual({ message: 'Network unavailable' });
  });
});
