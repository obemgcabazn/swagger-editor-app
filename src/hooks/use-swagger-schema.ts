'use client';

import { useCallback, useState } from 'react';

import { convertFormat } from '@/lib/swagger/parser';
import { deriveSchemaModel, type SchemaModel } from '@/lib/swagger/schema-status';
import type { SchemaFormat } from '@/lib/swagger/types';

export type SwaggerSchemaModel = SchemaModel & {
  loadContent: (content: string, formatOverride?: SchemaFormat) => void;
  reset: () => void;
  toggleFormat: () => void;
  updateContent: (content: string) => void;
};

type UseSwaggerSchemaOptions = Readonly<{
  initialContent?: string;
}>;

export function useSwaggerSchema({ initialContent = '' }: UseSwaggerSchemaOptions = {}) {
  const [model, setModel] = useState<SchemaModel>(() => deriveSchemaModel(initialContent));

  const updateContent = useCallback((content: string) => {
    setModel(deriveSchemaModel(content));
  }, []);

  const loadContent = useCallback((content: string, formatOverride?: SchemaFormat) => {
    setModel(deriveSchemaModel(content, formatOverride));
  }, []);

  const toggleFormat = useCallback(() => {
    setModel((prev) => {
      if (!prev.content.trim()) return prev;

      const nextFormat: SchemaFormat = prev.format === 'json' ? 'yaml' : 'json';
      const converted = convertFormat(prev.content, nextFormat);

      return deriveSchemaModel(converted, nextFormat);
    });
  }, []);

  const reset = useCallback(() => {
    setModel(deriveSchemaModel(''));
  }, []);

  return {
    ...model,
    loadContent,
    reset,
    toggleFormat,
    updateContent,
  };
}
