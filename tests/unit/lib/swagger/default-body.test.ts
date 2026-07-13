import { describe, expect, it } from 'vitest';

import { getDefaultBody } from '@/lib/swagger/default-body';

describe('getDefaultBody', () => {
  it('uses content-level examples when present', () => {
    const body = getDefaultBody({
      example: {
        body: 'And your body is your body',
        title: 'foo',
        userId: 1,
      },
      schema: { type: 'object' },
    });

    expect(JSON.parse(body)).toEqual({
      body: 'And your body is your body',
      title: 'foo',
      userId: 1,
    });
  });

  it('resolves schema refs from components', () => {
    const body = getDefaultBody(
      {
        schema: { $ref: '#/components/schemas/Post' },
      },
      {
        schemas: {
          Post: {
            type: 'object',
            properties: {
              body: { type: 'string' },
              title: { type: 'string' },
              userId: { type: 'integer' },
            },
          },
        },
      }
    );

    expect(JSON.parse(body)).toEqual({
      body: 'string',
      title: 'string',
      userId: 0,
    });
  });

  it('uses schema examples when content example is absent', () => {
    const body = getDefaultBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Ada' },
        },
      },
    });

    expect(JSON.parse(body)).toEqual({ name: 'Ada' });
  });
});
