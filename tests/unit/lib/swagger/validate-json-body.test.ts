import { describe, expect, it } from 'vitest';

import { getJsonBodyValidationError } from '@/lib/swagger/validate-json-body';

describe('getJsonBodyValidationError', () => {
  it('returns null for empty or whitespace-only bodies', () => {
    expect(getJsonBodyValidationError('')).toBeNull();
    expect(getJsonBodyValidationError('   ')).toBeNull();
  });

  it('returns null for valid JSON', () => {
    expect(getJsonBodyValidationError('{"title":"foo"}')).toBeNull();
    expect(getJsonBodyValidationError('[\n  1,\n  2\n]')).toBeNull();
  });

  it('returns an error for invalid JSON', () => {
    expect(getJsonBodyValidationError('And your body is your body')).toBe('invalid');
    expect(getJsonBodyValidationError('{title:"foo"}')).toBe('invalid');
  });
});
