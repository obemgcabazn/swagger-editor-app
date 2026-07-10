import type { SchemaValidationResult } from './types';

const CHECKS: Array<{
  path: string[];
  check: (s: Record<string, unknown>) => boolean;
  message: string;
}> = [
  {
    path: ['openapi'],
    check: (s) => typeof s.openapi === 'string',
    message: 'Missing "openapi" field.',
  },
  {
    path: ['info'],
    check: (s) => typeof s.info === 'object' && s.info !== null,
    message: 'Missing "info" object.',
  },
  {
    path: ['info', 'title'],
    check: (s) => typeof (s.info as Record<string, unknown>)?.title === 'string',
    message: 'Missing "info.title" field.',
  },
  {
    path: ['info', 'version'],
    check: (s) => typeof (s.info as Record<string, unknown>)?.version === 'string',
    message: 'Missing "info.version" field.',
  },
  {
    path: ['paths'],
    check: (s) => typeof s.paths === 'object' && s.paths !== null,
    message: 'Missing "paths" object.',
  },
];

export function validateOpenApiSchema(schema: unknown): SchemaValidationResult {
  if (!schema || typeof schema !== 'object') {
    return { errors: [{ message: 'Schema must be an object.', path: ['$'] }], isValid: false };
  }

  const spec = schema as Record<string, unknown>;
  const errors = CHECKS.filter((c) => !c.check(spec)).map((c) => ({
    message: c.message,
    path: c.path,
  }));

  return { errors, isValid: errors.length === 0 };
}
