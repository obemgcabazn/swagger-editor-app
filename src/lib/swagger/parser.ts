import { dump, load } from 'js-yaml';
import type { SchemaFormat } from './types';

export function detectFormat(content: string): SchemaFormat {
  const trimmed = content.trim();

  if (!trimmed) {
    return 'yaml';
  }

  return trimmed.startsWith('{') || trimmed.startsWith('[') ? 'json' : 'yaml';
}

export function parseSchemaContent(content: string) {
  if (!content.trim()) {
    return { data: null, error: null };
  }

  const isJson = detectFormat(content) === 'json';

  try {
    const parsed = isJson ? JSON.parse(content) : load(content);

    if (!parsed || typeof parsed !== 'object') {
      return { data: null, error: 'Schema must be an object.' };
    }

    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Parse error.' };
  }
}

export function convertFormat(content: string, targetFormat: SchemaFormat): string {
  if (!content.trim()) {
    return '';
  }

  const { data, error } = parseSchemaContent(content);

  if (error || !data) {
    return content;
  }

  return targetFormat === 'json'
    ? JSON.stringify(data, null, 2)
    : dump(data, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false });
}
