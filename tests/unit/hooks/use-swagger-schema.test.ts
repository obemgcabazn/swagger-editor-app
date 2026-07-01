import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSwaggerSchema } from '@/hooks/use-swagger-schema';

const FULL = JSON.stringify({ openapi: '3.0.0', info: { title: 'T', version: '1' }, paths: {} });

describe('useSwaggerSchema', () => {
  it('initial state', () => {
    const { result } = renderHook(() => useSwaggerSchema());
    expect(result.current.content).toBe('');
    expect(result.current.format).toBe('yaml');
  });

  it('detects json format', () => {
    const { result } = renderHook(() => useSwaggerSchema());
    act(() => result.current.updateContent('{"a":1}'));
    expect(result.current.format).toBe('json');
  });

  it('validates schema', () => {
    const { result } = renderHook(() => useSwaggerSchema());
    act(() => result.current.updateContent(FULL));
    expect(result.current.hasValidSchema).toBe(true);
  });

  it('reports errors for bad schema', () => {
    const { result } = renderHook(() => useSwaggerSchema());
    act(() => result.current.updateContent('{"openapi":"3.0.0"}'));
    expect(result.current.hasValidSchema).toBe(false);
    expect(result.current.validationErrors.length).toBeGreaterThan(0);
  });

  it('toggles format', () => {
    const { result } = renderHook(() => useSwaggerSchema());
    act(() => result.current.updateContent(FULL));
    act(() => result.current.toggleFormat());
    expect(result.current.format).toBe('yaml');
  });

  it('resets', () => {
    const { result } = renderHook(() => useSwaggerSchema());
    act(() => result.current.updateContent(FULL));
    act(() => result.current.reset());
    expect(result.current.content).toBe('');
  });
});
