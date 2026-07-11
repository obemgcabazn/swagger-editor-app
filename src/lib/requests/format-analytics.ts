const EMPTY_VALUE = '—';

export function formatDurationMs(durationMs: number | null): string {
  if (durationMs === null) {
    return EMPTY_VALUE;
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const seconds = durationMs / 1000;
  return `${seconds.toFixed(1)} s`;
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) {
    return EMPTY_VALUE;
  }

  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'] as const;
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted = value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}

export function formatRequestSize(bytes: number | null, noBodyLabel: string): string {
  if (bytes === null) {
    return noBodyLabel;
  }

  return formatBytes(bytes);
}

export function formatTimestamp(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function formatStatusCode(statusCode: number | null): string {
  if (statusCode === null) {
    return EMPTY_VALUE;
  }

  return String(statusCode);
}
