type JsonContent = {
  example?: unknown;
  examples?: Record<string, { value?: unknown }>;
  schema?: unknown;
};

export type OpenApiComponents = {
  schemas?: Record<string, unknown>;
};

export function resolveSchema(schema: unknown, components?: OpenApiComponents): unknown {
  if (!schema || typeof schema !== 'object') return schema;

  const s = schema as Record<string, unknown>;
  const ref = s.$ref;

  if (typeof ref !== 'string') return schema;

  const match = ref.match(/^#\/components\/schemas\/(.+)$/);

  if (!match || !components?.schemas) return schema;

  return resolveSchema(components.schemas[match[1]], components);
}

export function getRequestJsonContent(requestBody?: {
  content?: Record<string, JsonContent>;
}): JsonContent | undefined {
  return requestBody?.content?.['application/json'];
}

export function getRequestSchema(
  content: JsonContent | undefined,
  components?: OpenApiComponents
): Record<string, unknown> | null {
  if (!content?.schema) return null;

  const resolved = resolveSchema(content.schema, components);

  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) {
    return null;
  }

  return resolved as Record<string, unknown>;
}

export function getRequestExample(
  content: JsonContent | undefined,
  components?: OpenApiComponents
): unknown | null {
  if (!content) return null;

  if (content.example !== undefined) return content.example;

  const examples = content.examples;

  if (examples) {
    const first = Object.values(examples).find((entry) => entry.value !== undefined);

    if (first?.value !== undefined) return first.value;
  }

  const resolved = resolveSchema(content.schema, components);

  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) {
    return null;
  }

  const schema = resolved as Record<string, unknown>;

  if (schema.example !== undefined) return schema.example;

  if (schema.type === 'object' && schema.properties) {
    const props = schema.properties as Record<string, { type: string; example?: unknown }>;
    const example: Record<string, unknown> = {};

    for (const [key, prop] of Object.entries(props)) {
      if (prop.example !== undefined) example[key] = prop.example;
      else if (prop.type === 'string') example[key] = 'string';
      else if (prop.type === 'number' || prop.type === 'integer') example[key] = 0;
      else if (prop.type === 'boolean') example[key] = false;
    }

    return Object.keys(example).length > 0 ? example : null;
  }

  return null;
}

export function getResponseJsonContent(response: {
  content?: Record<string, JsonContent>;
}): JsonContent | undefined {
  return response.content?.['application/json'];
}

export function getResponseSchema(
  response: { content?: Record<string, JsonContent> },
  components?: OpenApiComponents
): Record<string, unknown> | null {
  const content = getResponseJsonContent(response);

  if (!content?.schema) return null;

  const resolved = resolveSchema(content.schema, components);

  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) {
    return null;
  }

  return resolved as Record<string, unknown>;
}

export function getResponseExample(
  response: { content?: Record<string, JsonContent> },
  components?: OpenApiComponents
): unknown | null {
  const content = getResponseJsonContent(response);

  if (!content) return null;

  if (content.example !== undefined) return content.example;

  const examples = content.examples;

  if (examples) {
    const first = Object.values(examples).find((entry) => entry.value !== undefined);

    if (first?.value !== undefined) return first.value;
  }

  const resolved = resolveSchema(content.schema, components);

  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) {
    return null;
  }

  const schema = resolved as Record<string, unknown>;

  return schema.example ?? null;
}

export function formatSchemaDocument(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  return JSON.stringify(value, null, 2);
}
