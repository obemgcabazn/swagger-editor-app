import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FormatToggle } from '@/components/swagger/format-toggle';
import { ValidationErrors } from '@/components/swagger/validation-errors';

describe('FormatToggle', () => {
  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<FormatToggle currentFormat="json" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled', () => {
    render(<FormatToggle currentFormat="yaml" disabled onToggle={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('ValidationErrors', () => {
  it('renders nothing when errors empty', () => {
    const { container } = render(<ValidationErrors errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders list of errors', () => {
    render(<ValidationErrors errors={['Error 1', 'Error 2']} />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });
});
