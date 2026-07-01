'use client';

import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FormatToggleProps = Readonly<{
  currentFormat: 'json' | 'yaml';
  disabled?: boolean;
  onToggle: () => void;
}>;

export function FormatToggle({ currentFormat, disabled, onToggle }: FormatToggleProps) {
  return (
    <Button
      aria-label={`Switch to ${currentFormat === 'json' ? 'YAML' : 'JSON'}`}
      className="gap-1.5"
      disabled={disabled}
      onClick={onToggle}
      size="sm"
      variant="ghost"
    >
      <ArrowLeftRight className="size-3.5" />
      <span className="hidden sm:inline">{currentFormat === 'json' ? 'YAML' : 'JSON'}</span>
    </Button>
  );
}
