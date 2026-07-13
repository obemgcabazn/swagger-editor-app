import { cn } from '@/lib/utils';

type PaneBodyProps = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

export function SplitWorkspace({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="split-workspace">{children}</div>;
}

export function EditorWorkspacePane({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="split-workspace__editor" id="editor">
      {children}
    </div>
  );
}

export function ViewerWorkspacePane({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="split-workspace__viewer" id="viewer">
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
