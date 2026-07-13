function tryParseJsonString(value: string): unknown | null {
  const trimmed = value.trim();

  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatNestedJsonStrings(value: unknown): unknown {
  if (typeof value === 'string') {
    const parsed = tryParseJsonString(value);
    return parsed === null ? value : formatNestedJsonStrings(parsed);
  }

  if (Array.isArray(value)) {
    return value.map(formatNestedJsonStrings);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, formatNestedJsonStrings(nestedValue)])
    );
  }

  return value;
}

export function formatExecutionResult(data: unknown): string {
  return JSON.stringify(formatNestedJsonStrings(data), null, 2);
}
