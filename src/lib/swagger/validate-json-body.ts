export function getJsonBodyValidationError(body: string): string | null {
  if (!body.trim()) return null;

  try {
    JSON.parse(body);
    return null;
  } catch {
    return 'invalid';
  }
}
