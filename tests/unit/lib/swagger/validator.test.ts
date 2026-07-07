import { describe, expect, it } from 'vitest';
import { validateOpenApiSchema } from '@/lib/swagger/validator';

const valid = { openapi: '3.0.0', info: { title: 'T', version: '1' }, paths: {} };

describe('validateOpenApiSchema', () => {
  it('valid', () => expect(validateOpenApiSchema(valid).isValid).toBe(true));
  it('rejects null', () => expect(validateOpenApiSchema(null).isValid).toBe(false));
  it('missing openapi', () =>
    expect(validateOpenApiSchema({ ...valid, openapi: undefined }).isValid).toBe(false));
  it('missing info', () =>
    expect(validateOpenApiSchema({ ...valid, info: undefined }).isValid).toBe(false));
  it('missing paths', () =>
    expect(validateOpenApiSchema({ ...valid, paths: undefined }).isValid).toBe(false));
});
