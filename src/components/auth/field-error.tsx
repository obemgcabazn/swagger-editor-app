type FieldErrorProps = Readonly<{
  message?: string;
}>;

export function FieldError({ message }: FieldErrorProps) {
  return <p className="text-destructive mt-1 min-h-4 text-xs">{message}</p>;
}
