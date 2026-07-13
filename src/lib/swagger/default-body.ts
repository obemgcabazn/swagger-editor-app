import type { OpenApiComponents } from '@/lib/swagger/schema-documentation';
import { resolveSchema } from '@/lib/swagger/schema-documentation';

type JsonContent = {
  example?: unknown;
  schema?: unknown;
};

export function getDefaultBody(
  content: JsonContent | undefined,
  components?: OpenApiComponents
): string {
  if (!content) return '';

  if (content.example !== undefined) {
    return JSON.stringify(content.example, null, 2);
  }

  return getDefaultBodyFromSchema(resolveSchema(content.schema, components));
}

function getDefaultBodyFromSchema(schema: unknown): string {
  if (!schema || typeof schema !== 'object') return '';

  const s = schema as Record<string, unknown>;

  if (s.example !== undefined) return JSON.stringify(s.example, null, 2);

  if (s.type === 'object' && s.properties) {
    const props = s.properties as Record<string, { type: string; example?: unknown }>;
    const example: Record<string, unknown> = {};

    for (const [key, prop] of Object.entries(props)) {
      if (prop.example !== undefined) example[key] = prop.example;
      else if (prop.type === 'string') example[key] = 'string';
      else if (prop.type === 'number' || prop.type === 'integer') example[key] = 0;
      else if (prop.type === 'boolean') example[key] = false;
    }

    return JSON.stringify(example, null, 2);
  }

  return '';
}
