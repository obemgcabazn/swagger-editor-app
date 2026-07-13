import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSwaggerSchema } from '@/hooks/use-swagger-schema';

const FULL = JSON.stringify({ openapi: '3.0.0', info: { title: 'T', version: '1' }, paths: {} });

describe('useSwaggerSchema', () => {
  it('initial state', () => {
    const { result } = renderHook(() => useSwaggerSchema());

    expect(result.current.content).toBe('');
    expect(result.current.format).toBe('yaml');
    expect(result.current.status).toBe('idle');
  });

  it('accepts initial content', () => {
    const { result } = renderHook(() => useSwaggerSchema({ initialContent: FULL }));

    expect(result.current.status).toBe('valid');
    expect(result.current.parsed).toEqual(JSON.parse(FULL));
  });

  it('loads content with an explicit format', () => {
    const { result } = renderHook(() => useSwaggerSchema());

    act(() => result.current.loadContent(FULL, 'yaml'));

    expect(result.current.format).toBe('yaml');
    expect(result.current.status).toBe('valid');
  });

  it('detects json format', () => {
    const { result } = renderHook(() => useSwaggerSchema());

    act(() => result.current.updateContent('{"a":1}'));

    expect(result.current.format).toBe('json');
    expect(result.current.status).toBe('invalid');
  });

  it('validates schema', () => {
    const { result } = renderHook(() => useSwaggerSchema());

    act(() => result.current.updateContent(FULL));

    expect(result.current.status).toBe('valid');
    expect(result.current.parsed).toEqual(JSON.parse(FULL));
  });

  it('reports errors for bad schema', () => {
    const { result } = renderHook(() => useSwaggerSchema());

    act(() => result.current.updateContent('{"openapi":"3.0.0"}'));

    expect(result.current.status).toBe('invalid');
    expect(result.current.errors.length).toBeGreaterThan(0);
  });

  it('toggles format', () => {
    const { result } = renderHook(() => useSwaggerSchema());

    act(() => result.current.updateContent(FULL));
    act(() => result.current.toggleFormat());

    expect(result.current.format).toBe('yaml');
    expect(result.current.status).toBe('valid');
  });

  it('resets', () => {
    const { result } = renderHook(() => useSwaggerSchema());

    act(() => result.current.updateContent(FULL));
    act(() => result.current.reset());

    expect(result.current.content).toBe('');
    expect(result.current.status).toBe('idle');
  });
});
