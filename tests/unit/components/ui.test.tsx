import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

describe('ui primitives', () => {
  it('renders button content and variant classes', () => {
    render(
      <Button variant="outline" size="lg">
        Continue
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Continue' });

    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button).toHaveClass('border-border', 'h-9');
  });

  it('exposes button variant class generation', () => {
    expect(buttonVariants({ variant: 'destructive', size: 'icon' })).toContain('text-destructive');
  });

  it('renders labels and inputs with passed attributes', () => {
    render(
      <>
        <Label htmlFor="email" className="text-primary">
          Email
        </Label>
        <Input id="email" type="email" placeholder="name@example.com" className="max-w-sm" />
      </>
    );

    expect(screen.getByText('Email')).toHaveAttribute('for', 'email');
    expect(screen.getByText('Email')).toHaveClass('text-primary');
    expect(screen.getByPlaceholderText('name@example.com')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('name@example.com')).toHaveClass('max-w-sm');
  });
});

describe('cn', () => {
  it('merges conditional classes and resolves Tailwind conflicts', () => {
    expect(cn('px-4', false && 'hidden', 'px-2')).toBe('px-2');
  });
});
