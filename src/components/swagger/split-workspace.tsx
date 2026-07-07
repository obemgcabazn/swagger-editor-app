import { cn } from '@/lib/utils';

type PaneBodyProps = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

export function SplitWorkspace({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:divide-x">{children}</div>;
}

export function EditorWorkspacePane({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex h-[50vh] min-h-0 flex-col lg:h-auto lg:flex-1">{children}</div>;
}

export function ViewerWorkspacePane({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-0 flex-col overflow-auto border-t lg:flex-1 lg:border-t-0">
      {children}
    </div>
  );
}

export function PaneToolbar({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="border-border bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-1.5">
      {children}
    </div>
  );
}

export function PaneBody({ children, className }: PaneBodyProps) {
  return <div className={cn('min-h-0 flex-1', className)}>{children}</div>;
}
