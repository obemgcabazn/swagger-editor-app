import { detectFormat, parseSchemaContent } from './parser';
import type { SchemaFormat } from './types';
import { validateOpenApiSchema } from './validator';

export type SchemaStatus = 'idle' | 'pending' | 'invalid' | 'valid';

export type SchemaModel = {
  content: string;
  errors: string[];
  format: SchemaFormat;
  parsed: Record<string, unknown> | null;
  status: SchemaStatus;
};

const IDLE: SchemaModel = {
  content: '',
  errors: [],
  format: 'yaml',
  parsed: null,
  status: 'idle',
};

export function deriveSchemaModel(content: string, formatOverride?: SchemaFormat): SchemaModel {
  if (!content.trim()) {
    return IDLE;
  }

  const format = formatOverride ?? detectFormat(content);
  const { data, error } = parseSchemaContent(content);

  if (error || !data) {
    return {
      content,
      errors: error ? [error] : ['Schema must be an object.'],
      format,
      parsed: null,
      status: 'invalid',
    };
  }

  const validation = validateOpenApiSchema(data);

  if (!validation.isValid) {
    return {
      content,
      errors: validation.errors.map((e) => e.message),
      format,
      parsed: null,
      status: 'invalid',
    };
  }

  return {
    content,
    errors: [],
    format,
    parsed: data as Record<string, unknown>,
    status: 'valid',
  };
}
