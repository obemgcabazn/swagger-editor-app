import { describe, expect, it } from 'vitest';

import {
  formatBytes,
  formatDurationMs,
  formatRequestSize,
  formatStatusCode,
  formatTimestamp,
} from '@/lib/requests/format-analytics';

describe('formatDurationMs', () => {
  it('returns an em dash for null', () => {
    expect(formatDurationMs(null)).toBe('—');
  });

  it('formats sub-second durations in milliseconds', () => {
    expect(formatDurationMs(42)).toBe('42 ms');
  });

  it('formats longer durations in seconds', () => {
    expect(formatDurationMs(1500)).toBe('1.5 s');
  });
});

describe('formatBytes', () => {
  it('returns an em dash for null', () => {
    expect(formatBytes(null)).toBe('—');
  });

  it('formats zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
});

describe('formatRequestSize', () => {
  it('returns the no-body label for null', () => {
    expect(formatRequestSize(null, 'No body')).toBe('No body');
  });

  it('formats byte values when present', () => {
    expect(formatRequestSize(14, 'No body')).toBe('14 B');
  });
});

describe('formatTimestamp', () => {
  it('formats an ISO timestamp for the given locale', () => {
    const formatted = formatTimestamp('2026-07-01T10:30:00.000Z', 'en');

    expect(formatted).toMatch(/2026/);
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe('formatStatusCode', () => {
  it('returns an em dash for null', () => {
    expect(formatStatusCode(null)).toBe('—');
  });

  it('returns the status code as a string', () => {
    expect(formatStatusCode(404)).toBe('404');
  });
});
