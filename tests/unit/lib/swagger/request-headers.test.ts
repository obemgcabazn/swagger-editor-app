import { describe, expect, it } from 'vitest';

import { buildCookieHeader, buildRequestHeaders } from '@/lib/swagger/request-headers';

describe('buildCookieHeader', () => {
  it('returns null when no cookie params are set', () => {
    expect(buildCookieHeader({})).toBeNull();
  });

  it('skips empty cookie values', () => {
    expect(buildCookieHeader({ sessionId: 'abc', theme: '   ' })).toBe('sessionId=abc');
  });

  it('serializes multiple cookies into one header value', () => {
    expect(buildCookieHeader({ sessionId: 'abc123', theme: 'dark' })).toBe(
      'sessionId=abc123; theme=dark'
    );
  });

  it('encodes cookie names and values', () => {
    expect(buildCookieHeader({ 'a b': 'c=d' })).toBe('a%20b=c%3Dd');
  });
});

describe('buildRequestHeaders', () => {
  it('merges custom headers and cookies', () => {
    expect(
      buildRequestHeaders({
        headers: [{ key: 'authorization', value: 'Bearer token' }],
        cookieParams: { sessionId: 'abc123', theme: 'dark' },
      })
    ).toEqual({
      authorization: 'Bearer token',
      cookie: 'sessionId=abc123; theme=dark',
    });
  });

  it('adds content-type when provided', () => {
    expect(
      buildRequestHeaders({
        contentType: 'application/json',
        headers: [],
        cookieParams: { sessionId: 'abc' },
      })
    ).toEqual({
      cookie: 'sessionId=abc',
      'content-type': 'application/json',
    });
  });

  it('ignores header rows with blank keys', () => {
    expect(
      buildRequestHeaders({
        headers: [
          { key: '   ', value: 'ignored' },
          { key: 'accept', value: 'application/json' },
        ],
      })
    ).toEqual({
      accept: 'application/json',
    });
  });
});
