'use client';

type ValidationErrorsProps = Readonly<{
  errors: string[];
}>;

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (!errors.length) return null;

  return (
    <ul className="space-y-1.5" role="alert">
      {errors.map((error, i) => (
        <li
          className="text-destructive bg-destructive/5 border-destructive/10 rounded-md border px-3 py-2 text-xs"
          key={i}
        >
          {error}
        </li>
      ))}
    </ul>
  );
}
