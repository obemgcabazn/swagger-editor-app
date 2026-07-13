import { describe, expect, it } from 'vitest';

import { formatExecutionResult } from '@/lib/swagger/format-execution-result';

describe('formatExecutionResult', () => {
  it('pretty-prints nested JSON strings in the execution payload', () => {
    const formatted = formatExecutionResult({
      response: {
        body: '{"id":1,"title":"foo"}',
        status: 200,
      },
    });

    expect(formatted).toContain('"body": {');
    expect(formatted).toContain('"id": 1');
    expect(formatted).toContain('"title": "foo"');
    expect(formatted).not.toContain('"{\\"id\\":1');
  });

  it('leaves non-JSON strings unchanged', () => {
    const formatted = formatExecutionResult({
      response: {
        body: 'plain text',
      },
    });

    expect(formatted).toContain('"body": "plain text"');
  });
});
