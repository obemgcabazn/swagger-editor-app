import { render, screen } from '@testing-library/react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { AuthField } from '@/components/auth/auth-field';
import { FieldError } from '@/components/auth/field-error';
import { SubmitButton } from '@/components/auth/submit-button';

function createRegister(name: string): UseFormRegisterReturn {
  return {
    name,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  };
}

describe('FieldError', () => {
  it('renders the validation message when provided', () => {
    render(<FieldError message="Invalid email address" />);

    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('keeps a reserved error slot when no message is provided', () => {
    const { container } = render(<FieldError />);

    const slot = container.querySelector('p');

    expect(slot).toBeInTheDocument();
    expect(slot).toHaveClass('min-h-4');
    expect(slot).toBeEmptyDOMElement();
  });
});

describe('SubmitButton', () => {
  it('renders the idle label and stays enabled while not submitting', () => {
    render(<SubmitButton idleLabel="Sign In" isSubmitting={false} pendingLabel="Signing in..." />);

    const button = screen.getByRole('button', { name: 'Sign In' });

    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders the pending label and disables the button while submitting', () => {
    render(<SubmitButton idleLabel="Sign In" isSubmitting pendingLabel="Signing in..." />);

    const button = screen.getByRole('button', { name: 'Signing in...' });

    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('reserves width for both idle and pending labels to avoid layout shift', () => {
    const { container } = render(
      <SubmitButton idleLabel="Sign Up" isSubmitting={false} pendingLabel="Signing up..." />
    );

    const measuringSpans = container.querySelectorAll('[aria-hidden="true"]');

    expect(measuringSpans).toHaveLength(2);
    expect(measuringSpans[0]).toHaveTextContent('Sign Up');
    expect(measuringSpans[1]).toHaveTextContent('Signing up...');
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('forwards data-testid to the button', () => {
    render(
      <SubmitButton
        data-testid="sign-in-submit"
        idleLabel="Sign In"
        isSubmitting={false}
        pendingLabel="Signing in..."
      />
    );

    expect(screen.getByTestId('sign-in-submit')).toBeInTheDocument();
  });
});

describe('AuthField', () => {
  it('renders a labeled input with the provided type and placeholder', () => {
    render(
      <AuthField
        id="sign-in-email"
        label="Email"
        placeholder="john@email.com"
        register={createRegister('email')}
        type="email"
      />
    );

    const input = screen.getByLabelText('Email');

    expect(input).toHaveAttribute('id', 'sign-in-email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'john@email.com');
    expect(input).toHaveAttribute('name', 'email');
  });

  it('shows a field error below the input', () => {
    render(
      <AuthField
        error="Password is required"
        id="sign-in-password"
        label="Password"
        register={createRegister('password')}
        type="password"
      />
    );

    expect(screen.getByText('Password is required')).toHaveClass('min-h-4');
  });

  it('keeps the reserved error slot when no field error is provided', () => {
    const { container } = render(
      <AuthField id="sign-in-password" label="Password" register={createRegister('password')} />
    );

    const errorSlot = container.querySelector('p');

    expect(errorSlot).toHaveClass('min-h-4');
    expect(errorSlot).toBeEmptyDOMElement();
  });

  it('applies desktop sizing classes to the label and input', () => {
    render(<AuthField id="sign-up-name" label="Name" register={createRegister('name')} />);

    expect(screen.getByText('Name')).toHaveClass('md:text-sm');
    expect(screen.getByLabelText('Name')).toHaveClass('md:h-10', 'md:text-sm');
  });
});
