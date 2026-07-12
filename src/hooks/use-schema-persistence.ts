'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type UseSchemaPersistenceOptions = Readonly<{
  content: string;
  format: 'json' | 'yaml';
  isAuthenticated: boolean;
  onLoad: (content: string) => void;
}>;

export function useSchemaPersistence({
  content,
  format,
  isAuthenticated,
  onLoad,
}: UseSchemaPersistenceOptions) {
  const loadedRef = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || loadedRef.current) return;

    loadedRef.current = true;

    fetch('/api/schemas')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: { content: string; format: string }) => {
        if (data.content) onLoad(data.content);
      })
      .catch(() => {});
  }, [isAuthenticated, onLoad]);

  const save = useCallback(() => {
    if (!isAuthenticated || !content.trim()) return;

    fetch('/api/schemas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, format }),
    })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .catch(() => {});
  }, [content, format, isAuthenticated]);

  return { saved, save };
}
