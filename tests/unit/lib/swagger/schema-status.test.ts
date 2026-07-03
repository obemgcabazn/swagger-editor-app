import { describe, expect, it } from 'vitest';

import { deriveSchemaModel } from '@/lib/swagger/schema-status';

const FULL = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'T', version: '1' },
  paths: {},
});

describe('deriveSchemaModel', () => {
  it('returns idle for empty content', () => {
    expect(deriveSchemaModel('')).toEqual({
      content: '',
      errors: [],
      format: 'yaml',
      parsed: null,
      status: 'idle',
    });
  });

  it('returns invalid for parse errors', () => {
    const result = deriveSchemaModel('{"openapi":');

    expect(result.status).toBe('invalid');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.parsed).toBeNull();
  });

  it('returns invalid for structural validation errors', () => {
    const result = deriveSchemaModel('{"openapi":"3.0.0"}');

    expect(result.status).toBe('invalid');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.parsed).toBeNull();
  });

  it('returns valid with parsed schema', () => {
    const result = deriveSchemaModel(FULL);

    expect(result.status).toBe('valid');
    expect(result.errors).toEqual([]);
    expect(result.parsed).toEqual(JSON.parse(FULL));
    expect(result.format).toBe('json');
  });

  it('detects json array roots as json', () => {
    expect(deriveSchemaModel('[1, 2]').format).toBe('json');
  });
});
