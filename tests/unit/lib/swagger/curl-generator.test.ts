import { describe, expect, it } from 'vitest';

import { generateCurlCommand } from '@/lib/swagger/curl-generator';
import { buildRequestHeaders } from '@/lib/swagger/request-headers';

describe('generateCurlCommand', () => {
  it('includes cookie header generated from request state', () => {
    const headers = buildRequestHeaders({
      headers: [{ key: 'authorization', value: 'Bearer token' }],
      cookieParams: { sessionId: 'abc123' },
    });

    const curl = generateCurlCommand('GET', 'https://api.example.com/users/me', headers, null);

    expect(curl).toContain("-H 'authorization: Bearer token'");
    expect(curl).toContain("-H 'cookie: sessionId=abc123'");
    expect(curl).toContain("'https://api.example.com/users/me'");
  });

  it('includes method, body, and content-type for POST requests', () => {
    const headers = buildRequestHeaders({
      contentType: 'application/json',
      cookieParams: { sessionId: 'abc123' },
      headers: [],
    });

    const curl = generateCurlCommand(
      'POST',
      'https://api.example.com/users',
      headers,
      '{"name":"Ada"}'
    );

    expect(curl).toContain('-X POST');
    expect(curl).toContain("-H 'cookie: sessionId=abc123'");
    expect(curl).toContain("-H 'content-type: application/json'");
    expect(curl).toContain(`-d '{"name":"Ada"}'`);
  });
});
