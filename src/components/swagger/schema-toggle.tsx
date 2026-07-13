'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type SchemaToggleProps = Readonly<{
  children?: ReactNode;
  content?: string;
  label: ReactNode;
}>;

export function SchemaToggle({ children, content, label }: SchemaToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-border rounded-md border">
      <button
        className="hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-left transition-colors"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {open ? (
          <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="text-muted-foreground size-3.5 shrink-0" />
        )}
        <span className="flex min-w-0 flex-1 items-center gap-2 text-xs">{label}</span>
      </button>
      {open && (
        <div className="border-border bg-muted border-t p-2 text-xs">
          {children ??
            (content ? <pre className="overflow-auto whitespace-pre-wrap">{content}</pre> : null)}
        </div>
      )}
    </div>
  );
}
