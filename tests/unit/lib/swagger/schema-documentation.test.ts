import { describe, expect, it } from 'vitest';

import {
  formatSchemaDocument,
  getRequestExample,
  getRequestSchema,
  getResponseExample,
  getResponseSchema,
} from '@/lib/swagger/schema-documentation';

const components = {
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
};

describe('schema-documentation', () => {
  it('resolves request schemas from component refs', () => {
    const schema = getRequestSchema({ schema: { $ref: '#/components/schemas/Post' } }, components);

    expect(schema).toEqual(components.schemas.Post);
  });

  it('returns request examples from content example', () => {
    const example = getRequestExample(
      {
        example: { body: 'hello', title: 'foo', userId: 1 },
        schema: { $ref: '#/components/schemas/Post' },
      },
      components
    );

    expect(example).toEqual({ body: 'hello', title: 'foo', userId: 1 });
  });

  it('falls back to generated request examples from schema properties', () => {
    const example = getRequestExample(
      { schema: { $ref: '#/components/schemas/Post' } },
      components
    );

    expect(example).toEqual({ body: 'string', title: 'string', userId: 0 });
  });

  it('returns response schema and example from spec content', () => {
    const response = {
      content: {
        'application/json': {
          example: { id: 1 },
          schema: {
            type: 'object',
            properties: { id: { type: 'integer' } },
          },
        },
      },
    };

    expect(getResponseSchema(response, components)).toEqual({
      type: 'object',
      properties: { id: { type: 'integer' } },
    });
    expect(getResponseExample(response, components)).toEqual({ id: 1 });
  });

  it('formats schema documents as pretty JSON', () => {
    expect(formatSchemaDocument({ id: 1 })).toBe('{\n  "id": 1\n}');
    expect(formatSchemaDocument(null)).toBeNull();
  });
});
