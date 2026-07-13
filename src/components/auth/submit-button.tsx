import { Button } from '@/components/ui/button';

type SubmitButtonProps = Readonly<{
  idleLabel: string;
  pendingLabel: string;
  isSubmitting: boolean;
  'data-testid'?: string;
}>;

export function SubmitButton({
  idleLabel,
  pendingLabel,
  isSubmitting,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      className="mt-5 md:h-10 md:px-4 md:text-sm"
      disabled={isSubmitting}
      type="submit"
      {...props}
    >
      <span className="grid">
        <span
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 flex items-center gap-1.5"
        >
          <span>{idleLabel}</span>
        </span>
        <span
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 flex items-center gap-1.5"
        >
          <span className="size-4 rounded-full border-2 border-current border-t-transparent" />
          <span>{pendingLabel}</span>
        </span>
        <span className="col-start-1 row-start-1 flex items-center gap-1.5">
          {isSubmitting && (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          <span>{isSubmitting ? pendingLabel : idleLabel}</span>
        </span>
      </span>
    </Button>
  );
}
