import { describe, expect, it } from 'vitest';
import { convertFormat, detectFormat, parseSchemaContent } from '@/lib/swagger/parser';

describe('detectFormat', () => {
  it('returns json for {', () => expect(detectFormat('{"a":1}')).toBe('json'));
  it('returns json for [', () => expect(detectFormat('[1]')).toBe('json'));
  it('returns yaml for text', () => expect(detectFormat('openapi: 3.0.0')).toBe('yaml'));
  it('returns yaml for empty', () => expect(detectFormat('')).toBe('yaml'));
});

describe('parseSchemaContent', () => {
  it('parses valid JSON', () => {
    const r = parseSchemaContent('{"openapi":"3.0.0"}');
    expect(r.error).toBeNull();
    expect(r.data).toEqual({ openapi: '3.0.0' });
  });

  it('returns error for malformed JSON', () => {
    const r = parseSchemaContent('{"openapi":');
    expect(r.error).toBeTruthy();
    expect(r.data).toBeNull();
  });

  it('returns null for empty', () => {
    const r = parseSchemaContent('');
    expect(r.error).toBeNull();
    expect(r.data).toBeNull();
  });
});

describe('convertFormat', () => {
  it('json to yaml', () => {
    expect(convertFormat('{"a":1}', 'yaml')).toContain('a:');
  });

  it('yaml to json', () => {
    expect(() => JSON.parse(convertFormat('a: 1', 'json'))).not.toThrow();
  });

  it('returns original on error', () => {
    expect(convertFormat('{bad', 'yaml')).toBe('{bad');
  });
});
