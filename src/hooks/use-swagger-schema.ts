'use client';

import { useCallback, useState } from 'react';
import type { SchemaFormat } from '@/lib/swagger/types';
import { convertFormat, parseSchemaContent } from '@/lib/swagger/parser';
import { validateOpenApiSchema } from '@/lib/swagger/validator';

type SchemaState = {
  content: string;
  error: string | null;
  format: SchemaFormat;
  validationErrors: string[];
};

const EMPTY: SchemaState = { content: '', error: null, format: 'yaml', validationErrors: [] };

export function useSwaggerSchema() {
  const [state, setState] = useState<SchemaState>(EMPTY);

  const updateContent = useCallback((content: string) => {
    if (!content.trim()) {
      setState(EMPTY);
      return;
    }

    const format = content.trim().startsWith('{') ? 'json' : 'yaml';
    const { data, error } = parseSchemaContent(content);

    if (error || !data) {
      setState({ content, error, format, validationErrors: [] });
      return;
    }

    const validation = validateOpenApiSchema(data);
    setState({
      content,
      error: null,
      format,
      validationErrors: validation.errors.map((e) => e.message),
    });
  }, []);

  const toggleFormat = useCallback(() => {
    setState((prev) => {
      if (!prev.content.trim()) return prev;

      const next: SchemaFormat = prev.format === 'json' ? 'yaml' : 'json';

      return { ...prev, content: convertFormat(prev.content, next), format: next };
    });
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  return {
    ...state,
    hasValidSchema:
      state.content.trim().length > 0 && !state.error && state.validationErrors.length === 0,
    reset,
    toggleFormat,
    updateContent,
  };
}
